import type { ScoreTrend } from '../hooks/useFinancialHealth'

// A falling score reads as a real problem signal (coral), same philosophy
// as "red only for over-budget" elsewhere in the redesign — up/flat stay
// in the orange family rather than reaching for green.
const CONFIG: Record<Exclude<ScoreTrend, null>, { icon: string; label: string; color: string }> = {
  up: { icon: '↑', label: 'en hausse', color: '#FF7A00' },
  down: { icon: '↓', label: 'en baisse', color: '#E5484D' },
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
