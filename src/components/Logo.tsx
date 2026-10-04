import { useId } from 'react'

// The app's bar-chart mark — three ascending bars, a primary-to-accent
// gradient driven by the live theme tokens (not hardcoded hex) so it
// automatically follows whichever palette is active: the app's orange
// default, a custom accent preset, or the landing page's own orange
// (.landing-classic collapses primary/accent to the same value, so there
// it renders as solid orange). The static public/icon.svg favicon can't
// do this — it's a plain file, not CSS-aware — so it keeps its own fixed
// stops. Rendered inline as SVG rather than an <img> so it stays crisp at
// any size/DPI and needs no separate asset request, consistent with every
// other icon in this app. useId keeps the gradient's id collision-free if
// this ever renders more than once on the same page (e.g. two instances
// at once).
// animated: bars grow up from the baseline on mount, staggered (see
// .bar-grow-in in index.css) — used once, for the landing hero's opening
// moment. Off by default: the header/nav marks should just be there, not
// replay an intro animation on every render.
export function LogoMark({
  className = 'h-7 w-7',
  animated = false,
}: {
  className?: string
  animated?: boolean
}) {
  const gradientId = useId()
  return (
    <svg
      viewBox="0 0 465 465"
      className={`${className} ${animated ? 'bar-grow-in' : ''}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--color-primary)' }} />
          <stop offset="1" style={{ stopColor: 'var(--color-accent)' }} />
        </linearGradient>
      </defs>
      <rect x="70" y="260" width="85" height="180" rx="32" fill={`url(#${gradientId})`} />
      <rect x="195" y="165" width="85" height="275" rx="32" fill={`url(#${gradientId})`} />
      <rect x="320" y="70" width="85" height="370" rx="32" fill={`url(#${gradientId})`} />
    </svg>
  )
}
