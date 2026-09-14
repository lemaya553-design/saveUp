import { useTrialWindow } from '../hooks/useTrialWindow'
import { useLanguage } from '../hooks/useLanguage'
import { formatTrialRemaining } from '../lib/trial'

export function TrialCountdownBadge() {
  const { loading, remainingMs } = useTrialWindow()
  const { lang } = useLanguage()
  if (loading || remainingMs === null || remainingMs <= 0) return null

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent"
      title={lang === 'fr' ? 'Temps restant de ton essai gratuit de 24h' : 'Time left on your 24h free trial'}
    >
      <span aria-hidden="true">⏳</span>
      {lang === 'fr' ? 'Essai gratuit' : 'Free trial'} — {formatTrialRemaining(remainingMs)}
    </span>
  )
}
