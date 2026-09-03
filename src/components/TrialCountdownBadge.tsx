import { useTrialWindow } from '../hooks/useTrialWindow'
import { formatTrialRemaining } from '../lib/trial'

export function TrialCountdownBadge() {
  const { loading, remainingMs } = useTrialWindow()
  if (loading || remainingMs === null || remainingMs <= 0) return null

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent"
      title="Temps restant de ton essai gratuit de 24h"
    >
      <span aria-hidden="true">⏳</span>
      Essai gratuit — {formatTrialRemaining(remainingMs)}
    </span>
  )
}
