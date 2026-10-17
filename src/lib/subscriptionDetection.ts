import type { ExpenseRecord } from '../hooks/useExpenseHistory'

// Detects recurring charges (subscriptions, memberships, anything billed on
// roughly a monthly cadence) from the user's own expense history — both
// CSV/Excel-imported and manually-entered rows, since both land in the same
// `expenses` table ImportTransactionsModal.tsx and AddExpenseModal.tsx
// already write to. Entirely separate from recurringExpenses.ts (the
// Budget → Récurrences tab's user-DEFINED recurring rules) — this file only
// ever *infers* patterns from history that already happened, never reads or
// writes a `recurring_expenses` row.

export interface DetectedSubscription {
  // Stable across re-runs as new months of data arrive (merchant + rounded
  // monthly amount) — PremiumPage keys its "Je garde"/"À vérifier" marking
  // on this, so it needs to survive a new occurrence being added to the
  // same cluster, not just reflect today's exact transaction set.
  key: string
  displayName: string
  monthlyAmount: number
  occurrences: number
  lastSpentAt: string
  category: string
}

const MIN_OCCURRENCES = 2
// A billing cycle is never exactly 30.0 days (28-31-day months, weekend
// shifts) — this window covers real monthly billing while still rejecting
// anything biweekly (~14d) or quarterly (~90d).
const MIN_GAP_DAYS = 25
const MAX_GAP_DAYS = 36
// Same-merchant charges within this band count as "the same price" (tax
// rounding, minor FX drift) — wider than that, and it reads as a
// coincidentally-similar but different purchase, not a repeating bill.
// Exported so other code that needs to recognize "is this specific
// transaction one of the subscriptions already detected above" (see
// categoryBenchmark.ts) uses the exact same tolerance rather than a second,
// possibly-drifting copy of these numbers.
export const AMOUNT_TOLERANCE_RATIO = 0.08
export const AMOUNT_TOLERANCE_MIN_DOLLARS = 1

// Lowercase, accent-stripped, punctuation-stripped, and reference/store
// numbers removed, so "NETFLIX.COM 8532", "Netflix.com*8532NY", and
// "netflix.com" all collapse to the same key. Reference codes get dropped
// token-by-token (any whitespace-delimited token with 3+ digits in it,
// letters or not) rather than via a \b-bounded digits-only regex — real
// statement descriptions often glue a trailing location/terminal code
// straight onto the digits ("8532NY") with no word boundary between them,
// which a digits-only pattern would miss entirely. Deliberately coarse
// otherwise: this is also exactly why two unrelated purchases at the same
// chain (e.g. two different gas-station fill-ups) can collide into one
// merchant group — real limitation, not a bug, see this module's own tests
// for a false-positive example.
export function normalizeMerchant(description: string): string {
  const cleaned = description
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
  const tokens = cleaned.split(/\s+/).filter((token) => {
    if (token === '') return false
    const digitCount = (token.match(/\d/g) ?? []).length
    return digitCount < 3
  })
  return tokens.join(' ').trim()
}

function daysBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000
}

function mostFrequent<T extends { description: string; category: string }>(
  records: T[],
  pick: (r: T) => string,
  fallback: string,
): string {
  const counts = new Map<string, number>()
  for (const r of records) counts.set(pick(r), (counts.get(pick(r)) ?? 0) + 1)
  let best = fallback
  let bestCount = 0
  for (const [value, count] of counts) {
    if (count > bestCount) {
      bestCount = count
      best = value
    }
  }
  return best
}

export function detectRecurringCharges(records: ExpenseRecord[]): DetectedSubscription[] {
  const byMerchant = new Map<string, ExpenseRecord[]>()
  for (const r of records) {
    const key = normalizeMerchant(r.description)
    if (!key) continue
    const group = byMerchant.get(key)
    if (group) group.push(r)
    else byMerchant.set(key, [r])
  }

  const results: DetectedSubscription[] = []

  for (const [merchantKey, group] of byMerchant) {
    // Greedy amount clustering (sorted ascending, start a new cluster once
    // a record falls outside the running cluster average's tolerance) — a
    // merchant with both a $15.99 subscription and unrelated $80 purchases
    // must not have those averaged into one meaningless "amount."
    const sorted = [...group].sort((a, b) => a.amount - b.amount)
    const clusters: ExpenseRecord[][] = []
    let current: ExpenseRecord[] = []
    for (const r of sorted) {
      if (current.length === 0) {
        current = [r]
        continue
      }
      const avg = current.reduce((s, c) => s + c.amount, 0) / current.length
      const tolerance = Math.max(AMOUNT_TOLERANCE_MIN_DOLLARS, avg * AMOUNT_TOLERANCE_RATIO)
      if (Math.abs(r.amount - avg) <= tolerance) {
        current.push(r)
      } else {
        clusters.push(current)
        current = [r]
      }
    }
    if (current.length > 0) clusters.push(current)

    for (const cluster of clusters) {
      if (cluster.length < MIN_OCCURRENCES) continue

      const byDate = [...cluster].sort((a, b) => a.spent_at.localeCompare(b.spent_at))
      // Every consecutive gap must land in the monthly window — one bad gap
      // (a one-off purchase that happened to land near a real monthly
      // charge, or a skipped/paused month) disqualifies the whole cluster
      // rather than silently averaging past it.
      let regular = true
      for (let i = 1; i < byDate.length; i++) {
        const gap = daysBetween(byDate[i - 1].spent_at, byDate[i].spent_at)
        if (gap < MIN_GAP_DAYS || gap > MAX_GAP_DAYS) {
          regular = false
          break
        }
      }
      if (!regular) continue

      const monthlyAmount = cluster.reduce((s, c) => s + c.amount, 0) / cluster.length
      const mostRecent = byDate[byDate.length - 1]

      results.push({
        key: `${merchantKey}:${Math.round(monthlyAmount)}`,
        displayName: mostFrequent(cluster, (r) => r.description, mostRecent.description),
        monthlyAmount,
        occurrences: cluster.length,
        lastSpentAt: mostRecent.spent_at,
        category: mostFrequent(cluster, (r) => r.category, mostRecent.category),
      })
    }
  }

  return results.sort((a, b) => b.monthlyAmount - a.monthlyAmount)
}
