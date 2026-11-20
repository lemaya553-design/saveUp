// "Limite du mois" card (Dashboard) — a simplified, editable take on the
// classic "50/30/20" budgeting rule of thumb: roughly needsPct% of income
// for needs, savingsPct% toward savings goals — one aggregate "needs" total
// against one limit, meant to be understood at a glance.

export const DEFAULT_NEEDS_PCT = 50
export const DEFAULT_SAVINGS_PCT = 15
export const MIN_PCT = 0
export const MAX_PCT = 100

// The app's own seeded "needs" categories (supabase/schema.sql) — Loisirs
// and Autre (plus anything the user renamed/created) are treated as
// discretionary. A category the user renamed won't match here (string-keyed,
// like every other category-name lookup in this app).
export const NEEDS_CATEGORIES = ['Logement', 'Alimentation', 'Transport', 'Santé']

export interface CategorizedAmount {
  amount: number
  category: string
}

// Fixed expenses (rent, insurance...) have no date of their own — they
// recur every month by definition, so they always count in full, unlike
// ad-hoc `expenses` rows which must already be filtered to the target
// month by the caller (see useMonthlyExpenses.ts for the exact same
// division of responsibility elsewhere in this app).
export function computeNeedsSpending(fixedExpenses: CategorizedAmount[], monthExpenses: CategorizedAmount[]): number {
  const isNeed = (e: CategorizedAmount) => NEEDS_CATEGORIES.includes(e.category)
  const fixedNeeds = fixedExpenses.filter(isNeed).reduce((sum, e) => sum + e.amount, 0)
  const adHocNeeds = monthExpenses.filter(isNeed).reduce((sum, e) => sum + e.amount, 0)
  return fixedNeeds + adHocNeeds
}

export interface NeedsLimitResult {
  needsSpent: number
  // null whenever monthlyIncome isn't set — showing a 0%/$0 limit there
  // would read as "you have no needs budget," which is false, just unknown.
  needsLimit: number | null
  pctOfLimit: number | null
  savingsTarget: number | null
  overLimit: boolean
}

export function computeNeedsLimit(
  monthlyIncome: number,
  needsSpent: number,
  needsPct: number,
  savingsPct: number,
): NeedsLimitResult {
  if (monthlyIncome <= 0) {
    return { needsSpent, needsLimit: null, pctOfLimit: null, savingsTarget: null, overLimit: false }
  }
  const needsLimit = monthlyIncome * (needsPct / 100)
  const savingsTarget = monthlyIncome * (savingsPct / 100)
  const pctOfLimit = needsLimit > 0 ? (needsSpent / needsLimit) * 100 : needsSpent > 0 ? 100 : 0
  return { needsSpent, needsLimit, pctOfLimit, savingsTarget, overLimit: needsSpent > needsLimit }
}

// Keeps a slider/number-input's percentage inside a sane, always-renderable
// range — never NaN, never negative, never off the right edge of a 0-100
// scale, regardless of what a user types into the editable field.
export function clampPct(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(MAX_PCT, Math.max(MIN_PCT, Math.round(value)))
}
