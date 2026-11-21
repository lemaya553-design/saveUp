import { Link } from 'react-router-dom'
import { Card } from './Card'
import { ScoreGauge } from './ScoreGauge'
import { ProgressBar } from './ProgressBar'
import { BadgeMedal } from './BadgeMedal'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useClaimedBadges } from '../hooks/useClaimedBadges'
import { useBadgeProgress } from '../hooks/useBadgeProgress'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { isAtLeast } from '../lib/plans'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import {
  BADGES,
  getBadgeProgress,
  getBadgeRequirementText,
  getBadgeResultLabel,
  getUserStatus,
  getNextStatus,
} from '../lib/badges'
import { computeSavingsScoreBreakdown, getSavingsScoreExplanations } from '../lib/rewards'

// Self-contained (own hook instances) — was its own route, now the
// Récompenses tab on Statistiques.
export function RecompensesTab() {
  const goals = useSavingsGoals()
  const contributions = useSavingsContributions()
  const claimedBadges = useClaimedBadges()
  const { loading: progressLoading, error: progressError, ctx, plan } = useBadgeProgress()
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].recompenses
  const formatMoney = useMoneyFormat()
  const dateLocale = lang === 'fr' ? 'fr-CA' : 'en-CA'

  const loading = goals.loading || contributions.loading || claimedBadges.loading || progressLoading
  const error = goals.error || contributions.error || claimedBadges.error || progressError

  const totalCurrentAmount = goals.goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTargetAmount = goals.goals.reduce((sum, g) => sum + g.targetAmount, 0)

  const savingsBreakdown = computeSavingsScoreBreakdown(
    totalCurrentAmount,
    totalTargetAmount,
    contributions.contributions,
  )
  const savingsExplanations = getSavingsScoreExplanations(savingsBreakdown, lang)

  if (loading) {
    return <p className="text-sm text-muted">{t.loading}</p>
  }

  const claimedCount = claimedBadges.claimedIds.size
  const status = getUserStatus(claimedCount)
  const nextStatus = getNextStatus(claimedCount)
  const hasGoal = goals.goals.length > 0

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-6 glass rounded-2xl p-5 shadow-lg shadow-black/30">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-4xl">
            {status.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t.status.title}</p>
            <p className="text-xl font-bold text-ink">{status.name[lang]}</p>
            <p className="text-sm text-muted">{t.status.badgesCount(claimedCount)}</p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar
            value={
              nextStatus
                ? ((claimedCount - status.min) / (nextStatus.min - status.min)) * 100
                : 100
            }
            colorClass="bg-primary"
          />
          <p className="mt-2 text-xs text-muted">
            {nextStatus ? t.status.nextStatus(nextStatus.name[lang], nextStatus.min - claimedCount) : t.status.maxReached}
          </p>
        </div>
      </div>

      <div className="mb-6 glass flex items-center gap-4 rounded-2xl p-5 shadow-lg shadow-black/30">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-3xl">
          🔥
        </div>
        <div>
          <p className="text-2xl font-bold text-ink">{t.streak.days(ctx.streakDays)}</p>
          <p className="text-sm text-muted">{ctx.streakDays > 0 ? t.streak.keepGoing : t.streak.startOne}</p>
        </div>
      </div>

      {!hasGoal && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
          <p className="text-ink">{t.noGoal.text}</p>
          <Link
            to="/epargne/objectifs"
            className="whitespace-nowrap rounded-lg budget-btn-primary px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
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
              <p className="text-2xl font-bold text-primary">{formatMoney(totalCurrentAmount)}</p>
              <p className="mt-2 max-w-[180px] text-center text-xs text-muted">
                {t.savingsScore.caption}{' '}
                <Link to="/dashboard" className="budget-action-link">
                  {t.savingsScore.seeHealthScore}
                </Link>
              </p>
            </div>

            <ul className="w-full flex-1 space-y-4">
              {savingsExplanations.map((item) => (
                <li key={item.label} className="text-sm">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-medium text-ink">{item.label}</span>
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {item.value}/{item.max}
                    </span>
                  </div>
                  <ProgressBar value={item.value} colorClass="bg-primary" />
                  <p className="mt-1.5 text-xs text-muted">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-ink">{t.yourBadges}</h2>
            <p className="text-xs text-muted">{t.claimedCount(claimedCount, BADGES.length)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {BADGES.map((def) => {
              const planLocked = def.minPlan !== undefined && !isAtLeast(plan, def.minPlan)
              const claimed = claimedBadges.claimedIds.has(def.id)
              const revealed = claimed && !planLocked
              const progress = getBadgeProgress(def, ctx)
              const claimedAt = claimedBadges.claimedAt.get(def.id)

              return (
                <div key={def.id} className="glass flex flex-col items-center gap-2 rounded-2xl p-4 text-center shadow-lg shadow-black/30">
                  <div className="w-full max-w-[96px]">
                    <BadgeMedal
                      rarity={def.rarity}
                      icon={def.icon}
                      unlocked={revealed}
                      resultLabel={revealed ? getBadgeResultLabel(def, lang, formatMoney) : ''}
                    />
                  </div>
                  <p className={`text-sm font-semibold ${revealed ? 'text-ink' : 'text-muted'}`}>{def.name[lang]}</p>

                  {revealed ? (
                    claimedAt && (
                      <p className="text-xs text-muted">
                        {t.obtainedOn(new Date(claimedAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' }))}
                      </p>
                    )
                  ) : planLocked ? (
                    <Link to="/tarifs" className="text-xs font-medium budget-action-link">
                      {t.goToStandard}
                    </Link>
                  ) : (
                    <>
                      <p className="text-xs text-muted">{getBadgeRequirementText(def, lang, formatMoney)}</p>
                      <div className="w-full">
                        <ProgressBar value={progress.pct} colorClass="bg-primary" />
                      </div>
                    </>
                  )}
                  {!revealed && (
                    <p className="text-xs text-muted">🔒 {planLocked ? t.standardOnly : t.locked}</p>
                  )}
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
          <span className="text-primary">→</span>
        </Link>
      </div>
    </div>
  )
}
