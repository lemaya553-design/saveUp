import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/#comment-ca-marche', label: 'Comment ça marche' },
  { to: '/#fonctionnalites', label: 'Fonctionnalités' },
  { to: '/#resultats', label: 'Résultats' },
  { to: '/tarifs', label: 'Tarifs' },
  { to: '/#faq', label: 'FAQ' },
]

function MenuIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CloseIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function LandingHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent"
        >
          SaveUp
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to} className="whitespace-nowrap transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="rounded-lg bg-primary-strong px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
          >
            Commencer gratuitement
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-white/5 lg:hidden"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 pb-3 sm:px-6 lg:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
