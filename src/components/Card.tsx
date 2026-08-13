import type { ReactNode } from 'react'

// compact: a denser rendering for pages whose cards read as too tall/padded
// at the default size (currently just Budget) — smaller padding, tighter
// title, and less gap before the body. Opt-in per usage so every other
// page's cards are unaffected.
export function Card({
  title,
  hint,
  children,
  compact = false,
}: {
  title: string
  hint?: string
  children: ReactNode
  compact?: boolean
}) {
  return (
    <section
      className={`glass shadow-lg shadow-black/30 ${compact ? 'rounded-xl p-4' : 'rounded-2xl p-5'}`}
    >
      <h2 className={`font-semibold text-ink ${compact ? 'text-base' : 'text-lg'}`}>{title}</h2>
      {hint && <p className={`mt-1 text-xs text-muted ${compact ? 'mb-2' : 'mb-4'}`}>{hint}</p>}
      <div className={hint ? undefined : compact ? 'mt-2' : 'mt-4'}>{children}</div>
    </section>
  )
}
