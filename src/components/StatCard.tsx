import type { ReactNode } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { CARD_BORDER } from './DashboardCard'
import type { PeriodDelta } from '../lib/statistics'

export interface KpiStat {
  label: string
  // Pre-formatted display value (e.g. "245 $" or "3/5") — callers decide
  // whether it's money, a count, etc.
  value: string
  delta: PeriodDelta
}

function formatDelta(delta: PeriodDelta, formatMoney: (amount: number) => string, lang: 'fr' | 'en'): string {
  if (delta.direction === 'none') return '—'
  const sign = delta.amount > 0 ? '+' : delta.amount < 0 ? '−' : ''
  const amountStr = `${sign}${formatMoney(Math.abs(delta.amount))}`
  if (delta.pct === null) return amountStr
  const pctDigits = Math.abs(delta.pct).toFixed(1).replace('.', lang === 'fr' ? ',' : '.')
  return `${amountStr} (${sign}${pctDigits} %)`
}

// Favorable-increase / decrease, not spent-more-is-bad / spent-less-is-good
// — this row is reused across KPIs where "up" is good (income, savings,
// goals reached) and ones where the caller's own chart already makes "up"
// read as spending more (handled visually by the chart itself, not by
// recoloring this badge red). Kept intentionally 2-toned — green for up,
// muted gray for down/flat — matching the brief's "vert/orange pour une
// hausse, gris pour une baisse" (green chosen over orange so it never
// collides with the orange "selected tab" bar right next to it).
function deltaColorClass(delta: PeriodDelta): string {
  if (delta.direction === 'up') return 'text-success'
  return 'text-muted'
}

function deltaArrow(delta: PeriodDelta): string | null {
  if (delta.direction === 'up') return '↑'
  if (delta.direction === 'down') return '↓'
  return null
}

// The KPI-tabs + white-card shell shared by Statistiques' Aperçu charts —
// same card recipe as Dashboard's "Évolution de ton score"
// (DashboardCard), extended with a row of clickable key-number "tabs"
// above the chart body (per the second reference mockup): the active one
// carries an orange top bar and determines which series/number the chart
// below is emphasizing.
export function StatCard({
  title,
  hint,
  kpis,
  activeIndex = 0,
  onSelectKpi,
  children,
}: {
  title: string
  hint?: string
  kpis?: KpiStat[]
  activeIndex?: number
  onSelectKpi?: (index: number) => void
  children: ReactNode
}) {
  const { lang } = useLanguage()
  const formatMoney = useMoneyFormat()
  const clickable = !!onSelectKpi && (kpis?.length ?? 0) > 1

  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: CARD_BORDER }}
    >
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}

      {kpis && kpis.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-b" style={{ borderColor: CARD_BORDER }}>
          {kpis.map((kpi, i) => {
            const active = i === activeIndex
            const arrow = deltaArrow(kpi.delta)
            const content = (
              <>
                <p className="text-xs text-muted">{kpi.label}</p>
                <p className="mt-0.5 text-xl font-bold text-ink sm:text-2xl">{kpi.value}</p>
                <p className={`mt-0.5 text-xs font-medium ${deltaColorClass(kpi.delta)}`}>
                  {arrow && <span aria-hidden="true">{arrow} </span>}
                  {formatDelta(kpi.delta, formatMoney, lang)}
                </p>
              </>
            )
            const className = `min-w-[7rem] border-t-2 px-0.5 pb-3 pt-2 text-left transition-colors ${
              active ? 'border-[#FF7A00]' : 'border-transparent'
            } ${clickable ? 'cursor-pointer hover:bg-overlay/5' : ''}`

            return clickable ? (
              <button key={kpi.label} type="button" onClick={() => onSelectKpi?.(i)} className={className}>
                {content}
              </button>
            ) : (
              <div key={kpi.label} className={className}>
                {content}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4">{children}</div>
    </section>
  )
}
