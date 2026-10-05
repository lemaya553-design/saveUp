import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { BUDGET } from '../lib/i18n/budget'
import type { MonthlyTotal } from '../lib/budgetInsights'
import { BudgetEmptyChart } from './BudgetEmptyChart'

const CURRENT_MONTH_COLOR = '#FF7A00'
const PAST_MONTH_COLOR = '#CC5F00'

function TrendIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h16M7 19.5v-6M12 19.5v-10M17 19.5v-4" />
    </svg>
  )
}

function GhostBars() {
  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <rect x="20" y="40" width="28" height="60" rx="6" fill="#CC5F00" />
      <rect x="66" y="55" width="28" height="45" rx="6" fill="#CC5F00" />
      <rect x="112" y="20" width="28" height="80" rx="6" fill="#FF7A00" />
    </svg>
  )
}

function TrendTooltip({
  active,
  payload,
  formatMoney,
}: {
  active?: boolean
  payload?: { payload: MonthlyTotal }[]
  formatMoney: (amount: number) => string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/20">
      <p className="font-semibold capitalize text-ink">{point.label}</p>
      <p className="text-muted">{formatMoney(point.amount)}</p>
    </div>
  )
}

export function BudgetTrendBars({ months, onAddExpense }: { months: MonthlyTotal[]; onAddExpense: () => void }) {
  const { lang } = useLanguage()
  const et = BUDGET[lang].emptyChart
  const formatMoney = useMoneyFormat()
  const reduceMotion = usePrefersReducedMotion()
  const hasData = months.some((m) => m.amount > 0)
  const lastIndex = months.length - 1

  if (!hasData) {
    return (
      <BudgetEmptyChart
        ghost={<GhostBars />}
        icon={<TrendIcon className="h-5 w-5" />}
        title={et.trendTitle}
        description={et.trendDescription}
        actionLabel={et.cta}
        onAction={onAddExpense}
        heightClassName="h-48"
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={months} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          content={<TrendTooltip formatMoney={formatMoney} />}
          cursor={{ fill: 'color-mix(in srgb, var(--color-overlay) 6%, transparent)' }}
        />
        <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={56} isAnimationActive={!reduceMotion}>
          {months.map((m, i) => (
            <Cell key={m.label + i} fill={i === lastIndex ? CURRENT_MONTH_COLOR : PAST_MONTH_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
