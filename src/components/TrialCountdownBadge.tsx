import { useEffect, useState } from 'react'
import { useTrialWindow } from '../hooks/useTrialWindow'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

// Isolated in its own leaf component (rather than ticking state up in Nav)
// so the 1s interval only re-renders this small pill, not the whole nav
// tree it's mounted in.
export function TrialCountdownBadge() {
  const { loading, expiresAt } = useTrialWindow()
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (expiresAt === null) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (loading || expiresAt === null || now === null) return null
  const remaining = expiresAt - now
  if (remaining <= 0) return null

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent"
      title="Temps restant de ton essai gratuit de 24h"
    >
      <span aria-hidden="true">⏳</span>
      Essai gratuit — {formatRemaining(remaining)}
    </span>
  )
}
