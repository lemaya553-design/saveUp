import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { MISC } from '../lib/i18n/misc'

// Always-visible while "Essayer sans compte" is active (Connexion.tsx) —
// a guest otherwise has no obvious way back to actually creating an
// account, and no reminder that nothing they're doing is saved anywhere
// yet. Sits right under TopBar, above every page's own content.
export function GuestModeBanner() {
  const { lang } = useLanguage()
  const t = MISC[lang].guestModeBanner

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
      <span className="text-ink">{t.message}</span>
      <Link
        to="/connexion"
        className="shrink-0 rounded-lg budget-btn-primary px-3 py-1.5 text-xs font-medium text-white"
      >
        {t.cta}
      </Link>
    </div>
  )
}
