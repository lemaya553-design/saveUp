// Which encouragement sentence DashboardGoalCard shows under the progress
// bar — a pure bucket lookup so the thresholds have one tested home instead
// of living inline in JSX. Text itself lives in DASHBOARD[lang].goalCard
// (i18n), keyed by this tier.
export type GoalEncouragementTier = 'start' | 'progress' | 'half' | 'final' | 'done'

export function getGoalEncouragementTier(pct: number): GoalEncouragementTier {
  if (pct >= 100) return 'done'
  if (pct >= 75) return 'final'
  if (pct >= 50) return 'half'
  if (pct >= 25) return 'progress'
  return 'start'
}
