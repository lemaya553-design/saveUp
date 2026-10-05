import { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { budgetColorForCategory } from '../lib/budgetChartColors'
import { BUDGET } from '../lib/i18n/budget'
import type { CategoryTotal } from '../lib/budgetInsights'
import { BudgetEmptyChart } from './BudgetEmptyChart'

function RingIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  )
}

function GhostRing() {
  return (
    <svg viewBox="0 0 120 120" className="mx-auto h-full max-h-48" aria-hidden="true">
      <circle cx="60" cy="60" r="48" fill="none" stroke="#FFD9B0" strokeWidth="16" />
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        stroke="#FF7A00"
        strokeWidth="16"
        strokeDasharray="110 190"
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        stroke="#CC5F00"
        strokeWidth="16"
        strokeDasharray="60 240"
        strokeDashoffset="-110"
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
    </svg>
  )
}

function DonutTooltip({
  active,
  payload,
  formatMoney,
  lang,
}: {
  active?: boolean
  payload?: { payload: CategoryTotal }[]
  formatMoney: (amount: number) => string
  lang: import('../lib/i18n/language').Lang
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/20">
      <p className="font-semibold text-ink">{translateCategoryLabel(entry.category, lang)}</p>
      <p className="mt-1 text-ink">{formatMoney(entry.amount)}</p>
      <p className="text-muted">{entry.pct.toFixed(0)}%</p>
    </div>
  )
}

export function BudgetCategoryRing({
  categories,
  onAddExpense,
}: {
  categories: CategoryTotal[]
  onAddExpense: () => void
}) {
  const { lang } = useLanguage()
  const t = BUDGET[lang].breakdownCard
  const et = BUDGET[lang].emptyChart
  const formatMoney = useMoneyFormat()
  const reduceMotion = usePrefersReducedMotion()
  const [hovered, setHovered] = useState<string | null>(null)

  const total = categories.reduce((sum, c) => sum + c.amount, 0)

  if (categories.length === 0) {
    return (
      <BudgetEmptyChart
        ghost={<GhostRing />}
        icon={<RingIcon className="h-5 w-5" />}
        title={et.categoryTitle}
        description={et.categoryDescription}
        actionLabel={et.cta}
        onAction={onAddExpense}
      />
    )
  }

  return (
    <div>
      <div className="relative mx-auto h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="amount"
              nameKey="category"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={categories.length > 1 ? 2.5 : 0}
              stroke="var(--color-surface)"
              strokeWidth={2}
              isAnimationActive={!reduceMotion}
            >
              {categories.map((c) => (
                <Cell
                  key={c.category}
                  fill={budgetColorForCategory(c.category)}
                  fillOpacity={hovered && hovered !== c.category ? 0.35 : 1}
                  onMouseEnter={() => setHovered(c.category)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer', transition: 'fill-opacity 0.15s ease' }}
                />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip formatMoney={formatMoney} lang={lang} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-ink">{formatMoney(total)}</span>
          <span className="mt-0.5 text-[11px] text-muted">{t.title}</span>
        </div>
      </div>

      <ul className="mt-5 divide-y divide-overlay/10">
        {categories.map((c) => (
          <li
            key={c.category}
            onMouseEnter={() => setHovered(c.category)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center gap-3 py-2.5 transition-opacity ${
              hovered && hovered !== c.category ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <span
              aria-hidden="true"
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: budgetColorForCategory(c.category) }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{translateCategoryLabel(c.category, lang)}</p>
              <p className="text-xs text-muted">{c.pct.toFixed(0)}%</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-ink">{formatMoney(c.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
