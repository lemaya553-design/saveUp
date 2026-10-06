import { useLanguage } from '../hooks/useLanguage'

const RADIUS = 80
const ARC_LENGTH = Math.PI * RADIUS
const ARC_PATH = `M 20 100 A ${RADIUS} ${RADIUS} 0 0 1 180 100`

// Orange-family 3-tier read instead of lib/financialHealth.ts's shared
// getScoreColorClass (green/violet/red) — that function is also used by
// the landing page's demo simulator, which keeps its original colors;
// this component is Dashboard-only, so it gets its own tiers instead of
// overriding a function other pages still rely on.
function scoreColor(score: number): string {
  if (score >= 70) return '#FF7A00'
  if (score >= 40) return '#FFB347'
  return '#E5484D'
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
