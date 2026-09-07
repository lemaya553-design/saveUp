// Only the public marketing pages (landing + Tarifs when logged out) are
// bilingual — the signed-in app stays French-only for now, on purpose.
export type Lang = 'fr' | 'en'

export const LANGUAGES: { value: Lang; label: string }[] = [
  { value: 'fr', label: 'FR' },
  { value: 'en', label: 'EN' },
]

export const STORAGE_KEY = 'saveup-lang'

// French is the product's home language — English is only the fallback for
// a browser that doesn't ask for French at all, not the default.
export function detectBrowserLang(): Lang {
  if (typeof navigator === 'undefined') return 'fr'
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language]
  const prefersFrench = candidates.some((tag) => tag?.toLowerCase().startsWith('fr'))
  return prefersFrench ? 'fr' : 'en'
}
