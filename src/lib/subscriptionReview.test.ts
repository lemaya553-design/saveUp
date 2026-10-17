import { beforeEach, describe, expect, it } from 'vitest'
import { getSubscriptionReviewStatus, setSubscriptionReviewStatus } from './subscriptionReview'

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

describe('subscriptionReview', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('a never-marked subscription reads as null (no opinion yet)', () => {
    expect(getSubscriptionReviewStatus('user-1', 'netflix:17')).toBeNull()
  })

  it('marking "kept" reads back correctly', () => {
    setSubscriptionReviewStatus('user-1', 'netflix:17', 'kept')
    expect(getSubscriptionReviewStatus('user-1', 'netflix:17')).toBe('kept')
  })

  it('marking "review" reads back correctly', () => {
    setSubscriptionReviewStatus('user-1', 'netflix:17', 'review')
    expect(getSubscriptionReviewStatus('user-1', 'netflix:17')).toBe('review')
  })

  it('changing the mark overwrites the previous one', () => {
    setSubscriptionReviewStatus('user-1', 'netflix:17', 'kept')
    setSubscriptionReviewStatus('user-1', 'netflix:17', 'review')
    expect(getSubscriptionReviewStatus('user-1', 'netflix:17')).toBe('review')
  })

  it('is scoped per user — marking for one user does not affect another', () => {
    setSubscriptionReviewStatus('user-1', 'netflix:17', 'kept')
    expect(getSubscriptionReviewStatus('user-2', 'netflix:17')).toBeNull()
  })

  it('is scoped per subscription key — marking one does not affect another for the same user', () => {
    setSubscriptionReviewStatus('user-1', 'netflix:17', 'kept')
    expect(getSubscriptionReviewStatus('user-1', 'spotify:12')).toBeNull()
  })
})
