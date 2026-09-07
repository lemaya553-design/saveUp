import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { detectBrowserLang, STORAGE_KEY, type Lang } from '../lib/i18n/language'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readInitialLang(): Lang {
  if (typeof window === 'undefined') return 'fr'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'fr' || stored === 'en') return stored
  return detectBrowserLang()
}

// Mounted once at the app root (like AuthProvider/PreferencesProvider) —
// harmless anywhere it's not read. Only the public marketing pages
// (landing, Tarifs when logged out) actually consult it; the signed-in app
// never calls useLanguage() and stays French regardless of this value.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private browsing / storage disabled — the choice just won't survive
      // a reload, same graceful degradation as usePreferences' theme flash guard.
    }
  }, [])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
