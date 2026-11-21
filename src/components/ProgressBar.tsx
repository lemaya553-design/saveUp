import { useEffect, useState } from 'react'

// gradient: the shared "objectif/badge progress" look (#1E3A8A → #4A6CF7,
// per the brand palette) — opt-in rather than the default so bars using
// colorClass for a semantic color (success green, over-budget red) never
// get silently recolored blue.
export function ProgressBar({
  value,
  colorClass = 'bg-success',
  gradient = false,
}: {
  value: number
  colorClass?: string
  gradient?: boolean
}) {
  const clamped = Math.min(100, Math.max(0, value))
  // Starts at 0 and animates up to the real value one frame after mount —
  // rendering straight at `clamped` on the first paint would leave nothing
  // for the transition below to animate from, so the fill would just
  // appear instantly instead of "filling in."
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(clamped))
    return () => cancelAnimationFrame(frame)
  }, [clamped])

  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-overlay/10"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out motion-reduce:transition-none ${gradient ? '' : colorClass}`}
        style={{
          width: `${width}%`,
          backgroundImage: gradient ? 'linear-gradient(90deg, #1E3A8A, #4A6CF7)' : undefined,
        }}
      />
    </div>
  )
}
