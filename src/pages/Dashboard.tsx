import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { ProgressBar } from '../components/ProgressBar'
import { ScoreTrendBadge } from '../components/ScoreTrendBadge'
import { ScoreGauge } from '../components/ScoreGauge'
import { ScoreHistoryChart } from '../components/ScoreHistoryChart'
import { AlertBanner } from '../components/AlertBanner'
import { RewardsPreview } from '../components/RewardsPreview'
import { DashboardStat } from '../components/DashboardStat'
import { MonthComparison } from '../components/MonthComparison'
import { QuickAmountEdit } from '../components/QuickAmountEdit'
import { PageSkeleton } from '../components/PageSkeleton'
import { useFinancialHealth } from '../hooks/useFinancialHealth'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useExpenses } from '../hooks/useExpenses'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useInvestmentBalance } from '../hooks/useInvestmentBalance'
import { formatCurrency } from '../lib/format'
import { getScoreExplanations } from '../lib/financialHealth'
import { getSpendableBudgetCaption, sumThisMonth } from '../lib/budgetInsights'
import { getBudgetPaceAlert, getSavingsGoalLateAlert } from '../lib/alerts'

function PlusIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function getLastMonthName(): string {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return lastMonth.toLocaleDateString('fr-CA', { month: 'long' })
}

export function Dashboard() {
  const navigate = useNavigate()
  const health = useFinancialHealth()
  const goals = useSavingsGoals()
  const expenses = useExpenses()
  const contributions = useSavingsContributions()
  const investmentBalance = useInvestmentBalance()

  const [quickDescription, setQuickDescription] = useState('')
  const [quickAmount, setQuickAmount] = useState('')

  const loading =
    health.loading || goals.loading || expenses.loading || contributions.loading || investmentBalance.loading
  const error =
    health.error || goals.error || expenses.error || contributions.error || investmentBalance.error

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

  function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(quickAmount)
    if (!quickDescription.trim() || !parsed || parsed <= 0) return
    expenses.addExpense(quickDescription.trim(), parsed)
    setQuickDescription('')
    setQuickAmount('')
  }

  if (isFreshUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-10">
        <PageHeader
          title="Comment tu t'en sors ce mois-ci"
          subtitle="Ton portrait financier en un coup d'œil."
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

  const scoreExplanations = getScoreExplanations(health.breakdown)
  const weakestExplanation = scoreExplanations.reduce((worst, item) =>
    item.value / item.max < worst.value / worst.max ? item : worst,
  )

  const budgetPaceAlert = getBudgetPaceAlert({
    spentThisMonth: health.spentThisMonth,
    discretionaryBudget: spendableBudget,
    monthProgress: health.monthProgress,
  })
  // Only the single most urgent late goal, to keep the banner list short.
  const savingsGoalLateAlert = goals.goals
    .map((g) => getSavingsGoalLateAlert(g))
    .find((alert) => alert !== null)

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Comment tu t'en sors ce mois-ci"
        subtitle="Ton portrait financier en un coup d'œil."
      />

      <QuickAmountEdit label="Revenu mensuel" amount={health.monthlyIncome} onChange={health.setMonthlyIncome} />

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {(budgetPaceAlert || savingsGoalLateAlert) && (
        <div className="mb-6">
          {budgetPaceAlert && <AlertBanner>{budgetPaceAlert}</AlertBanner>}
          {savingsGoalLateAlert && <AlertBanner>{savingsGoalLateAlert}</AlertBanner>}
        </div>
      )}

      {/* The 3 headline numbers — biggest, most contrasted elements on the page. */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5 shadow-lg shadow-black/30">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Score de santé
          </p>
          <div className="mt-1">
            <ScoreGauge score={health.breakdown.score} />
          </div>
          <div className="-mt-2 flex justify-center">
            <ScoreTrendBadge trend={health.trend} />
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Reflète tes habitudes de dépenses et de budget.{' '}
            <Link to="/recompenses" className="text-accent hover:text-accent/80">
              Voir ton score d'épargne →
            </Link>
          </p>
        </div>

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

      {/* Primary action: visible without scrolling, no navigation needed. */}
      <section className="glass mb-6 rounded-2xl p-6 shadow-lg shadow-black/30 ring-1 ring-primary/30">
        <h2 className="text-xl font-bold text-ink">Ajoute une dépense</h2>
        <p className="mb-4 mt-1 text-xs text-muted">
          Note-la en 5 secondes pour garder ton score à jour.
        </p>
        <form onSubmit={handleQuickAdd} className="flex flex-wrap gap-2">
          <input
            type="text"
            value={quickDescription}
            onChange={(e) => setQuickDescription(e.target.value)}
            placeholder="Description (ex: Café)"
            className="min-w-[140px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={quickAmount}
            onChange={(e) => setQuickAmount(e.target.value)}
            placeholder="Montant"
            className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-primary-strong px-6 py-3 text-base font-semibold text-white shadow-[0_0_20px_rgba(74,108,247,0.35)] transition-all hover:brightness-110"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter
          </button>
        </form>
      </section>

      <div className="grid gap-6">
        <MonthComparison
          currentAmount={health.spentThisMonth}
          previousAmount={health.spentLastMonth}
          previousLabel={getLastMonthName()}
        />

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

        <RewardsPreview totalCurrentAmount={totalCurrentAmount} goals={goals.goals} />

        <Card title="Détail du score" hint="Ce qui fait bouger ton score.">
          <div className="space-y-2">
            {scoreExplanations.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-ink">{item.label}</span>
                  <span className="text-muted">
                    {item.value}/{item.max}
                  </span>
                </div>
                <ProgressBar value={(item.value / item.max) * 100} colorClass="bg-accent" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">{weakestExplanation.detail}</p>

          <div className="mt-5 border-t border-white/10 pt-4">
            <ScoreHistoryChart history={health.history} />
          </div>
        </Card>
      </div>
    </div>
  )
}
