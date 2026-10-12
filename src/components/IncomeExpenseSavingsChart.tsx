import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { IncomeExpenseSavingsPoint } from '../lib/statistics'
import { BudgetEmptyChart } from './BudgetEmptyChart'

// Three tones of the same orange family — stays inside the app's
// orange/black/white palette instead of reaching for a conventional
// green-for-income/red-for-expense scheme.
const SERIES = ['income', 'expenses', 'savings'] as const
const COLORS: Record<(typeof SERIES)[number], string> = {
  income: '#FFB347',
  expenses: '#FF7A00',
  savings: '#CC5F00',
}
const GRID_STROKE = 'color-mix(in srgb, var(--color-overlay) 8%, transparent)'

function GroupedBarsIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h16M6 19.5v-7M10 19.5v-11M14 19.5v-5M18 19.5v-9" />
    </svg>
  )
}

function GhostLines() {
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,70 60,55 120,60 180,40 240,45 300,25" fill="none" stroke="#FFB347" strokeWidth={2.5} />
      <path d="M0,90 60,80 120,85 180,70 240,75 300,60" fill="none" stroke="#FF7A00" strokeWidth={2.5} />
      <path d="M0,105 60,100 120,102 180,95 240,98 300,90" fill="none" stroke="#CC5F00" strokeWidth={2.5} />
    </svg>
  )
}

function GroupedTooltip({
  active,
  payload,
  formatMoney,
  t,
}: {
  active?: boolean
  payload?: { payload: IncomeExpenseSavingsPoint }[]
  formatMoney: (amount: number) => string
  t: { income: string; expenses: string; savings: string }
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/20">
      <p className="mb-1 font-semibold capitalize text-ink">{point.label}</p>
      <p className="text-ink">
        {t.income}: {formatMoney(point.income)}
      </p>
      <p className="text-ink">
        {t.expenses}: {formatMoney(point.expenses)}
      </p>
      <p className="text-ink">
        {t.savings}: {formatMoney(point.savings)}
      </p>
    </div>
  )
}

export function IncomeExpenseSavingsChart({
  points,
  onAddExpense,
  activeIndex = 0,
}: {
  points: IncomeExpenseSavingsPoint[]
  onAddExpense: () => void
  // Which of the 3 KPI tabs (income/expenses/savings) is selected above —
  // its line renders at full emphasis, the other two dimmed, per "mettent
  // la série choisie en avant".
  activeIndex?: number
}) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].newTrendCharts.incomeExpenseSavings
  const formatMoney = useMoneyFormat()
  const reduceMotion = usePrefersReducedMotion()
  const hasData = points.some((p) => p.income > 0 || p.expenses > 0 || p.savings > 0)

  if (!hasData) {
    return (
      <BudgetEmptyChart
        ghost={<GhostLines />}
        icon={<GroupedBarsIcon className="h-5 w-5" />}
        title={t.emptyTitle}
        description={t.emptyDescription}
        actionLabel={t.emptyCta}
        onAction={onAddExpense}
        heightClassName="h-48"
      />
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="capitalize"
          />
          <YAxis hide />
          <Tooltip content={<GroupedTooltip formatMoney={formatMoney} t={t} />} />
          {SERIES.map((_, i) => i)
            // Draw the emphasized series last so it isn't visually buried
            // under the two dimmed ones at crossing points.
            .sort((a, b) => (a === activeIndex ? 1 : b === activeIndex ? -1 : 0))
            .map((i) => {
              const key = SERIES[i]
              const active = i === activeIndex
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[key]}
                  strokeWidth={active ? 3 : 1.5}
                  strokeOpacity={active ? 1 : 0.35}
                  dot={active ? { r: 3, fill: COLORS[key], strokeWidth: 0 } : false}
                  activeDot={{ r: 5, fill: COLORS[key], strokeWidth: 0 }}
                  isAnimationActive={!reduceMotion}
                />
              )
            })}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.income }} />
          {t.income}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.expenses }} />
          {t.expenses}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.savings }} />
          {t.savings}
        </span>
      </div>
    </div>
  )
}
