import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { STATISTIQUES } from '../lib/i18n/statistiques'
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

function TrendTooltip({
  active,
  payload,
  formatMoney,
  t,
}: {
  active?: boolean
  payload?: { payload: IncomeExpenseTrendPoint }[]
  formatMoney: (amount: number) => string
  t: (typeof STATISTIQUES)['fr']['incomeExpenseTrendChart']
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/40">
      <p className="font-semibold capitalize text-ink">{point.label}</p>
      <p className="mt-1 text-ink">{t.expenses(formatMoney(point.expenses))}</p>
      <p className="text-muted">{t.income(formatMoney(point.income))}</p>
      <p className={`mt-1 font-medium ${point.savingsRatePct >= 0 ? 'text-success' : 'text-red-400'}`}>
        {t.savingsRate(`${point.savingsRatePct >= 0 ? '+' : ''}${point.savingsRatePct.toFixed(0)}%`)}
      </p>
    </div>
  )
}

export function IncomeExpenseTrendChart({ points }: { points: IncomeExpenseTrendPoint[] }) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].incomeExpenseTrendChart
  const formatMoney = useMoneyFormat()

  if (points.length < 2) {
    return <p className="text-sm text-muted">{t.notEnoughData}</p>
  }

  const income = points[0]?.income ?? 0

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={points} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="color-mix(in srgb, var(--color-overlay) 8%, transparent)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis hide domain={[0, (dataMax: number) => Math.max(dataMax, income) * 1.2]} />
          <Tooltip content={<TrendTooltip formatMoney={formatMoney} t={t} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <ReferenceLine
            y={income}
            stroke="var(--color-muted)"
            strokeDasharray="4 3"
            label={{
              value: t.currentIncome(formatMoney(income)),
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
      <p className="mt-1 text-center text-xs text-muted">{t.footnote}</p>
    </div>
  )
}
