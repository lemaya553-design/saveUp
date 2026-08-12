import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { REWARD_TIERS } from '../lib/rewards'

// Every number here is a true fact about the product, not a made-up
// adoption/social-proof metric — SaveUp is too new for those, and the
// "Résultats" section already says so explicitly rather than inventing
// stats. badges comes straight from REWARD_TIERS so it can't drift out of
// sync with the real app.
const STATS = [
  { target: REWARD_TIERS.length, suffix: '', label: 'badges à débloquer en épargnant' },
  { target: 6, suffix: ' mois', label: 'de tendances visualisées d’un coup d’œil' },
  { target: 3, suffix: '', label: 'étapes pour un premier budget prêt' },
  { target: 5, suffix: '', label: 'outils réunis dans une seule app' },
] as const

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
