import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { HelpButton } from '../components/HelpButton'
import { Card } from '../components/Card'
import { PageSkeleton } from '../components/PageSkeleton'
import { TabBar, type TabDef } from '../components/TabBar'
import { MonthComparison } from '../components/MonthComparison'
import { CategorySpendingChart } from '../components/CategorySpendingChart'
import { SpendingBreakdownCard } from '../components/SpendingBreakdownCard'
import { MonthlyTrendChart } from '../components/MonthlyTrendChart'
import { MonthOverlayChart } from '../components/MonthOverlayChart'
import { IncomeExpenseTrendChart } from '../components/IncomeExpenseTrendChart'
import { BudgetVsActualChart } from '../components/BudgetVsActualChart'
import { CategoryMomList } from '../components/CategoryMomList'
import { DataExportCard } from '../components/DataExportCard'
import { RecompensesTab } from '../components/RecompensesTab'
import { StatistiquesStatCards } from '../components/StatistiquesStatCards'
import { UpgradePrompt } from '../components/UpgradePrompt'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { useExpenses } from '../hooks/useExpenses'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { useCategories } from '../hooks/useCategories'
import { useIncome } from '../hooks/useIncome'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSubscription } from '../hooks/useSubscription'
import { useCsvExport } from '../hooks/useCsvExport'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { computeCategorySpending } from '../lib/categorySpending'
import { getMonthRange } from '../lib/format'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import {
  computeBudgetVsActual,
  computeCategoryMonthOverMonth,
  computeIncomeExpenseTrend,
  computeMonthlySpendingTrend,
  computeThisVsLastMonth,
} from '../lib/statistics'

type Tab = 'apercu' | 'tendances' | 'recompenses'
const TABS: Tab[] = ['apercu', 'tendances', 'recompenses']

// Covers MAX_MONTHS_BACK below with margin (6 months × 31 days + slack).
const CONTRIBUTIONS_DAYS_BACK = 200

// Matches useExpenseHistory(5) below — the category chart's month picker
// can't go back further than the data actually fetched.
const MAX_MONTHS_BACK = 5

export function Statistiques() {
  const { tab: tabParam } = useParams<{ tab: string }>()
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang]
  const formatMoney = useMoneyFormat()
  const TAB_DEFS: TabDef<Tab>[] = [
    { key: 'apercu', label: t.tabs.apercu },
    { key: 'tendances', label: t.tabs.tendances },
    { key: 'recompenses', label: t.tabs.recompenses },
  ]
  const HELP_BY_TAB: Record<Tab, { title: string; purpose: string; actions: string[] }> = {
    apercu: t.help.apercu,
    tendances: t.help.tendances,
    recompenses: t.help.recompenses,
  }
  const history = useExpenseHistory(5) // 5 months back + current = 6 total
  const expenses = useExpenses()
  const fixed = useFixedExpenses()
  const categories = useCategories()
  const income = useIncome()
  const contributions = useSavingsContributions(CONTRIBUTIONS_DAYS_BACK)
  const goals = useSavingsGoals()
  const subscription = useSubscription()
  const csvExport = useCsvExport()

  // 0 = current month, -1 = last month, etc. — only the category-by-category
  // card is month-scoped; the trend, budget, and MoM cards are deliberately
  // fixed to "this month" (or "last N months"), matching what they're for.
  const [monthOffset, setMonthOffset] = useState(0)
  const selectedMonth = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  }, [monthOffset])
  const selectedMonthLabel = useMemo(
    () => selectedMonth.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { month: 'long', year: 'numeric' }),
    [selectedMonth, lang],
  )

  const loading =
    history.loading || fixed.loading || categories.loading || income.loading || contributions.loading || goals.loading
  const error =
    history.error || fixed.error || categories.error || income.error || contributions.error || goals.error

  const categorySpending = useMemo(
    () => computeCategorySpending(history.records, income.monthlyIncome, selectedMonth),
    [history.records, income.monthlyIncome, selectedMonth],
  )
  const monthlyTrend = useMemo(
    () => computeMonthlySpendingTrend(history.records, lang),
    [history.records, lang],
  )
  const incomeExpenseTrend = useMemo(
    () => computeIncomeExpenseTrend(history.records, fixed.totalFixedExpenses, income.monthlyIncome, lang),
    [history.records, fixed.totalFixedExpenses, income.monthlyIncome, lang],
  )
  const momChanges = useMemo(() => computeCategoryMonthOverMonth(history.records), [history.records])
  // Same data as momChanges, just re-sorted biggest-last-month-first and
  // limited to categories that actually had a last month to compare
  // against — a category with $0 last month has no reference to overlay
  // against and is already covered by CategoryMomList's "nouveau" case.
  const lastMonthOverlay = useMemo(
    () =>
      momChanges
        .filter((c) => c.lastMonth > 0)
        .slice()
        .sort((a, b) => b.lastMonth - a.lastMonth),
    [momChanges],
  )
  const budgetVsActual = useMemo(
    () => computeBudgetVsActual(categories.categories, fixed.fixedExpenses, history.records),
    [categories.categories, fixed.fixedExpenses, history.records],
  )
  const thisVsLastMonth = useMemo(() => computeThisVsLastMonth(history.records), [history.records])
  const lastMonthLabel = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString(
      lang === 'fr' ? 'fr-CA' : 'en-CA',
      { month: 'long' },
    )
  }, [lang])

  // Contributions made during the selected month — same window the category
  // chart's own picker uses, so clicking prev/next moves both together.
  const goalNameById = useMemo(() => new Map(goals.goals.map((g) => [g.id, g.name])), [goals.goals])
  const savingsForMonth = useMemo(() => {
    const { start, end } = getMonthRange(selectedMonth)
    const inMonth = contributions.contributions.filter((c) => {
      const d = new Date(c.created_at)
      return d >= start && d < end
    })
    return {
      total: inMonth.reduce((sum, c) => sum + c.amount, 0),
      transactions: inMonth.map((c) => ({
        id: c.id,
        description: c.goal_id
          ? t.contributionDescription(goalNameById.get(c.goal_id) ?? t.fallbackGoalName)
          : t.contributionDescriptionGeneric,
        amount: c.amount,
        spent_at: c.created_at,
      })),
    }
  }, [contributions.contributions, goalNameById, selectedMonth, t])

  const spentThisSelectedMonth = useMemo(
    () => categorySpending.reduce((sum, e) => sum + e.total, 0),
    [categorySpending],
  )
  const withinBudgetCount = useMemo(() => budgetVsActual.filter((s) => !s.overBudget).length, [budgetVsActual])

  if (!tabParam || !TABS.includes(tabParam as Tab)) {
    return <Navigate to="/statistiques/apercu" replace />
  }
  const tab = tabParam as Tab

  if (tab !== 'recompenses' && loading) {
    return <PageSkeleton cards={4} />
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 pt-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">{t.page.title}</h1>
        <HelpButton title={HELP_BY_TAB[tab].title ?? t.page.title} purpose={HELP_BY_TAB[tab].purpose} actions={HELP_BY_TAB[tab].actions} />
      </div>

      <div className="mb-6">
        <TabBar
          tabs={TAB_DEFS}
          active={tab}
          onChange={(next) => navigate(`/statistiques/${next}`)}
          activeClassName="bg-[#FF7A00] text-white shadow-md"
        />
      </div>

      {tab !== 'recompenses' && error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {tab === 'apercu' && (
        <div className="grid gap-6">
          <StatistiquesStatCards
            spentThisMonth={spentThisSelectedMonth}
            monthLabel={selectedMonthLabel}
            monthlyIncome={income.monthlyIncome}
            categoriesTracked={categorySpending.length}
            withinBudgetCount={withinBudgetCount}
            budgetTrackedCount={budgetVsActual.length}
            formatMoney={formatMoney}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <SpendingBreakdownCard
              historyRecords={history.records}
              fixedExpenses={fixed.fixedExpenses}
              monthlyIncome={income.monthlyIncome}
              maxMonthsBack={MAX_MONTHS_BACK}
            />

            <Card title={t.apercu.categoryCard.title} hint={t.apercu.categoryCard.hint}>
              <div className="mb-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setMonthOffset((o) => Math.max(-MAX_MONTHS_BACK, o - 1))}
                  disabled={monthOffset <= -MAX_MONTHS_BACK}
                  aria-label={t.monthNav.prev}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-overlay/5 disabled:opacity-30"
                >
                  ‹
                </button>
                <span className="min-w-[9rem] text-center text-sm font-medium capitalize text-ink">
                  {selectedMonthLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
                  disabled={monthOffset >= 0}
                  aria-label={t.monthNav.next}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-overlay/5 disabled:opacity-30"
                >
                  ›
                </button>
              </div>

              {monthOffset !== 0 && (
                <p className="mb-3 text-center text-xs text-muted">{t.apercu.categoryCard.pctNote}</p>
              )}

              <CategorySpendingChart
                entries={categorySpending}
                savingsTotal={savingsForMonth.total}
                savingsTransactions={savingsForMonth.transactions}
                categories={categories.categories}
                onRenameCategory={categories.renameCategory}
                onReclassify={(t, newCategory) => expenses.updateExpense(t.id, t.description, t.amount, newCategory)}
              />
            </Card>
          </div>

          <Card title={t.apercu.budgetVsActualCard.title} hint={t.apercu.budgetVsActualCard.hint}>
            <BudgetVsActualChart statuses={budgetVsActual} />
          </Card>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-ink">{t.apercu.manageData.heading}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <DataExportCard canExport={subscription.limits.dataExport} />

              <Card title={t.apercu.csvCard.title} hint={t.apercu.csvCard.hint}>
                {csvExport.error && <p className="mb-3 text-sm text-red-400">{csvExport.error}</p>}
                <button
                  type="button"
                  onClick={csvExport.exportAll}
                  disabled={csvExport.exporting}
                  className="budget-btn-primary rounded-lg px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-60"
                >
                  {csvExport.exporting ? t.apercu.csvCard.exporting : t.apercu.csvCard.download}
                </button>
              </Card>
            </div>
          </div>
        </div>
      )}

      {tab === 'tendances' && (
        <div className="grid gap-6">
          {subscription.limits.fullStatistics && (
            <MonthComparison
              currentAmount={thisVsLastMonth.thisMonth}
              previousAmount={thisVsLastMonth.lastMonth}
              previousLabel={lastMonthLabel}
            />
          )}

          {subscription.limits.fullStatistics ? (
            <>
              <Card title={t.tendances.comparisonCard.title} hint={t.tendances.comparisonCard.hint}>
                <MonthOverlayChart entries={lastMonthOverlay} />
              </Card>

              <Card title={t.tendances.trendCard.title} hint={t.tendances.trendCard.hint}>
                <MonthlyTrendChart points={monthlyTrend} />
              </Card>
            </>
          ) : (
            <UpgradePrompt
              title={t.tendances.upgradeTrends.title}
              description={t.tendances.upgradeTrends.description}
              variantClassName="border-[#FF7A00]/30 bg-[#FF7A00]/10"
              linkClassName="text-[#FF7A00] hover:opacity-80"
              minPlan="standard"
            />
          )}

          <Card title={t.tendances.momCard.title} hint={t.tendances.momCard.hint}>
            <CategoryMomList changes={momChanges} />
          </Card>

          {subscription.limits.incomeExpenseTrend ? (
            <Card title={t.tendances.incomeExpenseCard.title} hint={t.tendances.incomeExpenseCard.hint}>
              <IncomeExpenseTrendChart points={incomeExpenseTrend} />
            </Card>
          ) : (
            <UpgradePrompt
              title={t.tendances.upgradeIncomeExpense.title}
              description={t.tendances.upgradeIncomeExpense.description}
              variantClassName="border-[#FF7A00]/30 bg-[#FF7A00]/10"
              linkClassName="text-[#FF7A00] hover:opacity-80"
              minPlan="standard"
            />
          )}
        </div>
      )}

      {tab === 'recompenses' && <RecompensesTab />}
    </div>
  )
}
