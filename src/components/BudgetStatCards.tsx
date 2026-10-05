import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { getCurrencySymbol } from '../lib/format'
import { usePreferences } from '../hooks/usePreferences'
import { BUDGET } from '../lib/i18n/budget'

const TINT_LIGHT = 'color-mix(in srgb, var(--color-surface) 92%, #FF7A00 8%)'

function cardStyle(): React.CSSProperties {
  return { background: TINT_LIGHT, borderColor: 'color-mix(in srgb, var(--color-overlay) 10%, transparent)' }
}

function WalletIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A1.5 1.5 0 0 1 4.5 6h13A1.5 1.5 0 0 1 19 7.5V9h2.5A1.5 1.5 0 0 1 23 10.5v7a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 3 17.5Z" />
      <circle cx="18" cy="14" r="1.25" fill="currentColor" stroke="none" />
    </svg>
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
      <path strokeLinecap="round" d="M14.5 10c1 .36 2.5 1.08 2.5 2.1" />
    </svg>
  )
}

function CalendarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path strokeLinecap="round" d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  )
}

function PencilIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function StatShell({
  index,
  wide,
  children,
}: {
  index: number
  wide?: boolean
  children: React.ReactNode
}) {
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

export function BudgetStatCards({
  remainingThisMonth,
  spentThisMonth,
  spentPct,
  monthProgressPct,
  isOverBudget,
  progressCaption,
  spendableCaption,
  monthlyIncome,
  onIncomeChange,
  weeklyRemaining,
  spentThisWeek,
}: {
  remainingThisMonth: number
  spentThisMonth: number
  spentPct: number
  monthProgressPct: number
  isOverBudget: boolean
  progressCaption: string
  spendableCaption: string
  monthlyIncome: number
  onIncomeChange: (value: number) => void
  weeklyRemaining: number
  spentThisWeek: number
}) {
  const { lang } = useLanguage()
  const t = BUDGET[lang].statCards
  const formatMoney = useMoneyFormat()
  const [animateIn, setAnimateIn] = useState(false)
  const remainingValue = useCountUp(Math.round(Math.abs(remainingThisMonth)), animateIn)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimateIn(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatShell index={0} wide>
        <CardHeader icon={<WalletIcon className="h-4 w-4" />} label={t.remaining} />
        <p className={`text-3xl font-bold sm:text-4xl ${isOverBudget ? 'text-red-400' : 'text-ink'}`}>
          {isOverBudget && '-'}
          {formatMoney(remainingValue)}
        </p>

        <div className="relative mt-4 h-3 w-full overflow-hidden rounded-full bg-overlay/10">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, spentPct)}%`,
              backgroundImage: isOverBudget
                ? 'linear-gradient(to right, #E5484D, #CC5F00)'
                : 'linear-gradient(to right, #CC5F00, #FF7A00)',
            }}
          />
          <div
            className="absolute top-0 h-full w-0.5 bg-ink/60"
            style={{ left: `${Math.min(100, monthProgressPct)}%` }}
            aria-hidden="true"
          />
        </div>
        <p className="mt-2 text-xs text-muted">{progressCaption}</p>
        <p className={`mt-1 text-xs ${remainingThisMonth < 0 && !isOverBudget ? 'text-red-400' : 'text-muted'}`}>
          {spendableCaption}
        </p>
      </StatShell>

      <StatShell index={1}>
        <CardHeader icon={<ReceiptIcon className="h-4 w-4" />} label={t.spent} />
        <p className="text-2xl font-bold text-ink sm:text-3xl">{formatMoney(spentThisMonth)}</p>
      </StatShell>

      <IncomeStat index={2} label={t.income} value={monthlyIncome} onChange={onIncomeChange} ariaLabel={t.editIncomeAria} />

      <StatShell index={3}>
        <CardHeader icon={<CalendarIcon className="h-4 w-4" />} label={t.weeklyBudget} />
        <p className={`text-2xl font-bold sm:text-3xl ${weeklyRemaining < 0 ? 'text-red-400' : 'text-ink'}`}>
          {formatMoney(weeklyRemaining)}
        </p>
        <p className="mt-1 text-xs text-muted">{t.weeklyBudgetCaption(formatMoney(spentThisWeek))}</p>
      </StatShell>
    </div>
  )
}

function IncomeStat({
  index,
  label,
  value,
  onChange,
  ariaLabel,
}: {
  index: number
  label: string
  value: number
  onChange: (value: number) => void
  ariaLabel: string
}) {
  const { lang } = useLanguage()
  const { currency } = usePreferences()
  const formatMoney = useMoneyFormat()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value || ''))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commit() {
    const parsed = Math.max(0, Number(draft) || 0)
    onChange(parsed)
    setDraft(String(parsed))
    setEditing(false)
  }

  return (
    <StatShell index={index}>
      <div className="flex items-center justify-between">
        <CardHeader icon={<CoinsIcon className="h-4 w-4" />} label={label} />
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={ariaLabel}
            className="-mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-overlay/5 hover:text-ink"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {editing ? (
        <label className="flex items-center gap-1.5">
          <span className="text-muted">{getCurrencySymbol(currency, lang)}</span>
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className="w-full rounded-lg border px-2 py-1 text-2xl font-bold text-ink focus:outline-none sm:text-3xl"
            style={{ borderColor: '#FF7A00', backgroundColor: 'var(--color-canvas)' }}
          />
        </label>
      ) : (
        <p className="text-2xl font-bold text-ink sm:text-3xl">{formatMoney(value)}</p>
      )}
    </StatShell>
  )
}
