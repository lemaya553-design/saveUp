import { useId } from 'react'

// The app's bar-chart mark — three ascending bars, orange gradient (the
// Budget page redesign's brand palette). public/icon.svg, the favicon/PWA
// icon source, keeps its own original blue-to-mauve gradient on purpose —
// out of scope for that redesign, which only covers in-app chrome. Rendered
// inline as SVG rather than an <img> so it stays crisp at any size/DPI and
// needs no separate asset request, consistent with every other icon in
// this app. useId keeps the gradient's id collision-free if this ever
// renders more than once on the same page (e.g. two instances at once).
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
          <stop offset="0" stopColor="#CC5F00" />
          <stop offset="1" stopColor="#FF7A00" />
        </linearGradient>
      </defs>
      <rect x="70" y="260" width="85" height="180" rx="32" fill={`url(#${gradientId})`} />
      <rect x="195" y="165" width="85" height="275" rx="32" fill={`url(#${gradientId})`} />
      <rect x="320" y="70" width="85" height="370" rx="32" fill={`url(#${gradientId})`} />
    </svg>
  )
}
