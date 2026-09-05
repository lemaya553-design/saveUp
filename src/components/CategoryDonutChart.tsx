import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../lib/format'
import { colorForCategoryLabel } from '../lib/categoryColors'

export interface DonutSegment {
  category: string
  amount: number
  pct: number
  // Transaction/line-item count for this category — null when the segment
  // isn't a set of real transactions at all (the Revenus tab's "Disponible"
  // remainder), so the list shows a percentage only, not a fake "0
  // transactions".
  count: number | null
}

const defaultFormatCount = (count: number) => `${count} transaction${count > 1 ? 's' : ''}`

function DonutTooltip({
  active,
  payload,
  formatCount,
}: {
  active?: boolean
  payload?: { payload: DonutSegment }[]
  formatCount: (count: number) => string
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/40">
      <p className="font-semibold text-ink">{entry.category}</p>
      <p className="mt-1 text-ink">{formatCurrency(entry.amount)}</p>
      <p className="text-muted">
        {entry.pct.toFixed(0)}%{entry.count !== null ? ` · ${formatCount(entry.count)}` : ''}
      </p>
    </div>
  )
}

export function CategoryDonutChart({
  segments,
  centerTotal,
  centerLabel,
  emptyMessage,
  formatCount = defaultFormatCount,
}: {
  segments: DonutSegment[]
  centerTotal: number
  centerLabel: string
  emptyMessage: string
  // What each segment's `count` actually counts — real dated transactions
  // by default; the Revenus tab passes its own ("2 dépenses fixes") since
  // "transaction" would misdescribe a recurring fixed expense.
  formatCount?: (count: number) => string
}) {
  const [hovered, setHovered] = useState<string | null>(null)

  if (segments.length === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>
  }

  return (
    <div>
      <div className="relative mx-auto h-56 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="amount"
              nameKey="category"
              innerRadius="68%"
              outerRadius="100%"
              // A thin surface-colored ring between slices — the "2px gap
              // between fills" convention, adapted to a donut, so adjacent
              // same-family hues (blue/mauve) never visually fuse.
              paddingAngle={segments.length > 1 ? 2.5 : 0}
              stroke="var(--color-surface)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {segments.map((s) => (
                <Cell
                  key={s.category}
                  fill={colorForCategoryLabel(s.category)}
                  fillOpacity={hovered && hovered !== s.category ? 0.35 : 1}
                  onMouseEnter={() => setHovered(s.category)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer', transition: 'fill-opacity 0.15s ease' }}
                />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip formatCount={formatCount} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-ink">{formatCurrency(centerTotal)}</span>
          <span className="mt-0.5 text-xs text-muted">{centerLabel}</span>
        </div>
      </div>

      <ul className="mt-5 divide-y divide-overlay/10">
        {segments.map((s) => (
          <li
            key={s.category}
            onMouseEnter={() => setHovered(s.category)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center gap-3 py-2.5 transition-opacity ${
              hovered && hovered !== s.category ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <span
              aria-hidden="true"
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: colorForCategoryLabel(s.category) }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{s.category}</p>
              <p className="text-xs text-muted">
                {s.pct.toFixed(0)}%{s.count !== null ? ` · ${formatCount(s.count)}` : ''}
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-ink">{formatCurrency(s.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
