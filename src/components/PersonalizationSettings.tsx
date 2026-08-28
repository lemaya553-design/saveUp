import { Card } from './Card'
import { AvatarCircle } from './AvatarCircle'
import { usePreferences } from '../hooks/usePreferences'
import { ACCENT_COLORS, AVATAR_EMOJIS, type AccentColor, type Theme } from '../lib/theme'

export function PersonalizationSettings() {
  const { loading, error, accentColor, theme, avatarEmoji, setAccentColor, setTheme, setAvatarEmoji } =
    usePreferences()

  return (
    <Card title="Personnalisation" hint="L'apparence de SaveUp, juste pour toi.">
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Couleur d'accent</p>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={loading}
                onClick={() => setAccentColor(option.value as AccentColor)}
                aria-pressed={accentColor === option.value}
                aria-label={option.label}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-all disabled:opacity-60 ${
                  accentColor === option.value ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''
                }`}
              >
                <span
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: option.swatch }}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Thème</p>
          <div className="glass inline-flex gap-1 rounded-full p-1">
            {(['dark', 'light'] as Theme[]).map((option) => (
              <button
                key={option}
                type="button"
                disabled={loading}
                onClick={() => setTheme(option)}
                aria-pressed={theme === option}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                  theme === option
                    ? 'bg-primary-strong text-white shadow-md shadow-primary/30'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {option === 'dark' ? 'Sombre' : 'Clair'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Avatar</p>
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
                  aria-label={`Avatar ${emoji}`}
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
    </Card>
  )
}
