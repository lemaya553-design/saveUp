import { beforeEach, describe, expect, it } from 'vitest'
import { clearPendingGoalName, consumePendingGoalName, setPendingGoalName } from './pendingGoal'

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

describe('pendingGoal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('nothing set -> consume reads null', () => {
    expect(consumePendingGoalName()).toBeNull()
  })

  it('set then consume -> returns the name', () => {
    setPendingGoalName('Vacances')
    expect(consumePendingGoalName()).toBe('Vacances')
  })

  it('consume is single-use — a second read returns null', () => {
    setPendingGoalName('Fonds d’urgence')
    consumePendingGoalName()
    expect(consumePendingGoalName()).toBeNull()
  })

  it('clear removes a pending name without ever reading it', () => {
    setPendingGoalName('Achat important')
    clearPendingGoalName()
    expect(consumePendingGoalName()).toBeNull()
  })

  it('setting a new name overwrites a previous unconsumed one', () => {
    setPendingGoalName('Vacances')
    setPendingGoalName('Achat important')
    expect(consumePendingGoalName()).toBe('Achat important')
  })
})
