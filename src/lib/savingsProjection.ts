import { WEEKS_PER_MONTH } from './format'

export interface RequiredPace {
  perWeek: number
  perMonth: number
}

// How much needs to be saved per week/month, starting now, to hit
// `amount` by `targetDateStr`. Used both for a brand-new goal (amount =
// full target) and for an existing one (amount = remaining balance).
// Returns null once the date has passed — there's no meaningful pace left.
export function computeRequiredPace(
  amount: number,
  targetDateStr: string,
  now = new Date(),
): RequiredPace | null {
  const targetDate = new Date(targetDateStr)
  const daysRemaining = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (daysRemaining <= 0 || amount <= 0) return null

  const weeksRemaining = daysRemaining / 7
  const monthsRemaining = weeksRemaining / WEEKS_PER_MONTH

  return {
    perWeek: amount / weeksRemaining,
    perMonth: amount / monthsRemaining,
  }
}

// Average $/month contributed over the last `windowDays`, used as the
// "current pace" for a completion-date projection.
export function estimateMonthlyRate(
  contributions: { amount: number; created_at: string }[],
  now: Date,
  windowDays = 90,
): number {
  const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000
  const total = contributions
    .filter((c) => new Date(c.created_at).getTime() >= cutoff)
    .reduce((sum, c) => sum + c.amount, 0)
  return total / (windowDays / 30)
}

// Rough month-level estimate of when a goal will be reached at the current
// pace. Returns null when there's no recent contribution pace to project
// from (rather than a misleadingly precise "never").
export function estimateCompletionDate(
  remaining: number,
  monthlyRate: number,
  now: Date,
): Date | null {
  if (remaining <= 0) return now
  if (monthlyRate <= 0) return null
  const monthsNeeded = remaining / monthlyRate
  const result = new Date(now)
  result.setMonth(result.getMonth() + Math.ceil(monthsNeeded))
  return result
}

// Oldest-to-newest booleans, one per week, marking whether a contribution
// landed in that week — the raw data behind a "did I save this week" dot row.
export function computeWeeklyContributionDots(
  contributions: { created_at: string }[],
  now: Date,
  weeks = 8,
): boolean[] {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const buckets = new Array(weeks).fill(false)

  for (const c of contributions) {
    const weeksAgo = Math.floor((now.getTime() - new Date(c.created_at).getTime()) / msPerWeek)
    if (weeksAgo >= 0 && weeksAgo < weeks) {
      buckets[weeks - 1 - weeksAgo] = true
    }
  }

  return buckets
}
