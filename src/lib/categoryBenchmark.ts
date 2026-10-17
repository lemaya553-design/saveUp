import { getMonthRange } from './format'
import {
  AMOUNT_TOLERANCE_MIN_DOLLARS,
  AMOUNT_TOLERANCE_RATIO,
  detectRecurringCharges,
  normalizeMerchant,
} from './subscriptionDetection'
import type { ExpenseRecord } from '../hooks/useExpenseHistory'

export type BenchmarkCategory = 'loyer' | 'epicerie' | 'restaurants' | 'transport' | 'abonnements' | 'autre'

export const BENCHMARK_CATEGORY_ORDER: BenchmarkCategory[] = [
  'loyer',
  'epicerie',
  'restaurants',
  'transport',
  'abonnements',
  'autre',
]

// General reference points only — NOT financial advice, and not specific to
// any one household. Freely editable: these are plain percentages of
// monthly income, the same unit computeCategoryBenchmarks reports for every
// category below.
export const CATEGORY_BENCHMARKS: Record<BenchmarkCategory, number> = {
  loyer: 30,
  epicerie: 15,
  restaurants: 10,
  transport: 15,
  abonnements: 5,
  autre: 15,
}

// Maps the app's actual stored category names (the 6 seeded in every new
// account — see supabase/schema.sql — plus the ones useCategorySuggestion
// auto-creates for a recognized merchant concept with no matching user
// category) onto the 6 fixed buckets this analysis reports. Anything that
// doesn't match a key here (Loisirs, Santé, Électronique, Autre, or any
// category the user renamed/created themselves) falls into "autre" — see
// mapToBucket below. "Abonnements" has no entry here on purpose: it isn't
// filled from the `category` field at all, see assignBucket.
const CATEGORY_TO_BUCKET: Record<string, BenchmarkCategory> = {
  Logement: 'loyer',
  Alimentation: 'epicerie',
  Restauration: 'restaurants',
  Transport: 'transport',
}

function mapToBucket(category: string): BenchmarkCategory {
  return CATEGORY_TO_BUCKET[category] ?? 'autre'
}

// detectRecurringCharges's `key` is `${merchantKey}:${roundedAmount}` — this
// recovers just the merchant part so a given month's transaction can be
// matched back to the subscription that produced it (merchantKey never
// itself contains ':', normalizeMerchant only ever emits letters/digits/
// spaces, so the last ':' is always the one the detector appended).
function merchantKeyFromSubscriptionKey(subscriptionKey: string): string {
  const idx = subscriptionKey.lastIndexOf(':')
  return idx === -1 ? subscriptionKey : subscriptionKey.slice(0, idx)
}

export interface CategoryBenchmarkEntry {
  category: BenchmarkCategory
  total: number
  // null when monthly income isn't set — showing "0%" there would read as
  // "this costs nothing", which is misleading (same convention as
  // categorySpending.ts's pctOfIncome).
  pctOfIncome: number | null
  benchmarkPct: number
  overBenchmark: boolean
}

export interface CategoryBenchmarkResult {
  entries: CategoryBenchmarkEntry[]
  totalSpent: number
  totalPctOfIncome: number | null
}

// This month's spending, split into the 6 fixed buckets above, each
// compared to its CATEGORY_BENCHMARKS reference point. "Abonnements" is
// filled from the same recurring-charge detector that powers the Premium
// page (detectRecurringCharges) rather than the `category` field — the app
// has no native "Abonnements" category, and a subscription can land under
// Loisirs, Divers, or whatever the user renamed a category to. A
// transaction recognized as a still-active subscription this month is
// counted under "abonnements" and nowhere else, so the 6 buckets never
// double-count a single transaction.
export function computeCategoryBenchmarks(
  records: ExpenseRecord[],
  monthlyIncome: number,
  now = new Date(),
): CategoryBenchmarkResult {
  const { start, end } = getMonthRange(now)
  const thisMonth = records.filter((r) => {
    const d = new Date(r.spent_at)
    return d >= start && d < end
  })

  // Needs the FULL history (not just thisMonth) to establish a monthly
  // cadence across 2+ occurrences — same reasoning as Premium.tsx. Only
  // subscriptions still billing as of the selected month count toward that
  // month's "abonnements" bucket.
  const activeSubscriptions = detectRecurringCharges(records).filter((s) => {
    const last = new Date(s.lastSpentAt)
    return last >= start && last < end
  })

  const totals: Record<BenchmarkCategory, number> = {
    loyer: 0,
    epicerie: 0,
    restaurants: 0,
    transport: 0,
    abonnements: 0,
    autre: 0,
  }

  for (const r of thisMonth) {
    const merchantKey = normalizeMerchant(r.description)
    const isSubscriptionCharge = activeSubscriptions.some((s) => {
      if (merchantKeyFromSubscriptionKey(s.key) !== merchantKey) return false
      const tolerance = Math.max(AMOUNT_TOLERANCE_MIN_DOLLARS, s.monthlyAmount * AMOUNT_TOLERANCE_RATIO)
      return Math.abs(r.amount - s.monthlyAmount) <= tolerance
    })
    totals[isSubscriptionCharge ? 'abonnements' : mapToBucket(r.category)] += r.amount
  }

  const totalSpent = BENCHMARK_CATEGORY_ORDER.reduce((sum, category) => sum + totals[category], 0)

  const entries: CategoryBenchmarkEntry[] = BENCHMARK_CATEGORY_ORDER.map((category) => {
    const total = totals[category]
    const pctOfIncome = monthlyIncome > 0 ? (total / monthlyIncome) * 100 : null
    const benchmarkPct = CATEGORY_BENCHMARKS[category]
    return {
      category,
      total,
      pctOfIncome,
      benchmarkPct,
      overBenchmark: pctOfIncome !== null && pctOfIncome > benchmarkPct,
    }
  })

  return {
    entries,
    totalSpent,
    totalPctOfIncome: monthlyIncome > 0 ? (totalSpent / monthlyIncome) * 100 : null,
  }
}

// "Si tu réduis X de reductionPct%, tu gardes environ ... $/mois, soit ... $/année."
// reductionPct is the 0-50 slider value next to each over-benchmark bar.
export function computeReductionSavings(
  categoryTotal: number,
  reductionPct: number,
): { monthly: number; annual: number } {
  const monthly = categoryTotal * (reductionPct / 100)
  return { monthly, annual: monthly * 12 }
}
