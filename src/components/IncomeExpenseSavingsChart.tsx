import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { IncomeExpenseSavingsPoint } from '../lib/statistics'
import { BudgetEmptyChart } from './BudgetEmptyChart'

// Three tones of the same orange family — stays inside the app's
// orange/black/white palette instead of reaching for a conventional
// green-for-income/red-for-expense scheme.
const INCOME_COLOR = '#FFB347'
const EXPENSES_COLOR = '#FF7A00'
const SAVINGS_COLOR = '#CC5F00'

function GroupedBarsIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h16M6 19.5v-7M10 19.5v-11M14 19.5v-5M18 19.5v-9" />
    </svg>
  )
}

function GhostGroupedBars() {
  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <rect x="10" y="45" width="10" height="55" rx="3" fill="#FFB347" />
      <rect x="22" y="30" width="10" height="70" rx="3" fill="#FF7A00" />
      <rect x="34" y="60" width="10" height="40" rx="3" fill="#CC5F00" />
      <rect x="86" y="35" width="10" height="65" rx="3" fill="#FFB347" />
      <rect x="98" y="25" width="10" height="75" rx="3" fill="#FF7A00" />
      <rect x="110" y="55" width="10" height="45" rx="3" fill="#CC5F00" />
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
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/40">
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
}: {
  points: IncomeExpenseSavingsPoint[]
  onAddExpense: () => void
}) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].newTrendCharts.incomeExpenseSavings
  const formatMoney = useMoneyFormat()
  const reduceMotion = usePrefersReducedMotion()
  const hasData = points.some((p) => p.income > 0 || p.expenses > 0 || p.savings > 0)

  if (!hasData) {
    return (
      <BudgetEmptyChart
        ghost={<GhostGroupedBars />}
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
      <div className="overflow-x-auto">
        <div style={{ minWidth: Math.max(320, points.length * 90) }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
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
                content={<GroupedTooltip formatMoney={formatMoney} t={t} />}
                cursor={{ fill: 'color-mix(in srgb, var(--color-overlay) 6%, transparent)' }}
              />
              <Bar dataKey="income" fill={INCOME_COLOR} radius={[6, 6, 0, 0]} maxBarSize={28} isAnimationActive={!reduceMotion} />
              <Bar dataKey="expenses" fill={EXPENSES_COLOR} radius={[6, 6, 0, 0]} maxBarSize={28} isAnimationActive={!reduceMotion} />
              <Bar dataKey="savings" fill={SAVINGS_COLOR} radius={[6, 6, 0, 0]} maxBarSize={28} isAnimationActive={!reduceMotion} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: INCOME_COLOR }} />
          {t.income}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: EXPENSES_COLOR }} />
          {t.expenses}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SAVINGS_COLOR }} />
          {t.savings}
        </span>
      </div>
    </div>
  )
}
