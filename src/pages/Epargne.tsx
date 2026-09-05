import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
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
import { DuelsTab } from '../components/DuelsTab'
import { InvestissementTab } from '../components/InvestissementTab'
import { UpgradePrompt } from '../components/UpgradePrompt'
import { PageSkeleton } from '../components/PageSkeleton'
import { TabBar, type TabDef } from '../components/TabBar'
import { useSubscription } from '../hooks/useSubscription'
import { useDuels } from '../hooks/useDuels'
import { splitByLimit } from '../lib/plans'

type Tab = 'objectifs' | 'simulateur' | 'duels' | 'investissement'
const TABS: Tab[] = ['objectifs', 'simulateur', 'duels', 'investissement']
const TAB_DEFS: TabDef<Tab>[] = [
  { key: 'objectifs', label: 'Objectifs' },
  { key: 'simulateur', label: 'Simulateur « et si »' },
  { key: 'duels', label: 'Duels' },
  { key: 'investissement', label: 'Investissement' },
]

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

const DUELS_HELP = {
  title: 'Duels',
  purpose: "Affronte un ami sur vos objectifs d'épargne respectifs, chacun sur son propre argent.",
  actions: [
    'Lance un duel depuis un de tes objectifs (onglet Objectifs), et envoie le lien à un ami.',
    'Vous voyez chacun le % de progression de l\'autre — jamais les montants en dollars.',
    'Le duel dure 30, 60 ou 90 jours ; à la fin, celui qui a le plus progressé gagne.',
  ],
}

const INVESTISSEMENT_HELP = {
  title: 'Investissement',
  purpose: 'Estime la croissance future d\'un placement grâce à l\'intérêt composé.',
  actions: [
    'Indique le montant actuellement investi et un taux de rendement annuel.',
    'Compare la projection sur différentes durées (1, 5, 10 ans...).',
    'Consulte l\'estimation du temps pour doubler ton placement (règle du 72).',
  ],
}

const HELP_BY_TAB: Record<Tab, typeof OBJECTIFS_HELP> = {
  objectifs: OBJECTIFS_HELP,
  simulateur: SIMULATEUR_HELP,
  duels: DUELS_HELP,
  investissement: INVESTISSEMENT_HELP,
}

export function Epargne() {
  const { tab: tabParam } = useParams<{ tab: string }>()
  const navigate = useNavigate()
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Loaded once here and passed down to the Objectifs/Simulateur tabs, so
  // switching between them never re-fetches — Duels and Investissement stay
  // self-contained (own hook instances), same as every other standalone tab
  // folded into this page.
  const goals = useSavingsGoals()
  const subscription = useSubscription()
  const duels = useDuels()
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

  if (!tabParam || !TABS.includes(tabParam as Tab)) {
    return <Navigate to="/epargne/objectifs" replace />
  }
  const tab = tabParam as Tab

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
        subtitle="Tes objectifs d'épargne, un simulateur, tes duels et tes placements."
        help={HELP_BY_TAB[tab]}
      />

      <TabBar tabs={TAB_DEFS} active={tab} onChange={(next) => navigate(`/epargne/${next}`)} />

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
                  onSetPhoto={goals.setGoalPhoto}
                  onRemovePhoto={goals.removeGoalPhoto}
                  onCreateDuel={duels.createDuel}
                  isDueling={duels.busyGoalIds.has(goal.id)}
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
                <AddGoalCard onAdd={goals.addGoal} onSetPhoto={goals.setGoalPhoto} defaultOpen={!hasGoals} />
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
      ) : tab === 'simulateur' ? (
        subscription.limits.advancedSimulator ? (
          <SimulateurTab
            health={health}
            fixed={fixed}
            goals={goals}
            contributions={contributions}
            categorySpending={categorySpending}
            onGoToObjectifs={() => {
              navigate('/epargne/objectifs')
              setShowCreateForm(true)
            }}
          />
        ) : (
          <UpgradePrompt
            title="Simulateur « et si » — fonctionnalité Premium"
            description="Teste des scénarios de dépenses/épargne et vois leur impact sur ton budget et ton score avant de les appliquer pour de vrai."
            minPlan="premium"
          />
        )
      ) : tab === 'duels' ? (
        <DuelsTab onGoToObjectifs={() => navigate('/epargne/objectifs')} />
      ) : (
        <InvestissementTab />
      )}
    </div>
  )
}
