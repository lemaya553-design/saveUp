import { getMonthRange, getPreviousMonthRange, getWeekStart, toDateString } from './format'
import type { Lang } from './i18n/language'

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
  lang: Lang,
  now = new Date(),
  maxMonths = 6,
): MonthlySpendingPoint[] {
  const locale = lang === 'fr' ? 'fr-CA' : 'en-CA'
  if (records.length === 0) {
    const { start } = getMonthRange(now)
    return [{ label: start.toLocaleDateString(locale, { month: 'short' }), monthStart: toDateString(start), amount: 0 }]
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
      label: monthDate.toLocaleDateString(locale, { month: 'short' }),
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
  lang: Lang,
  now = new Date(),
  maxMonths = 6,
): IncomeExpenseTrendPoint[] {
  const monthlyAdHoc = computeMonthlySpendingTrend(adHocRecords, lang, now, maxMonths)

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

// ---------------------------------------------------------------------------
// Weekly spending, last N weeks (Tendances' "Dépenses par semaine")

export interface WeeklySpendingPoint {
  label: string
  weekStart: string
  amount: number
  isCurrentWeek: boolean
}

export function computeWeeklySpending(
  records: { amount: number; spent_at: string }[],
  lang: Lang,
  now = new Date(),
  weeksBack = 8,
): WeeklySpendingPoint[] {
  const locale = lang === 'fr' ? 'fr-CA' : 'en-CA'
  const currentWeekStart = getWeekStart(now)

  const points: WeeklySpendingPoint[] = []
  for (let offset = weeksBack - 1; offset >= 0; offset--) {
    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(currentWeekStart.getDate() - offset * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const amount = records
      .filter((r) => {
        const d = new Date(r.spent_at)
        return d >= weekStart && d < weekEnd
      })
      .reduce((sum, r) => sum + r.amount, 0)

    points.push({
      label: weekStart.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
      weekStart: toDateString(weekStart),
      amount,
      isCurrentWeek: offset === 0,
    })
  }
  return points
}

// ---------------------------------------------------------------------------
// Savings goal progress, most-advanced first (Tendances' "Progression de mes
// objectifs") — a thin reshape of SavingsGoal, not a real computation, but
// kept here so the sort order (and the "no target" edge case) has one
// tested home instead of living inline in the component.

export interface GoalProgressPoint {
  id: string
  name: string
  current: number
  target: number
  pct: number
}

export function computeGoalsProgress(
  goals: { id: string; name: string; currentAmount: number; targetAmount: number }[],
): GoalProgressPoint[] {
  return goals
    .map((g) => ({
      id: g.id,
      name: g.name,
      current: g.currentAmount,
      target: g.targetAmount,
      // A goal with no target (shouldn't normally happen — the form
      // requires one) reads as "fully reached" once anything's saved,
      // rather than dividing by zero.
      pct: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : g.currentAmount > 0 ? 100 : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
}

// ---------------------------------------------------------------------------
// Income, expenses and savings, last N months (Tendances' "Revenus, dépenses
// et épargne") — same income/expenses convention as computeIncomeExpenseTrend
// (current income and fixed-expenses totals held constant across history,
// real ad-hoc spending per month), plus savings contributions summed per
// month from their own table. Savings are deliberately never added into
// `expenses` — putting money into a goal isn't spending it.

export interface IncomeExpenseSavingsPoint {
  label: string
  monthStart: string
  income: number
  expenses: number
  savings: number
}

export function computeIncomeExpenseSavingsTrend(
  adHocRecords: { amount: number; spent_at: string }[],
  currentFixedExpensesTotal: number,
  monthlyIncome: number,
  contributions: { amount: number; created_at: string }[],
  lang: Lang,
  now = new Date(),
  maxMonths = 6,
): IncomeExpenseSavingsPoint[] {
  const monthlyAdHoc = computeMonthlySpendingTrend(adHocRecords, lang, now, maxMonths)

  return monthlyAdHoc.map((point) => {
    // Not `new Date(point.monthStart)`: a date-only ISO string ("2026-10-01")
    // parses as UTC midnight, which getMonthRange then reads back via
    // getFullYear()/getMonth() in LOCAL time — in any timezone behind UTC
    // (e.g. America/Toronto) that silently lands in the previous month.
    // Building the Date from components instead stays in local time throughout.
    const [y, m, d] = point.monthStart.split('-').map(Number)
    const { start, end } = getMonthRange(new Date(y, m - 1, d))
    const savings = contributions
      .filter((c) => {
        const d = new Date(c.created_at)
        return d >= start && d < end
      })
      .reduce((sum, c) => sum + c.amount, 0)

    return {
      label: point.label,
      monthStart: point.monthStart,
      income: monthlyIncome,
      expenses: currentFixedExpensesTotal + point.amount,
      savings,
    }
  })
}

// ---------------------------------------------------------------------------
// Spending by day of week, for one month (Tendances' "Dépenses par jour de
// la semaine") — Monday-first to match getWeekStart's convention used
// elsewhere on this page.

export interface WeekdaySpendingPoint {
  label: string
  // Full weekday name ("jeudi", not "jeu.") for the "Tu dépenses le plus le
  // {longLabel}." sentence — French's abbreviated form already ends in a
  // period, which read as "jeu.." once dropped into that sentence.
  longLabel: string
  weekdayIndex: number
  amount: number
}

export function computeWeekdaySpending(
  records: { amount: number; spent_at: string }[],
  month: Date,
  lang: Lang,
): WeekdaySpendingPoint[] {
  const locale = lang === 'fr' ? 'fr-CA' : 'en-CA'
  const { start, end } = getMonthRange(month)
  const totals = new Array(7).fill(0) as number[]

  for (const r of records) {
    const d = new Date(r.spent_at)
    if (d < start || d >= end) continue
    const jsDay = d.getDay() // 0 = Sunday .. 6 = Saturday
    const mondayFirstIndex = jsDay === 0 ? 6 : jsDay - 1
    totals[mondayFirstIndex] += r.amount
  }

  // Any Monday works as a label reference — only the weekday name is used.
  const referenceMonday = getWeekStart(new Date())
  return totals.map((amount, i) => {
    const d = new Date(referenceMonday)
    d.setDate(referenceMonday.getDate() + i)
    return {
      label: d.toLocaleDateString(locale, { weekday: 'short' }),
      longLabel: d.toLocaleDateString(locale, { weekday: 'long' }),
      weekdayIndex: i,
      amount,
    }
  })
}

// ---------------------------------------------------------------------------
// Period-over-period delta for a single KPI number (Aperçu's clickable
// "chiffres clés" row above each chart) — current vs. previous value, as a
// direction + raw amount + percentage, so each component only has to format
// a number already computed here. `previous === null` means "no previous
// period exists at all"; `previous === 0` is treated the same way (a % off
// a $0 base isn't a meaningful number) — both surface as direction 'none',
// which callers render as "—" per the spec.

export interface PeriodDelta {
  direction: 'up' | 'down' | 'flat' | 'none'
  amount: number
  pct: number | null
}

export function computePeriodDelta(current: number, previous: number | null): PeriodDelta {
  if (previous === null || previous === 0) return { direction: 'none', amount: 0, pct: null }
  const amount = current - previous
  const direction = amount > 0 ? 'up' : amount < 0 ? 'down' : 'flat'
  return { direction, amount, pct: (amount / previous) * 100 }
}
