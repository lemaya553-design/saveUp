import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../lib/format'
import type { MonthlySpendingPoint } from '../lib/statistics'

const LINE_COLOR = '#4a6cf7'

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: MonthlySpendingPoint }[]
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/40">
      <p className="font-semibold capitalize text-ink">{point.label}</p>
      <p className="text-muted">{formatCurrency(point.amount)}</p>
    </div>
  )
}

export function MonthlyTrendChart({ points }: { points: MonthlySpendingPoint[] }) {
  if (points.length < 2) {
    return (
      <p className="text-sm text-muted">
        Pas encore assez d'historique pour une tendance — reviens dans quelques semaines.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis hide />
        <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
        <Line
          type="monotone"
          dataKey="amount"
          stroke={LINE_COLOR}
          strokeWidth={2.5}
          dot={{ r: 4, fill: LINE_COLOR, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
