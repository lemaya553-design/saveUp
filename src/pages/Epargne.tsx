import { useMemo, useState } from 'react'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useIncome } from '../hooks/useIncome'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { useFinancialHealth } from '../hooks/useFinancialHealth'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { sumThisMonth } from '../lib/budgetInsights'
import { computeRequiredPace, estimateMonthlyRate } from '../lib/savingsProjection'
import { computeCategorySpending } from '../lib/categorySpending'
import { formatCurrency } from '../lib/format'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { SavingsGoalCard } from '../components/SavingsGoalCard'
import { AddGoalCard } from '../components/AddGoalCard'
import { ContributeForm } from '../components/ContributeForm'
import { ContributionHistory } from '../components/ContributionHistory'
import { PaceComparisonChart, type PaceComparisonEntry } from '../components/PaceComparisonChart'
import { SimulateurTab } from '../components/SimulateurTab'
import { PageSkeleton } from '../components/PageSkeleton'

type Tab = 'objectifs' | 'simulateur'

export function Epargne() {
  const [tab, setTab] = useState<Tab>('objectifs')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Loaded once here and passed down to both tabs, so switching tabs never
  // re-fetches — Objectifs and Simulateur both need goals/contributions,
  // and Simulateur additionally needs income/fixed/health.
  const goals = useSavingsGoals()
  const contributions = useSavingsContributions()
  const income = useIncome()
  const fixed = useFixedExpenses()
  const health = useFinancialHealth()
  // Only Simulateur needs this (per-category breakdown of this month's
  // ad-hoc spending, to seed its category sliders) — loaded here anyway so
  // switching tabs doesn't trigger a fetch, same rationale as the other
  // hooks above. monthsBack=0 scopes the query to the current month only.
  const history = useExpenseHistory(0)

  const loading =
    goals.loading || contributions.loading || income.loading || fixed.loading || health.loading || history.loading
  const error =
    goals.error || contributions.error || income.error || fixed.error || health.error || history.error

  const discretionaryBudget = Math.max(0, income.monthlyIncome - fixed.totalFixedExpenses)
  const savingsThisMonth = useMemo(
    () => sumThisMonth(contributions.contributions),
    [contributions.contributions],
  )
  const categorySpending = useMemo(
    () => computeCategorySpending(history.records, income.monthlyIncome, new Date()),
    [history.records, income.monthlyIncome],
  )

  // Actuel vs nécessaire, per goal — only goals with a deadline (and still
  // short of it) have a "required pace" to compare against; the rest are
  // simply left out rather than shown with a meaningless comparison.
  const paceComparison = useMemo(() => {
    const now = new Date()
    return goals.goals.reduce<PaceComparisonEntry[]>((entries, goal) => {
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
      if (!goal.targetDate || remaining <= 0) return entries
      const requiredPace = computeRequiredPace(remaining, goal.targetDate, now)
      if (!requiredPace) return entries
      const goalContributions = contributions.contributions.filter((c) => c.goal_id === goal.id)
      const monthlyRate = estimateMonthlyRate(goalContributions, now)
      entries.push({
        id: goal.id,
        name: goal.name,
        monthlyRate,
        requiredPerMonth: requiredPace.perMonth,
        isAhead: monthlyRate >= requiredPace.perMonth,
      })
      return entries
    }, [])
  }, [goals.goals, contributions.contributions])

  if (loading) {
    return <PageSkeleton cards={3} />
  }

  const hasGoals = goals.goals.length > 0
  const totalCurrentAmount = goals.goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTargetAmount = goals.goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const overallProgress =
    totalTargetAmount > 0 ? Math.min(100, (totalCurrentAmount / totalTargetAmount) * 100) : 0

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Vers quoi tu épargnes"
        subtitle="Tes objectifs d'épargne, et un simulateur pour tester des changements avant de les appliquer."
      />

      <div className="glass mb-6 inline-flex gap-1 rounded-full p-1">
        <button
          type="button"
          onClick={() => setTab('objectifs')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'objectifs' ? 'bg-primary-strong text-white shadow-md shadow-primary/30' : 'text-muted hover:text-ink'
          }`}
        >
          Objectifs
        </button>
        <button
          type="button"
          onClick={() => setTab('simulateur')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'simulateur' ? 'bg-primary-strong text-white shadow-md shadow-primary/30' : 'text-muted hover:text-ink'
          }`}
        >
          Simulateur « et si »
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {tab === 'objectifs' ? (
        !hasGoals && !showCreateForm ? (
          <EmptyState
            title="Tu n'as pas encore d'objectif d'épargne"
            description="Fixe un montant à atteindre pour commencer à suivre ta progression et débloquer des badges."
            actionLabel="Fixer mon premier objectif"
            onAction={() => setShowCreateForm(true)}
          />
        ) : (
          <div className="grid gap-6">
            {hasGoals && (
              <div className="glass rounded-2xl p-6 shadow-lg shadow-black/30">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">Épargné</p>
                    <p className="mt-1 text-2xl font-bold text-success sm:text-3xl">
                      {formatCurrency(totalCurrentAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">Objectif total</p>
                    <p className="mt-1 text-2xl font-bold text-ink sm:text-3xl">
                      {formatCurrency(totalTargetAmount)}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      {goals.goals.length} objectif{goals.goals.length > 1 ? 's' : ''}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-primary sm:text-3xl">
                      {overallProgress.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${
                      overallProgress >= 100 ? 'bg-success' : 'bg-primary'
                    }`}
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {goals.goals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  contributionsForGoal={contributions.contributions.filter((c) => c.goal_id === goal.id)}
                  onSave={goals.updateGoal}
                  onRemove={goals.removeGoal}
                />
              ))}
              <AddGoalCard onAdd={goals.addGoal} defaultOpen={!hasGoals} />
            </div>

            {hasGoals && (
              <>
                <Card
                  title="Rythme actuel vs nécessaire"
                  hint="Ce que tu mets de côté par mois, comparé à ce qu'il faudrait pour respecter l'échéance de chaque objectif."
                >
                  <PaceComparisonChart entries={paceComparison} />
                </Card>

                <ContributeForm
                  goals={goals.goals}
                  onContribute={goals.addContribution}
                  discretionaryBudget={discretionaryBudget}
                  savingsThisMonth={savingsThisMonth}
                />
                <ContributionHistory contributions={contributions.contributions} goals={goals.goals} />
              </>
            )}
          </div>
        )
      ) : (
        <SimulateurTab
          health={health}
          fixed={fixed}
          goals={goals}
          contributions={contributions}
          categorySpending={categorySpending}
          onGoToObjectifs={() => {
            setTab('objectifs')
            setShowCreateForm(true)
          }}
        />
      )}
    </div>
  )
}
