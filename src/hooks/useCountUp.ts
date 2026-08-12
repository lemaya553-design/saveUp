import { useEffect, useRef, useState } from 'react'

// Animates 0 -> target once `active` flips true (driven by the caller,
// typically an IntersectionObserver — see AnimatedStats). Ease-out cubic via
// requestAnimationFrame, not CSS, since the thing animating is a text node
// (the number itself), not a style property. Skips straight to the final
// value under prefers-reduced-motion.
export function useCountUp(target: number, active: boolean, durationMs = 1200): number {
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!active || startedRef.current) return
    startedRef.current = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }

    const start = performance.now()
    let frame: number

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, target, durationMs])

  return value
}
