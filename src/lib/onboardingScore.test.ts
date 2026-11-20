import { describe, expect, it } from 'vitest'
import { computeOnboardingScore } from './onboardingScore'

const TODAY = new Date('2026-01-01T00:00:00Z')

function baseInput() {
  return {
    incomeRange: '1500_3000' as const,
    fixedExpensesRange: 'moins_500' as const,
    moneyLeaks: [],
    financialMood: 'en_controle' as const,
    goalAmount: 500,
    goalDate: '2026-07-01',
    payFrequency: 'mensuelle' as const,
  }
}

describe('computeOnboardingScore', () => {
  it('scores a strong profile near the top', () => {
    const result = computeOnboardingScore(baseInput(), TODAY)
    expect(result.fixedExpensesTier).toBe('great')
    expect(result.moodTier).toBe('great')
    expect(result.score).toBeGreaterThan(80)
  })

  it('scores a strained profile near the bottom', () => {
    const result = computeOnboardingScore(
      {
        incomeRange: 'moins_500',
        fixedExpensesRange: 'plus_1500',
        moneyLeaks: ['restos', 'shopping', 'abonnements', 'sorties', 'jeux'],
        financialMood: 'stresse',
        goalAmount: 5000,
        goalDate: '2026-02-01',
        payFrequency: 'mensuelle',
      },
      TODAY,
    )
    expect(result.fixedExpensesTier).toBe('strained')
    expect(result.moodTier).toBe('strained')
    expect(result.score).toBeLessThan(20)
  })

  it('always stays within 0-100', () => {
    const best = computeOnboardingScore(baseInput(), TODAY)
    const worst = computeOnboardingScore(
      {
        ...baseInput(),
        fixedExpensesRange: 'plus_1500',
        incomeRange: 'moins_500',
        moneyLeaks: ['sais_pas'],
        financialMood: 'stresse',
        goalAmount: 10000,
        goalDate: '2026-01-15',
      },
      TODAY,
    )
    expect(best.score).toBeLessThanOrEqual(100)
    expect(worst.score).toBeGreaterThanOrEqual(0)
  })

  it('treats a goal with no target date as neutral, not penalized', () => {
    const noDate = computeOnboardingScore({ ...baseInput(), goalDate: null }, TODAY)
    expect(noDate.goalPacePctOfIncome).toBeNull()
    expect(noDate.goalPaceTier).toBe('unknown')
  })

  it('flags "sais_pas" as unknown leaks, scored below 1-2 named leaks', () => {
    const unknown = computeOnboardingScore({ ...baseInput(), moneyLeaks: ['sais_pas'] }, TODAY)
    const named = computeOnboardingScore({ ...baseInput(), moneyLeaks: ['restos', 'shopping'] }, TODAY)
    expect(unknown.leaksUnknown).toBe(true)
    expect(unknown.score).toBeLessThan(named.score)
  })

  it('reports the first named leak as topLeak, ignoring sais_pas', () => {
    const result = computeOnboardingScore({ ...baseInput(), moneyLeaks: ['sais_pas', 'restos', 'jeux'] }, TODAY)
    expect(result.topLeak).toBe('restos')
    expect(result.leaksCount).toBe(2)
  })

  it('topLeak is null when no leaks are picked at all', () => {
    const result = computeOnboardingScore({ ...baseInput(), moneyLeaks: [] }, TODAY)
    expect(result.topLeak).toBeNull()
  })

  it('a tighter goal pace (more per paycheck relative to income) scores lower', () => {
    const modest = computeOnboardingScore({ ...baseInput(), goalAmount: 300, goalDate: '2027-01-01' }, TODAY)
    const ambitious = computeOnboardingScore({ ...baseInput(), goalAmount: 10000, goalDate: '2026-02-01' }, TODAY)
    expect(ambitious.goalPacePctOfIncome).toBeGreaterThan(modest.goalPacePctOfIncome ?? 0)
    expect(ambitious.score).toBeLessThan(modest.score)
  })

  it('variable pay falls back to a monthly pace for the income-per-period comparison', () => {
    const monthly = computeOnboardingScore({ ...baseInput(), payFrequency: 'mensuelle' }, TODAY)
    const variable = computeOnboardingScore({ ...baseInput(), payFrequency: 'ca_change' }, TODAY)
    expect(variable.goalPacePctOfIncome).toBeCloseTo(monthly.goalPacePctOfIncome ?? 0, 5)
  })

  it('goal pace % of income is roughly invariant to pay frequency (a goal costing 10% of each paycheck is the same effort whether paychecks are weekly or monthly)', () => {
    const monthly = computeOnboardingScore({ ...baseInput(), payFrequency: 'mensuelle' }, TODAY)
    const weekly = computeOnboardingScore({ ...baseInput(), payFrequency: 'hebdomadaire' }, TODAY)
    expect(weekly.goalPacePctOfIncome).toBeCloseTo(monthly.goalPacePctOfIncome ?? 0, 0)
  })
})
