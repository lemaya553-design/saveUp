import { useAuth } from '../hooks/useAuth'
import { useTrialWindow } from '../hooks/useTrialWindow'
import { formatTrialRemaining } from '../lib/trial'
import { useLanguage } from '../hooks/useLanguage'

// Marketing-surface badge (landing hero, Tarifs banner, Standard/Premium
// cards) — unlike Nav's TrialCountdownBadge this also renders for
// logged-out visitors, since those pages are the whole point of the "sign
// up now" pitch. Once a real trial is known to have expired, this hides
// itself everywhere it's used; logged-out visitors have no trial to expire,
// so they always see the static invite. The logged-in/trialing branch below
// never reads useLanguage() — the signed-in app stays French regardless of
// the stored marketing-page language.
export function TrialBadge({ className }: { className: string }) {
  const { user } = useAuth()
  const { loading, remainingMs } = useTrialWindow()
  const { lang } = useLanguage()

  if (!user) {
    return (
      <span className={className}>
        <span aria-hidden="true">⏳</span>
        {lang === 'fr' ? 'Essai gratuit 24h — inscris-toi maintenant' : '24h free trial — sign up now'}
      </span>
    )
  }

  if (loading || remainingMs === null || remainingMs <= 0) return null

  return (
    <span className={className}>
      <span aria-hidden="true">⏳</span>
      Essai gratuit — {formatTrialRemaining(remainingMs)}
    </span>
  )
}
