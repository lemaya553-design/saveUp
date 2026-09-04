import { useEffect, useRef, useState } from 'react'

// Animates smoothly from whatever is currently displayed to a new target
// every time `target` changes — unlike useCountUp (which only ever counts
// up once, from 0, when triggered). Used for values that update repeatedly
// in place, like a savings goal's projected days-remaining ticking down
// live when a contribution lands. Reads the in-flight value off a ref (not
// just the value captured when the effect started) so a target that changes
// again mid-animation retargets smoothly instead of jumping.
export function useAnimatedNumber(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target)
  const currentRef = useRef(target)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      currentRef.current = target
      setValue(target)
      return
    }
    if (currentRef.current === target) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      currentRef.current = target
      setValue(target)
      return
    }

    const from = currentRef.current
    const start = performance.now()
    let frame: number

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(from + (target - from) * eased)
      currentRef.current = next
      setValue(next)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return value
}
