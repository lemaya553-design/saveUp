import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { formatCurrency, formatCurrencyEN } from '../lib/format'
import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'

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
  const { lang } = useLanguage()
  const t = COMMON[lang].simulatorPreview

  return (
    <div ref={ref} className="flex h-full flex-col justify-between">
      <div>
        <p className="text-sm text-muted">{t.whatIf}</p>
        <p className="mt-1 text-lg font-semibold text-ink line-through decoration-red-400/70 decoration-2">
          {t.cutExample}
        </p>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">{t.towardGoal}</p>
          <p className="text-3xl font-black text-success">
            +{lang === 'fr' ? formatCurrency(monthly) : formatCurrencyEN(monthly)}
            <span className="text-base font-medium text-muted">{t.perMonth}</span>
          </p>
        </div>
        <ArrowIcon className="h-8 w-8 shrink-0 text-success" />
      </div>
    </div>
  )
}
