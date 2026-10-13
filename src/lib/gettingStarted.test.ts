import { beforeEach, describe, expect, it } from 'vitest'
import { hasViewedStats, markStatsViewed } from './gettingStarted'

// Vitest's default (node) environment has no `localStorage` global (no
// jsdom in this project) — a minimal in-memory stand-in is enough since
// gettingStarted.ts only ever calls getItem/setItem.
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

describe('gettingStarted localStorage helper', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('a brand-new user (never visited) reads as not viewed', () => {
    expect(hasViewedStats('user-1')).toBe(false)
  })

  it('marking viewed makes it read back as viewed', () => {
    markStatsViewed('user-1')
    expect(hasViewedStats('user-1')).toBe(true)
  })

  it('is scoped per user id — marking one account does not affect another', () => {
    markStatsViewed('user-1')
    expect(hasViewedStats('user-2')).toBe(false)
  })

  it('many accounts each keep their own independent flag', () => {
    markStatsViewed('user-a')
    markStatsViewed('user-c')
    expect(hasViewedStats('user-a')).toBe(true)
    expect(hasViewedStats('user-b')).toBe(false)
    expect(hasViewedStats('user-c')).toBe(true)
  })
})
