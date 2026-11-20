// The landing page's own light/dark toggle — deliberately independent of
// lib/theme.ts's applyTheme/THEME_STORAGE_KEY (the signed-in app's
// account-level preference, synced to Supabase). A logged-out visitor has
// no account yet, so this stays a local-only, device-scoped choice: a
// separate localStorage key, defaulting to the OS preference the first
// time there's nothing stored. try/catch everywhere — a visitor with
// localStorage disabled (private browsing, some corporate policies) should
// still get a working toggle, just one that resets on reload instead of
// erroring out.
export type LandingTheme = 'light' | 'dark'

const STORAGE_KEY = 'saveup-landing-theme'

export function getInitialLandingTheme(): LandingTheme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // ignore — fall through to the OS preference
  }
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  } catch {
    // matchMedia unsupported — default to light
  }
  return 'light'
}

export function persistLandingTheme(theme: LandingTheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore — the toggle still works for the rest of this visit
  }
}
