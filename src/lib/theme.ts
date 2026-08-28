export type AccentColor = 'bleu' | 'vert' | 'violet' | 'orange'
export type Theme = 'dark' | 'light'

export const ACCENT_COLORS: { value: AccentColor; label: string; swatch: string }[] = [
  { value: 'bleu', label: 'Bleu', swatch: '#4a6cf7' },
  { value: 'vert', label: 'Vert', swatch: '#22c55e' },
  { value: 'violet', label: 'Violet', swatch: '#8b5cf6' },
  { value: 'orange', label: 'Orange', swatch: '#f97316' },
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
