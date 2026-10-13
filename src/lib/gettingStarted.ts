// Tracks whether a user has clicked through to Statistiques from the
// Dashboard "getting started" guide's 3rd step ("Vois où va ton argent") —
// the only one of the 3 steps with no data of its own to check against
// (unlike a goal existing or an expense existing, "looked at the stats
// page" isn't something the backend records anywhere). A visit flag, same
// low-stakes pattern as pwaInstall.ts's install-prompt dismissal — not
// account data, so no RLS/migration needed, and losing it on a new device
// just means the step shows as unchecked again, not a real failure.
// Scoped per user id so switching accounts on a shared browser doesn't
// carry the checkmark over.
function storageKey(userId: string): string {
  return `saveup-getting-started-viewed-stats-${userId}`
}

export function hasViewedStats(userId: string): boolean {
  return localStorage.getItem(storageKey(userId)) === '1'
}

export function markStatsViewed(userId: string): void {
  localStorage.setItem(storageKey(userId), '1')
}
