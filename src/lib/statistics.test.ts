import { describe, expect, it } from 'vitest'
import {
  computeGoalsProgress,
  computeIncomeExpenseSavingsTrend,
  computeWeekdaySpending,
  computeWeeklySpending,
} from './statistics'

describe('computeWeeklySpending edge cases', () => {
  const now = new Date('2026-10-12T12:00:00') // Monday

  it('empty records -> 8 zero weeks, last one current', () => {
    const points = computeWeeklySpending([], 'fr', now)
    expect(points).toHaveLength(8)
    expect(points.every((p) => p.amount === 0)).toBe(true)
    expect(points[7].isCurrentWeek).toBe(true)
    expect(points.filter((p) => p.isCurrentWeek)).toHaveLength(1)
  })

  it('1 record lands in exactly one week bucket', () => {
    const points = computeWeeklySpending([{ amount: 42, spent_at: '2026-10-12T08:00:00' }], 'fr', now)
    const nonZero = points.filter((p) => p.amount > 0)
    expect(nonZero).toHaveLength(1)
    expect(nonZero[0].amount).toBe(42)
    expect(nonZero[0].isCurrentWeek).toBe(true)
  })

  it('a record from 7 weeks ago lands in the oldest bucket, not current', () => {
    const points = computeWeeklySpending([{ amount: 10, spent_at: '2026-08-24T08:00:00' }], 'fr', now)
    expect(points[0].amount).toBe(10)
    expect(points[0].isCurrentWeek).toBe(false)
    expect(points.slice(1).every((p) => p.amount === 0)).toBe(true)
  })

  it('many records across all weeks sum correctly and total matches input', () => {
    const records = Array.from({ length: 8 }, (_, i) => ({
      amount: 100 + i,
      spent_at: new Date(now.getTime() - i * 7 * 86400000).toISOString(),
    }))
    const points = computeWeeklySpending(records, 'fr', now)
    const total = points.reduce((s, p) => s + p.amount, 0)
    expect(total).toBe(records.reduce((s, r) => s + r.amount, 0))
    expect(points.every((p) => p.amount > 0)).toBe(true)
  })
})

describe('computeGoalsProgress edge cases', () => {
  it('empty goals -> empty array', () => {
    expect(computeGoalsProgress([])).toEqual([])
  })

  it('1 goal, partial progress', () => {
    const result = computeGoalsProgress([{ id: '1', name: 'Vacances', currentAmount: 250, targetAmount: 1000 }])
    expect(result).toHaveLength(1)
    expect(result[0].pct).toBe(25)
  })

  it('zero-target goal with money saved reads as 100%, not NaN/Infinity', () => {
    const result = computeGoalsProgress([{ id: '1', name: 'Bug', currentAmount: 50, targetAmount: 0 }])
    expect(result[0].pct).toBe(100)
    expect(Number.isFinite(result[0].pct)).toBe(true)
  })

  it('zero-target, zero-saved goal reads as 0%, not NaN', () => {
    const result = computeGoalsProgress([{ id: '1', name: 'Bug', currentAmount: 0, targetAmount: 0 }])
    expect(result[0].pct).toBe(0)
  })

  it('many goals sorted most-advanced first', () => {
    const result = computeGoalsProgress([
      { id: 'a', name: 'A', currentAmount: 10, targetAmount: 100 }, // 10%
      { id: 'b', name: 'B', currentAmount: 90, targetAmount: 100 }, // 90%
      { id: 'c', name: 'C', currentAmount: 50, targetAmount: 100 }, // 50%
      { id: 'd', name: 'D', currentAmount: 120, targetAmount: 100 }, // 120% (overfunded)
    ])
    expect(result.map((r) => r.id)).toEqual(['d', 'b', 'c', 'a'])
  })
})

describe('computeIncomeExpenseSavingsTrend edge cases', () => {
  const now = new Date('2026-10-12T12:00:00')

  it('no data at all -> 6 months of zeros, no NaN', () => {
    const points = computeIncomeExpenseSavingsTrend([], 0, 0, [], 'fr', now)
    expect(points.length).toBeGreaterThan(0)
    expect(points.every((p) => p.income === 0 && p.expenses === 0 && p.savings === 0)).toBe(true)
  })

  it('savings are never added into expenses', () => {
    const points = computeIncomeExpenseSavingsTrend(
      [{ amount: 500, spent_at: now.toISOString() }],
      200,
      3000,
      [{ amount: 150, created_at: now.toISOString() }],
      'fr',
      now,
    )
    const current = points[points.length - 1]
    expect(current.expenses).toBe(700) // 500 ad-hoc + 200 fixed, savings excluded
    expect(current.savings).toBe(150)
    expect(current.income).toBe(3000)
  })

  it('many months of contributions land in the right month bucket', () => {
    const contributions = Array.from({ length: 6 }, (_, i) => ({
      amount: 100,
      created_at: new Date(now.getFullYear(), now.getMonth() - i, 15).toISOString(),
    }))
    const points = computeIncomeExpenseSavingsTrend([], 0, 1000, contributions, 'fr', now)
    expect(points.every((p) => p.savings === 100)).toBe(true)
  })
})

describe('computeWeekdaySpending edge cases', () => {
  const month = new Date('2026-10-01T00:00:00') // October 2026

  it('empty records -> 7 days, all zero, Monday first', () => {
    const points = computeWeekdaySpending([], month, 'fr')
    expect(points).toHaveLength(7)
    expect(points.every((p) => p.amount === 0)).toBe(true)
  })

  it('1 record on a known Wednesday lands in the Wednesday bucket only', () => {
    // 2026-10-07 is a Wednesday
    const points = computeWeekdaySpending([{ amount: 33, spent_at: '2026-10-07T10:00:00' }], month, 'fr')
    expect(points[2].amount).toBe(33) // index 2 = Wednesday (Mon=0)
    expect(points.filter((p) => p.amount > 0)).toHaveLength(1)
  })

  it('records outside the selected month are excluded', () => {
    const points = computeWeekdaySpending([{ amount: 999, spent_at: '2026-09-07T10:00:00' }], month, 'fr')
    expect(points.every((p) => p.amount === 0)).toBe(true)
  })

  it('many records across the month sum per weekday correctly', () => {
    const records = [
      { amount: 10, spent_at: '2026-10-05T10:00:00' }, // Monday
      { amount: 20, spent_at: '2026-10-12T10:00:00' }, // Monday
      { amount: 5, spent_at: '2026-10-09T10:00:00' }, // Friday
    ]
    const points = computeWeekdaySpending(records, month, 'fr')
    expect(points[0].amount).toBe(30) // Monday total
    expect(points[4].amount).toBe(5) // Friday total
    const total = points.reduce((s, p) => s + p.amount, 0)
    expect(total).toBe(35)
  })

  it('longLabel has no trailing period, unlike French short weekday labels', () => {
    // French abbreviated weekdays ("jeu.", "lun.") already end in a period —
    // the busiest-day sentence uses longLabel precisely to avoid "le jeu..".
    const points = computeWeekdaySpending([], month, 'fr')
    expect(points.some((p) => p.label.endsWith('.'))).toBe(true)
    expect(points.every((p) => !p.longLabel.endsWith('.'))).toBe(true)
  })
})
