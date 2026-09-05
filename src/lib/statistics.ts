import { getMonthRange, getPreviousMonthRange, toDateString } from './format'

// ---------------------------------------------------------------------------
// 6-month (or fewer) spending trend

export interface MonthlySpendingPoint {
  label: string
  monthStart: string
  amount: number
}

// Unlike Budget's 3-month computeMonthlyTrend (kept separate and untouched —
// its "show a global fallback if everything is zero" behavior is
// established and shouldn't change), this trims LEADING months before the
// user's earliest expense record, so a 2-month-old account shows 2 months,
// not 6 mostly-empty ones ("6 derniers mois, ou moins si pas assez de
// données").
export function computeMonthlySpendingTrend(
  records: { amount: number; spent_at: string }[],
  now = new Date(),
  maxMonths = 6,
): MonthlySpendingPoint[] {
  if (records.length === 0) {
    const { start } = getMonthRange(now)
    return [{ label: start.toLocaleDateString('fr-CA', { month: 'short' }), monthStart: toDateString(start), amount: 0 }]
  }

  const earliestSpentAt = records.reduce((min, r) => (r.spent_at < min ? r.spent_at : min), records[0].spent_at)
  const earliestDate = new Date(earliestSpentAt)
  const earliestMonthStart = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1)

  const points: MonthlySpendingPoint[] = []
  for (let offset = maxMonths - 1; offset >= 0; offset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    if (monthDate < earliestMonthStart) continue

    const { start, end } = getMonthRange(monthDate)
    const amount = records
      .filter((r) => {
        const d = new Date(r.spent_at)
        return d >= start && d < end
      })
      .reduce((sum, r) => sum + r.amount, 0)

    points.push({
      label: monthDate.toLocaleDateString('fr-CA', { month: 'short' }),
      monthStart: toDateString(start),
      amount,
    })
  }
  return points
}

// ---------------------------------------------------------------------------
// Income vs. expenses trend, with the resulting savings rate — Standard+.
// Income and fixed expenses have no history of their own (budget_settings/
// fixed_expenses each hold only their CURRENT value, never past ones), so
// both are held constant across every month here and applied retroactively
// — same "current data as the best available proxy for the past" trade-off
// this page's month picker already makes for pctOfIncome. Only the ad-hoc
// portion of expenses is real per-month history.

export interface IncomeExpenseTrendPoint {
  label: string
  monthStart: string
  income: number
  expenses: number
  // Can go negative (a month spent more than the current income) —
  // deliberately not clamped, since hiding that is worse than showing it.
  savingsRatePct: number
}

export function computeIncomeExpenseTrend(
  adHocRecords: { amount: number; spent_at: string }[],
  currentFixedExpensesTotal: number,
  monthlyIncome: number,
  now = new Date(),
  maxMonths = 6,
): IncomeExpenseTrendPoint[] {
  const monthlyAdHoc = computeMonthlySpendingTrend(adHocRecords, now, maxMonths)

  return monthlyAdHoc.map((point) => {
    const expenses = currentFixedExpensesTotal + point.amount
    const savingsRatePct = monthlyIncome > 0 ? ((monthlyIncome - expenses) / monthlyIncome) * 100 : 0
    return {
      label: point.label,
      monthStart: point.monthStart,
      income: monthlyIncome,
      expenses,
      savingsRatePct,
    }
  })
}

// ---------------------------------------------------------------------------
// This month vs. last month, total ad-hoc spending — powers the
// "Ce mois vs le mois passé" card. Always the real current/previous
// calendar month, independent of any month picker elsewhere on the page.

export function computeThisVsLastMonth(
  records: { amount: number; spent_at: string }[],
  now = new Date(),
): { thisMonth: number; lastMonth: number } {
  const { start: thisStart, end: thisEnd } = getMonthRange(now)
  const { start: lastStart, end: lastEnd } = getPreviousMonthRange(now)

  const sumInRange = (start: Date, end: Date) =>
    records
      .filter((r) => {
        const d = new Date(r.spent_at)
        return d >= start && d < end
      })
      .reduce((sum, r) => sum + r.amount, 0)

  return { thisMonth: sumInRange(thisStart, thisEnd), lastMonth: sumInRange(lastStart, lastEnd) }
}

// ---------------------------------------------------------------------------
// Month-over-month change, per category

export interface CategoryMomChange {
  category: string
  thisMonth: number
  lastMonth: number
  // null when last month was $0 for this category — a "%" change from zero
  // isn't a meaningful number, so callers should show "nouveau" or similar
  // instead of e.g. "+∞%".
  pctChange: number | null
}

function totalsByCategory(records: { amount: number; category: string }[]): Map<string, number> {
  const totals = new Map<string, number>()
  for (const r of records) {
    totals.set(r.category, (totals.get(r.category) ?? 0) + r.amount)
  }
  return totals
}

export function computeCategoryMonthOverMonth(
  records: { amount: number; category: string; spent_at: string }[],
  now = new Date(),
): CategoryMomChange[] {
  const { start: thisStart, end: thisEnd } = getMonthRange(now)
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const { start: lastStart, end: lastEnd } = getMonthRange(lastMonthDate)

  const thisMonthTotals = totalsByCategory(
    records.filter((r) => {
      const d = new Date(r.spent_at)
      return d >= thisStart && d < thisEnd
    }),
  )
  const lastMonthTotals = totalsByCategory(
    records.filter((r) => {
      const d = new Date(r.spent_at)
      return d >= lastStart && d < lastEnd
    }),
  )

  const categories = new Set([...thisMonthTotals.keys(), ...lastMonthTotals.keys()])

  return [...categories]
    .map((category) => {
      const thisMonth = thisMonthTotals.get(category) ?? 0
      const lastMonth = lastMonthTotals.get(category) ?? 0
      const pctChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null
      return { category, thisMonth, lastMonth, pctChange }
    })
    .sort((a, b) => b.thisMonth - a.thisMonth)
}

// ---------------------------------------------------------------------------
// Budget vs. actual, per category

export interface CategoryBudgetStatus {
  category: string
  budget: number
  actual: number
  pctUsed: number
  overBudget: boolean
}

// Actual = fixed expenses (recurring, counted in full, same as
// computeCategoryBreakdown) + this month's ad-hoc expenses — the full
// picture of what's committed/spent in a category, not just logged
// transactions. Only categories with a budget set (Paramètres) show up here;
// an unset category is excluded rather than shown as "$0 budget, over by
// $everything".
export function computeBudgetVsActual(
  categories: { name: string; monthlyBudget: number | null }[],
  fixedExpenses: { amount: number; category: string }[],
  monthlyExpenseRecords: { amount: number; category: string; spent_at: string }[],
  now = new Date(),
): CategoryBudgetStatus[] {
  const { start, end } = getMonthRange(now)
  const thisMonthRecords = monthlyExpenseRecords.filter((r) => {
    const d = new Date(r.spent_at)
    return d >= start && d < end
  })

  const actualByCategory = new Map<string, number>()
  for (const e of fixedExpenses) {
    actualByCategory.set(e.category, (actualByCategory.get(e.category) ?? 0) + e.amount)
  }
  for (const e of thisMonthRecords) {
    actualByCategory.set(e.category, (actualByCategory.get(e.category) ?? 0) + e.amount)
  }

  return categories
    .filter((c): c is { name: string; monthlyBudget: number } => (c.monthlyBudget ?? 0) > 0)
    .map((c) => {
      const actual = actualByCategory.get(c.name) ?? 0
      return {
        category: c.name,
        budget: c.monthlyBudget,
        actual,
        pctUsed: (actual / c.monthlyBudget) * 100,
        overBudget: actual > c.monthlyBudget,
      }
    })
    .sort((a, b) => b.pctUsed - a.pctUsed)
}
