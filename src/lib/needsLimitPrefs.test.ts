import { beforeEach, describe, expect, it } from 'vitest'
import { getNeedsLimitPcts, setNeedsLimitPcts } from './needsLimitPrefs'

// Vitest's default (node) environment has no `localStorage` global — same
// in-memory stand-in used by gettingStarted.test.ts.
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

describe('needsLimitPrefs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('unset -> defaults (50/15)', () => {
    expect(getNeedsLimitPcts('user-1')).toEqual({ needsPct: 50, savingsPct: 15 })
  })

  it('round-trips a saved value', () => {
    setNeedsLimitPcts('user-1', { needsPct: 60, savingsPct: 20 })
    expect(getNeedsLimitPcts('user-1')).toEqual({ needsPct: 60, savingsPct: 20 })
  })

  it('is scoped per user id', () => {
    setNeedsLimitPcts('user-1', { needsPct: 60, savingsPct: 20 })
    expect(getNeedsLimitPcts('user-2')).toEqual({ needsPct: 50, savingsPct: 15 })
  })

  it('clamps an out-of-range stored value on read', () => {
    localStorage.setItem('saveup-needs-limit-pcts-user-1', JSON.stringify({ needsPct: 150, savingsPct: -5 }))
    expect(getNeedsLimitPcts('user-1')).toEqual({ needsPct: 100, savingsPct: 0 })
  })

  it('malformed JSON reads back as defaults instead of throwing', () => {
    localStorage.setItem('saveup-needs-limit-pcts-user-1', '{not valid json')
    expect(getNeedsLimitPcts('user-1')).toEqual({ needsPct: 50, savingsPct: 15 })
  })
})
