import { useEffect, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { useLanguage } from '../hooks/useLanguage'
import { STATISTIQUES } from '../lib/i18n/statistiques'

const TINT = 'color-mix(in srgb, var(--color-surface) 92%, #FF7A00 8%)'

function cardStyle(): React.CSSProperties {
  return { background: TINT, borderColor: 'color-mix(in srgb, var(--color-overlay) 10%, transparent)' }
}

function StatShell({ index, wide, children }: { index: number; wide?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`budget-card-in hover-lift rounded-2xl border p-5 shadow-sm ${wide ? 'sm:col-span-2' : ''}`}
      style={{ ...cardStyle(), animationDelay: `${index * 80}ms` }}
    >
      {children}
    </div>
  )
}

function CardHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ color: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.14)' }}
      >
        {icon}
      </span>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
    </div>
  )
}

function ReceiptIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5Z" />
      <path strokeLinecap="round" d="M9 8h6M9 12h6" />
    </svg>
  )
}

function CoinsIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <ellipse cx="9" cy="7" rx="6" ry="3" />
      <path strokeLinecap="round" d="M3 7v4c0 1.66 2.69 3 6 3s6-1.34 6-3V7" />
      <path strokeLinecap="round" d="M3 11v4c0 1.66 2.69 3 6 3s6-1.34 6-3v-4" />
    </svg>
  )
}

function GridIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function CheckIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
    </svg>
  )
}

export function StatistiquesStatCards({
  spentThisMonth,
  monthLabel,
  monthlyIncome,
  categoriesTracked,
  withinBudgetCount,
  budgetTrackedCount,
  formatMoney,
}: {
  spentThisMonth: number
  monthLabel: string
  monthlyIncome: number
  categoriesTracked: number
  withinBudgetCount: number
  budgetTrackedCount: number
  formatMoney: (amount: number) => string
}) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].statCards
  const [animateIn, setAnimateIn] = useState(false)
  const spentValue = useCountUp(Math.round(spentThisMonth), animateIn)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimateIn(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatShell index={0} wide>
        <CardHeader icon={<ReceiptIcon className="h-4 w-4" />} label={t.spent} />
        <p className="text-3xl font-bold text-ink sm:text-4xl">{formatMoney(spentValue)}</p>
        <p className="mt-2 text-xs capitalize text-muted">{monthLabel}</p>
      </StatShell>

      <StatShell index={1}>
        <CardHeader icon={<CoinsIcon className="h-4 w-4" />} label={t.income} />
        <p className="text-2xl font-bold text-ink sm:text-3xl">{formatMoney(monthlyIncome)}</p>
      </StatShell>

      <StatShell index={2}>
        <CardHeader icon={<GridIcon className="h-4 w-4" />} label={t.categories} />
        <p className="text-2xl font-bold text-ink sm:text-3xl">{categoriesTracked}</p>
      </StatShell>

      <StatShell index={3}>
        <CardHeader icon={<CheckIcon className="h-4 w-4" />} label={t.onBudget} />
        <p className="text-2xl font-bold text-ink sm:text-3xl">
          {budgetTrackedCount > 0 ? `${withinBudgetCount}/${budgetTrackedCount}` : '—'}
        </p>
      </StatShell>
    </div>
  )
}
