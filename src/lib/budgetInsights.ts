import { formatCurrency, formatCurrencyEN, getMonthRange } from './format'
import { translateCategoryLabel } from './i18n/categoryLabels'
import type { Lang } from './i18n/language'

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
export function getSpendableBudgetCaption(rawSpendableBudget: number, lang: Lang): string {
  const money = lang === 'fr' ? formatCurrency : formatCurrencyEN
  if (rawSpendableBudget >= 0) {
    return lang === 'fr' ? `sur ${money(rawSpendableBudget)} alloués` : `of ${money(rawSpendableBudget)} allocated`
  }
  return lang === 'fr'
    ? `Dépassé de ${money(Math.abs(rawSpendableBudget))} — l'épargne du mois dépasse ton revenu disponible`
    : `Over by ${money(Math.abs(rawSpendableBudget))} — this month's savings exceed your available income`
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
  lang: Lang,
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
    months.push({
      label: monthDate.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { month: 'short' }),
      amount,
    })
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
  lang: Lang,
  now = new Date(),
): string {
  if (records.length < 3) {
    return lang === 'fr'
      ? 'Continue à noter tes dépenses — dès que tu en as quelques-unes, tu verras des insights personnalisés ici.'
      : "Keep logging your expenses — once you've got a few, you'll see personalized insights here."
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
    const category = translateCategoryLabel(biggestIncreaseCategory, lang)
    return lang === 'fr'
      ? `Tu dépenses ${Math.round(biggestIncreasePct)}% de plus en ${category} que le mois dernier.`
      : `You're spending ${Math.round(biggestIncreasePct)}% more on ${category} than last month.`
  }

  if (thisMonthTotals.size > 0) {
    const [topCategory, topAmount] = [...thisMonthTotals.entries()].sort((a, b) => b[1] - a[1])[0]
    const total = [...thisMonthTotals.values()].reduce((sum, v) => sum + v, 0)
    const pct = total > 0 ? Math.round((topAmount / total) * 100) : 0
    const category = translateCategoryLabel(topCategory, lang)
    return lang === 'fr'
      ? `Ton poste le plus lourd ce mois-ci est ${category}, avec ${pct}% de tes dépenses.`
      : `Your biggest category this month is ${category}, at ${pct}% of your spending.`
  }

  return lang === 'fr'
    ? 'Continue à noter tes dépenses — dès que tu en as quelques-unes ce mois-ci, tu verras des insights personnalisés ici.'
    : "Keep logging your expenses — once you've got a few this month, you'll see personalized insights here."
}
