import type { Lang } from './i18n/language'

export type AccentColor = 'bleu' | 'vert' | 'violet' | 'orange'
export type Theme = 'dark' | 'light'

// value is the internal id stored in localStorage/data-accent — NOT the
// display label. 'bleu' is the sentinel for "no data-accent attribute" (see
// applyAccentColor below), and the app's default palette is now orange
// (SaveUp Minimaliste), so 'bleu' now carries the "Orange" label/swatch;
// the slot that used to be the literal "Orange" preset carries "Bleu"
// instead, pointing at a :root[data-accent='orange'] override in index.css
// that now holds the old blue values. Renaming the ids themselves would
// touch the stored preference of every existing user — relabeling what's
// shown is the same outcome without that migration.
export const ACCENT_COLORS: { value: AccentColor; label: Record<Lang, string>; swatch: string }[] = [
  { value: 'bleu', label: { fr: 'Orange', en: 'Orange' }, swatch: '#ff8533' },
  { value: 'vert', label: { fr: 'Vert', en: 'Green' }, swatch: '#22c55e' },
  { value: 'violet', label: { fr: 'Violet', en: 'Purple' }, swatch: '#8b5cf6' },
  { value: 'orange', label: { fr: 'Bleu', en: 'Blue' }, swatch: '#4a6cf7' },
]

export const AVATAR_EMOJIS = ['😊', '💰', '🚀', '🎯', '🌟', '🐱', '🦊', '🌈', '🐢', '🍀', '⭐', '🐙']

export const THEME_STORAGE_KEY = 'saveup-theme'
export const ACCENT_STORAGE_KEY = 'saveup-accent'

// `data-theme`/`data-accent` attributes are what index.css actually reads
// (see the `:root[data-theme='dark']` / `:root[data-accent='...']` blocks)
// — "light"/"bleu" are the no-attribute defaults (SaveUp Minimaliste's
// white/black/orange identity, matching the landing page), so they're
// removed rather than written, keeping the DOM state consistent with what
// a first-ever visit (no preference saved anywhere yet) already renders.
export function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark'
  } else {
    delete document.documentElement.dataset.theme
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function applyAccentColor(accent: AccentColor) {
  if (accent === 'bleu') {
    delete document.documentElement.dataset.accent
  } else {
    document.documentElement.dataset.accent = accent
  }
  localStorage.setItem(ACCENT_STORAGE_KEY, accent)
}
