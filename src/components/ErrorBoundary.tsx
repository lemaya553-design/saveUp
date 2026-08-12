import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
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
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4 text-center text-ink">
          <p className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-bold text-transparent">
            SaveUp
          </p>
          <h1 className="text-2xl font-bold">Une erreur inattendue est survenue</h1>
          <p className="max-w-sm text-sm text-muted">
            Quelque chose s'est mal passé de notre côté. Tes données sont en sécurité — essaie de
            recharger la page.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary-strong px-5 py-2.5 font-medium text-white transition-all hover:brightness-110"
          >
            Recharger la page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
