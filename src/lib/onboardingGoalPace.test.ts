import { describe, expect, it } from 'vitest'
import { computeAmountPerPay } from './onboardingGoalPace'

const TODAY = new Date('2026-01-01T00:00:00Z')

describe('computeAmountPerPay', () => {
  it('returns null with no amount', () => {
    expect(computeAmountPerPay(0, '2026-04-01', 'mensuelle', TODAY)).toBeNull()
  })

  it('returns null with no target date', () => {
    expect(computeAmountPerPay(1000, null, 'mensuelle', TODAY)).toBeNull()
  })

  it('returns null on an invalid date string', () => {
    expect(computeAmountPerPay(1000, 'not-a-date', 'mensuelle', TODAY)).toBeNull()
  })

  it('splits evenly across monthly periods', () => {
    // ~90 days -> 3 monthly periods
    expect(computeAmountPerPay(900, '2026-04-01', 'mensuelle', TODAY)).toBeCloseTo(300, 0)
  })

  it('splits across weekly periods', () => {
    // ~91 days -> 13 weekly periods
    expect(computeAmountPerPay(1300, '2026-04-02', 'hebdomadaire', TODAY)).toBeCloseTo(100, 0)
  })

  it('splits across biweekly periods', () => {
    // ~91 days -> round(91/14) = 7 biweekly periods
    expect(computeAmountPerPay(1400, '2026-04-02', 'aux_deux_semaines', TODAY)).toBeCloseTo(200, 0)
  })

  it('falls back to a monthly pace for variable pay', () => {
    expect(computeAmountPerPay(900, '2026-04-01', 'ca_change', TODAY)).toBeCloseTo(300, 0)
  })

  it('falls back to a monthly pace when frequency is unset', () => {
    expect(computeAmountPerPay(900, '2026-04-01', null, TODAY)).toBeCloseTo(300, 0)
  })

  it('clamps a past/today target date to 1 remaining period', () => {
    expect(computeAmountPerPay(500, '2025-01-01', 'mensuelle', TODAY)).toBe(500)
    expect(computeAmountPerPay(500, '2026-01-01', 'mensuelle', TODAY)).toBe(500)
  })
})
