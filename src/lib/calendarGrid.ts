import { toDateString } from './format'

export interface CalendarCell {
  date: Date
  dateStr: string
  inCurrentMonth: boolean
  isToday: boolean
  isFuture: boolean
}

// Monday-first, matching format.ts's own getWeekStart convention (used by
// the weekly-spending chart elsewhere in the app) — every week returned is
// a full 7 days, so the grid always tiles cleanly even when the month
// doesn't start on a Monday or end on a Sunday.
function mondayIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1
}

// Full weeks (Monday-Sunday) covering every day of `monthDate`'s month,
// including the leading/trailing days borrowed from the adjacent months to
// fill out the first and last week — those are marked `inCurrentMonth:
// false` so the UI can render them dimmed/unclickable instead of omitting
// them, which would leave a ragged grid.
export function buildMonthGrid(monthDate: Date, today = new Date()): CalendarCell[][] {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)

  const gridStart = new Date(firstOfMonth)
  gridStart.setDate(gridStart.getDate() - mondayIndex(firstOfMonth.getDay()))

  const gridEnd = new Date(lastOfMonth)
  gridEnd.setDate(gridEnd.getDate() + (6 - mondayIndex(lastOfMonth.getDay())))

  const todayStr = toDateString(today)
  const weeks: CalendarCell[][] = []
  let week: CalendarCell[] = []
  const cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    const dateStr = toDateString(cursor)
    week.push({
      date: new Date(cursor),
      dateStr,
      inCurrentMonth: cursor.getMonth() === month,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return weeks
}

// How much of the app's accent color (--color-primary) to mix into a rated
// day's background, 0-10 mapped onto 0-MAX%. Capped well below 100% even at
// a perfect 10 — "une échelle douce" — so the big rating number drawn on
// top (always text-ink) stays legible in both themes rather than needing a
// second light/dark text-color flip at high ratings.
const MAX_RATING_BLEND_PCT = 72

export function ratingBlendPct(rating: number): number {
  const clamped = Math.min(10, Math.max(0, rating))
  return (clamped / 10) * MAX_RATING_BLEND_PCT
}

export interface MonthNoteStats {
  average: number | null
  notedDaysCount: number
}

// Days with no note are excluded entirely (never averaged in as a 0 or any
// other penalty) — matches "une case sans note reste vide, sans pénalité".
export function computeMonthNoteStats(ratings: number[]): MonthNoteStats {
  if (ratings.length === 0) return { average: null, notedDaysCount: 0 }
  const sum = ratings.reduce((s, r) => s + r, 0)
  return { average: sum / ratings.length, notedDaysCount: ratings.length }
}
