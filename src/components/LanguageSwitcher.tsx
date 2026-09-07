import { useLanguage } from '../hooks/useLanguage'
import { LANGUAGES } from '../lib/i18n/language'

// Deliberately small and quiet (not a full pill-button bar like TabBar) —
// visible but not competing with the actual CTA next to it, on either the
// desktop nav row or the mobile menu. Callers control visibility with a
// wrapping element (not a className override here) — this component's own
// `inline-flex` is unconditional, so a `hidden` passed in would fight it at
// equal specificity instead of cleanly winning below the sm breakpoint.
export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-overlay/10 bg-overlay/5 p-0.5 text-xs font-semibold"
      role="group"
      aria-label="Choisir la langue / Choose language"
    >
      {LANGUAGES.map((l) => (
        <button
          key={l.value}
          type="button"
          onClick={() => setLang(l.value)}
          aria-pressed={lang === l.value}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === l.value ? 'bg-primary-strong text-white' : 'text-muted hover:text-ink'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
