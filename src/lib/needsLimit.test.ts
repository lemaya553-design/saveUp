import { describe, expect, it } from 'vitest'
import { clampPct, computeNeedsLimit, computeNeedsSpending } from './needsLimit'

describe('computeNeedsSpending', () => {
  it('sums fixed + ad-hoc expenses whose category is a "need"', () => {
    const fixed = [
      { amount: 1450, category: 'Logement' },
      { amount: 35, category: 'Loisirs' }, // not a need
    ]
    const monthly = [
      { amount: 200, category: 'Alimentation' },
      { amount: 20, category: 'Loisirs' }, // not a need
    ]
    expect(computeNeedsSpending(fixed, monthly)).toBe(1650)
  })

  it('no needs categories present -> 0', () => {
    expect(computeNeedsSpending([{ amount: 35, category: 'Loisirs' }], [])).toBe(0)
  })

  it('empty inputs -> 0', () => {
    expect(computeNeedsSpending([], [])).toBe(0)
  })

  it('a user-renamed category no longer matches (documented limitation)', () => {
    expect(computeNeedsSpending([{ amount: 1450, category: 'Mon loyer' }], [])).toBe(0)
  })
})

describe('computeNeedsLimit', () => {
  it('income not set (0) -> everything but needsSpent is null, never a false limit', () => {
    const result = computeNeedsLimit(0, 500, 50, 15)
    expect(result.needsLimit).toBeNull()
    expect(result.pctOfLimit).toBeNull()
    expect(result.savingsTarget).toBeNull()
    expect(result.overLimit).toBe(false)
    expect(result.needsSpent).toBe(500)
  })

  it('under the limit', () => {
    const result = computeNeedsLimit(4000, 1500, 50, 15)
    expect(result.needsLimit).toBe(2000)
    expect(result.pctOfLimit).toBeCloseTo(75, 5)
    expect(result.savingsTarget).toBe(600)
    expect(result.overLimit).toBe(false)
  })

  it('exactly at the limit is NOT over (strictly greater-than)', () => {
    const result = computeNeedsLimit(4000, 2000, 50, 15)
    expect(result.pctOfLimit).toBeCloseTo(100, 5)
    expect(result.overLimit).toBe(false)
  })

  it('over the limit', () => {
    const result = computeNeedsLimit(4000, 2500, 50, 15)
    expect(result.pctOfLimit).toBeCloseTo(125, 5)
    expect(result.overLimit).toBe(true)
  })

  it('no spending at all -> 0%, not over', () => {
    const result = computeNeedsLimit(4000, 0, 50, 15)
    expect(result.pctOfLimit).toBe(0)
    expect(result.overLimit).toBe(false)
  })

  it('needsPct of 0 with some spending -> 100% (any spending is "over" a $0 limit)', () => {
    const result = computeNeedsLimit(4000, 10, 0, 15)
    expect(result.needsLimit).toBe(0)
    expect(result.pctOfLimit).toBe(100)
    expect(result.overLimit).toBe(true)
  })

  it('needsPct of 0 with zero spending -> 0%, not over', () => {
    const result = computeNeedsLimit(4000, 0, 0, 15)
    expect(result.pctOfLimit).toBe(0)
    expect(result.overLimit).toBe(false)
  })

  it('handles a very large income without breaking', () => {
    const result = computeNeedsLimit(1_000_000, 100_000, 50, 15)
    expect(result.needsLimit).toBe(500_000)
    expect(result.pctOfLimit).toBeCloseTo(20, 5)
  })
})

describe('clampPct', () => {
  it('passes through a normal value', () => {
    expect(clampPct(50, 50)).toBe(50)
  })

  it('clamps above 100', () => {
    expect(clampPct(150, 50)).toBe(100)
  })

  it('clamps below 0', () => {
    expect(clampPct(-10, 50)).toBe(0)
  })

  it('NaN falls back to the given default', () => {
    expect(clampPct(NaN, 15)).toBe(15)
  })

  it('rounds a fractional value', () => {
    expect(clampPct(33.6, 0)).toBe(34)
  })
})
