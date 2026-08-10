import type { ScoreTrend } from '../hooks/useFinancialHealth'

const CONFIG: Record<Exclude<ScoreTrend, null>, { icon: string; label: string; className: string }> = {
  up: { icon: '↑', label: 'en hausse', className: 'text-success' },
  down: { icon: '↓', label: 'en baisse', className: 'text-red-400' },
  flat: { icon: '→', label: 'stable', className: 'text-muted' },
}

export function ScoreTrendBadge({ trend }: { trend: ScoreTrend }) {
  if (!trend) return null
  const { icon, label, className } = CONFIG[trend]

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${className}`}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  )
}
