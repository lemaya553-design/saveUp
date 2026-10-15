// Tracks whether DashboardGoalCard has already shown its one-time confetti
// burst for a given goal — "une seule fois" means once ever, not once per
// session, so a returning visit to an already-100%-complete goal doesn't
// replay it every time. Same low-stakes localStorage pattern as
// gettingStarted.ts/pendingGoal.ts: losing this on a new device just means
// the celebration plays again once, not a real failure.
const STORAGE_PREFIX = 'saveup-goal-celebrated-'

export function hasCelebratedGoal(goalId: string): boolean {
  return localStorage.getItem(STORAGE_PREFIX + goalId) === '1'
}

export function markGoalCelebrated(goalId: string): void {
  localStorage.setItem(STORAGE_PREFIX + goalId, '1')
}
