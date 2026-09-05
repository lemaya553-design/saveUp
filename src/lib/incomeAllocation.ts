import { AVAILABLE_LABEL } from './categoryColors'

export interface IncomeAllocationEntry {
  category: string
  amount: number
  pct: number
  // Count of fixed-expense line items in that category — null for the
  // "Disponible" remainder, which isn't a set of line items at all.
  count: number | null
}

// Where a month's income actually goes — grouped by fixed expense category
// (recurring commitments, not the day-to-day ad-hoc spending the Dépenses
// tab already covers), plus whatever's left over. Fixed expenses have no
// date of their own (they're an ongoing recurring list, not monthly
// records), so unlike the Dépenses tab this doesn't vary with the month
// picker — that's a property of "fixed", not a bug.
export function computeIncomeAllocation(
  fixedExpenses: { amount: number; category: string }[],
  monthlyIncome: number,
): IncomeAllocationEntry[] {
  if (monthlyIncome <= 0) return []

  const totals = new Map<string, { amount: number; count: number }>()
  for (const e of fixedExpenses) {
    const existing = totals.get(e.category) ?? { amount: 0, count: 0 }
    totals.set(e.category, { amount: existing.amount + e.amount, count: existing.count + 1 })
  }

  const entries: IncomeAllocationEntry[] = [...totals.entries()]
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      pct: (amount / monthlyIncome) * 100,
      count,
    }))
    .sort((a, b) => b.amount - a.amount)

  const totalFixed = entries.reduce((sum, e) => sum + e.amount, 0)
  const available = monthlyIncome - totalFixed
  if (available > 0) {
    entries.push({
      category: AVAILABLE_LABEL,
      amount: available,
      pct: (available / monthlyIncome) * 100,
      count: null,
    })
  }

  return entries
}
