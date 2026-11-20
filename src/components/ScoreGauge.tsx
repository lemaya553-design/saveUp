import { useLanguage } from '../hooks/useLanguage'

const RADIUS = 80
const ARC_LENGTH = Math.PI * RADIUS
const ARC_PATH = `M 20 100 A ${RADIUS} ${RADIUS} 0 0 1 180 100`

// Same 3-tier read as lib/financialHealth.ts's shared getScoreColorClass
// (green/blue/red) — this component needs real hex (SVG stroke, not a
// Tailwind class) so it can't call that function directly, but mirrors its
// exact thresholds and colors rather than inventing its own.
function scoreColor(score: number): string {
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#4A6CF7'
  return '#ef4444'
}

export function ScoreGauge({
  score,
  label,
}: {
  score: number
  label?: string
}) {
  const { lang } = useLanguage()
  const resolvedLabel = label ?? (lang === 'fr' ? 'Score de santé financière' : 'Financial health score')
  const clamped = Math.min(100, Math.max(0, score))
  const offset = ARC_LENGTH * (1 - clamped / 100)
  const color = scoreColor(clamped)
  const ariaLabel =
    lang === 'fr' ? `${resolvedLabel} : ${clamped} sur 100` : `${resolvedLabel}: ${clamped} out of 100`

  return (
    <div className="relative mx-auto w-full max-w-[220px]">
      <svg viewBox="0 0 200 110" className="w-full" role="img" aria-label={ariaLabel}>
        <path
          d={ARC_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={14}
          strokeLinecap="round"
          className="text-overlay/10"
        />
        <path
          d={ARC_PATH}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {clamped}
        </span>
        <span className="text-xs text-muted">/100</span>
      </div>
    </div>
  )
}
