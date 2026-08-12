import { toDateString } from './format'

// Consecutive days ending today, counted backward from today until the
// first missing day. `activityDates` is unordered and may contain
// duplicates or dates outside any particular window — only membership
// matters. Today itself must already be in the set for a same-day visit to
// count (the caller records it before calling this).
export function computeStreak(activityDates: Iterable<string>, today = new Date()): number {
  const days = new Set(activityDates)
  let streak = 0
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  while (days.has(toDateString(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}
