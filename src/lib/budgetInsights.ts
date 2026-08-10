import { formatCurrency, getMonthRange } from './format'

export interface CategoryTotal {
  category: string
  amount: number
  pct: number
  colorClass: string
}

// Combines fixed expenses (recurring, counted in full), this month's ad-hoc
// expenses, and this month's savings contributions (shown as their own
// "Épargne" category, in success green, so saving reads as distinct from
// spending rather than just another expense line), grouped by category and
// sorted from biggest to smallest.
export function computeCategoryBreakdown(
  fixedExpenses: { amount: number; category: string }[],
  monthlyExpenses: { amount: number; category: string }[],
  savingsThisMonth = 0,
): CategoryTotal[] {
  const totals = new Map<string, number>()
  for (const e of fixedExpenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
  }
  for (const e of monthlyExpenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
  }
  if (savingsThisMonth > 0) {
    totals.set('Épargne', (totals.get('Épargne') ?? 0) + savingsThisMonth)
  }

  const grandTotal = [...totals.values()].reduce((sum, v) => sum + v, 0)

  return [...totals.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      pct: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
      colorClass: category === 'Épargne' ? 'bg-success' : 'bg-primary',
    }))
    .sort((a, b) => b.amount - a.amount)
}

// The "sur X$ alloués" caption for the month's spendable budget. Takes the
// UNCLAMPED figure (income − fixed expenses − savings this month, which can
// go negative) so that when savings alone already exceed what's available,
// the caption explains that instead of silently showing "sur 0,00 $
// alloués" — a real $0 budget and an over-committed one look identical
// once clamped, and only one of those is self-explanatory.
export function getSpendableBudgetCaption(rawSpendableBudget: number): string {
  if (rawSpendableBudget >= 0) {
    return `sur ${formatCurrency(rawSpendableBudget)} alloués`
  }
  return `Dépassé de ${formatCurrency(Math.abs(rawSpendableBudget))} — l'épargne du mois dépasse ton revenu disponible`
}

// Sum of records (savings contributions, expenses, anything with an
// amount + created_at) that landed in the current calendar month.
export function sumThisMonth(
  records: { amount: number; created_at: string }[],
  now = new Date(),
): number {
  const { start, end } = getMonthRange(now)
  return records
    .filter((r) => {
      const d = new Date(r.created_at)
      return d >= start && d < end
    })
    .reduce((sum, r) => sum + r.amount, 0)
}

export interface MonthlyTotal {
  label: string
  amount: number
}

// Ad-hoc expense totals for the current month and the 2 months before it,
// oldest first.
export function computeMonthlyTrend(
  records: { amount: number; spent_at: string }[],
  now = new Date(),
): MonthlyTotal[] {
  const months: MonthlyTotal[] = []

  for (let offset = 2; offset >= 0; offset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const { start, end } = getMonthRange(monthDate)
    const amount = records
      .filter((r) => {
        const d = new Date(r.spent_at)
        return d >= start && d < end
      })
      .reduce((sum, r) => sum + r.amount, 0)
    months.push({ label: monthDate.toLocaleDateString('fr-CA', { month: 'short' }), amount })
  }

  return months
}

function totalsByCategory(records: { amount: number; category: string }[]): Map<string, number> {
  const totals = new Map<string, number>()
  for (const r of records) {
    totals.set(r.category, (totals.get(r.category) ?? 0) + r.amount)
  }
  return totals
}

// One sentence, generated from real data: either a month-over-month
// category call-out, or (with less history) the heaviest category this
// month, or — with barely any data — an encouragement to keep logging.
export function generateBudgetInsight(
  records: { amount: number; category: string; spent_at: string }[],
  now = new Date(),
): string {
  if (records.length < 3) {
    return 'Continue à noter tes dépenses — dès que tu en as quelques-unes, tu verras des insights personnalisés ici.'
  }

  const { start: thisMonthStart, end: thisMonthEnd } = getMonthRange(now)
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const { start: lastMonthStart, end: lastMonthEnd } = getMonthRange(lastMonthDate)

  const thisMonthRecords = records.filter((r) => {
    const d = new Date(r.spent_at)
    return d >= thisMonthStart && d < thisMonthEnd
  })
  const lastMonthRecords = records.filter((r) => {
    const d = new Date(r.spent_at)
    return d >= lastMonthStart && d < lastMonthEnd
  })

  const thisMonthTotals = totalsByCategory(thisMonthRecords)
  const lastMonthTotals = totalsByCategory(lastMonthRecords)

  let biggestIncreaseCategory: string | null = null
  let biggestIncreasePct = 0
  for (const [category, amount] of thisMonthTotals) {
    const previous = lastMonthTotals.get(category)
    if (!previous || previous <= 0) continue
    const pctChange = ((amount - previous) / previous) * 100
    if (pctChange >= 15 && pctChange > biggestIncreasePct) {
      biggestIncreasePct = pctChange
      biggestIncreaseCategory = category
    }
  }

  if (biggestIncreaseCategory) {
    return `Tu dépenses ${Math.round(biggestIncreasePct)}% de plus en ${biggestIncreaseCategory} que le mois dernier.`
  }

  if (thisMonthTotals.size > 0) {
    const [topCategory, topAmount] = [...thisMonthTotals.entries()].sort((a, b) => b[1] - a[1])[0]
    const total = [...thisMonthTotals.values()].reduce((sum, v) => sum + v, 0)
    const pct = total > 0 ? Math.round((topAmount / total) * 100) : 0
    return `Ton poste le plus lourd ce mois-ci est ${topCategory}, avec ${pct}% de tes dépenses.`
  }

  return 'Continue à noter tes dépenses — dès que tu en as quelques-unes ce mois-ci, tu verras des insights personnalisés ici.'
}
