import { useEffect, useState } from 'react'

// Reactive version of the `window.matchMedia(...).matches` one-shot check
// already used by useCountUp — the Budget page's charts need to keep
// reading this across the component's lifetime (not just once on mount)
// since recharts' `isAnimationActive` is read on every render.
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduced(query.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return reduced
}
