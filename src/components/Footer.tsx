import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'

export function Footer() {
  const { lang } = useLanguage()
  const t = COMMON[lang].footer

  return (
    <footer className="border-t border-overlay/10 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} SaveUp</span>
        <div className="flex items-center gap-5">
          <Link to="/tarifs" className="transition-colors hover:text-ink">
            {t.pricing}
          </Link>
          <Link to="/confidentialite" className="transition-colors hover:text-ink">
            {t.privacy}
          </Link>
          <Link to="/conditions" className="transition-colors hover:text-ink">
            {t.terms}
          </Link>
        </div>
      </div>
    </footer>
  )
}
