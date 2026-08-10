import { useMemo, useState } from 'react'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useIncome } from '../hooks/useIncome'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { sumThisMonth } from '../lib/budgetInsights'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { SavingsGoalCard } from '../components/SavingsGoalCard'
import { AddGoalCard } from '../components/AddGoalCard'
import { ContributeForm } from '../components/ContributeForm'
import { ContributionHistory } from '../components/ContributionHistory'
import { PageSkeleton } from '../components/PageSkeleton'

export function Epargne() {
  const goals = useSavingsGoals()
  const contributions = useSavingsContributions()
  const income = useIncome()
  const fixed = useFixedExpenses()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const loading = goals.loading || contributions.loading || income.loading || fixed.loading
  const error = goals.error || contributions.error || income.error || fixed.error

  const discretionaryBudget = Math.max(0, income.monthlyIncome - fixed.totalFixedExpenses)
  const savingsThisMonth = useMemo(
    () => sumThisMonth(contributions.contributions),
    [contributions.contributions],
  )

  if (loading) {
    return <PageSkeleton cards={3} />
  }

  const hasGoals = goals.goals.length > 0

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Vers quoi tu épargnes"
        subtitle="Fixe un ou plusieurs objectifs et suis ta progression."
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!hasGoals && !showCreateForm ? (
        <EmptyState
          title="Tu n'as pas encore d'objectif d'épargne"
          description="Fixe un montant à atteindre pour commencer à suivre ta progression et débloquer des badges."
          actionLabel="Fixer mon premier objectif"
          onAction={() => setShowCreateForm(true)}
        />
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.goals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                contributionsForGoal={contributions.contributions.filter(
                  (c) => c.goal_id === goal.id,
                )}
                onSave={goals.updateGoal}
                onRemove={goals.removeGoal}
              />
            ))}
            <AddGoalCard onAdd={goals.addGoal} defaultOpen={!hasGoals} />
          </div>

          {hasGoals && (
            <>
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
      )}
    </div>
  )
}
