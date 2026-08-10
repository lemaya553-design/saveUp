import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { ScoreGauge } from '../components/ScoreGauge'
import { ProgressBar } from '../components/ProgressBar'
import { PageSkeleton } from '../components/PageSkeleton'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { formatCurrency } from '../lib/format'
import { TIER_ICONS, TIER_UNLOCKED_CLASS } from '../components/rewardIcons'
import {
  REWARD_TIERS,
  computeSavingsScoreBreakdown,
  getGoalCompletionRequirement,
  getNextTierProgress,
  getSavingsScoreExplanations,
  getSeenTierIds,
  getTierRequirement,
  getUnlockedTiers,
  saveSeenTierIds,
} from '../lib/rewards'

export function Recompenses() {
  const goals = useSavingsGoals()
  const contributions = useSavingsContributions()

  const loading = goals.loading || contributions.loading
  const error = goals.error || contributions.error

  const totalCurrentAmount = goals.goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTargetAmount = goals.goals.reduce((sum, g) => sum + g.targetAmount, 0)

  const savingsBreakdown = useMemo(
    () => computeSavingsScoreBreakdown(totalCurrentAmount, totalTargetAmount, contributions.contributions),
    [totalCurrentAmount, totalTargetAmount, contributions.contributions],
  )
  const savingsExplanations = useMemo(
    () => getSavingsScoreExplanations(savingsBreakdown),
    [savingsBreakdown],
  )

  const unlockedIds = useMemo(
    () => new Set(getUnlockedTiers(totalCurrentAmount, goals.goals).map((tier) => tier.id)),
    [totalCurrentAmount, goals.goals],
  )

  const nextTierProgress = useMemo(
    () => getNextTierProgress(totalCurrentAmount, goals.goals),
    [totalCurrentAmount, goals.goals],
  )

  // '' means "Tous les objectifs" (total mode) — the default and the only
  // option when there's 0 or 1 goal, since total === that one goal then.
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const selectedGoal =
    goals.goals.length > 1 ? goals.goals.find((g) => g.id === selectedGoalId) : undefined

  const [newlyUnlocked, setNewlyUnlocked] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (loading) return
    const seen = getSeenTierIds()
    const fresh = [...unlockedIds].filter((id) => !seen.has(id))
    if (fresh.length === 0) return

    setNewlyUnlocked(new Set(fresh))
    saveSeenTierIds(new Set([...seen, ...unlockedIds]))
    const timer = setTimeout(() => setNewlyUnlocked(new Set()), 2500)
    return () => clearTimeout(timer)
  }, [loading, unlockedIds])

  if (loading) {
    return <PageSkeleton cards={3} />
  }

  const hasGoal = goals.goals.length > 0
  const allUnlocked = unlockedIds.size === REWARD_TIERS.length

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader title="Regarde le chemin parcouru" subtitle="Chaque palier compte." />

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!hasGoal && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
          <p className="text-ink">Fixe un objectif d'épargne pour commencer à débloquer des badges.</p>
          <Link
            to="/epargne"
            className="whitespace-nowrap rounded-lg bg-primary-strong px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
          >
            Fixer un objectif
          </Link>
        </div>
      )}

      <div className="grid gap-6">
        <Card
          title="Score d'épargne"
          hint="Basé sur le montant épargné et la régularité de tes contributions."
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex flex-col items-center">
              <ScoreGauge score={savingsBreakdown.score} label="Score d'épargne" />
              <p className="mt-1 text-xs uppercase tracking-wide text-muted">Total épargné</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(totalCurrentAmount)}</p>
              <p className="mt-2 max-w-[180px] text-center text-xs text-muted">
                Reflète ton montant épargné et ta régularité.{' '}
                <Link to="/dashboard" className="text-accent hover:text-accent/80">
                  Voir ton score de santé →
                </Link>
              </p>
            </div>

            <ul className="w-full flex-1 space-y-3">
              {savingsExplanations.map((item) => (
                <li key={item.label} className="text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium text-ink">{item.label}</span>
                    <span className="text-xs text-muted">
                      {item.value}/{item.max}
                    </span>
                  </div>
                  <ProgressBar value={item.value} colorClass="bg-accent" />
                  <p className="mt-1 text-xs text-muted">{item.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            {goals.goals.length > 1 && (
              <label className="mb-3 flex items-center justify-end gap-2 text-xs text-muted">
                Voir :
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-ink focus:border-primary focus:outline-none"
                >
                  <option value="" className="bg-surface">
                    Tous les objectifs
                  </option>
                  {goals.goals.map((g) => (
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
                  <p className="text-sm text-success">🎉 « {selectedGoal.name} » est complété !</p>
                ) : (
                  <>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-ink">Progression de « {selectedGoal.name} »</span>
                      <span className="text-muted">{Math.round(goalRequirement.progressPct)}%</span>
                    </div>
                    <ProgressBar value={goalRequirement.progressPct} colorClass="bg-primary" />
                    <p className="mt-2 text-xs text-muted">
                      Il te manque {formatCurrency(goalRequirement.missingAmount)} pour compléter «{' '}
                      {selectedGoal.name} »
                      {badgeAlreadyUnlocked ? '.' : ' et débloquer « Objectif atteint ».'}
                    </p>
                  </>
                )
              })()
            ) : allUnlocked ? (
              <p className="text-sm text-success">🎉 Tous les badges sont débloqués !</p>
            ) : nextTierProgress ? (
              <>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-ink">Prochain palier : {nextTierProgress.tier.name}</span>
                  <span className="text-muted">{Math.round(nextTierProgress.progressPct)}%</span>
                </div>
                <ProgressBar value={nextTierProgress.progressPct} colorClass="bg-primary" />
                <p className="mt-2 text-xs text-muted">
                  Il te manque {formatCurrency(nextTierProgress.missingAmount)} pour débloquer «{' '}
                  {nextTierProgress.tier.name} »
                  {nextTierProgress.goalName ? ` (sur « ${nextTierProgress.goalName} »)` : ''}.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">
                Fixe un objectif d'épargne pour voir ta progression vers le prochain palier.
              </p>
            )}
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold text-ink">Tes badges</h2>
          <p className="mb-4 mt-1 text-xs text-muted">
            {unlockedIds.size}/{REWARD_TIERS.length} débloqués — continue d'épargner pour les débloquer
            tous.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {REWARD_TIERS.map((tier) => {
              const unlocked = unlockedIds.has(tier.id)
              const isNew = newlyUnlocked.has(tier.id)
              const Icon = TIER_ICONS[tier.id]
              const requirement = unlocked ? null : getTierRequirement(tier, totalCurrentAmount, goals.goals)

              return (
                <div
                  key={tier.id}
                  className={`glass flex flex-col items-center gap-2 rounded-2xl p-4 text-center shadow-lg shadow-black/30 ${
                    isNew ? 'badge-unlock' : ''
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${
                      unlocked ? TIER_UNLOCKED_CLASS[tier.id] : 'bg-white/5 text-muted'
                    }`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <p className={`text-sm font-semibold ${unlocked ? 'text-ink' : 'text-muted'}`}>
                    {tier.name}
                  </p>
                  {unlocked ? (
                    <p className="text-xs text-muted">{tier.description}</p>
                  ) : requirement ? (
                    <p className="text-xs font-medium text-accent">
                      Il manque {formatCurrency(requirement.missingAmount)}
                    </p>
                  ) : (
                    <p className="text-xs text-muted">Complète un objectif actif</p>
                  )}
                  {!unlocked && <p className="text-xs text-muted">🔒 Verrouillé</p>}
                </div>
              )
            })}
          </div>
        </div>

        <Link
          to="/epargne"
          className="glass flex items-center justify-between rounded-2xl p-5 shadow-lg shadow-black/30 transition-colors hover:bg-white/5"
        >
          <div>
            <p className="font-semibold text-ink">Continuer d'épargner</p>
            <p className="text-sm text-muted">Ajoute une contribution pour progresser vers ton prochain badge.</p>
          </div>
          <span className="text-accent">→</span>
        </Link>
      </div>
    </div>
  )
}
