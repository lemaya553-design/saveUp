import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearSubscriptionMark,
  getSubscriptionMark,
  markSubscriptionForReview,
  markSubscriptionKept,
} from './subscriptionReview'

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
    expect(getSubscriptionMark('user-1', 'netflix:17')).toBeNull()
  })

  it('marking "kept" reads back as kept, with no review details', () => {
    markSubscriptionKept('user-1', 'netflix:17')
    expect(getSubscriptionMark('user-1', 'netflix:17')).toEqual({ status: 'kept' })
  })

  it('marking for review reads back the full reason/usage/note', () => {
    markSubscriptionForReview('user-1', 'netflix:17', {
      reason: 'rarely_use',
      usageScale: 2,
      note: 'Je l’oublie souvent.',
    })
    expect(getSubscriptionMark('user-1', 'netflix:17')).toEqual({
      status: 'review',
      review: { reason: 'rarely_use', usageScale: 2, note: 'Je l’oublie souvent.' },
    })
  })

  it('an empty note still round-trips as an empty string, not undefined', () => {
    markSubscriptionForReview('user-1', 'netflix:17', { reason: 'other', usageScale: 5, note: '' })
    const mark = getSubscriptionMark('user-1', 'netflix:17')
    expect(mark?.status).toBe('review')
    expect(mark?.status === 'review' && mark.review.note).toBe('')
  })

  it('re-saving a review overwrites the previous answers (edit flow)', () => {
    markSubscriptionForReview('user-1', 'netflix:17', { reason: 'dont_recognize', usageScale: 1, note: '' })
    markSubscriptionForReview('user-1', 'netflix:17', { reason: 'want_to_cancel', usageScale: 3, note: 'Updated' })
    const mark = getSubscriptionMark('user-1', 'netflix:17')
    expect(mark).toEqual({ status: 'review', review: { reason: 'want_to_cancel', usageScale: 3, note: 'Updated' } })
  })

  it('switching from "review" to "kept" replaces the mark entirely', () => {
    markSubscriptionForReview('user-1', 'netflix:17', { reason: 'dont_recognize', usageScale: 1, note: '' })
    markSubscriptionKept('user-1', 'netflix:17')
    expect(getSubscriptionMark('user-1', 'netflix:17')).toEqual({ status: 'kept' })
  })

  it('clearing a mark removes it entirely — the item becomes unmarked again', () => {
    markSubscriptionKept('user-1', 'netflix:17')
    clearSubscriptionMark('user-1', 'netflix:17')
    expect(getSubscriptionMark('user-1', 'netflix:17')).toBeNull()
  })

  it('is scoped per user — marking for one user does not affect another', () => {
    markSubscriptionKept('user-1', 'netflix:17')
    expect(getSubscriptionMark('user-2', 'netflix:17')).toBeNull()
  })

  it('is scoped per subscription key — marking one does not affect another for the same user', () => {
    markSubscriptionKept('user-1', 'netflix:17')
    expect(getSubscriptionMark('user-1', 'spotify:12')).toBeNull()
  })

  it('malformed/corrupted stored JSON reads back as null instead of throwing', () => {
    localStorage.setItem('saveup-subscription-review-user-1-netflix:17', '{not valid json')
    expect(getSubscriptionMark('user-1', 'netflix:17')).toBeNull()
  })
})
