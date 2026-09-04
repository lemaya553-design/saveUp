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

// Day-precise estimate of when a goal will be reached at the current pace
// (unlike a month-rounded estimate, this is what lets the UI say "dans 4
// mois, 12 jours" instead of just "dans 4 mois"). Returns null when there's
// no recent contribution pace to project from — a misleadingly precise
// "never" is worse than admitting there's nothing to project from.
export function estimateCompletionDate(
  remaining: number,
  monthlyRate: number,
  now: Date,
): Date | null {
  if (remaining <= 0) return now
  if (monthlyRate <= 0) return null
  const dailyRate = monthlyRate / 30
  const daysNeeded = remaining / dailyRate
  const result = new Date(now)
  result.setDate(result.getDate() + Math.ceil(daysNeeded))
  return result
}

// How many contributions landed within the pace-estimation window —
// extrapolating a full trajectory from a single contribution is exactly the
// fake precision a completion-date estimate should avoid, so callers gate
// on this (see MIN_CONTRIBUTIONS_FOR_ESTIMATE) before trusting a rate.
export function countRecentContributions(
  contributions: { created_at: string }[],
  now: Date,
  windowDays = 90,
): number {
  const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000
  return contributions.filter((c) => new Date(c.created_at).getTime() >= cutoff).length
}

const DAY_MS = 24 * 60 * 60 * 1000

// Whole days between two dates (positive when `to` is after `from`).
export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS)
}

// Calendar-accurate months + remainder days between two dates — the same
// approach an age calculator uses, so a month boundary never produces an
// odd "3 mois, 31 jours" the way a flat /30.44 average would.
export function monthsAndDaysBetween(from: Date, to: Date): { months: number; days: number } {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  const cursor = new Date(from)
  cursor.setMonth(cursor.getMonth() + months)
  if (cursor.getTime() > to.getTime()) {
    months -= 1
    cursor.setMonth(cursor.getMonth() - 1)
  }
  const days = Math.round((to.getTime() - cursor.getTime()) / DAY_MS)
  return { months: Math.max(0, months), days: Math.max(0, days) }
}

export function formatMonthsAndDays(months: number, days: number): string {
  const monthPart = months > 0 ? `${months} mois` : ''
  const dayPart = days > 0 ? `${days} jour${days > 1 ? 's' : ''}` : ''
  if (monthPart && dayPart) return `${monthPart}, ${dayPart}`
  if (monthPart) return monthPart
  if (dayPart) return dayPart
  return "aujourd'hui"
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
