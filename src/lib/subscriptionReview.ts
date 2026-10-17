// "Je garde" / "À vérifier" marking for Premium.tsx's detected subscriptions
// — purely a UI label, never a deletion (the task is explicit: marking a
// detected charge never touches the underlying expense rows). Scoped per
// user id + detection key (see subscriptionDetection.ts's DetectedSubscription.key)
// and kept client-side only, same low-stakes localStorage pattern as
// gettingStarted.ts/goalCelebration.ts — losing it on a new device just
// means re-reviewing, not a real failure.
export type SubscriptionReviewStatus = 'kept' | 'review'

function storageKey(userId: string, subscriptionKey: string): string {
  return `saveup-subscription-review-${userId}-${subscriptionKey}`
}

export function getSubscriptionReviewStatus(userId: string, subscriptionKey: string): SubscriptionReviewStatus | null {
  const raw = localStorage.getItem(storageKey(userId, subscriptionKey))
  return raw === 'kept' || raw === 'review' ? raw : null
}

export function setSubscriptionReviewStatus(
  userId: string,
  subscriptionKey: string,
  status: SubscriptionReviewStatus,
): void {
  localStorage.setItem(storageKey(userId, subscriptionKey), status)
}
