import { describe, expect, it } from 'vitest'
import { getGoalEncouragementTier } from './goalEncouragement'

describe('getGoalEncouragementTier', () => {
  it('0% -> start', () => {
    expect(getGoalEncouragementTier(0)).toBe('start')
  })

  it('boundary just under 25% -> still start', () => {
    expect(getGoalEncouragementTier(24.9)).toBe('start')
  })

  it('exactly 25% -> progress', () => {
    expect(getGoalEncouragementTier(25)).toBe('progress')
  })

  it('34% (the spec example) -> progress', () => {
    expect(getGoalEncouragementTier(34)).toBe('progress')
  })

  it('exactly 50% -> half', () => {
    expect(getGoalEncouragementTier(50)).toBe('half')
  })

  it('74.9% -> still half', () => {
    expect(getGoalEncouragementTier(74.9)).toBe('half')
  })

  it('exactly 75% -> final', () => {
    expect(getGoalEncouragementTier(75)).toBe('final')
  })

  it('99% -> still final', () => {
    expect(getGoalEncouragementTier(99)).toBe('final')
  })

  it('exactly 100% -> done', () => {
    expect(getGoalEncouragementTier(100)).toBe('done')
  })

  it('over 100% (overfunded goal) -> still done, not a crash', () => {
    expect(getGoalEncouragementTier(142)).toBe('done')
  })

  it('negative (defensive — should never happen upstream) -> start, not a crash', () => {
    expect(getGoalEncouragementTier(-5)).toBe('start')
  })
})
