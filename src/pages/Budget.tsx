import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useIncome } from '../hooks/useIncome'
import { useFixedExpenses, type FixedExpense } from '../hooks/useFixedExpenses'
import { useExpenses } from '../hooks/useExpenses'
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useSubscription } from '../hooks/useSubscription'
import { usePreferences } from '../hooks/usePreferences'
import { useRecurringExpenses } from '../hooks/useRecurringExpenses'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { getMonthRange } from '../lib/format'
import {
  computeCategoryBreakdown,
  computeMonthlyTrend,
  generateBudgetInsight,
  getSpendableBudgetCaption,
  sumThisMonth,
} from '../lib/budgetInsights'
import { getCategoryShareAlert } from '../lib/alerts'
import { canImportCsv, FREE_CSV_IMPORT_LIMIT } from '../lib/plans'
import { computeUpcomingRecurringTotal } from '../lib/recurringExpenses'
import { BUDGET } from '../lib/i18n/budget'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { AlertBanner } from '../components/AlertBanner'
import { IncomeInput } from '../components/IncomeInput'
import { FixedExpenses } from '../components/FixedExpenses'
import { RecurringExpenses } from '../components/RecurringExpenses'
import { ConvertToRecurringModal } from '../components/ConvertToRecurringModal'
import { RecentExpenses } from '../components/RecentExpenses'
import { CategoryBreakdown } from '../components/CategoryBreakdown'
import { ExpenseTrendChart } from '../components/ExpenseTrendChart'
import { BudgetInsight } from '../components/BudgetInsight'
import { PageSkeleton } from '../components/PageSkeleton'
import { TabBar, type TabDef } from '../components/TabBar'
import { CategoryManager } from '../components/CategoryManager'
import { CategorySuggestions } from '../components/CategorySuggestions'
import { RecategorizeCard } from '../components/RecategorizeCard'
import { ImportTransactionsModal } from '../components/ImportTransactionsModal'
import { UpgradePrompt } from '../components/UpgradePrompt'

type Tab = 'depenses' | 'categories' | 'import' | 'recurrences'
const TABS: Tab[] = ['depenses', 'categories', 'import', 'recurrences']

export function Budget() {
  const { tab: tabParam } = useParams<{ tab: string }>()
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const t = BUDGET[lang]
  const formatMoney = useMoneyFormat()
  const TAB_DEFS: TabDef<Tab>[] = [
    { key: 'depenses', label: t.tabs.depenses },
    { key: 'categories', label: t.tabs.categories },
    { key: 'import', label: t.tabs.import },
    { key: 'recurrences', label: t.tabs.recurrences },
  ]
  const HELP_BY_TAB: Record<Tab, { title: string; purpose: string; actions: string[] }> = {
    depenses: t.help.depenses,
    categories: t.help.categories,
    import: t.help.import,
    recurrences: t.help.recurrences,
  }
  const income = useIncome()
  const fixed = useFixedExpenses()
  const spending = useExpenses()
  const monthly = useMonthlyExpenses()
  const history = useExpenseHistory()
  const contributions = useSavingsContributions()
  const subscription = useSubscription()
  const preferences = usePreferences()
  const recurring = useRecurringExpenses()
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [convertingExpense, setConvertingExpense] = useState<FixedExpense | null>(null)

  const loading =
    income.loading ||
    fixed.loading ||
    spending.loading ||
    monthly.loading ||
    history.loading ||
    contributions.loading ||
    recurring.loading
  const error =
    income.error ||
    fixed.error ||
    spending.error ||
    monthly.error ||
    history.error ||
    contributions.error ||
    recurring.error

  const savingsThisMonth = useMemo(
    () => sumThisMonth(contributions.contributions),
    [contributions.contributions],
  )

  // Occurrences due later this month but not yet generated — counted here
  // so they show up in the budget before the actual transaction fires.
  // Already-generated occurrences are real `expenses` rows by now and are
  // already counted through monthly.spentThisMonth below, so adding them
  // here too would double-count — computeUpcomingRecurringTotal excludes
  // them by construction (see src/lib/recurringExpenses.ts).
  const upcomingRecurringTotal = useMemo(
    () => computeUpcomingRecurringTotal(recurring.rules, new Date()),
    [recurring.rules],
  )
  const atRecurringLimit =
    subscription.limits.maxRecurringExpenses !== null &&
    recurring.rules.length >= subscription.limits.maxRecurringExpenses

  // What's left to spend this month, after fixed costs, upcoming recurring
  // charges, and savings contributions already made — not just fixed
  // costs. Kept unclamped for the "alloué" caption (so an over-committed
  // month is explained rather than showing an unexplained $0) and clamped
  // for anything doing math with it (percentages, the weekly split).
  const rawSpendableBudget = useMemo(
    () => income.monthlyIncome - fixed.totalFixedExpenses - upcomingRecurringTotal - savingsThisMonth,
    [income.monthlyIncome, fixed.totalFixedExpenses, upcomingRecurringTotal, savingsThisMonth],
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
  const monthlyTrend = useMemo(() => computeMonthlyTrend(history.records, lang), [history.records, lang])
  const insightText = useMemo(
    () => generateBudgetInsight(history.records, lang),
    [history.records, lang],
  )
  const categoryShareAlert = useMemo(
    () => getCategoryShareAlert(history.records, lang),
    [history.records, lang],
  )

  if (!tabParam || !TABS.includes(tabParam as Tab)) {
    return <Navigate to="/budget/depenses" replace />
  }
  const tab = tabParam as Tab

  if (tab === 'depenses' && loading) {
    return <PageSkeleton cards={5} />
  }

  if (tab === 'depenses' && income.monthlyIncome === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-10">
        <PageHeader title={t.pageHeader.title} subtitle={t.pageHeader.subtitle} help={t.help.depenses} />

        <TabBar tabs={TAB_DEFS} active={tab} onChange={(next) => navigate(`/budget/${next}`)} />

        {error && (
          <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {showIncomeForm ? (
          <IncomeInput monthlyIncome={income.monthlyIncome} onChange={income.setMonthlyIncome} />
        ) : (
          <EmptyState
            title={t.noIncome.title}
            description={t.noIncome.description}
            actionLabel={t.noIncome.actionLabel}
            onAction={() => setShowIncomeForm(true)}
          />
        )}
      </div>
    )
  }

  const remainingThisMonth = spendableBudget - monthly.spentThisMonth
  const isOverBudget = remainingThisMonth < 0
  // A $0 budget with $0 spent must not read as "100% spent" — only fall
  // back to a full bar when something was actually spent against a budget
  // that's already at or below zero (a real overspend), matching Dashboard's
  // identical fix.
  const spentPct =
    spendableBudget > 0 ? (monthly.spentThisMonth / spendableBudget) * 100 : monthly.spentThisMonth > 0 ? 100 : 0
  const monthProgressPct = monthly.monthProgress * 100

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader title={t.pageHeader.title} subtitle={t.pageHeader.subtitle} help={HELP_BY_TAB[tab]} />

      <TabBar tabs={TAB_DEFS} active={tab} onChange={(next) => navigate(`/budget/${next}`)} />

      {tab === 'depenses' && error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {tab === 'depenses' && (
        <>
          {subscription.limits.alerts && categoryShareAlert && (
            <div className="mb-6">
              <AlertBanner>{categoryShareAlert}</AlertBanner>
            </div>
          )}

          <div className="grid gap-4">
            <div className="glass rounded-xl p-4 shadow-lg shadow-black/30">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{t.remaining.label}</p>
              <p
                className={`mt-1 text-3xl font-bold sm:text-4xl ${
                  isOverBudget ? 'text-red-400' : 'text-success'
                }`}
              >
                {formatMoney(remainingThisMonth)}
              </p>

              <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-overlay/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverBudget ? 'bg-red-400' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, spentPct)}%` }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-overlay/70"
                  style={{ left: `${Math.min(100, monthProgressPct)}%` }}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-xs text-muted">{t.remaining.progressCaption(spentPct, monthProgressPct)}</p>
              <p className={`mt-1 text-xs ${rawSpendableBudget < 0 ? 'text-red-400' : 'text-muted'}`}>
                {getSpendableBudgetCaption(rawSpendableBudget, lang, preferences.currency)}
                {savingsThisMonth > 0 && rawSpendableBudget >= 0 && t.remaining.includesSavings(formatMoney(savingsThisMonth))}
              </p>
              {upcomingRecurringTotal > 0 && (
                <p className="mt-1 text-xs text-muted">
                  {t.remaining.upcomingRecurring(formatMoney(upcomingRecurringTotal))}
                </p>
              )}
            </div>

            <Card title={t.breakdownCard.title} hint={t.breakdownCard.hint} compact>
              <CategoryBreakdown categories={categoryBreakdown} />
            </Card>

            <IncomeInput monthlyIncome={income.monthlyIncome} onChange={income.setMonthlyIncome} compact />

            <FixedExpenses
              expenses={fixed.fixedExpenses}
              total={fixed.totalFixedExpenses}
              onAdd={fixed.addFixedExpense}
              onUpdate={fixed.updateFixedExpense}
              onRemove={fixed.removeFixedExpense}
              onConvertToRecurring={setConvertingExpense}
              compact
            />

            <RecentExpenses
              expenses={spending.expenses}
              onUpdate={spending.updateExpense}
              onRemove={spending.removeExpense}
              compact
            />

            <Card title={t.trendCard.title} hint={t.trendCard.hint} compact>
              <ExpenseTrendChart months={monthlyTrend} />
            </Card>

            <BudgetInsight text={insightText} />
          </div>
        </>
      )}

      {tab === 'categories' && (
        <div className="grid gap-6">
          <CategoryManager />
          <CategorySuggestions />
          <RecategorizeCard />
        </div>
      )}

      {tab === 'import' && (
        <div className="grid gap-6">
          <Card title={t.importTab.cardTitle} hint={t.importTab.cardHint}>
            {canImportCsv(subscription.plan, preferences.csvImportCount) ? (
              <div>
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className="rounded-lg bg-primary-strong px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
                >
                  {t.importTab.importButton}
                </button>
                {subscription.plan === 'free' && (
                  <p className="mt-2 text-xs text-muted">
                    {t.importTab.freeRemaining(FREE_CSV_IMPORT_LIMIT - preferences.csvImportCount)}
                  </p>
                )}
              </div>
            ) : (
              <UpgradePrompt
                title={t.importTab.upgradeTitle}
                description={
                  subscription.plan === 'free'
                    ? t.importTab.upgradeUsedLimit(FREE_CSV_IMPORT_LIMIT)
                    : t.importTab.upgradeGeneric
                }
                minPlan="standard"
              />
            )}
          </Card>
        </div>
      )}

      {tab === 'recurrences' && (
        <div className="grid gap-6">
          <RecurringExpenses
            rules={recurring.rules}
            atLimit={atRecurringLimit}
            maxRecurringExpenses={subscription.limits.maxRecurringExpenses}
            onAdd={recurring.addRecurringExpense}
            onUpdate={recurring.updateRecurringExpense}
            onRemove={recurring.removeRecurringExpense}
          />
        </div>
      )}

      <ImportTransactionsModal open={importOpen} onClose={() => setImportOpen(false)} />
      <ConvertToRecurringModal
        expense={convertingExpense}
        atLimit={atRecurringLimit}
        maxRecurringExpenses={subscription.limits.maxRecurringExpenses}
        onClose={() => setConvertingExpense(null)}
        onConvert={async (description, amount, category, frequency, startDate, endDate) => {
          const ok = await recurring.addRecurringExpense(description, amount, category, frequency, startDate, endDate)
          if (ok && convertingExpense) await fixed.removeFixedExpense(convertingExpense.id)
          return ok
        }}
      />
    </div>
  )
}
