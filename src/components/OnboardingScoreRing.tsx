import { useEffect, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'

const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Full circular progress ring for Onboarding.tsx's score reveal screen —
// distinct from the in-app ScoreGauge (Dashboard) and the unused/orphaned
// HeroScoreGauge (a half-arc, built for an earlier landing-page design
// that was since replaced) — neither fit the "le cercle se remplit" brief
// here. Animates once on mount (a brief delay first, so the reveal doesn't
// start mid-render before the user has had a moment to see the heading),
// using the same useCountUp hook as the rest of the app for the number —
// strokeDashoffset is driven by that same animated value every frame
// rather than a separate CSS transition, so the ring fill and the number
// tick up in perfect lockstep.
export function OnboardingScoreRing({ score, caption }: { score: number; caption: string }) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setActive(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const value = useCountUp(score, active, 1400)
  const offset = CIRCUMFERENCE * (1 - value / 100)

  return (
    <div className="relative mx-auto h-48 w-48 sm:h-56 sm:w-56">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" role="img" aria-label={`${caption}: ${score}/100`}>
        <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={16} />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="#4A6CF7"
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black tracking-tight text-white sm:text-6xl">{value}</span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/50">{caption}</span>
      </div>
    </div>
  )
}
