// Captures a goal name chosen on the logged-out landing page (Home.tsx's
// hero goal picker) so it survives signup + onboarding and can prefill
// AddGoalCard's name field the first time a brand-new account opens it —
// no account/user id exists yet at the moment this is set, so (unlike
// gettingStarted.ts) this can't be scoped per-user. Single-use: consuming
// it clears it immediately, so it only ever prefills once.
const STORAGE_KEY = 'saveup-pending-goal-name'

export function setPendingGoalName(name: string): void {
  localStorage.setItem(STORAGE_KEY, name)
}

export function clearPendingGoalName(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function consumePendingGoalName(): string | null {
  const value = localStorage.getItem(STORAGE_KEY)
  if (value !== null) localStorage.removeItem(STORAGE_KEY)
  return value
}
