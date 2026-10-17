import { describe, expect, it } from 'vitest'
import { CATEGORY_BENCHMARKS, computeCategoryBenchmarks, computeReductionSavings } from './categoryBenchmark'

// 'T12:00:00' (no 'Z') parses as LOCAL noon, not UTC midnight — a bare
// 'YYYY-MM-DD' string parses as UTC, which can land on the previous day
// once converted to local time and fall outside getMonthRange's local-time
// boundaries (same convention statistics.test.ts uses, for the same reason).
function expense(description: string, amount: number, date: string, category = 'Autre') {
  return { id: `${description}-${date}`, description, amount, category, spent_at: `${date}T12:00:00` }
}

const NOW = new Date('2026-09-15T12:00:00')

describe('computeCategoryBenchmarks — empty / no income', () => {
  it('no records -> every bucket at 0, totalSpent 0', () => {
    const result = computeCategoryBenchmarks([], 4000, NOW)
    expect(result.totalSpent).toBe(0)
    expect(result.entries).toHaveLength(6)
    for (const entry of result.entries) {
      expect(entry.total).toBe(0)
      expect(entry.overBenchmark).toBe(false)
    }
  })

  it('income not set (0) -> pctOfIncome is null everywhere, not a false 0%', () => {
    const result = computeCategoryBenchmarks([expense('Loyer', 1000, '2026-09-01', 'Logement')], 0, NOW)
    expect(result.totalPctOfIncome).toBeNull()
    const loyer = result.entries.find((e) => e.category === 'loyer')
    expect(loyer?.pctOfIncome).toBeNull()
    expect(loyer?.overBenchmark).toBe(false)
  })
})

describe('computeCategoryBenchmarks — category mapping', () => {
  it('maps the seeded category names onto the 6 fixed buckets', () => {
    const records = [
      expense('Loyer septembre', 1000, '2026-09-01', 'Logement'),
      expense('Epicerie IGA', 400, '2026-09-02', 'Alimentation'),
      expense('Resto St-Hubert', 60, '2026-09-03', 'Restauration'),
      expense('Essence', 80, '2026-09-04', 'Transport'),
    ]
    const result = computeCategoryBenchmarks(records, 4000, NOW)
    const byCategory = new Map(result.entries.map((e) => [e.category, e.total]))
    expect(byCategory.get('loyer')).toBe(1000)
    expect(byCategory.get('epicerie')).toBe(400)
    expect(byCategory.get('restaurants')).toBe(60)
    expect(byCategory.get('transport')).toBe(80)
  })

  it('an unmapped category (e.g. Loisirs, Santé, or a user-renamed one) falls into "autre"', () => {
    const records = [
      expense('Cinéma', 20, '2026-09-01', 'Loisirs'),
      expense('Pharmacie', 15, '2026-09-02', 'Santé'),
      expense('Un truc', 5, '2026-09-03', 'Catégorie inventée'),
    ]
    const result = computeCategoryBenchmarks(records, 4000, NOW)
    const autre = result.entries.find((e) => e.category === 'autre')
    expect(autre?.total).toBe(40)
  })

  it('totalSpent is the sum of every record in the month, regardless of bucket', () => {
    const records = [
      expense('Loyer', 1000, '2026-09-01', 'Logement'),
      expense('Cinéma', 20, '2026-09-02', 'Loisirs'),
    ]
    const result = computeCategoryBenchmarks(records, 4000, NOW)
    expect(result.totalSpent).toBe(1020)
  })

  it('only counts the selected month — a transaction from another month is excluded', () => {
    const records = [expense('Loyer août', 1000, '2026-08-01', 'Logement')]
    const result = computeCategoryBenchmarks(records, 4000, NOW)
    expect(result.totalSpent).toBe(0)
  })
})

describe('computeCategoryBenchmarks — abonnements bucket (reuses subscription detection)', () => {
  it('a still-active detected subscription counts under "abonnements", not its original category', () => {
    const records = [
      expense('Netflix.com', 16.99, '2026-07-05', 'Loisirs'),
      expense('Netflix.com', 16.99, '2026-08-04', 'Loisirs'),
      expense('Netflix.com', 16.99, '2026-09-06', 'Loisirs'),
    ]
    const result = computeCategoryBenchmarks(records, 4000, NOW)
    const abonnements = result.entries.find((e) => e.category === 'abonnements')
    const autre = result.entries.find((e) => e.category === 'autre')
    expect(abonnements?.total).toBeCloseTo(16.99, 2)
    expect(autre?.total).toBe(0)
  })

  it('a single one-off charge from the same merchant (no cadence yet) is NOT pulled into abonnements', () => {
    const records = [expense('Netflix.com', 16.99, '2026-09-06', 'Loisirs')]
    const result = computeCategoryBenchmarks(records, 4000, NOW)
    const abonnements = result.entries.find((e) => e.category === 'abonnements')
    const autre = result.entries.find((e) => e.category === 'autre')
    expect(abonnements?.total).toBe(0)
    expect(autre?.total).toBeCloseTo(16.99, 2)
  })

  it('a subscription that stopped billing before the selected month does not count toward that month', () => {
    const records = [
      expense('Gym', 45, '2026-05-05', 'Santé'),
      expense('Gym', 45, '2026-06-04', 'Santé'),
      expense('Gym', 45, '2026-07-05', 'Santé'),
      // No August/September charge — cancelled. September itself has no
      // Gym transaction at all, so there's nothing to misclassify, but
      // this also confirms detection from older months doesn't leak in.
    ]
    const result = computeCategoryBenchmarks(records, 4000, NOW)
    expect(result.entries.find((e) => e.category === 'abonnements')?.total).toBe(0)
  })
})

describe('computeCategoryBenchmarks — benchmarks', () => {
  it('overBenchmark is true once pctOfIncome exceeds CATEGORY_BENCHMARKS for that category', () => {
    const monthlyIncome = 2000
    // restaurants benchmark is 10% -> $200/mo at this income; $250 is over.
    const records = [expense('Resto', 250, '2026-09-10', 'Restauration')]
    const result = computeCategoryBenchmarks(records, monthlyIncome, NOW)
    const restaurants = result.entries.find((e) => e.category === 'restaurants')
    expect(restaurants?.benchmarkPct).toBe(CATEGORY_BENCHMARKS.restaurants)
    expect(restaurants?.overBenchmark).toBe(true)
  })

  it('exactly at the benchmark is NOT over (strictly greater-than)', () => {
    const monthlyIncome = 2000
    const records = [expense('Resto', 200, '2026-09-10', 'Restauration')] // exactly 10%
    const result = computeCategoryBenchmarks(records, monthlyIncome, NOW)
    expect(result.entries.find((e) => e.category === 'restaurants')?.overBenchmark).toBe(false)
  })
})

describe('computeReductionSavings', () => {
  it('computes monthly and annual savings for a given reduction percentage', () => {
    const result = computeReductionSavings(300, 20)
    expect(result.monthly).toBeCloseTo(60, 2)
    expect(result.annual).toBeCloseTo(720, 2)
  })

  it('0% reduction keeps nothing', () => {
    expect(computeReductionSavings(300, 0)).toEqual({ monthly: 0, annual: 0 })
  })
})
