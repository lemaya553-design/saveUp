import type { ScoreTrend } from '../hooks/useFinancialHealth'

// Green/red only for genuine positive/negative signals — a rising score
// is good news (green), a falling one is a real problem signal (red),
// flat stays neutral gray.
const CONFIG: Record<Exclude<ScoreTrend, null>, { icon: string; label: string; color: string }> = {
  up: { icon: '↑', label: 'en hausse', color: '#22c55e' },
  down: { icon: '↓', label: 'en baisse', color: '#ef4444' },
  flat: { icon: '→', label: 'stable', color: 'var(--color-muted)' },
}

export function ScoreTrendBadge({ trend }: { trend: ScoreTrend }) {
  if (!trend) return null
  const { icon, label, color } = CONFIG[trend]

  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color }}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  )
}
