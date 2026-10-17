// "Je garde" / "À vérifier" marking for Premium.tsx's detected subscriptions
// — purely a UI label, never a deletion (the underlying expense rows are
// never touched by anything in this file). Scoped per user id + detection
// key (see subscriptionDetection.ts's DetectedSubscription.key) and kept
// client-side only, same low-stakes localStorage pattern as
// gettingStarted.ts/goalCelebration.ts — losing it on a new device just
// means re-reviewing, not a real failure.
//
// Replaces the earlier plain 'kept' | 'review' string format with a richer
// JSON shape (reason/usage/note for a review) — no migration from the old
// format since this feature shipped without real users depending on it yet.

export type ReviewReason = 'dont_recognize' | 'want_to_cancel' | 'rarely_use' | 'one_time_purchase' | 'other'

export interface ReviewDetails {
  reason: ReviewReason
  // 1-5, how much the user says they actually use it.
  usageScale: number
  // '' when left blank — always a string, never undefined, so callers don't
  // need an extra null-check just to show it.
  note: string
}

export type SubscriptionMark = { status: 'kept' } | { status: 'review'; review: ReviewDetails }

function storageKey(userId: string, subscriptionKey: string): string {
  return `saveup-subscription-review-${userId}-${subscriptionKey}`
}

export function getSubscriptionMark(userId: string, subscriptionKey: string): SubscriptionMark | null {
  const raw = localStorage.getItem(storageKey(userId, subscriptionKey))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<SubscriptionMark>
    if (parsed.status === 'kept') return { status: 'kept' }
    if (
      parsed.status === 'review' &&
      parsed.review &&
      typeof parsed.review.reason === 'string' &&
      typeof parsed.review.usageScale === 'number'
    ) {
      return { status: 'review', review: { ...parsed.review, note: parsed.review.note ?? '' } }
    }
    return null
  } catch {
    return null
  }
}

export function markSubscriptionKept(userId: string, subscriptionKey: string): void {
  localStorage.setItem(storageKey(userId, subscriptionKey), JSON.stringify({ status: 'kept' }))
}

export function markSubscriptionForReview(userId: string, subscriptionKey: string, review: ReviewDetails): void {
  localStorage.setItem(storageKey(userId, subscriptionKey), JSON.stringify({ status: 'review', review }))
}

// Reverses either mark — used by the "Abonnements gardés" panel's "remettre
// dans la liste" action, so a choice is never a dead end.
export function clearSubscriptionMark(userId: string, subscriptionKey: string): void {
  localStorage.removeItem(storageKey(userId, subscriptionKey))
}
