import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../lib/format'
import type { IncomeExpenseTrendPoint } from '../lib/statistics'

const EXPENSE_COLOR = '#4a6cf7'
// Status color (a month spent more than the current income), not a second
// categorical hue — reserved separately from the donut's category palette.
const OVER_INCOME_COLOR = '#f87171'

function SavingsRateLabel({
  x,
  y,
  width,
  index,
  points,
}: {
  x?: number | string
  y?: number | string
  width?: number | string
  index?: number
  points: IncomeExpenseTrendPoint[]
}) {
  if (x === undefined || y === undefined || width === undefined || index === undefined) return null
  const point = points[index]
  if (!point) return null
  const numX = Number(x) + Number(width) / 2
  const numY = Number(y) - 8
  const rate = Math.round(point.savingsRatePct)
  return (
    <text x={numX} y={numY} textAnchor="middle" fontSize={12} fontWeight={600} fill={rate >= 0 ? '#22c55e' : '#f87171'}>
      {rate >= 0 ? `+${rate}%` : `${rate}%`}
    </text>
  )
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: { payload: IncomeExpenseTrendPoint }[] }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/40">
      <p className="font-semibold capitalize text-ink">{point.label}</p>
      <p className="mt-1 text-ink">Dépenses : {formatCurrency(point.expenses)}</p>
      <p className="text-muted">Revenu : {formatCurrency(point.income)}</p>
      <p className={`mt-1 font-medium ${point.savingsRatePct >= 0 ? 'text-success' : 'text-red-400'}`}>
        Taux d'épargne : {point.savingsRatePct >= 0 ? '+' : ''}
        {point.savingsRatePct.toFixed(0)}%
      </p>
    </div>
  )
}

export function IncomeExpenseTrendChart({ points }: { points: IncomeExpenseTrendPoint[] }) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-muted">
        Pas encore assez d'historique pour une tendance — reviens dans quelques semaines.
      </p>
    )
  }

  const income = points[0]?.income ?? 0

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={points} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="color-mix(in srgb, var(--color-overlay) 8%, transparent)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis hide domain={[0, (dataMax: number) => Math.max(dataMax, income) * 1.2]} />
          <Tooltip content={<TrendTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <ReferenceLine
            y={income}
            stroke="var(--color-muted)"
            strokeDasharray="4 3"
            label={{
              value: `Revenu actuel : ${formatCurrency(income)}`,
              position: 'insideTopRight',
              fill: 'var(--color-muted)',
              fontSize: 11,
            }}
          />
          <Bar dataKey="expenses" radius={[6, 6, 0, 0]}>
            <LabelList dataKey="savingsRatePct" content={(props) => <SavingsRateLabel {...props} points={points} />} />
            {points.map((point) => (
              <Cell key={point.monthStart} fill={point.expenses > point.income ? OVER_INCOME_COLOR : EXPENSE_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted">
        Basé sur ton revenu et tes dépenses fixes actuels appliqués rétroactivement — pas
        nécessairement ce qu'ils étaient chaque mois.
      </p>
    </div>
  )
}
