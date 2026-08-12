import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { formatCurrency } from '../lib/format'

function ArrowIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

// A static illustration of what the real "simulateur et si" does — not the
// interactive widget itself (removed from this page on request), just an
// animated before/after so the concept still reads at a glance without
// requiring a click.
export function SimulatorPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const monthly = useCountUp(127, active, 1400)

  return (
    <div ref={ref} className="flex h-full flex-col justify-between">
      <div>
        <p className="text-sm text-muted">Et si tu coupais...</p>
        <p className="mt-1 text-lg font-semibold text-ink line-through decoration-red-400/70 decoration-2">
          Café à emporter, tous les jours
        </p>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Vers ton objectif</p>
          <p className="text-3xl font-black text-success">
            +{formatCurrency(monthly)}
            <span className="text-base font-medium text-muted">/mois</span>
          </p>
        </div>
        <ArrowIcon className="h-8 w-8 shrink-0 text-success" />
      </div>
    </div>
  )
}
