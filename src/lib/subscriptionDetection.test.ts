import { describe, expect, it } from 'vitest'
import { detectRecurringCharges } from './subscriptionDetection'

function expense(description: string, amount: number, spentAt: string, category = 'Autre') {
  return { id: `${description}-${spentAt}`, description, amount, category, spent_at: spentAt }
}

describe('detectRecurringCharges — empty / sparse data', () => {
  it('no records -> nothing detected', () => {
    expect(detectRecurringCharges([])).toEqual([])
  })

  it('a single occurrence of anything -> never detected (no pattern to confirm)', () => {
    const result = detectRecurringCharges([expense('Netflix.com', 16.99, '2026-09-05')])
    expect(result).toEqual([])
  })
})

describe('detectRecurringCharges — real subscriptions', () => {
  it('3 months of the same merchant/amount ~30 days apart -> detected', () => {
    const result = detectRecurringCharges([
      expense('NETFLIX.COM 8532', 16.99, '2026-07-05'),
      expense('NETFLIX.COM 8532', 16.99, '2026-08-04'),
      expense('Netflix.com*8532NY', 16.99, '2026-09-06'),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].occurrences).toBe(3)
    expect(result[0].monthlyAmount).toBeCloseTo(16.99, 2)
  })

  it('small tax/FX drift (within ~8%) still clusters as the same subscription', () => {
    const result = detectRecurringCharges([
      expense('Spotify', 11.99, '2026-07-10'),
      expense('Spotify', 12.49, '2026-08-09'),
      expense('Spotify', 11.99, '2026-09-10'),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].occurrences).toBe(3)
  })

  it('key stays stable across re-detection as a new month is added', () => {
    const base = [expense('Disney Plus', 13.99, '2026-07-01'), expense('Disney Plus', 13.99, '2026-08-01')]
    const before = detectRecurringCharges(base)
    const after = detectRecurringCharges([...base, expense('Disney Plus', 13.99, '2026-09-01')])
    expect(before).toHaveLength(1)
    expect(after).toHaveLength(1)
    expect(after[0].key).toBe(before[0].key)
  })

  it('picks the most frequent raw description as the display name', () => {
    const result = detectRecurringCharges([
      expense('AMZN Prime', 9.99, '2026-07-15'),
      expense('AMZN Prime', 9.99, '2026-08-15'),
      expense('Amazon Prime Membership', 9.99, '2026-09-15'),
    ])
    expect(result[0].displayName).toBe('AMZN Prime')
  })
})

describe('detectRecurringCharges — false positives the detector cannot rule out', () => {
  // Explicitly the scenario asked about: two charges at the same merchant
  // that are NOT a subscription. The detector has no way to know these are
  // unrelated one-off purchases — same normalized merchant + similar
  // amount + ~monthly gap is exactly what a real subscription looks like
  // from transaction data alone.
  it('two coincidentally-similar one-off purchases at the same merchant, ~30 days apart -> false positive (flagged as a known limitation)', () => {
    const result = detectRecurringCharges([
      expense('Canadian Tire 4471', 42.5, '2026-07-02'), // tires patch
      expense('Canadian Tire 9981', 44.0, '2026-08-01'), // unrelated: windshield wipers
    ])
    // This DOES get detected — documented limitation, not a test of
    // "correct" behavior. See subscriptionDetection.ts's own comments.
    expect(result).toHaveLength(1)
  })

  it('two same-merchant purchases with clearly different amounts -> NOT clustered together', () => {
    const result = detectRecurringCharges([
      expense('Amazon.ca', 12.99, '2026-07-10'),
      expense('Amazon.ca', 134.5, '2026-08-10'),
    ])
    expect(result).toEqual([])
  })
})

describe('detectRecurringCharges — correctly rejected non-subscriptions', () => {
  it('two purchases a few days apart (not monthly) -> not detected', () => {
    const result = detectRecurringCharges([
      expense('Tim Hortons', 6.5, '2026-09-01'),
      expense('Tim Hortons', 6.75, '2026-09-04'),
    ])
    expect(result).toEqual([])
  })

  it('a biweekly cadence (~14 days) -> not detected as monthly', () => {
    const result = detectRecurringCharges([
      expense('Gym Drop-in', 20, '2026-07-01'),
      expense('Gym Drop-in', 20, '2026-07-15'),
      expense('Gym Drop-in', 20, '2026-07-29'),
    ])
    expect(result).toEqual([])
  })

  it('a quarterly cadence (~90 days) -> not detected as monthly', () => {
    const result = detectRecurringCharges([
      expense('Insurance Co', 150, '2026-01-01'),
      expense('Insurance Co', 150, '2026-04-01'),
    ])
    expect(result).toEqual([])
  })

  it('one irregular gap among otherwise-regular ones disqualifies the whole cluster', () => {
    const result = detectRecurringCharges([
      expense('HBO Max', 14.99, '2026-06-01'),
      expense('HBO Max', 14.99, '2026-07-01'),
      expense('HBO Max', 14.99, '2026-10-15'), // a 3.5-month gap — paused, then resumed
    ])
    expect(result).toEqual([])
  })
})

describe('detectRecurringCharges — many detected subscriptions', () => {
  it('sorts results by monthly amount, highest first', () => {
    const result = detectRecurringCharges([
      expense('Netflix', 16.99, '2026-07-05'),
      expense('Netflix', 16.99, '2026-08-05'),
      expense('Spotify', 11.99, '2026-07-10'),
      expense('Spotify', 11.99, '2026-08-10'),
      expense('Gym Membership', 45, '2026-07-01'),
      expense('Gym Membership', 45, '2026-08-01'),
    ])
    expect(result.map((r) => r.displayName)).toEqual(['Gym Membership', 'Netflix', 'Spotify'])
  })

  it('keeps unrelated merchants separate', () => {
    const result = detectRecurringCharges([
      expense('Netflix', 16.99, '2026-07-05'),
      expense('Netflix', 16.99, '2026-08-05'),
      expense('Disney Plus', 13.99, '2026-07-05'),
      expense('Disney Plus', 13.99, '2026-08-05'),
    ])
    expect(result).toHaveLength(2)
  })
})
