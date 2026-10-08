import type { PayFrequency } from './onboardingQuiz'
import { addMonthsClamped } from './recurringExpenses'

const DAY_MS = 24 * 60 * 60 * 1000
// Defensive cap on how many pay periods a loop below will ever step through
// — a next_payday left untouched for a few years on a weekly cadence is
// still only a few hundred steps, so this is purely a safety net against an
// unexpected infinite loop, never expected to actually bind in practice.
const MAX_STEPS = 10000

export interface PayPeriod {
  periodStart: Date
  periodEnd: Date
  /** Whole days from `now` until periodEnd (the next payday) — always >= 0. */
  daysRemaining: number
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`)
}

// The k-th payday from `anchor` (k can be negative for past occurrences).
// Always computed fresh from the ORIGINAL anchor date, never chained from a
// previous occurrence — chaining monthly clamped steps (Jan 31 -> Feb 28 ->
// Mar 28) would permanently drift off the real pay day once a short month
// clamps it. Anchoring every step to the original date instead means Jan 31
// -> Feb 28 -> Mar 31, which is what an employer's actual pay calendar does
// (the SQL/recurring-expense convention this mirrors, addMonthsClamped, is
// fine for THAT use case since it only ever takes one step at a time).
function occurrenceAtStep(anchor: Date, frequency: PayFrequency, k: number): Date {
  switch (frequency) {
    case 'hebdomadaire':
      return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 7 * k)
    case 'aux_deux_semaines':
      return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + 14 * k)
    case 'mensuelle':
      return addMonthsClamped(anchor, k)
  }
}

// The step index k such that occurrenceAtStep(k-1) <= today < occurrenceAtStep(k)
// — i.e. k points at the next payday (today's own payday, if today IS
// payday, counts as already "collected": the current period just started
// and k points at the FOLLOWING one).
function findNextPeriodIndex(anchor: Date, frequency: PayFrequency, today: Date): number {
  let k = 0
  let guard = 0
  if (occurrenceAtStep(anchor, frequency, k) <= today) {
    while (occurrenceAtStep(anchor, frequency, k) <= today) {
      k += 1
      if (++guard > MAX_STEPS) break
    }
  } else {
    while (occurrenceAtStep(anchor, frequency, k - 1) > today) {
      k -= 1
      if (++guard > MAX_STEPS) break
    }
  }
  return k
}

// The pay period `now` currently falls in, derived from a frequency and any
// one known payday (past, present, or future — next_payday is only ever set
// once, at onboarding, so by the time this runs it's often stale). Advances
// forward (or back-fills backward, if next_payday happens to be upcoming)
// until it brackets `now`.
export function computeCurrentPayPeriod(
  payFrequency: PayFrequency,
  nextPaydayStr: string,
  now = new Date(),
): PayPeriod {
  const today = startOfDay(now)
  const anchor = parseDateOnly(nextPaydayStr)
  const k = findNextPeriodIndex(anchor, payFrequency, today)

  const periodEnd = occurrenceAtStep(anchor, payFrequency, k)
  const periodStart = occurrenceAtStep(anchor, payFrequency, k - 1)
  const daysRemaining = Math.round((periodEnd.getTime() - today.getTime()) / DAY_MS)

  return { periodStart, periodEnd, daysRemaining }
}

export interface RequiredPerPayPeriod {
  perPeriod: number
  periodsRemaining: number
}

// Same "null once the deadline can't be hit" convention as
// lib/savingsProjection.ts's computeRequiredPace, adapted to pay-period
// cadence instead of weeks/months. periodsRemaining counts every payday
// from the next one (today's own period, if already under way, can't
// receive a contribution timed to a payday that already happened) up to and
// including whichever payday falls on or before the target date.
export function computeRequiredPerPayPeriod(
  amount: number,
  targetDateStr: string,
  payFrequency: PayFrequency,
  nextPaydayStr: string,
  now = new Date(),
): RequiredPerPayPeriod | null {
  if (amount <= 0) return null
  const today = startOfDay(now)
  const targetDate = parseDateOnly(targetDateStr)
  if (targetDate <= today) return null

  const anchor = parseDateOnly(nextPaydayStr)
  const startK = findNextPeriodIndex(anchor, payFrequency, today)

  let periodsRemaining = 0
  let k = startK
  let guard = 0
  while (occurrenceAtStep(anchor, payFrequency, k) <= targetDate) {
    periodsRemaining += 1
    k += 1
    if (++guard > MAX_STEPS) break
  }

  if (periodsRemaining === 0) return null
  return { perPeriod: amount / periodsRemaining, periodsRemaining }
}
