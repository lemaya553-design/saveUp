import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../lib/format'
import type { CategoryMomChange } from '../lib/statistics'

// Mirrors BudgetVsActualChart's convention exactly, translated from a
// horizontal CSS progress bar to a vertical Recharts one: the track (mauve,
// translucent) is the reference ceiling — here "last month" instead of a
// fixed budget — and the fill is the actual/current amount, blue when under
// the ceiling, red when it exceeds it.
const TRACK_COLOR = 'rgba(139, 92, 246, 0.3)' // accent/mauve — "last month"
const FILL_COLOR = '#4a6cf7' // primary blue — "this month", under last month
const OVER_COLOR = '#f87171' // red-400 — "this month" exceeds last month

const MIN_COLUMN_WIDTH = 76
const CHART_HEIGHT = 220
const CORNER_RADIUS = 6

// A rect with rounded TOP corners only, flush at the bottom — matches the
// radius={[6,6,0,0]} bars used elsewhere on this page. Built by hand because
// a custom Bar `shape` draws raw SVG, not Recharts' own radius handling.
function roundedTopRectPath(x: number, y: number, width: number, height: number, radius: number): string {
  if (height <= 0 || width <= 0) return ''
  const r = Math.min(radius, width / 2, height)
  if (r <= 0) return `M${x},${y + height} L${x},${y} L${x + width},${y} L${x + width},${y + height} Z`
  return `M${x},${y + height} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + width - r},${y} Q${x + width},${y} ${x + width},${y + r} L${x + width},${y + height} Z`
}

interface OverlayBarProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: CategoryMomChange
}

// The core of the "overlaid, not side-by-side" visual: a single Bar series
// (dataKey="lastMonth", which drives the Y-axis scale) whose custom shape
// draws TWO rects at the same x/width — the full-height track for last
// month, and a shorter fill on top of it, growing from the shared baseline,
// sized to this month's proportion of last month's amount.
function OverlayBar({ x, y, width, height, payload }: OverlayBarProps) {
  if (x === undefined || y === undefined || width === undefined || height === undefined || !payload) return null
  const { lastMonth, thisMonth } = payload
  const ratio = lastMonth > 0 ? Math.min(1, thisMonth / lastMonth) : 0
  const fillHeight = height * ratio
  const fillY = y + (height - fillHeight)
  const over = thisMonth > lastMonth

  return (
    <g>
      <path d={roundedTopRectPath(x, y, width, height, CORNER_RADIUS)} fill={TRACK_COLOR} />
      {fillHeight > 0 && (
        <path
          d={roundedTopRectPath(x, fillY, width, fillHeight, CORNER_RADIUS)}
          fill={over ? OVER_COLOR : FILL_COLOR}
        />
      )}
    </g>
  )
}

function TrackTopLabel({
  x,
  y,
  width,
  index,
  entries,
}: {
  x?: number | string
  y?: number | string
  width?: number | string
  index?: number
  entries: CategoryMomChange[]
}) {
  if (x === undefined || y === undefined || width === undefined || index === undefined) return null
  const entry = entries[index]
  if (!entry) return null
  const numX = Number(x)
  const numY = Number(y)
  const numWidth = Number(width)
  return (
    <text x={numX + numWidth / 2} y={numY - 8} textAnchor="middle" fill="#f5f5f7" fontSize={12} fontWeight={600}>
      {formatCurrency(entry.lastMonth)}
    </text>
  )
}

function OverlayTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: CategoryMomChange }[]
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  const over = entry.thisMonth > entry.lastMonth
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/40">
      <p className="font-semibold text-ink">{entry.category}</p>
      <p className="mt-1 text-muted">Mois dernier : {formatCurrency(entry.lastMonth)}</p>
      <p className={over ? 'text-red-400' : 'text-ink'}>Ce mois-ci : {formatCurrency(entry.thisMonth)}</p>
    </div>
  )
}

// entries must already be filtered to lastMonth > 0 (a category with
// nothing spent last month has no reference to overlay against — those
// "nouveau ce mois-ci" cases are covered by CategoryMomList instead) and
// sorted by the caller (biggest last-month spend first, per the page's
// ordering choice).
export function MonthOverlayChart({ entries }: { entries: CategoryMomChange[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted">
        Pas assez de données du mois dernier pour comparer, pour l'instant.
      </p>
    )
  }

  const chartWidth = Math.max(280, entries.length * MIN_COLUMN_WIDTH)

  return (
    <div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: chartWidth }}>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={entries} margin={{ top: 24, right: 8, left: 8, bottom: 4 }} barCategoryGap={16}>
              <YAxis hide domain={[0, (dataMax: number) => dataMax * 1.15]} />
              <XAxis
                dataKey="category"
                tick={{ fill: '#f5f5f7', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <Tooltip content={<OverlayTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar
                dataKey="lastMonth"
                shape={(props: OverlayBarProps) => <OverlayBar {...props} />}
                label={(props) => <TrackTopLabel {...props} entries={entries} />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: TRACK_COLOR }} />
          Mois dernier
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: FILL_COLOR }} />
          Ce mois-ci
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: OVER_COLOR }} />
          Ce mois-ci (dépassé)
        </span>
      </div>
    </div>
  )
}
