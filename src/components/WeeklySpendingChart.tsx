import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { WeeklySpendingPoint } from '../lib/statistics'
import { BudgetEmptyChart } from './BudgetEmptyChart'

const PAST_WEEK_COLOR = '#CC5F00'
const CURRENT_WEEK_COLOR = '#FF7A00'

function WeekIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h16M7 19.5v-6M12 19.5v-10M17 19.5v-4" />
    </svg>
  )
}

function GhostBars() {
  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <rect x="4" y="55" width="12" height="45" rx="4" fill="#CC5F00" />
      <rect x="24" y="40" width="12" height="60" rx="4" fill="#CC5F00" />
      <rect x="44" y="62" width="12" height="38" rx="4" fill="#CC5F00" />
      <rect x="64" y="30" width="12" height="70" rx="4" fill="#CC5F00" />
      <rect x="84" y="50" width="12" height="50" rx="4" fill="#CC5F00" />
      <rect x="104" y="45" width="12" height="55" rx="4" fill="#CC5F00" />
      <rect x="124" y="20" width="12" height="80" rx="4" fill="#CC5F00" />
      <rect x="144" y="10" width="12" height="90" rx="4" fill="#FF7A00" />
    </svg>
  )
}

function WeeklyTooltip({
  active,
  payload,
  formatMoney,
  currentWeekLabel,
}: {
  active?: boolean
  payload?: { payload: WeeklySpendingPoint }[]
  formatMoney: (amount: number) => string
  currentWeekLabel: string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/40">
      <p className="font-semibold text-ink">{point.isCurrentWeek ? currentWeekLabel : point.label}</p>
      <p className="text-muted">{formatMoney(point.amount)}</p>
    </div>
  )
}

export function WeeklySpendingChart({
  points,
  onAddExpense,
}: {
  points: WeeklySpendingPoint[]
  onAddExpense: () => void
}) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].newTrendCharts.weeklySpending
  const formatMoney = useMoneyFormat()
  const reduceMotion = usePrefersReducedMotion()
  const hasData = points.some((p) => p.amount > 0)

  if (!hasData) {
    return (
      <BudgetEmptyChart
        ghost={<GhostBars />}
        icon={<WeekIcon className="h-5 w-5" />}
        title={t.emptyTitle}
        description={t.emptyDescription}
        actionLabel={t.emptyCta}
        onAction={onAddExpense}
        heightClassName="h-48"
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: Math.max(320, points.length * 44) }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="color-mix(in srgb, var(--color-overlay) 8%, transparent)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip
              content={<WeeklyTooltip formatMoney={formatMoney} currentWeekLabel={t.currentWeekLabel} />}
              cursor={{ fill: 'color-mix(in srgb, var(--color-overlay) 6%, transparent)' }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40} isAnimationActive={!reduceMotion}>
              {points.map((p) => (
                <Cell key={p.weekStart} fill={p.isCurrentWeek ? CURRENT_WEEK_COLOR : PAST_WEEK_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
