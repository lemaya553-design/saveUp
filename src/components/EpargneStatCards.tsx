import { useEffect, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { useLanguage } from '../hooks/useLanguage'
import { EPARGNE } from '../lib/i18n/epargne'

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

function TargetIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FlagIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 21V4m0 1.5 11 3-11 3" />
    </svg>
  )
}

function TrendIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5 9 12l4 3 7-10.5" />
    </svg>
  )
}

function ListIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  )
}

export function EpargneStatCards({
  totalCurrentAmount,
  totalTargetAmount,
  overallProgress,
  goalsCount,
  formatMoney,
}: {
  totalCurrentAmount: number
  totalTargetAmount: number
  overallProgress: number
  goalsCount: number
  formatMoney: (amount: number) => string
}) {
  const { lang } = useLanguage()
  const t = EPARGNE[lang].objectifsTab
  const [animateIn, setAnimateIn] = useState(false)
  const savedValue = useCountUp(Math.round(totalCurrentAmount), animateIn)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimateIn(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatShell index={0} wide>
        <CardHeader icon={<TargetIcon className="h-4 w-4" />} label={t.savedLabel} />
        <p className="text-3xl font-bold text-ink sm:text-4xl">{formatMoney(savedValue)}</p>
        <div className="relative mt-4 h-3 w-full overflow-hidden rounded-full bg-overlay/10">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, overallProgress)}%`,
              backgroundImage: 'linear-gradient(to right, #CC5F00, #FF7A00)',
            }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{overallProgress.toFixed(0)}%</p>
      </StatShell>

      <StatShell index={1}>
        <CardHeader icon={<FlagIcon className="h-4 w-4" />} label={t.totalTargetLabel} />
        <p className="text-2xl font-bold text-ink sm:text-3xl">{formatMoney(totalTargetAmount)}</p>
      </StatShell>

      <StatShell index={2}>
        <CardHeader icon={<TrendIcon className="h-4 w-4" />} label={t.progressLabel} />
        <p className="text-2xl font-bold text-ink sm:text-3xl">{overallProgress.toFixed(0)}%</p>
      </StatShell>

      <StatShell index={3}>
        <CardHeader icon={<ListIcon className="h-4 w-4" />} label={t.activeGoalsLabel} />
        <p className="text-2xl font-bold text-ink sm:text-3xl">{t.goalsCount(goalsCount)}</p>
      </StatShell>
    </div>
  )
}
