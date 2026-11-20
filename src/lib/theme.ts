export type Theme = 'dark' | 'light'

export const AVATAR_EMOJIS = ['😊', '💰', '🚀', '🎯', '🌟', '🐱', '🦊', '🌈', '🐢', '🍀', '⭐', '🐙']

export const THEME_STORAGE_KEY = 'saveup-theme'

// `data-theme` is what index.css actually reads (see the
// `:root[data-theme='light']` block) — "dark" is the no-attribute default,
// so it's removed rather than written, keeping the DOM state consistent
// with what a first-ever visit (no preference saved anywhere yet) already
// renders. There used to be a matching applyAccentColor/data-accent pair
// here too (Paramètres > Personnalisation's blue/green/purple/orange
// picker) — removed along with that picker, see git history: the app is a
// single fixed blue brand now, with no more per-account accent choice.
export function applyTheme(theme: Theme) {
  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light'
  } else {
    delete document.documentElement.dataset.theme
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}
