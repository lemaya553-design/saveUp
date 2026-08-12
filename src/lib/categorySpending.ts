import { getMonthRange } from './format'

export interface CategoryTransaction {
  id: string
  description: string
  amount: number
  spent_at: string
}

export interface CategorySpendingEntry {
  category: string
  total: number
  // null when no monthly income is set — showing "0%" there would read as
  // "this costs nothing", which is misleading.
  pctOfIncome: number | null
  transactions: CategoryTransaction[]
}

export interface ExpenseRecordForSpending {
  id: string
  description: string
  amount: number
  category: string
  spent_at: string
}

// This month's ad-hoc expenses, grouped by category, sorted biggest first —
// each with its individual transactions (also sorted biggest first) for the
// drill-down view. Deliberately excludes fixed_expenses: those are recurring
// totals without a specific date within the month, so they can't provide the
// per-transaction (merchant, date) detail this view drills into.
export function computeCategorySpending(
  records: ExpenseRecordForSpending[],
  monthlyIncome: number,
  now = new Date(),
): CategorySpendingEntry[] {
  const { start, end } = getMonthRange(now)
  const thisMonth = records.filter((r) => {
    const d = new Date(r.spent_at)
    return d >= start && d < end
  })

  const byCategory = new Map<string, CategorySpendingEntry>()
  for (const r of thisMonth) {
    let entry = byCategory.get(r.category)
    if (!entry) {
      entry = { category: r.category, total: 0, pctOfIncome: null, transactions: [] }
      byCategory.set(r.category, entry)
    }
    entry.total += r.amount
    entry.transactions.push({ id: r.id, description: r.description, amount: r.amount, spent_at: r.spent_at })
  }

  return [...byCategory.values()]
    .map((entry) => ({
      ...entry,
      pctOfIncome: monthlyIncome > 0 ? (entry.total / monthlyIncome) * 100 : null,
      transactions: entry.transactions.sort((a, b) => b.amount - a.amount),
    }))
    .sort((a, b) => b.total - a.total)
}
