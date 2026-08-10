import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} SaveUp</span>
        <div className="flex items-center gap-5">
          <Link to="/tarifs" className="transition-colors hover:text-ink">
            Tarifs
          </Link>
          <Link to="/confidentialite" className="transition-colors hover:text-ink">
            Confidentialité
          </Link>
          <Link to="/conditions" className="transition-colors hover:text-ink">
            Conditions d'utilisation
          </Link>
        </div>
      </div>
    </footer>
  )
}
