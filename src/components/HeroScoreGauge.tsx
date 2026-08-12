import { useEffect, useId, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'

const RADIUS = 130
const ARC_LENGTH = Math.PI * RADIUS
const ARC_PATH = `M 30 160 A ${RADIUS} ${RADIUS} 0 0 1 290 160`

// The hero's centerpiece visual — a bigger, more dramatic take on the real
// app's ScoreGauge (not the same component: this one gets a two-tone
// gradient stroke and a glow, fitting for a marketing hero, while the real
// in-app gauge stays untouched and single-toned by score tier). Animates in
// shortly after mount, not on scroll — the hero is always visible on load.
export function HeroScoreGauge({ score }: { score: number }) {
  const gradientId = useId()
  const [active, setActive] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setActive(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const value = useCountUp(score, active, 1600)
  const offset = ARC_LENGTH * (1 - value / 100)

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <svg
        viewBox="0 0 320 180"
        className="w-full"
        role="img"
        aria-label={`Exemple : score de santé financière de ${score} sur 100`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4a6cf7" />
            <stop offset="0.55" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <path d={ARC_PATH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={22} strokeLinecap="round" />
        <path
          d={ARC_PATH}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center">
        <span className="text-6xl font-black tracking-tight text-ink">{value}</span>
        <span className="mt-1 text-xs uppercase tracking-wide text-muted">
          Score de santé financière · exemple
        </span>
      </div>
    </div>
  )
}
