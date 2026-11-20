import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'
import { CurrencySwitcher } from './CurrencySwitcher'
import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'

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

function SunIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="4.5" />
      <path
        strokeLinecap="round"
        d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"
      />
    </svg>
  )
}

function MoonIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a7 7 0 0 0 10.8 10.8z" />
    </svg>
  )
}

// theme/onToggleTheme: only Home.tsx (the one page wrapped in
// .landing-classic's light/dark-aware palette) passes these, which is what
// renders the sun/moon button at all — every OTHER page reusing this same
// shared header (Tarifs.tsx, pre-login) has nothing to toggle, so it's left
// out there rather than rendering a button with nowhere to send its click.
export function LandingHeader({
  theme,
  onToggleTheme,
}: {
  theme?: 'light' | 'dark'
  onToggleTheme?: () => void
} = {}) {
  const [open, setOpen] = useState(false)
  const { lang } = useLanguage()
  const t = COMMON[lang].header

  const navLinks = [
    { to: '/#comment-ca-marche', label: t.navFeatures },
    { to: '/#histoire', label: t.navFounder },
    { to: '/connexion', label: t.navConnexion },
  ]

  return (
    <header className="sticky top-0 z-20 border-b border-overlay/10 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-4 px-2 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 justify-self-start">
          <LogoMark className="h-7 w-7" />
          <span className="text-xl font-bold">
            <span className="text-ink">save</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Up</span>
          </span>
        </Link>

        <nav className="hidden items-center justify-self-center gap-8 text-sm font-medium text-muted lg:flex">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className="whitespace-nowrap transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-0.5 sm:gap-2">
          {/* Visible at every width, not just sm+ — used to be hidden below
              640px and only reachable at the bottom of the burger menu,
              which meant an English-speaking visitor on a phone had no
              visible way to switch language without opening the menu
              first. */}
          {theme && onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? t.switchToLight : t.switchToDark}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink transition-colors hover:bg-overlay/5"
            >
              {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
          )}
          <LanguageSwitcher />
          {/* Was only ever wired into Nav.tsx (the signed-in app header) —
              a logged-out visitor on the public marketing site had no way
              to see it at all, in any commit, ever. Safe with no session:
              CurrencySwitcher falls back to CAD and never touches auth
              state directly. */}
          <CurrencySwitcher />

          <Link
            to="/dashboard"
            className="whitespace-nowrap rounded-xl bg-primary-strong px-2 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:brightness-110 sm:px-4"
          >
            {/* Short label below sm: at 375px, ctaStart's full text
                ("Essayer gratuitement") wraps to two lines once the
                switcher above takes its place on the same row. */}
            <span className="sm:hidden">{t.ctaStartShort}</span>
            <span className="hidden sm:inline">{t.ctaStart}</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-overlay/5 lg:hidden"
            aria-label={open ? t.closeMenu : t.openMenu}
            aria-expanded={open}
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-overlay/10 px-4 pb-3 sm:px-6 lg:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-overlay/5 hover:text-ink"
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
