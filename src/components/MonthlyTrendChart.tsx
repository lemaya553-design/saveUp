import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { MonthlySpendingPoint } from '../lib/statistics'

const LINE_COLOR = '#4a6cf7'

function TrendTooltip({
  active,
  payload,
  formatMoney,
}: {
  active?: boolean
  payload?: { payload: MonthlySpendingPoint }[]
  formatMoney: (amount: number) => string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/40">
      <p className="font-semibold capitalize text-ink">{point.label}</p>
      <p className="text-muted">{formatMoney(point.amount)}</p>
    </div>
  )
}

export function MonthlyTrendChart({ points }: { points: MonthlySpendingPoint[] }) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].monthlyTrendChart
  const formatMoney = useMoneyFormat()

  if (points.length < 2) {
    return <p className="text-sm text-muted">{t.notEnoughData}</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="color-mix(in srgb, var(--color-overlay) 8%, transparent)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis hide />
        <Tooltip
          content={<TrendTooltip formatMoney={formatMoney} />}
          cursor={{ stroke: 'color-mix(in srgb, var(--color-overlay) 15%, transparent)' }}
        />
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
