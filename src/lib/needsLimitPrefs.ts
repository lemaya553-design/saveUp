import { DEFAULT_NEEDS_PCT, DEFAULT_SAVINGS_PCT, clampPct } from './needsLimit'

// The needs/savings percentages are reference points, not financial data —
// kept per-user in localStorage only (same lightweight pattern as
// subscriptionReview.ts/gettingStarted.ts), never synced to Supabase.
// Scoped by user.id so switching accounts on the same browser never leaks
// one person's edited percentages into another's view.

interface NeedsLimitPcts {
  needsPct: number
  savingsPct: number
}

function storageKey(userId: string): string {
  return `saveup-needs-limit-pcts-${userId}`
}

export function getNeedsLimitPcts(userId: string): NeedsLimitPcts {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return { needsPct: DEFAULT_NEEDS_PCT, savingsPct: DEFAULT_SAVINGS_PCT }
    const parsed = JSON.parse(raw) as Partial<NeedsLimitPcts>
    return {
      needsPct: clampPct(Number(parsed.needsPct), DEFAULT_NEEDS_PCT),
      savingsPct: clampPct(Number(parsed.savingsPct), DEFAULT_SAVINGS_PCT),
    }
  } catch {
    return { needsPct: DEFAULT_NEEDS_PCT, savingsPct: DEFAULT_SAVINGS_PCT }
  }
}

export function setNeedsLimitPcts(userId: string, pcts: NeedsLimitPcts): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(pcts))
  } catch {
    // Private browsing / storage disabled — the edit just won't survive a
    // reload, same graceful degradation used elsewhere in this app.
  }
}
