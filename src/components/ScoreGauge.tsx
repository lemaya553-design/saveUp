import { getScoreColorClass } from '../lib/financialHealth'

const RADIUS = 80
const ARC_LENGTH = Math.PI * RADIUS
const ARC_PATH = `M 20 100 A ${RADIUS} ${RADIUS} 0 0 1 180 100`

export function ScoreGauge({
  score,
  label = 'Score de santé financière',
}: {
  score: number
  label?: string
}) {
  const clamped = Math.min(100, Math.max(0, score))
  const offset = ARC_LENGTH * (1 - clamped / 100)
  const colorClass = getScoreColorClass(clamped)

  return (
    <div className="relative mx-auto w-full max-w-[220px]">
      <svg viewBox="0 0 200 110" className="w-full" role="img" aria-label={`${label} : ${clamped} sur 100`}>
        <path
          d={ARC_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={14}
          strokeLinecap="round"
          className="text-white/10"
        />
        <path
          d={ARC_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={offset}
          className={`transition-all duration-500 ${colorClass}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className={`text-4xl font-bold ${colorClass}`}>{clamped}</span>
        <span className="text-xs text-muted">/100</span>
      </div>
    </div>
  )
}
