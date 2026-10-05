import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'
import { TrialCountdownBadge } from './TrialCountdownBadge'
import { LanguageSwitcher } from './LanguageSwitcher'
import { CurrencySwitcher } from './CurrencySwitcher'

function MenuIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

// Sticky strip that sits above every in-app page's own content (the page
// itself still renders its own PageHeader hero where it has one) — on
// desktop it's mostly a home for the trial/language/currency widgets that
// used to live in Nav.tsx; on mobile it's also the sidebar drawer's trigger.
export function TopBar({ title, onOpenMenu }: { title: string; onOpenMenu: () => void }) {
  const { lang } = useLanguage()
  const t = COMMON[lang].header

  return (
    <header className="sticky top-0 z-20 border-b border-overlay/10 bg-surface/70 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            <button
              type="button"
              onClick={onOpenMenu}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink transition-colors hover:bg-overlay/5"
              aria-label={t.openMenu}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
          <h1 className="truncate text-lg font-semibold text-ink sm:text-xl">{title}</h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <TrialCountdownBadge />
          <LanguageSwitcher />
          <CurrencySwitcher />
        </div>
      </div>
    </header>
  )
}
