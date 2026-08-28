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
import { UpgradePrompt } from '../components/UpgradePrompt'
import { PageSkeleton } from '../components/PageSkeleton'
import { useSubscription } from '../hooks/useSubscription'
import { splitByLimit } from '../lib/plans'

type Tab = 'objectifs' | 'simulateur'

const OBJECTIFS_HELP = {
  title: 'Objectifs',
  purpose: 'Crée et suis tes objectifs d\'épargne (voyage, fonds d\'urgence...) et leur progression.',
  actions: [
    'Crée un nouvel objectif avec un montant cible et, si tu veux, une date.',
    'Ajoute une contribution à un objectif existant pour le faire avancer.',
    'Compare ton rythme actuel au rythme nécessaire pour atteindre tes dates cibles.',
  ],
}

const SIMULATEUR_HELP = {
  title: 'Simulateur « et si »',
  purpose:
    'Teste l\'effet d\'un changement (revenu, dépenses, rythme d\'épargne) avant de l\'appliquer pour de vrai.',
  actions: [
    'Ajuste les curseurs pour simuler un changement de revenu ou de dépenses par catégorie.',
    'Regarde l\'impact estimé sur ta capacité d\'épargne mensuelle.',
    'Rien n\'est enregistré ici : c\'est un essai, pas une vraie modification de ton budget.',
  ],
}

export function Epargne() {
  const [tab, setTab] = useState<Tab>('objectifs')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Loaded once here and passed down to both tabs, so switching tabs never
  // re-fetches — Objectifs and Simulateur both need goals/contributions,
  // and Simulateur additionally needs income/fixed/health.
  const goals = useSavingsGoals()
  const subscription = useSubscription()
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

  // Goals beyond the account's current plan limit stay visible (nothing is
  // deleted) but are excluded from everything that lets them actually DO
  // something — contributions, pace comparison — until the account has
  // room again (upgrade, or an active goal removed). See SavingsGoalCard's
  // `locked` prop for the matching visual treatment.
  const { active: activeGoals, over: pausedGoals } = useMemo(
    () => splitByLimit(goals.goals, subscription.limits.maxGoals),
    [goals.goals, subscription.limits.maxGoals],
  )
  const pausedGoalIds = useMemo(() => new Set(pausedGoals.map((g) => g.id)), [pausedGoals])

  // Actuel vs nécessaire, per goal — only goals with a deadline (and still
  // short of it) have a "required pace" to compare against; the rest are
  // simply left out rather than shown with a meaningless comparison.
  const paceComparison = useMemo(() => {
    const now = new Date()
    return activeGoals.reduce<PaceComparisonEntry[]>((entries, goal) => {
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
  }, [activeGoals, contributions.contributions])

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
        help={tab === 'objectifs' ? OBJECTIFS_HELP : SIMULATEUR_HELP}
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
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-overlay/10">
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
                  locked={pausedGoalIds.has(goal.id)}
                />
              ))}
              {subscription.limits.maxGoals !== null && goals.goals.length >= subscription.limits.maxGoals ? (
                <UpgradePrompt
                  title={`Limite de ${subscription.limits.maxGoals} objectif${subscription.limits.maxGoals > 1 ? 's' : ''} atteinte`}
                  description="Le plan Gratuit est limité à un objectif d'épargne actif. Passe à Standard pour en suivre autant que tu veux."
                  minPlan="standard"
                />
              ) : (
                <AddGoalCard onAdd={goals.addGoal} defaultOpen={!hasGoals} />
              )}
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
                  goals={activeGoals}
                  onContribute={goals.addContribution}
                  discretionaryBudget={discretionaryBudget}
                  savingsThisMonth={savingsThisMonth}
                />
                <ContributionHistory contributions={contributions.contributions} goals={goals.goals} />
              </>
            )}
          </div>
        )
      ) : subscription.limits.advancedSimulator ? (
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
      ) : (
        <UpgradePrompt
          title="Simulateur « et si » — fonctionnalité Premium"
          description="Teste des scénarios de dépenses/épargne et vois leur impact sur ton budget et ton score avant de les appliquer pour de vrai."
          minPlan="premium"
        />
      )}
    </div>
  )
}
