import { Link } from 'react-router-dom'
import { ProgressBar } from './ProgressBar'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { GoalProgressPoint } from '../lib/statistics'

function GoalIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

// Not a Recharts chart — "barres horizontales de progression" is exactly
// what the app's existing ProgressBar component already renders (same one
// Épargne's SavingsGoalCard uses), so this just lists goals through it
// rather than reinventing a horizontal bar chart in a charting library that
// doesn't make that particular shape any easier.
export function GoalsProgressChart({ goals }: { goals: GoalProgressPoint[] }) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].newTrendCharts.goalsProgress
  const formatMoney = useMoneyFormat()

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-6 text-center">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ color: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.15)' }}
        >
          <GoalIcon className="h-5 w-5" />
        </span>
        <p className="text-sm font-semibold text-ink">{t.emptyTitle}</p>
        <p className="max-w-[22rem] text-xs text-muted">{t.emptyDescription}</p>
        <Link
          to="/epargne/objectifs"
          className="mt-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ backgroundColor: '#FF7A00' }}
        >
          {t.emptyCta}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {goals.map((g) => (
        <div key={g.id} className="min-w-0">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium text-ink">{g.name}</span>
            <span className="shrink-0 text-xs text-muted">
              {t.reached(formatMoney(g.current), formatMoney(g.target), Math.round(g.pct))}
            </span>
          </div>
          <ProgressBar value={g.pct} colorClass={g.pct >= 100 ? 'bg-[#FF7A00]' : 'bg-[#CC5F00]'} />
        </div>
      ))}
    </div>
  )
}
