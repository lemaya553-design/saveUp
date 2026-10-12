import { useId } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { WeeklySpendingPoint } from '../lib/statistics'
import { BudgetEmptyChart } from './BudgetEmptyChart'

const ORANGE = '#FF7A00'
const GRID_STROKE = 'color-mix(in srgb, var(--color-overlay) 8%, transparent)'

function WeekIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h16M7 19.5v-6M12 19.5v-10M17 19.5v-4" />
    </svg>
  )
}

// Same ghost curve shape as DashboardScoreChart's empty state — this card
// uses the exact same recipe (white card, orange monotone area), so its
// empty state should look like the same product, not a different one.
function GhostCurve() {
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ghost-weekly-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ORANGE} stopOpacity={0.35} />
          <stop offset="100%" stopColor={ORANGE} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d="M0,90 C40,70 60,80 90,60 C130,35 150,55 190,40 C230,25 260,45 300,20 L300,120 L0,120 Z"
        fill="url(#ghost-weekly-gradient)"
      />
      <path
        d="M0,90 C40,70 60,80 90,60 C130,35 150,55 190,40 C230,25 260,45 300,20"
        fill="none"
        stroke={ORANGE}
        strokeWidth={2.5}
      />
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
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/20">
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
  const gradientId = useId()
  const hasData = points.some((p) => p.amount > 0)

  if (!hasData) {
    return (
      <BudgetEmptyChart
        ghost={<GhostCurve />}
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
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ORANGE} stopOpacity={0.35} />
            <stop offset="100%" stopColor={ORANGE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis hide />
        <Tooltip content={<WeeklyTooltip formatMoney={formatMoney} currentWeekLabel={t.currentWeekLabel} />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke={ORANGE}
          strokeWidth={3}
          fill={`url(#${gradientId})`}
          dot={{ r: 3, fill: ORANGE, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: ORANGE, strokeWidth: 0 }}
          isAnimationActive={!reduceMotion}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
