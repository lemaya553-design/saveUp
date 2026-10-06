import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useCountUp } from '../hooks/useCountUp'
import { useLanguage } from '../hooks/useLanguage'
import { DASHBOARD } from '../lib/i18n/dashboard'
import { ScoreGauge } from './ScoreGauge'
import { ScoreTrendBadge } from './ScoreTrendBadge'
import type { ScoreTrend } from '../hooks/useFinancialHealth'

const TINT = 'color-mix(in srgb, var(--color-surface) 92%, #FF7A00 8%)'

function cardStyle(): React.CSSProperties {
  return { background: TINT, borderColor: 'color-mix(in srgb, var(--color-overlay) 10%, transparent)' }
}

function StatShell({ index, wide, children }: { index: number; wide?: boolean; children: ReactNode }) {
  return (
    <div
      className={`budget-card-in hover-lift rounded-2xl border p-5 shadow-sm ${wide ? 'sm:col-span-2' : ''}`}
      style={{ ...cardStyle(), animationDelay: `${index * 80}ms` }}
    >
      {children}
    </div>
  )
}

function CardHeader({ icon, label }: { icon: ReactNode; label: string }) {
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

function TargetIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function StackIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8 4.5-8 4.5-8-4.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 12 8 4.5 8-4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 16.5 8 4.5 8-4.5" />
    </svg>
  )
}

export function DashboardStatCards({
  score,
  trend,
  spentThisMonth,
  isOverBudget,
  spentCaption,
  totalCurrentAmount,
  savedCaption,
  accumulatedTotal,
  formatMoney,
}: {
  score: number
  trend: ScoreTrend
  spentThisMonth: number
  isOverBudget: boolean
  spentCaption: ReactNode
  totalCurrentAmount: number
  savedCaption: ReactNode
  accumulatedTotal: number
  formatMoney: (amount: number) => string
}) {
  const { lang } = useLanguage()
  const t = DASHBOARD[lang]
  const [animateIn, setAnimateIn] = useState(false)
  const spentValue = useCountUp(Math.round(spentThisMonth), animateIn)
  const savedValue = useCountUp(Math.round(totalCurrentAmount), animateIn)
  const accumulatedValue = useCountUp(Math.round(accumulatedTotal), animateIn)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimateIn(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatShell index={0} wide>
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-6">
          <div className="w-full max-w-[180px]">
            <ScoreGauge score={score} label={t.score.label} />
          </div>
          <div className="mt-2 flex flex-col items-center sm:mt-0 sm:items-start">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{t.score.label}</p>
            <ScoreTrendBadge trend={trend} />
            <p className="mt-2 max-w-[22ch] text-center text-xs text-muted sm:text-left">
              {t.score.caption}{' '}
              <Link to="/statistiques/recompenses" className="budget-action-link">
                {t.score.linkText}
              </Link>
            </p>
          </div>
        </div>
      </StatShell>

      <StatShell index={1}>
        <CardHeader icon={<ReceiptIcon className="h-4 w-4" />} label={t.spent.label} />
        <p className={`text-2xl font-bold sm:text-3xl ${isOverBudget ? 'text-red-400' : 'text-ink'}`}>
          {formatMoney(spentValue)}
        </p>
        <p className="mt-1 text-xs text-muted">{spentCaption}</p>
      </StatShell>

      <StatShell index={2}>
        <CardHeader icon={<TargetIcon className="h-4 w-4" />} label={t.saved.label} />
        <p className="text-2xl font-bold text-ink sm:text-3xl">{formatMoney(savedValue)}</p>
        <p className="mt-1 text-xs text-muted">{savedCaption}</p>
      </StatShell>

      <StatShell index={3}>
        <CardHeader icon={<StackIcon className="h-4 w-4" />} label={t.accumulated.title} />
        <p className="text-2xl font-bold text-ink sm:text-3xl">{formatMoney(accumulatedValue)}</p>
        <p className="mt-1 text-xs text-muted">{t.accumulated.hint}</p>
      </StatShell>
    </div>
  )
}
