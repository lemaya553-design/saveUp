// Tracks whether a brand-new user has already been shown the 3-step
// welcome tutorial (choose a goal -> set an amount -> watch the bar fill)
// on the Dashboard, whether they finished it or hit "Passer". Same
// low-stakes visit-flag pattern as gettingStarted.ts — not account data,
// so no RLS/migration needed, and losing it on a new device just means
// the tutorial shows again once, not a real failure.
function storageKey(userId: string): string {
  return `saveup-welcome-tutorial-seen-${userId}`
}

export function hasSeenWelcomeTutorial(userId: string): boolean {
  return localStorage.getItem(storageKey(userId)) === '1'
}

export function markWelcomeTutorialSeen(userId: string): void {
  localStorage.setItem(storageKey(userId), '1')
}
