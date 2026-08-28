import { useState, type MouseEvent } from 'react'
import type { ScoreSnapshot } from '../hooks/useFinancialHealth'

const WIDTH = 320
const HEIGHT = 100
const PADDING = 8

export function ScoreHistoryChart({ history }: { history: ScoreSnapshot[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (history.length < 2) {
    return (
      <p className="text-sm text-muted">
        Reviens dans quelques jours pour voir l’évolution de ton score.
      </p>
    )
  }

  const points = history.map((snapshot, i) => {
    const x = PADDING + (i / (history.length - 1)) * (WIDTH - PADDING * 2)
    const y = HEIGHT - PADDING - (snapshot.score / 100) * (HEIGHT - PADDING * 2)
    return { x, y, ...snapshot }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${HEIGHT - PADDING} L ${points[0].x} ${HEIGHT - PADDING} Z`
  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  function handleMove(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDist = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setHoverIndex(closest)
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none text-primary"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <line
          x1={PADDING}
          y1={HEIGHT - PADDING}
          x2={WIDTH - PADDING}
          y2={HEIGHT - PADDING}
          stroke="currentColor"
          strokeWidth={1}
          className="text-overlay/10"
        />
        <path d={areaPath} fill="currentColor" opacity={0.1} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hovered && (
          <>
            <line
              x1={hovered.x}
              y1={PADDING}
              x2={hovered.x}
              y2={HEIGHT - PADDING}
              stroke="currentColor"
              strokeWidth={1}
              className="text-overlay/20"
            />
            <circle cx={hovered.x} cy={hovered.y} r={4} fill="currentColor" strokeWidth={2} className="stroke-surface" />
          </>
        )}
      </svg>

      {hovered && (
        <div
          className="glass pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg px-2 py-1 text-xs text-ink"
          style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
        >
          {new Date(hovered.score_date).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })} ·{' '}
          {hovered.score}
        </div>
      )}
    </div>
  )
}
