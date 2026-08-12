import { useMemo, useState } from 'react'
import { useIncome } from '../hooks/useIncome'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { useExpenses } from '../hooks/useExpenses'
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { getMonthRange, formatCurrency } from '../lib/format'
import {
  computeCategoryBreakdown,
  computeMonthlyTrend,
  generateBudgetInsight,
  getSpendableBudgetCaption,
  sumThisMonth,
} from '../lib/budgetInsights'
import { getCategoryShareAlert } from '../lib/alerts'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { AlertBanner } from '../components/AlertBanner'
import { IncomeInput } from '../components/IncomeInput'
import { FixedExpenses } from '../components/FixedExpenses'
import { RecentExpenses } from '../components/RecentExpenses'
import { CategoryBreakdown } from '../components/CategoryBreakdown'
import { ExpenseTrendChart } from '../components/ExpenseTrendChart'
import { BudgetInsight } from '../components/BudgetInsight'
import { PageSkeleton } from '../components/PageSkeleton'

export function Budget() {
  const income = useIncome()
  const fixed = useFixedExpenses()
  const spending = useExpenses()
  const monthly = useMonthlyExpenses()
  const history = useExpenseHistory()
  const contributions = useSavingsContributions()
  const [showIncomeForm, setShowIncomeForm] = useState(false)

  const loading =
    income.loading ||
    fixed.loading ||
    spending.loading ||
    monthly.loading ||
    history.loading ||
    contributions.loading
  const error =
    income.error || fixed.error || spending.error || monthly.error || history.error || contributions.error

  const savingsThisMonth = useMemo(
    () => sumThisMonth(contributions.contributions),
    [contributions.contributions],
  )

  // What's left to spend this month, after fixed costs AND savings
  // contributions already made — not just fixed costs. Kept unclamped for
  // the "alloué" caption (so an over-committed month is explained rather
  // than showing an unexplained $0) and clamped for anything doing math
  // with it (percentages, the weekly split).
  const rawSpendableBudget = useMemo(
    () => income.monthlyIncome - fixed.totalFixedExpenses - savingsThisMonth,
    [income.monthlyIncome, fixed.totalFixedExpenses, savingsThisMonth],
  )
  const spendableBudget = Math.max(0, rawSpendableBudget)

  const thisMonthRecords = useMemo(() => {
    const { start, end } = getMonthRange(new Date())
    return history.records.filter((r) => {
      const d = new Date(r.spent_at)
      return d >= start && d < end
    })
  }, [history.records])

  const categoryBreakdown = useMemo(
    () => computeCategoryBreakdown(fixed.fixedExpenses, thisMonthRecords, savingsThisMonth),
    [fixed.fixedExpenses, thisMonthRecords, savingsThisMonth],
  )
  const monthlyTrend = useMemo(() => computeMonthlyTrend(history.records), [history.records])
  const insightText = useMemo(() => generateBudgetInsight(history.records), [history.records])
  const categoryShareAlert = useMemo(() => getCategoryShareAlert(history.records), [history.records])

  if (loading) {
    return <PageSkeleton cards={5} />
  }

  if (income.monthlyIncome === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-10">
        <PageHeader
          title="Où va ton argent ce mois-ci"
          subtitle="Revenu, dépenses fixes et budget de la semaine."
        />

        {error && (
          <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {showIncomeForm ? (
          <IncomeInput monthlyIncome={income.monthlyIncome} onChange={income.setMonthlyIncome} />
        ) : (
          <EmptyState
            title="Tu n'as pas encore de budget"
            description="Commence par ajouter ton revenu mensuel — le reste se calcule automatiquement à partir de là."
            actionLabel="Ajouter mes revenus"
            onAction={() => setShowIncomeForm(true)}
          />
        )}
      </div>
    )
  }

  const remainingThisMonth = spendableBudget - monthly.spentThisMonth
  const isOverBudget = remainingThisMonth < 0
  const spentPct = spendableBudget > 0 ? (monthly.spentThisMonth / spendableBudget) * 100 : 100
  const monthProgressPct = monthly.monthProgress * 100

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Où va ton argent ce mois-ci"
        subtitle="Revenu, dépenses fixes et budget de la semaine."
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {categoryShareAlert && (
        <div className="mb-6">
          <AlertBanner>{categoryShareAlert}</AlertBanner>
        </div>
      )}

      <div className="grid gap-6">
        {/* 1. Résumé en haut */}
        <div className="glass rounded-2xl p-6 shadow-lg shadow-black/30">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Il te reste ce mois-ci
          </p>
          <p
            className={`mt-1 text-4xl font-bold sm:text-5xl ${
              isOverBudget ? 'text-red-400' : 'text-success'
            }`}
          >
            {formatCurrency(remainingThisMonth)}
          </p>

          <div className="relative mt-5 h-3 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${
                isOverBudget ? 'bg-red-400' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, spentPct)}%` }}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-white/70"
              style={{ left: `${Math.min(100, monthProgressPct)}%` }}
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {Math.round(spentPct)}% dépensé · {Math.round(monthProgressPct)}% du mois écoulé
            (repère blanc)
          </p>
          <p className={`mt-1 text-xs ${rawSpendableBudget < 0 ? 'text-red-400' : 'text-muted'}`}>
            {getSpendableBudgetCaption(rawSpendableBudget)}
            {savingsThisMonth > 0 && rawSpendableBudget >= 0 && (
              <> — inclut {formatCurrency(savingsThisMonth)} déjà mis de côté ce mois-ci.</>
            )}
          </p>
        </div>

        {/* 3. Répartition par catégorie */}
        <Card
          title="Répartition par catégorie"
          hint="Dépenses fixes, dépenses du mois et épargne, regroupées par catégorie."
        >
          <CategoryBreakdown categories={categoryBreakdown} />
        </Card>

        <IncomeInput monthlyIncome={income.monthlyIncome} onChange={income.setMonthlyIncome} />

        {/* 4. Dépenses fixes */}
        <FixedExpenses
          expenses={fixed.fixedExpenses}
          total={fixed.totalFixedExpenses}
          onAdd={fixed.addFixedExpense}
          onUpdate={fixed.updateFixedExpense}
          onRemove={fixed.removeFixedExpense}
        />

        {/* 5. Dépenses récentes */}
        <RecentExpenses
          expenses={spending.expenses}
          onUpdate={spending.updateExpense}
          onRemove={spending.removeExpense}
        />

        {/* 6. Tendance 3 mois */}
        <Card title="Tendance sur 3 mois" hint="Total de tes dépenses du jour le jour, mois par mois.">
          <ExpenseTrendChart months={monthlyTrend} />
        </Card>

        {/* 7. Insight automatique */}
        <BudgetInsight text={insightText} />
      </div>
    </div>
  )
}
