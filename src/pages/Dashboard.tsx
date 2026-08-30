import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { ScoreTrendBadge } from '../components/ScoreTrendBadge'
import { ScoreGauge } from '../components/ScoreGauge'
import { AlertBanner } from '../components/AlertBanner'
import { DashboardStat } from '../components/DashboardStat'
import { PersonalizedTips } from '../components/PersonalizedTips'
import { PageSkeleton } from '../components/PageSkeleton'
import {
  BudgetIllustration,
  SavingsIllustration,
  StatsIllustration,
  BadgesIllustration,
} from '../components/FeatureIllustrations'
import { useFinancialHealth } from '../hooks/useFinancialHealth'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useInvestmentBalance } from '../hooks/useInvestmentBalance'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { useSubscription } from '../hooks/useSubscription'
import { usePreferences } from '../hooks/usePreferences'
import { formatCurrency } from '../lib/format'
import { getSpendableBudgetCaption, sumThisMonth } from '../lib/budgetInsights'
import { getBudgetPaceAlert, getSavingsGoalLateAlert } from '../lib/alerts'
import { generatePersonalizedTips } from '../lib/tips'

const FEATURE_LINKS = [
  {
    to: '/budget',
    Illustration: BudgetIllustration,
    title: 'Budget',
    description: 'Dépenses par catégorie, comparées à ce que tu t\'es fixé.',
  },
  {
    to: '/epargne',
    Illustration: SavingsIllustration,
    title: 'Épargne',
    description: 'Tes objectifs et leur progression.',
  },
  {
    to: '/statistiques',
    Illustration: StatsIllustration,
    title: 'Statistiques',
    description: 'Tendances et comparaisons mensuelles, en détail.',
  },
  {
    to: '/recompenses',
    Illustration: BadgesIllustration,
    title: 'Récompenses',
    description: 'Tes badges et ta série de connexions.',
  },
]

const DASHBOARD_HELP = {
  purpose:
    'Un coup d\'œil sur ta santé financière : ton score, ce qu\'il te reste à dépenser ce mois-ci et la progression de tes objectifs.',
  actions: [
    'Consulte ton score de santé financière et son évolution récente.',
    'Vérifie combien il te reste à dépenser ce mois-ci.',
    'Lis tes conseils personnalisés — générés à partir de tes vraies dépenses et objectifs.',
    'Clique sur une carte (Budget, Épargne, Statistiques...) pour y aller directement.',
  ],
}

export function Dashboard() {
  const navigate = useNavigate()
  const health = useFinancialHealth()
  const goals = useSavingsGoals()
  const contributions = useSavingsContributions()
  const investmentBalance = useInvestmentBalance()
  const expenseHistory = useExpenseHistory()
  const subscription = useSubscription()
  const preferences = usePreferences()

  const loading =
    health.loading || goals.loading || contributions.loading || investmentBalance.loading || expenseHistory.loading
  const error =
    health.error || goals.error || contributions.error || investmentBalance.error || expenseHistory.error

  const savingsThisMonth = useMemo(
    () => sumThisMonth(contributions.contributions),
    [contributions.contributions],
  )

  // What's left to spend this month, after fixed costs AND savings
  // contributions already made — matches the Budget page's calculation.
  // Kept unclamped for the caption (so an over-committed month is visible
  // and explained) and clamped for anything doing math with it (a
  // percentage or a progress bar can't sensibly work off a negative total).
  const rawSpendableBudget = health.discretionaryBudget - savingsThisMonth
  const spendableBudget = Math.max(0, rawSpendableBudget)

  // Data-driven, not a localStorage flag: a flag would be scoped to this
  // browser, not this account, and would wrongly skip onboarding for a
  // brand-new account that happens to share a browser with an old one.
  // "Fresh" means nothing has ever been saved for this account — no income
  // row at all (hasIncomeRecord, distinct from monthlyIncome === 0, which a
  // returning user could legitimately have), no fixed expenses, no goals.
  const isFreshUser =
    !loading &&
    !health.hasIncomeRecord &&
    health.totalFixedExpenses === 0 &&
    goals.goals.length === 0

  useEffect(() => {
    if (!loading && isFreshUser) {
      navigate('/onboarding', { replace: true })
    }
  }, [loading, isFreshUser, navigate])

  if (loading) {
    return <PageSkeleton cards={4} />
  }

  if (isFreshUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-10">
        <PageHeader
          title="Comment tu t'en sors"
          subtitle="Ton portrait financier en un coup d'œil."
          help={DASHBOARD_HELP}
        />
        <EmptyState
          title="Tu n'as pas encore de budget"
          description="Commence par ajouter ton revenu mensuel — tout le reste (budget, alertes, score) se calcule automatiquement à partir de là."
          actionLabel="Ajouter mes revenus"
          actionTo="/budget"
        />
      </div>
    )
  }

  const budgetPct = spendableBudget > 0 ? (health.spentThisMonth / spendableBudget) * 100 : 100
  const isOverBudget = budgetPct > 100 || rawSpendableBudget < 0

  const totalCurrentAmount = goals.goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTargetAmount = goals.goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const goalProgress = totalTargetAmount > 0 ? Math.min(100, (totalCurrentAmount / totalTargetAmount) * 100) : 0

  const budgetPaceAlert = getBudgetPaceAlert({
    spentThisMonth: health.spentThisMonth,
    discretionaryBudget: spendableBudget,
    monthProgress: health.monthProgress,
  })
  // Only the single most urgent late goal, to keep the banner list short.
  const savingsGoalLateAlert = goals.goals
    .map((g) => getSavingsGoalLateAlert(g))
    .find((alert) => alert !== null)

  const tips = generatePersonalizedTips({
    expenseRecords: expenseHistory.records,
    goals: goals.goals,
    contributions: contributions.contributions,
    mainGoal: preferences.onboardingMainGoal,
  })

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Comment tu t'en sors"
        subtitle="Ton portrait financier en un coup d'œil."
        help={DASHBOARD_HELP}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {subscription.limits.alerts && (budgetPaceAlert || savingsGoalLateAlert) && (
        <div className="mb-6">
          {budgetPaceAlert && <AlertBanner>{budgetPaceAlert}</AlertBanner>}
          {savingsGoalLateAlert && <AlertBanner>{savingsGoalLateAlert}</AlertBanner>}
        </div>
      )}

      {/* Score gets the visual lead — it's the one number meant to answer
          "how am I doing," everything else here is supporting detail. The
          featured card takes 3/5 of the row on wider screens, with spent/saved
          stacked narrower beside it rather than three equal-weight boxes. */}
      <div className="mb-6 grid gap-4 sm:grid-cols-5">
        <div className="glass flex flex-col items-center rounded-2xl p-6 text-center shadow-lg shadow-black/30 sm:col-span-3 sm:justify-center">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Score de santé</p>
          <div className="mt-2 w-full max-w-[240px]">
            <ScoreGauge score={health.breakdown.score} />
          </div>
          <ScoreTrendBadge trend={health.trend} />
          <p className="mt-3 max-w-[26ch] text-xs text-muted">
            Reflète tes habitudes de dépenses et de budget.{' '}
            <Link to="/recompenses" className="text-accent hover:text-accent/80">
              Voir tes récompenses →
            </Link>
          </p>
        </div>

        <div className="grid gap-4 sm:col-span-2">
          <DashboardStat
            label="Dépensé ce mois-ci"
            value={formatCurrency(health.spentThisMonth)}
            valueColorClass={isOverBudget ? 'text-red-400' : 'text-ink'}
            progress={budgetPct}
            progressColorClass={isOverBudget ? 'bg-red-400' : 'bg-primary'}
            caption={getSpendableBudgetCaption(rawSpendableBudget)}
          />

          <DashboardStat
            label="Épargné"
            value={formatCurrency(totalCurrentAmount)}
            valueColorClass="text-success"
            progress={totalTargetAmount > 0 ? goalProgress : undefined}
            progressColorClass="bg-success"
            caption={
              <Link to="/epargne" className="hover:text-accent">
                {goals.goals.length === 0
                  ? 'Fixe un objectif dans Épargne →'
                  : goals.goals.length === 1
                    ? `vers ${formatCurrency(totalTargetAmount)} →`
                    : `${goals.goals.length} objectifs actifs →`}
              </Link>
            }
          />
        </div>
      </div>

      <div className="grid gap-6">
        <Card
          title="Ce que tu as accumulé"
          hint="Épargne totale (tous objectifs) et montant réellement investi à ce jour."
        >
          <p className="text-3xl font-bold text-success sm:text-4xl">
            {formatCurrency(totalCurrentAmount + investmentBalance.currentAmount)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted">Épargné</p>
              <p className="font-medium text-ink">{formatCurrency(totalCurrentAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Investi</p>
              <Link to="/investissement" className="font-medium text-ink hover:text-accent">
                {formatCurrency(investmentBalance.currentAmount)}
              </Link>
            </div>
          </div>
        </Card>

        <PersonalizedTips tips={tips} />

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
            Aller plus loin
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURE_LINKS.map(({ to, Illustration, title, description }) => (
              <Link
                key={to}
                to={to}
                className="hover-lift glass flex min-w-0 items-center gap-3 rounded-2xl p-4 shadow-lg shadow-black/30"
              >
                <Illustration variant="icon" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{title}</p>
                  <p className="truncate text-xs text-muted">{description}</p>
                </div>
                <span className="shrink-0 text-accent">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
