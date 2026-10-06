import type { ReactNode } from 'react'

// Shared "ghost chart" empty state for the Budget page's 3 charts — a
// low-opacity decorative preview of the real chart shape, with an icon +
// short sentence + CTA layered on top. Replaces plain muted-gray text for
// every chart that has no data yet.
export function BudgetEmptyChart({
  ghost,
  icon,
  title,
  description,
  actionLabel,
  onAction,
  heightClassName = 'h-56',
}: {
  ghost: ReactNode
  icon: ReactNode
  title: string
  description: string
  // Omit both when there's genuinely nothing to "go do" (e.g. Dashboard's
  // score chart just needs a day or two of history, not an action) —
  // every other caller still passes both.
  actionLabel?: string
  onAction?: () => void
  heightClassName?: string
}) {
  return (
    <div className={`relative ${heightClassName} w-full overflow-hidden rounded-xl`}>
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        {ghost}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ color: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.15)' }}
        >
          {icon}
        </span>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="max-w-[22rem] text-xs text-muted">{description}</p>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
            style={{ backgroundColor: '#FF7A00' }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
