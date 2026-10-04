import type { Lang } from './i18n/language'

export type AccentColor = 'bleu' | 'vert' | 'violet' | 'orange'
export type Theme = 'dark' | 'light'

export const ACCENT_COLORS: { value: AccentColor; label: Record<Lang, string>; swatch: string }[] = [
  { value: 'bleu', label: { fr: 'Bleu', en: 'Blue' }, swatch: '#4a6cf7' },
  { value: 'vert', label: { fr: 'Vert', en: 'Green' }, swatch: '#22c55e' },
  { value: 'violet', label: { fr: 'Violet', en: 'Purple' }, swatch: '#8b5cf6' },
  { value: 'orange', label: { fr: 'Orange', en: 'Orange' }, swatch: '#f97316' },
]

export const AVATAR_EMOJIS = ['😊', '💰', '🚀', '🎯', '🌟', '🐱', '🦊', '🌈', '🐢', '🍀', '⭐', '🐙']

export const THEME_STORAGE_KEY = 'saveup-theme'
export const ACCENT_STORAGE_KEY = 'saveup-accent'

// `data-theme`/`data-accent` attributes are what index.css actually reads
// (see the `:root[data-theme='light']` / `:root[data-accent='...']` blocks)
// — "dark"/"bleu" are the no-attribute defaults, so they're removed rather
// than written, keeping the DOM state consistent with what a first-ever
// visit (no preference saved anywhere yet) already renders.
export function applyTheme(theme: Theme) {
  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light'
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
