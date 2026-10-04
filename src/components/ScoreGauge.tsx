import { useLanguage } from '../hooks/useLanguage'

const RADIUS = 80
const ARC_LENGTH = Math.PI * RADIUS
const ARC_PATH = `M 20 100 A ${RADIUS} ${RADIUS} 0 0 1 180 100`

// Always brand orange + a high-contrast number, regardless of score tier —
// the gauge used to shift red/orange/green by score (via
// getScoreColorClass, still used elsewhere for score explanation rows),
// but that put green on the dashboard's single most prominent number,
// which SaveUp Minimaliste reserves orange for exclusively. The arc's fill
// LENGTH still encodes the score; only the color stopped doing double duty
// as a second signal. text-ink (not a literal white) so the number stays
// readable if the card ever sits on the light theme's white surface —
// it resolves to white on the app's dark default, matching the requested
// look there.
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
          stroke="currentColor"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className="text-4xl font-bold text-ink">{clamped}</span>
        <span className="text-xs text-muted">/100</span>
      </div>
    </div>
  )
}
