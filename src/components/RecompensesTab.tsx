import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from './Card'
import { ScoreGauge } from './ScoreGauge'
import { ProgressBar } from './ProgressBar'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useClaimedBadges } from '../hooks/useClaimedBadges'
import { useLoginStreak } from '../hooks/useLoginStreak'
import { useIncome } from '../hooks/useIncome'
import { useSubscription } from '../hooks/useSubscription'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { isAtLeast, splitByLimit } from '../lib/plans'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import { TIER_ICONS, TIER_UNLOCKED_CLASS } from './rewardIcons'
import {
  REWARD_TIERS,
  STARTER_BADGE,
  computeSavingsScoreBreakdown,
  getGoalCompletionRequirement,
  getNextTierProgress,
  getSavingsScoreExplanations,
  getTierRequirement,
  getUnlockedTiers,
  isStarterBadgeUnlocked,
} from '../lib/rewards'

// How long the grey -> color reveal stays flagged as "just claimed" — a
// touch longer than the shared .badge-unlock keyframe (0.7s) so the
// animation always finishes before the class is removed.
const CLAIM_ANIMATION_MS = 900

// Self-contained (own hook instances) — was its own route, now the
// Récompenses tab on Statistiques.
export function RecompensesTab() {
  const goals = useSavingsGoals()
  const contributions = useSavingsContributions()
  const claimedBadges = useClaimedBadges()
  const streak = useLoginStreak()
  const income = useIncome()
  const subscription = useSubscription()
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].recompenses
  const formatMoney = useMoneyFormat()

  const loading = goals.loading || contributions.loading || claimedBadges.loading || income.loading
  const error = goals.error || contributions.error || claimedBadges.error

  const starterEarned = isStarterBadgeUnlocked(income.hasIncomeRecord)
  const starterClaimed = claimedBadges.claimedIds.has(STARTER_BADGE.id)

  const totalCurrentAmount = goals.goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTargetAmount = goals.goals.reduce((sum, g) => sum + g.targetAmount, 0)

  // Paused (over the plan's goal limit) goals don't count toward the
  // "goal-complete" badge or the goal picker below — same active/paused
  // split as the Épargne page. The savings SCORE above still reflects every
  // dollar actually saved (real money, shown honestly) even if it came from
  // a paused goal; only the goal-tracking features are restricted.
  const activeGoals = useMemo(
    () => splitByLimit(goals.goals, subscription.limits.maxGoals).active,
    [goals.goals, subscription.limits.maxGoals],
  )

  const savingsBreakdown = useMemo(
    () => computeSavingsScoreBreakdown(totalCurrentAmount, totalTargetAmount, contributions.contributions),
    [totalCurrentAmount, totalTargetAmount, contributions.contributions],
  )
  const savingsExplanations = useMemo(
    () => getSavingsScoreExplanations(savingsBreakdown, lang),
    [savingsBreakdown, lang],
  )

  // A tier the user has earned by progress but whose minPlan they don't have
  // yet doesn't count as unlocked — allUnlocked/claimedCount/readyToClaim
  // and each tile's own "earned" state all read from this same set, so a
  // Free-plan user who's technically hit the $1000 mark still sees it as
  // locked (for their plan) rather than claimable.
  const unlockedIds = useMemo(() => {
    const earnedIds = getUnlockedTiers(totalCurrentAmount, activeGoals).map((tier) => tier.id)
    return new Set(
      earnedIds.filter((id) => {
        const tier = REWARD_TIERS.find((t) => t.id === id)
        return !tier?.minPlan || isAtLeast(subscription.plan, tier.minPlan)
      }),
    )
  }, [totalCurrentAmount, activeGoals, subscription.plan])

  const nextTierProgress = useMemo(
    () => getNextTierProgress(totalCurrentAmount, activeGoals),
    [totalCurrentAmount, activeGoals],
  )

  // '' means "Tous les objectifs" (total mode) — the default and the only
  // option when there's 0 or 1 goal, since total === that one goal then.
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const selectedGoal =
    activeGoals.length > 1 ? activeGoals.find((g) => g.id === selectedGoalId) : undefined

  // Tiers the user has earned but hasn't clicked "Réclamer" on yet.
  const [justClaimed, setJustClaimed] = useState<Set<string>>(new Set())

  async function handleClaim(tierId: string) {
    const ok = await claimedBadges.claim(tierId)
    if (!ok) return
    setJustClaimed((prev) => new Set(prev).add(tierId))
    setTimeout(() => {
      setJustClaimed((prev) => {
        const next = new Set(prev)
        next.delete(tierId)
        return next
      })
    }, CLAIM_ANIMATION_MS)
  }

  if (loading) {
    return <p className="text-sm text-muted">{t.loading}</p>
  }

  const hasGoal = goals.goals.length > 0
  const allUnlocked = unlockedIds.size === REWARD_TIERS.length
  const claimedCount = [...unlockedIds].filter((id) => claimedBadges.claimedIds.has(id)).length
  const readyToClaimCount = unlockedIds.size - claimedCount

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-6 glass flex items-center gap-4 rounded-2xl p-5 shadow-lg shadow-black/30">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/15 text-3xl">
          🔥
        </div>
        <div>
          <p className="text-2xl font-bold text-ink">{t.streak.days(streak.streak)}</p>
          <p className="text-sm text-muted">
            {streak.streak > 0 ? t.streak.keepGoing : t.streak.startOne}
          </p>
        </div>
      </div>

      {starterEarned && (
        <div
          className={`mb-6 glass flex items-center gap-4 rounded-2xl p-5 shadow-lg shadow-black/30 ${
            justClaimed.has(STARTER_BADGE.id) ? 'badge-unlock' : ''
          }`}
        >
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
              starterClaimed || justClaimed.has(STARTER_BADGE.id) ? TIER_UNLOCKED_CLASS.starter : 'bg-overlay/5 text-muted'
            }`}
          >
            {(() => {
              const StarterIcon = TIER_ICONS.starter
              return <StarterIcon className="h-7 w-7" />
            })()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ink">{STARTER_BADGE.name[lang]}</p>
            <p className="text-sm text-muted">
              {starterClaimed || justClaimed.has(STARTER_BADGE.id)
                ? STARTER_BADGE.description[lang]
                : t.starterBadge.readyDefault}
            </p>
          </div>
          {!starterClaimed && !justClaimed.has(STARTER_BADGE.id) && (
            <button
              type="button"
              onClick={() => handleClaim(STARTER_BADGE.id)}
              className="shrink-0 rounded-full bg-primary-strong px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              {t.starterBadge.claim}
            </button>
          )}
        </div>
      )}

      {!hasGoal && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
          <p className="text-ink">{t.noGoal.text}</p>
          <Link
            to="/epargne/objectifs"
            className="whitespace-nowrap rounded-lg bg-primary-strong px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
          >
            {t.noGoal.cta}
          </Link>
        </div>
      )}

      <div className="grid gap-6">
        <Card title={t.savingsScore.title} hint={t.savingsScore.hint}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex flex-col items-center">
              <ScoreGauge score={savingsBreakdown.score} label={t.savingsScore.title} />
              <p className="mt-1 text-xs uppercase tracking-wide text-muted">{t.savingsScore.totalSaved}</p>
              <p className="text-2xl font-bold text-success">{formatMoney(totalCurrentAmount)}</p>
              <p className="mt-2 max-w-[180px] text-center text-xs text-muted">
                {t.savingsScore.caption}{' '}
                <Link to="/dashboard" className="text-accent hover:text-accent/80">
                  {t.savingsScore.seeHealthScore}
                </Link>
              </p>
            </div>

            <ul className="w-full flex-1 space-y-4">
              {savingsExplanations.map((item) => (
                <li key={item.label} className="text-sm">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-medium text-ink">{item.label}</span>
                    <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                      {item.value}/{item.max}
                    </span>
                  </div>
                  <ProgressBar value={item.value} colorClass="bg-accent" />
                  <p className="mt-1.5 text-xs text-muted">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-overlay/10 pt-4">
            {activeGoals.length > 1 && (
              <label className="mb-3 flex items-center justify-end gap-2 text-xs text-muted">
                {t.goalSelector.label}
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="rounded-lg border border-overlay/10 bg-overlay/5 px-2 py-1 text-xs text-ink focus:border-primary focus:outline-none"
                >
                  <option value="" className="bg-surface">
                    {t.goalSelector.allGoals}
                  </option>
                  {activeGoals.map((g) => (
                    <option key={g.id} value={g.id} className="bg-surface">
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selectedGoal ? (
              (() => {
                const goalRequirement = getGoalCompletionRequirement(selectedGoal)
                const goalComplete = selectedGoal.currentAmount >= selectedGoal.targetAmount
                const badgeAlreadyUnlocked = unlockedIds.has('goal-complete')

                return goalComplete ? (
                  <p className="text-sm text-success">{t.goalComplete(selectedGoal.name)}</p>
                ) : (
                  <>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-ink">{t.goalProgress(selectedGoal.name)}</span>
                      <span className="text-muted">{Math.round(goalRequirement.progressPct)}%</span>
                    </div>
                    <ProgressBar value={goalRequirement.progressPct} colorClass="bg-primary" />
                    <p className="mt-2 text-xs text-muted">
                      {t.missingToComplete(formatMoney(goalRequirement.missingAmount), selectedGoal.name)}
                      {badgeAlreadyUnlocked ? '.' : t.andUnlockGoalBadge}
                    </p>
                  </>
                )
              })()
            ) : allUnlocked ? (
              <p className="text-sm text-success">{t.allUnlocked}</p>
            ) : nextTierProgress ? (
              <>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-ink">{t.nextTier(nextTierProgress.tier.name[lang])}</span>
                  <span className="text-muted">{Math.round(nextTierProgress.progressPct)}%</span>
                </div>
                <ProgressBar value={nextTierProgress.progressPct} colorClass="bg-primary" />
                <p className="mt-2 text-xs text-muted">
                  {t.missingForTier(formatMoney(nextTierProgress.missingAmount), nextTierProgress.tier.name[lang])}
                  {nextTierProgress.goalName ? t.onGoal(nextTierProgress.goalName) : ''}.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">{t.setGoalToSeeProgress}</p>
            )}
          </div>
        </Card>

        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-ink">{t.yourBadges}</h2>
            <p className="text-xs text-muted">
              {t.claimedCount(claimedCount, REWARD_TIERS.length)}
              {readyToClaimCount > 0 && (
                <span className="ml-1.5 font-semibold text-accent">
                  {t.toClaimCount(readyToClaimCount)}
                </span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {REWARD_TIERS.map((tier) => {
              const planLocked = tier.minPlan !== undefined && !isAtLeast(subscription.plan, tier.minPlan)
              const earned = unlockedIds.has(tier.id)
              const claimed = claimedBadges.claimedIds.has(tier.id)
              const isAnimating = justClaimed.has(tier.id)
              const revealed = claimed || isAnimating
              const Icon = TIER_ICONS[tier.id]
              const requirement = earned ? null : getTierRequirement(tier, totalCurrentAmount, activeGoals)

              return (
                <div
                  key={tier.id}
                  className={`glass flex flex-col items-center gap-2 rounded-2xl p-4 text-center shadow-lg shadow-black/30 ${
                    isAnimating ? 'badge-unlock' : ''
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-500 ${
                      revealed ? TIER_UNLOCKED_CLASS[tier.id] : 'bg-overlay/5 text-muted'
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <p className={`text-sm font-semibold ${revealed ? 'text-ink' : 'text-muted'}`}>
                    {tier.name[lang]}
                  </p>
                  {revealed ? (
                    <p className="text-xs text-muted">{tier.description[lang]}</p>
                  ) : planLocked ? (
                    <Link to="/tarifs" className="text-xs font-medium text-accent hover:text-accent/80">
                      {t.goToStandard}
                    </Link>
                  ) : earned ? (
                    <>
                      <p className="text-xs font-semibold text-accent">{t.badgeEarned}</p>
                      <button
                        type="button"
                        onClick={() => handleClaim(tier.id)}
                        className="mt-1 rounded-full bg-primary-strong px-3 py-1 text-xs font-semibold text-white transition-all hover:brightness-110"
                      >
                        {t.claim}
                      </button>
                    </>
                  ) : requirement ? (
                    <p className="text-xs font-medium text-accent">
                      {t.missingAmount(formatMoney(requirement.missingAmount))}
                    </p>
                  ) : (
                    <p className="text-xs text-muted">{t.completeActiveGoal}</p>
                  )}
                  {!earned && <p className="text-xs text-muted">🔒 {planLocked ? t.standard : t.locked}</p>}
                </div>
              )
            })}
          </div>
        </div>

        <Link
          to="/epargne/objectifs"
          className="glass flex items-center justify-between rounded-2xl p-5 shadow-lg shadow-black/30 transition-colors hover:bg-overlay/5"
        >
          <div>
            <p className="font-semibold text-ink">{t.continueSaving}</p>
            <p className="text-sm text-muted">{t.continueSavingHint}</p>
          </div>
          <span className="text-accent">→</span>
        </Link>
      </div>
    </div>
  )
}
