import { beforeEach, describe, expect, it } from 'vitest'
import { hasCelebratedGoal, markGoalCelebrated } from './goalCelebration'

function installMemoryLocalStorage() {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  } as Storage
}

installMemoryLocalStorage()

describe('goalCelebration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('a goal never celebrated reads as not celebrated', () => {
    expect(hasCelebratedGoal('goal-1')).toBe(false)
  })

  it('marking celebrated makes it read back as celebrated', () => {
    markGoalCelebrated('goal-1')
    expect(hasCelebratedGoal('goal-1')).toBe(true)
  })

  it('is scoped per goal id — celebrating one goal does not affect another', () => {
    markGoalCelebrated('goal-1')
    expect(hasCelebratedGoal('goal-2')).toBe(false)
  })
})
