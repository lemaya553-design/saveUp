import { useId, useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { getMonthRange } from '../lib/format'
import { BUDGET } from '../lib/i18n/budget'
import { BudgetEmptyChart } from './BudgetEmptyChart'

const ORANGE_VIF = '#FF7A00'
const ORANGE_FONCE = '#CC5F00'

// Below this many distinct spending days this month, a daily cumulative
// curve reads as a jagged staircase rather than a trend — a weekly bar
// chart carries the same "where did it go" story with less noise.
const MIN_DAYS_FOR_CURVE = 4

interface DailyPoint {
  day: number
  cumulative: number | null
  ideal: number
}

interface WeeklyPoint {
  label: string
  amount: number
}

function computeDaily(records: { amount: number; spent_at: string }[], spendableBudget: number, now: Date): DailyPoint[] {
  const { start, end } = getMonthRange(now)
  const daysInMonth = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  const today = now.getDate()

  const byDay = new Array<number>(daysInMonth + 1).fill(0)
  for (const r of records) {
    const d = new Date(r.spent_at).getDate()
    if (d >= 1 && d <= daysInMonth) byDay[d] += r.amount
  }

  const points: DailyPoint[] = []
  let running = 0
  for (let day = 1; day <= daysInMonth; day++) {
    running += byDay[day]
    points.push({
      day,
      cumulative: day <= today ? running : null,
      ideal: spendableBudget > 0 ? (spendableBudget * day) / daysInMonth : 0,
    })
  }
  return points
}

function computeWeekly(
  records: { amount: number; spent_at: string }[],
  labelFor: (weekIndex: number) => string,
): WeeklyPoint[] {
  const totals = new Map<number, number>()
  for (const r of records) {
    const d = new Date(r.spent_at).getDate()
    const weekIndex = Math.ceil(d / 7)
    totals.set(weekIndex, (totals.get(weekIndex) ?? 0) + r.amount)
  }
  const maxWeek = Math.max(1, ...totals.keys())
  return Array.from({ length: maxWeek }, (_, i) => ({
    label: labelFor(i + 1),
    amount: totals.get(i + 1) ?? 0,
  }))
}

function GhostCurve() {
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ghost-spend-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ORANGE_VIF} stopOpacity={0.35} />
          <stop offset="100%" stopColor={ORANGE_VIF} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d="M0,100 C40,95 60,70 90,65 C130,58 150,40 190,32 C230,24 260,20 300,10 L300,120 L0,120 Z"
        fill="url(#ghost-spend-gradient)"
      />
      <path
        d="M0,100 C40,95 60,70 90,65 C130,58 150,40 190,32 C230,24 260,20 300,10"
        fill="none"
        stroke={ORANGE_VIF}
        strokeWidth={2.5}
      />
      <path d="M0,90 L300,20" fill="none" stroke={ORANGE_FONCE} strokeWidth={2} strokeDasharray="5 5" />
    </svg>
  )
}

function ChartIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5 9 12l4 3 7-10.5" />
    </svg>
  )
}

function SpendingTooltip({
  active,
  payload,
  formatMoney,
  t,
}: {
  active?: boolean
  payload?: { payload: DailyPoint }[]
  formatMoney: (amount: number) => string
  t: typeof BUDGET['fr']['spendingChart']
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/20">
      {point.cumulative !== null && (
        <p className="text-ink">
          <span style={{ color: ORANGE_VIF }}>●</span> {t.actualLegend}: {formatMoney(point.cumulative)}
        </p>
      )}
      <p className="text-muted">
        <span style={{ color: ORANGE_FONCE }}>●</span> {t.idealPaceLegend}: {formatMoney(point.ideal)}
      </p>
    </div>
  )
}

function WeeklyTooltip({
  active,
  payload,
  formatMoney,
}: {
  active?: boolean
  payload?: { payload: WeeklyPoint }[]
  formatMoney: (amount: number) => string
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/20">
      <p className="font-semibold text-ink">{point.label}</p>
      <p className="text-muted">{formatMoney(point.amount)}</p>
    </div>
  )
}

export function BudgetSpendingChart({
  records,
  spendableBudget,
  onAddExpense,
}: {
  records: { amount: number; spent_at: string }[]
  spendableBudget: number
  onAddExpense: () => void
}) {
  const { lang } = useLanguage()
  const t = BUDGET[lang].spendingChart
  const et = BUDGET[lang].emptyChart
  const formatMoney = useMoneyFormat()
  const reduceMotion = usePrefersReducedMotion()
  const gradientId = useId()
  const now = useMemo(() => new Date(), [])

  const distinctDays = useMemo(() => new Set(records.map((r) => new Date(r.spent_at).getDate())).size, [records])

  const daily = useMemo(() => computeDaily(records, spendableBudget, now), [records, spendableBudget, now])
  const weekly = useMemo(() => computeWeekly(records, t.weeklyFallbackLabel), [records, t])

  if (records.length === 0) {
    return (
      <BudgetEmptyChart
        ghost={<GhostCurve />}
        icon={<ChartIcon className="h-5 w-5" />}
        title={et.spendingTitle}
        description={et.spendingDescription}
        actionLabel={et.cta}
        onAction={onAddExpense}
      />
    )
  }

  if (distinctDays < MIN_DAYS_FOR_CURVE) {
    return (
      <div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="color-mix(in srgb, var(--color-overlay) 8%, transparent)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip
              content={<WeeklyTooltip formatMoney={formatMoney} />}
              cursor={{ fill: 'color-mix(in srgb, var(--color-overlay) 6%, transparent)' }}
            />
            <Bar
              dataKey="amount"
              fill={ORANGE_VIF}
              radius={[8, 8, 0, 0]}
              maxBarSize={64}
              isAnimationActive={!reduceMotion}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ORANGE_VIF} stopOpacity={0.35} />
              <stop offset="100%" stopColor={ORANGE_VIF} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="color-mix(in srgb, var(--color-overlay) 8%, transparent)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip content={<SpendingTooltip formatMoney={formatMoney} t={t} />} />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke={ORANGE_FONCE}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={!reduceMotion}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={ORANGE_VIF}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            connectNulls={false}
            dot={false}
            isAnimationActive={!reduceMotion}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: ORANGE_VIF }} />
          {t.actualLegend}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-0.5 w-4 rounded-full"
            style={{ backgroundImage: `repeating-linear-gradient(to right, ${ORANGE_FONCE} 0 4px, transparent 4px 7px)` }}
          />
          {t.idealPaceLegend}
        </span>
      </div>
    </div>
  )
}
