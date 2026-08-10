import { useState, type MouseEvent } from 'react'
import { formatCurrency } from '../lib/format'
import type { ProjectionPoint } from '../lib/investment'

const WIDTH = 320
const HEIGHT = 130
const PADDING = 8

function formatMonthLabel(month: number): string {
  if (month === 0) return 'Départ'
  const years = Math.floor(month / 12)
  const remainingMonths = month % 12
  if (years === 0) return `${month} mois`
  if (remainingMonths === 0) return `${years} an${years > 1 ? 's' : ''}`
  return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`
}

export function GrowthChart({ points }: { points: ProjectionPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (points.length < 2) return null

  const maxValue = Math.max(...points.map((p) => p.value), 1)
  const minValue = Math.min(...points.map((p) => p.value), 0)
  const valueRange = Math.max(1, maxValue - minValue)

  const scaled = points.map((p, i) => {
    const x = PADDING + (i / (points.length - 1)) * (WIDTH - PADDING * 2)
    const y = HEIGHT - PADDING - ((p.value - minValue) / valueRange) * (HEIGHT - PADDING * 2)
    return { x, y, ...p }
  })

  const linePath = scaled.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${scaled[scaled.length - 1].x} ${HEIGHT - PADDING} L ${scaled[0].x} ${HEIGHT - PADDING} Z`
  const hovered = hoverIndex !== null ? scaled[hoverIndex] : null

  function handleMove(e: MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDist = Infinity
    scaled.forEach((p, i) => {
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
          className="text-white/10"
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
              className="text-white/20"
            />
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r={4}
              fill="currentColor"
              strokeWidth={2}
              className="stroke-surface"
            />
          </>
        )}
      </svg>

      {hovered && (
        <div
          className="glass pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg px-2 py-1 text-xs text-ink"
          style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: `${(hovered.y / HEIGHT) * 100}%` }}
        >
          {formatMonthLabel(hovered.month)} · {formatCurrency(hovered.value)}
        </div>
      )}
    </div>
  )
}
