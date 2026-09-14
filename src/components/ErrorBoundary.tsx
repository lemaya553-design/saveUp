import { Component, type ErrorInfo, type ReactNode } from 'react'
import { detectBrowserLang, STORAGE_KEY, type Lang } from '../lib/i18n/language'
import { MISC } from '../lib/i18n/misc'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// This sits above LanguageProvider in main.tsx (it has to — it's the last
// line of defense if *anything* below it, including the provider tree,
// throws while rendering) so its fallback can't read useLanguage() via
// context. Reads localStorage directly instead, mirroring the same
// stored-choice-then-browser-detection fallback useLanguage.tsx uses.
function readLang(): Lang {
  if (typeof window === 'undefined') return 'fr'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') return stored
  } catch {
    // Private browsing / storage disabled — fall through to browser detection.
  }
  return detectBrowserLang()
}

// React only supports catching render-time exceptions via a class component
// — there's no hook equivalent. Without this, any unexpected bug (a null
// reference, a malformed Supabase response shape) unmounts the whole tree
// and leaves a blank white page with no way back except a manual refresh.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('SaveUp crashed:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      const t = MISC[readLang()].errorBoundary
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4 text-center text-ink">
          <p className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-bold text-transparent">
            SaveUp
          </p>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="max-w-sm text-sm text-muted">{t.body}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary-strong px-5 py-2.5 font-medium text-white transition-all hover:brightness-110"
          >
            {t.reload}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
