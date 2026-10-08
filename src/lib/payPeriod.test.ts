import { describe, expect, it } from 'vitest'
import { computeCurrentPayPeriod, computeRequiredPerPayPeriod } from './payPeriod'

// Local-date helper — mirrors how the rest of the app builds dates for
// these tests (new Date(y, m, d), never a UTC-parsed ISO string) so
// assertions can't drift with the test runner's timezone.
function d(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

describe('computeCurrentPayPeriod', () => {
  it('hebdomadaire: next_payday a few days in the future', () => {
    const now = d(2026, 1, 12) // Monday
    const period = computeCurrentPayPeriod('hebdomadaire', iso(2026, 1, 15), now)
    expect(period.periodStart).toEqual(d(2026, 1, 8))
    expect(period.periodEnd).toEqual(d(2026, 1, 15))
    expect(period.daysRemaining).toBe(3)
  })

  it('hebdomadaire: next_payday stale by several weeks advances to the next future payday', () => {
    const now = d(2026, 3, 1)
    const period = computeCurrentPayPeriod('hebdomadaire', iso(2026, 1, 1), now)
    // Jan 1 + 7*k must land as the smallest occurrence strictly after Mar 1.
    expect(period.periodEnd.getTime()).toBeGreaterThan(now.getTime())
    expect(period.periodStart.getTime()).toBeLessThanOrEqual(now.getTime())
    expect((period.periodEnd.getTime() - period.periodStart.getTime()) / 86400000).toBe(7)
  })

  it('hebdomadaire: next_payday is exactly today starts a fresh period ending in 7 days', () => {
    const now = d(2026, 6, 10)
    const period = computeCurrentPayPeriod('hebdomadaire', iso(2026, 6, 10), now)
    expect(period.periodStart).toEqual(d(2026, 6, 10))
    expect(period.periodEnd).toEqual(d(2026, 6, 17))
    expect(period.daysRemaining).toBe(7)
  })

  it('aux_deux_semaines: 14-day period width, stale anchor advances correctly', () => {
    const now = d(2026, 5, 20)
    const period = computeCurrentPayPeriod('aux_deux_semaines', iso(2026, 1, 2), now)
    expect((period.periodEnd.getTime() - period.periodStart.getTime()) / 86400000).toBe(14)
    expect(period.periodEnd.getTime()).toBeGreaterThan(now.getTime())
    expect(period.periodStart.getTime()).toBeLessThanOrEqual(now.getTime())
  })

  it('mensuelle: same day of month, future anchor', () => {
    const now = d(2026, 2, 1)
    const period = computeCurrentPayPeriod('mensuelle', iso(2026, 2, 15), now)
    expect(period.periodStart).toEqual(d(2026, 1, 15))
    expect(period.periodEnd).toEqual(d(2026, 2, 15))
  })

  it('mensuelle: short-month clamping does NOT permanently drift the anchor day (Jan 31 -> Feb 28 -> Mar 31)', () => {
    // Anchor stuck on the 31st from onboarding, now well into March.
    const now = d(2026, 3, 15)
    const period = computeCurrentPayPeriod('mensuelle', iso(2026, 1, 31), now)
    // Feb 2026 has 28 days, so the Feb occurrence clamps to the 28th — but
    // March has 31 days, so the very next occurrence must jump back to the
    // 31st rather than staying stuck at 28 (the classic chained-clamp bug).
    expect(period.periodStart).toEqual(d(2026, 2, 28))
    expect(period.periodEnd).toEqual(d(2026, 3, 31))
  })

  it('mensuelle: leap-year February clamps to the 29th, not the 28th', () => {
    const now = d(2028, 2, 20) // 2028 is a leap year
    const period = computeCurrentPayPeriod('mensuelle', iso(2028, 1, 31), now)
    expect(period.periodStart).toEqual(d(2028, 1, 31))
    expect(period.periodEnd).toEqual(d(2028, 2, 29))
  })

  it('mensuelle: next_payday far in the future back-fills periodStart correctly', () => {
    const now = d(2026, 1, 5)
    const period = computeCurrentPayPeriod('mensuelle', iso(2026, 1, 20), now)
    expect(period.periodStart).toEqual(d(2025, 12, 20))
    expect(period.periodEnd).toEqual(d(2026, 1, 20))
    expect(period.daysRemaining).toBe(15)
  })
})

describe('computeRequiredPerPayPeriod', () => {
  it('returns null for a non-positive amount', () => {
    expect(computeRequiredPerPayPeriod(0, iso(2026, 12, 1), 'hebdomadaire', iso(2026, 1, 1), d(2026, 1, 1))).toBeNull()
    expect(computeRequiredPerPayPeriod(-5, iso(2026, 12, 1), 'hebdomadaire', iso(2026, 1, 1), d(2026, 1, 1))).toBeNull()
  })

  it('returns null once the target date is today or in the past', () => {
    const now = d(2026, 6, 1)
    expect(computeRequiredPerPayPeriod(500, iso(2026, 6, 1), 'hebdomadaire', iso(2026, 1, 1), now)).toBeNull()
    expect(computeRequiredPerPayPeriod(500, iso(2026, 5, 1), 'hebdomadaire', iso(2026, 1, 1), now)).toBeNull()
  })

  it('hebdomadaire: splits the remaining amount across every future payday up to the target date', () => {
    const now = d(2026, 1, 1)
    // Next payday Jan 8, then weekly — target Jan 29 should include Jan 8,
    // 15, 22, 29 => 4 pay periods.
    const result = computeRequiredPerPayPeriod(400, iso(2026, 1, 29), 'hebdomadaire', iso(2026, 1, 8), now)
    expect(result).not.toBeNull()
    expect(result!.periodsRemaining).toBe(4)
    expect(result!.perPeriod).toBe(100)
  })

  it('mensuelle: periodsRemaining stays correct across the short-month clamp boundary', () => {
    const now = d(2026, 1, 1)
    // Anchor Jan 31; occurrences land Jan 31, Feb 28, Mar 31 — target Mar 31
    // should count all three.
    const result = computeRequiredPerPayPeriod(900, iso(2026, 3, 31), 'mensuelle', iso(2026, 1, 31), now)
    expect(result).not.toBeNull()
    expect(result!.periodsRemaining).toBe(3)
    expect(result!.perPeriod).toBe(300)
  })

  it('returns null when the next payday itself already falls after the target date', () => {
    const now = d(2026, 1, 1)
    const result = computeRequiredPerPayPeriod(100, iso(2026, 1, 5), 'mensuelle', iso(2026, 1, 20), now)
    expect(result).toBeNull()
  })
})
