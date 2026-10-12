import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { WeekdaySpendingPoint } from '../lib/statistics'
import { BudgetEmptyChart } from './BudgetEmptyChart'

const REGULAR_DAY_COLOR = '#FF7A00'
const BUSIEST_DAY_COLOR = '#B34D00'

function CalendarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path strokeLinecap="round" d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  )
}

function GhostBars() {
  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <rect x="6" y="55" width="14" height="45" rx="4" fill="#FF7A00" />
      <rect x="28" y="45" width="14" height="55" rx="4" fill="#FF7A00" />
      <rect x="50" y="60" width="14" height="40" rx="4" fill="#FF7A00" />
      <rect x="72" y="50" width="14" height="50" rx="4" fill="#FF7A00" />
      <rect x="94" y="20" width="14" height="80" rx="4" fill="#B34D00" />
      <rect x="116" y="35" width="14" height="65" rx="4" fill="#FF7A00" />
      <rect x="138" y="65" width="14" height="35" rx="4" fill="#FF7A00" />
    </svg>
  )
}

function WeekdayTooltip({
  active,
  payload,
  formatMoney,
}: {
  active?: boolean
  payload?: { payload: WeekdaySpendingPoint }[]
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

export function WeekdaySpendingChart({
  points,
  onAddExpense,
}: {
  points: WeekdaySpendingPoint[]
  onAddExpense: () => void
}) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].newTrendCharts.weekdaySpending
  const formatMoney = useMoneyFormat()
  const reduceMotion = usePrefersReducedMotion()
  const hasData = points.some((p) => p.amount > 0)

  if (!hasData) {
    return (
      <BudgetEmptyChart
        ghost={<GhostBars />}
        icon={<CalendarIcon className="h-5 w-5" />}
        title={t.emptyTitle}
        description={t.emptyDescription}
        actionLabel={t.emptyCta}
        onAction={onAddExpense}
        heightClassName="h-48"
      />
    )
  }

  const maxAmount = Math.max(...points.map((p) => p.amount))
  const busiestIndex = points.findIndex((p) => p.amount === maxAmount)

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="color-mix(in srgb, var(--color-overlay) 8%, transparent)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="capitalize"
          />
          <YAxis hide />
          <Tooltip
            content={<WeekdayTooltip formatMoney={formatMoney} />}
            cursor={{ fill: 'color-mix(in srgb, var(--color-overlay) 6%, transparent)' }}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={!reduceMotion}>
            {points.map((p, i) => (
              <Cell key={p.weekdayIndex} fill={i === busiestIndex ? BUSIEST_DAY_COLOR : REGULAR_DAY_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted">{t.busiestDay(points[busiestIndex].longLabel)}</p>
    </div>
  )
}
