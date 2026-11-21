import type { ReactNode } from 'react'

// compact: a denser rendering for pages whose cards read as too tall/padded
// at the default size (currently just Budget) — smaller padding, tighter
// title, and less gap before the body. Opt-in per usage so every other
// page's cards are unaffected.
// accent: the hairline blue gradient ring + fade-in reserved for a handful
// of genuinely important cards (see .card-accent in index.css) — opt-in for
// the same reason, most cards stay plain.
export function Card({
  title,
  hint,
  children,
  compact = false,
  accent = false,
}: {
  title: string
  hint?: string
  children: ReactNode
  compact?: boolean
  accent?: boolean
}) {
  return (
    <section
      // min-w-0: a grid/flex item's default min-width is its own content's
      // min-content size, not 0 — without this, a long `hint` string (or
      // any unbreakable content) forces this card wider than its column,
      // which then stretches every OTHER item sharing that same grid track
      // (siblings in a single-column `grid` all share one column width).
      className={`glass min-w-0 shadow-lg shadow-black/30 ${compact ? 'rounded-xl p-4' : 'rounded-2xl p-5'} ${
        accent ? 'budget-card-in card-accent' : ''
      }`}
    >
      <h2 className={`font-semibold text-ink ${compact ? 'text-base' : 'text-lg'}`}>{title}</h2>
      {hint && <p className={`mt-1 text-xs text-muted ${compact ? 'mb-2' : 'mb-4'}`}>{hint}</p>}
      <div className={hint ? undefined : compact ? 'mt-2' : 'mt-4'}>{children}</div>
    </section>
  )
}
