import { AvatarCircle } from './AvatarCircle'
import { usePreferences } from '../hooks/usePreferences'
import { useLanguage } from '../hooks/useLanguage'
import { AVATAR_EMOJIS, type Theme } from '../lib/theme'
import { PARAMETRES } from '../lib/i18n/parametres'

const CARD_BORDER = 'color-mix(in srgb, var(--color-overlay) 10%, transparent)'

// The blue/green/purple/orange accent-color picker that used to live here
// is gone — the app is a single fixed blue brand now, nothing left to
// choose between. Only the dark/light toggle and avatar picker remain.
export function PersonalizationSettings() {
  const { loading, error, theme, avatarEmoji, setTheme, setAvatarEmoji } = usePreferences()
  const { lang } = useLanguage()
  const t = PARAMETRES[lang].personalization

  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: CARD_BORDER }}
    >
      <h2 className="text-base font-semibold text-ink">{t.cardTitle}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{t.cardHint}</p>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-sm font-medium text-ink">{t.theme}</p>
          <div className="glass inline-flex gap-1 rounded-full p-1">
            {(['dark', 'light'] as Theme[]).map((option) => (
              <button
                key={option}
                type="button"
                disabled={loading}
                onClick={() => setTheme(option)}
                aria-pressed={theme === option}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                  theme === option ? 'budget-btn-primary' : 'text-muted hover:text-ink'
                }`}
              >
                {option === 'dark' ? t.dark : t.light}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">{t.avatar}</p>
          <div className="flex flex-wrap items-center gap-3">
            <AvatarCircle emoji={avatarEmoji} />
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  disabled={loading}
                  onClick={() => setAvatarEmoji(avatarEmoji === emoji ? null : emoji)}
                  aria-pressed={avatarEmoji === emoji}
                  aria-label={t.avatarAriaLabel(emoji)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-colors disabled:opacity-60 ${
                    avatarEmoji === emoji ? 'bg-primary/20 ring-1 ring-inset ring-primary/40' : 'hover:bg-overlay/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
