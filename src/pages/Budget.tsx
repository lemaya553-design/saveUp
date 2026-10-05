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
import { getCurrencySymbol, getMonthRange, getWeekStart, WEEKS_PER_MONTH } from '../lib/format'
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
import { Card } from '../components/Card'
import { HelpButton } from '../components/HelpButton'
import { AlertBanner } from '../components/AlertBanner'
import { FixedExpenses } from '../components/FixedExpenses'
import { RecurringExpenses } from '../components/RecurringExpenses'
import { ConvertToRecurringModal } from '../components/ConvertToRecurringModal'
import { RecentExpenses } from '../components/RecentExpenses'
import { BudgetStatCards } from '../components/BudgetStatCards'
import { BudgetSpendingChart } from '../components/BudgetSpendingChart'
import { BudgetCategoryRing } from '../components/BudgetCategoryRing'
import { BudgetTrendBars } from '../components/BudgetTrendBars'
import { AddExpenseModal } from '../components/AddExpenseModal'
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

function PlusIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

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
  const [importOpen, setImportOpen] = useState(false)
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
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

  // Same formula as the weekly-budget caption already established elsewhere
  // in the app (WEEKS_PER_MONTH = 52/12) — spendableBudget ÷ weeks, minus
  // whatever's already been spent since this week's Monday.
  const { weeklyRemaining, spentThisWeek } = useMemo(() => {
    const weeklyBudget = spendableBudget / WEEKS_PER_MONTH
    const weekStart = getWeekStart(new Date())
    const spent = thisMonthRecords
      .filter((r) => new Date(r.spent_at) >= weekStart)
      .reduce((sum, r) => sum + r.amount, 0)
    return { weeklyRemaining: weeklyBudget - spent, spentThisWeek: spent }
  }, [spendableBudget, thisMonthRecords])

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
      <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
        <BudgetHero title={t.pageHeader.title} help={t.help.depenses} onAddExpense={() => setAddExpenseOpen(true)} hideAdd />

        <TabBar tabs={TAB_DEFS} active={tab} onChange={(next) => navigate(`/budget/${next}`)} />

        {error && (
          <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div
          className="rounded-2xl border p-8 text-center shadow-sm"
          style={{ borderColor: 'color-mix(in srgb, var(--color-overlay) 10%, transparent)' }}
        >
          <h2 className="text-xl font-semibold text-ink">{t.noIncome.title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{t.noIncome.description}</p>
          <label className="mx-auto mt-5 flex max-w-xs items-center gap-2">
            <span className="text-muted">{getCurrencySymbol(preferences.currency, lang)}</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-lg border bg-canvas px-3 py-2.5 text-ink placeholder-muted focus:outline-none"
              style={{ borderColor: 'color-mix(in srgb, var(--color-overlay) 12%, transparent)' }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                const value = Math.max(0, Number((e.target as HTMLInputElement).value) || 0)
                if (value > 0) income.setMonthlyIncome(value)
              }}
              onBlur={(e) => {
                const value = Math.max(0, Number(e.target.value) || 0)
                if (value > 0) income.setMonthlyIncome(value)
              }}
            />
          </label>
        </div>
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

  let spendableCaption = getSpendableBudgetCaption(rawSpendableBudget, lang, preferences.currency)
  if (savingsThisMonth > 0 && rawSpendableBudget >= 0) {
    spendableCaption += t.remaining.includesSavings(formatMoney(savingsThisMonth))
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
      <BudgetHero title={t.pageHeader.title} help={HELP_BY_TAB[tab]} onAddExpense={() => setAddExpenseOpen(true)} />

      <div className="mb-6">
        <TabBar
          tabs={TAB_DEFS}
          active={tab}
          onChange={(next) => navigate(`/budget/${next}`)}
          activeClassName="bg-[#FF7A00] text-white shadow-md"
        />
      </div>

      {/* `error` combines every hook this page loads, including
          recurring.error — gating it to 'depenses' only used to leave a
          failed add/update/remove on the Récurrences tab completely silent
          (state set, nothing rendered): the button looked like it did
          nothing. Shown on both tabs that can actually produce it. */}
      {(tab === 'depenses' || tab === 'recurrences') && error && (
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

          <BudgetStatCards
            remainingThisMonth={remainingThisMonth}
            spentThisMonth={monthly.spentThisMonth}
            spentPct={spentPct}
            monthProgressPct={monthProgressPct}
            isOverBudget={isOverBudget}
            progressCaption={t.remaining.progressCaption(spentPct, monthProgressPct)}
            spendableCaption={spendableCaption}
            monthlyIncome={income.monthlyIncome}
            onIncomeChange={income.setMonthlyIncome}
            weeklyRemaining={weeklyRemaining}
            spentThisWeek={spentThisWeek}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="flex flex-col gap-6">
              <BudgetCard title={t.spendingChart.title} hint={t.spendingChart.hint}>
                <BudgetSpendingChart
                  records={thisMonthRecords}
                  spendableBudget={spendableBudget}
                  onAddExpense={() => setAddExpenseOpen(true)}
                />
              </BudgetCard>

              <FixedExpenses
                expenses={fixed.fixedExpenses}
                total={fixed.totalFixedExpenses}
                onAdd={fixed.addFixedExpense}
                onUpdate={fixed.updateFixedExpense}
                onRemove={fixed.removeFixedExpense}
                onConvertToRecurring={setConvertingExpense}
              />

              <RecentExpenses expenses={spending.expenses} onUpdate={spending.updateExpense} onRemove={spending.removeExpense} />
            </div>

            <div className="flex flex-col gap-6">
              <BudgetCard title={t.breakdownCard.title} hint={t.breakdownCard.hint}>
                <BudgetCategoryRing categories={categoryBreakdown} onAddExpense={() => setAddExpenseOpen(true)} />
              </BudgetCard>

              <BudgetCard title={t.trendCard.title} hint={t.trendCard.hint}>
                <BudgetTrendBars months={monthlyTrend} onAddExpense={() => setAddExpenseOpen(true)} />
              </BudgetCard>

              <BudgetInsight text={insightText} />
            </div>
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
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: '#FF7A00' }}
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
                variantClassName="border-[#FF7A00]/30 bg-[#FF7A00]/10"
                linkClassName="text-[#FF7A00] hover:opacity-80"
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
      <AddExpenseModal open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} onAdd={spending.addExpense} />
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

function BudgetHero({
  title,
  help,
  onAddExpense,
  hideAdd = false,
}: {
  title: string
  help: { title?: string; purpose: string; actions: string[] }
  onAddExpense: () => void
  hideAdd?: boolean
}) {
  const { lang } = useLanguage()
  const t = BUDGET[lang]
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pt-6">
      <div className="flex items-center gap-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">{title}</h1>
        <HelpButton title={help.title ?? title} purpose={help.purpose} actions={help.actions} />
      </div>
      {!hideAdd && (
        <button
          type="button"
          onClick={onAddExpense}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ backgroundColor: '#FF7A00' }}
        >
          <PlusIcon className="h-4 w-4" />
          {t.heroAddButton}
        </button>
      )}
    </div>
  )
}

function BudgetCard({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: 'color-mix(in srgb, var(--color-overlay) 10%, transparent)' }}
    >
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{hint}</p>
      {children}
    </section>
  )
}
