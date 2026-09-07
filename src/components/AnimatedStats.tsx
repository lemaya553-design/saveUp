import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { REWARD_TIERS } from '../lib/rewards'
import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'
import type { Lang } from '../lib/i18n/language'

// Every number here is a true fact about the product, not a made-up
// adoption/social-proof metric — SaveUp is too new for those, and the
// "Résultats" section already says so explicitly rather than inventing
// stats. badges comes straight from REWARD_TIERS so it can't drift out of
// sync with the real app.
function getStats(lang: Lang) {
  const t = COMMON[lang].stats
  return [
    { target: REWARD_TIERS.length, suffix: '', label: t.badges },
    { target: 6, suffix: t.monthsSuffix, label: t.trends },
    { target: 3, suffix: '', label: t.steps },
    { target: 5, suffix: '', label: t.tools },
  ] as const
}

function StatItem({
  target,
  suffix,
  label,
  active,
}: {
  target: number
  suffix: string
  label: string
  active: boolean
}) {
  const value = useCountUp(target, active)
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-ink sm:text-5xl">
        {value}
        <span className="text-primary">{suffix}</span>
      </p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  )
}

export function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const { lang } = useLanguage()
  const STATS = getStats(lang)

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

  return (
    <div ref={ref} className="grid grid-cols-2 gap-8 sm:grid-cols-4">
      {STATS.map((s) => (
        <StatItem key={s.label} target={s.target} suffix={s.suffix} label={s.label} active={active} />
      ))}
    </div>
  )
}
