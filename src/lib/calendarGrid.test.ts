import { describe, expect, it } from 'vitest'
import { buildMonthGrid, computeMonthNoteStats, ratingBlendPct } from './calendarGrid'

describe('buildMonthGrid', () => {
  it('every week has exactly 7 days, and weeks tile with no gaps/overlaps', () => {
    // September 2026: starts on a Tuesday, ends on a Wednesday.
    const weeks = buildMonthGrid(new Date('2026-09-15T12:00:00'))
    for (const week of weeks) expect(week).toHaveLength(7)

    const allDates = weeks.flat().map((c) => c.dateStr)
    const unique = new Set(allDates)
    expect(unique.size).toBe(allDates.length)
    for (let i = 1; i < allDates.length; i++) {
      const prev = new Date(`${allDates[i - 1]}T00:00:00`)
      const cur = new Date(`${allDates[i]}T00:00:00`)
      expect(cur.getTime() - prev.getTime()).toBe(86_400_000)
    }
  })

  it('every real day of the month is present and marked inCurrentMonth', () => {
    const weeks = buildMonthGrid(new Date('2026-09-15T12:00:00'))
    const inMonth = weeks.flat().filter((c) => c.inCurrentMonth)
    expect(inMonth).toHaveLength(30) // September has 30 days
    expect(inMonth[0].dateStr).toBe('2026-09-01')
    expect(inMonth[inMonth.length - 1].dateStr).toBe('2026-09-30')
  })

  it('leading/trailing days from adjacent months are marked inCurrentMonth: false', () => {
    const weeks = buildMonthGrid(new Date('2026-09-15T12:00:00'))
    const leading = weeks[0].filter((c) => !c.inCurrentMonth)
    const trailing = weeks[weeks.length - 1].filter((c) => !c.inCurrentMonth)
    // Sept 1 2026 is a Tuesday -> 1 leading day (Monday Aug 31).
    expect(leading.map((c) => c.dateStr)).toEqual(['2026-08-31'])
    // Sept 30 2026 is a Wednesday -> trailing Thu/Fri/Sat/Sun Oct 1-4.
    expect(trailing.map((c) => c.dateStr)).toEqual(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'])
  })

  it('weeks start on Monday', () => {
    const weeks = buildMonthGrid(new Date('2026-09-15T12:00:00'))
    for (const week of weeks) {
      const d = new Date(`${week[0].dateStr}T00:00:00`)
      expect(d.getDay()).toBe(1) // Monday
    }
  })

  it('a month that already starts on Monday needs no leading days', () => {
    // June 2026 starts on Monday June 1.
    const weeks = buildMonthGrid(new Date('2026-06-10T12:00:00'))
    expect(weeks[0][0].dateStr).toBe('2026-06-01')
    expect(weeks[0][0].inCurrentMonth).toBe(true)
  })

  it('marks today correctly and nothing else', () => {
    const today = new Date('2026-09-15T12:00:00')
    const weeks = buildMonthGrid(today, today)
    const todays = weeks.flat().filter((c) => c.isToday)
    expect(todays).toHaveLength(1)
    expect(todays[0].dateStr).toBe('2026-09-15')
  })

  it('marks days after today as isFuture, today and past as not', () => {
    const today = new Date('2026-09-15T12:00:00')
    const weeks = buildMonthGrid(today, today)
    const sept14 = weeks.flat().find((c) => c.dateStr === '2026-09-14')
    const sept15 = weeks.flat().find((c) => c.dateStr === '2026-09-15')
    const sept16 = weeks.flat().find((c) => c.dateStr === '2026-09-16')
    expect(sept14?.isFuture).toBe(false)
    expect(sept15?.isFuture).toBe(false)
    expect(sept16?.isFuture).toBe(true)
  })

  it('handles a leap-year February correctly (29 days)', () => {
    const weeks = buildMonthGrid(new Date('2028-02-10T12:00:00'))
    const inMonth = weeks.flat().filter((c) => c.inCurrentMonth)
    expect(inMonth).toHaveLength(29)
  })

  it('handles a December -> January month boundary without crashing', () => {
    const weeks = buildMonthGrid(new Date('2026-12-15T12:00:00'))
    const inMonth = weeks.flat().filter((c) => c.inCurrentMonth)
    expect(inMonth).toHaveLength(31)
    expect(inMonth[0].dateStr).toBe('2026-12-01')
  })
})

describe('computeMonthNoteStats', () => {
  it('no ratings -> average null, count 0 (not a false 0)', () => {
    expect(computeMonthNoteStats([])).toEqual({ average: null, notedDaysCount: 0 })
  })

  it('averages only the rated days', () => {
    expect(computeMonthNoteStats([10, 0, 5])).toEqual({ average: 5, notedDaysCount: 3 })
  })

  it('a single rating is its own average', () => {
    expect(computeMonthNoteStats([7])).toEqual({ average: 7, notedDaysCount: 1 })
  })
})

describe('ratingBlendPct', () => {
  it('rating 0 -> 0% blend (pure background)', () => {
    expect(ratingBlendPct(0)).toBe(0)
  })

  it('rating 10 -> capped below 100% ("soft" scale, not full-saturation accent)', () => {
    const pct = ratingBlendPct(10)
    expect(pct).toBeGreaterThan(0)
    expect(pct).toBeLessThan(100)
  })

  it('scales linearly between 0 and 10', () => {
    expect(ratingBlendPct(5)).toBeCloseTo(ratingBlendPct(10) / 2, 5)
  })

  it('clamps out-of-range input instead of extrapolating', () => {
    expect(ratingBlendPct(-5)).toBe(0)
    expect(ratingBlendPct(15)).toBe(ratingBlendPct(10))
  })
})
