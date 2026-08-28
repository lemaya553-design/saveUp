import { useState, type MouseEvent } from 'react'
import { formatCurrency } from '../lib/format'

export interface ComparisonPoint {
  month: number
  value: number
}

const WIDTH = 320
const HEIGHT = 130
const PADDING = 8

function formatMonthLabel(month: number): string {
  return month === 0 ? "Aujourd'hui" : `${month} mois`
}

export function SavingsComparisonChart({
  current,
  simulated,
}: {
  current: ComparisonPoint[]
  simulated: ComparisonPoint[]
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (current.length < 2) return null

  const allValues = [...current, ...simulated].map((p) => p.value)
  const maxValue = Math.max(...allValues, 1)
  const minValue = Math.min(...allValues, 0)
  const valueRange = Math.max(1, maxValue - minValue)

  function scale(points: ComparisonPoint[]) {
    return points.map((p, i) => {
      const x = PADDING + (i / (points.length - 1)) * (WIDTH - PADDING * 2)
      const y = HEIGHT - PADDING - ((p.value - minValue) / valueRange) * (HEIGHT - PADDING * 2)
      return { x, y, ...p }
    })
  }

  const currentScaled = scale(current)
  const simulatedScaled = scale(simulated)
  const currentPath = currentScaled.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const simulatedPath = simulatedScaled.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const hoveredCurrent = hoverIndex !== null ? currentScaled[hoverIndex] : null
  const hoveredSimulated = hoverIndex !== null ? simulatedScaled[hoverIndex] : null

  function handleMove(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDist = Infinity
    currentScaled.forEach((p, i) => {
      const dist = Math.abs(p.x - relativeX)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setHoverIndex(closest)
  }

  return (
    <div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none"
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
          <path
            d={currentPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />
          <path
            d={simulatedPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          />
          {hoveredCurrent && hoveredSimulated && (
            <>
              <line
                x1={hoveredCurrent.x}
                y1={PADDING}
                x2={hoveredCurrent.x}
                y2={HEIGHT - PADDING}
                stroke="currentColor"
                strokeWidth={1}
                className="text-overlay/20"
              />
              <circle
                cx={hoveredCurrent.x}
                cy={hoveredCurrent.y}
                r={4}
                fill="currentColor"
                strokeWidth={2}
                className="text-primary stroke-surface"
              />
              <circle
                cx={hoveredSimulated.x}
                cy={hoveredSimulated.y}
                r={4}
                fill="currentColor"
                strokeWidth={2}
                className="text-accent stroke-surface"
              />
            </>
          )}
        </svg>

        {hoveredCurrent && hoveredSimulated && (
          <div
            className="glass pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg px-2 py-1 text-xs text-ink"
            style={{
              left: `${(hoveredCurrent.x / WIDTH) * 100}%`,
              top: `${(Math.min(hoveredCurrent.y, hoveredSimulated.y) / HEIGHT) * 100}%`,
            }}
          >
            {formatMonthLabel(hoveredCurrent.month)} · {formatCurrency(hoveredCurrent.value)} vs{' '}
            {formatCurrency(hoveredSimulated.value)}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full bg-primary" aria-hidden="true" />
          <span className="text-ink">Actuel</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full bg-accent" aria-hidden="true" />
          <span className="text-ink">Simulé</span>
        </div>
      </div>
    </div>
  )
}
