import { useAuth } from '../hooks/useAuth'
import { useHasRealActivity } from '../hooks/useHasRealActivity'
import { usePwaInstall } from '../hooks/usePwaInstall'

function ShareIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v12m0-12l-4 4m4-4l4 4M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7"
      />
    </svg>
  )
}

// Mounted once in Layout (app chrome only, never on marketing pages) — its
// own visibility logic decides whether to render anything, so it's safe to
// always mount. Two independent conditions gate it: platform eligibility
// (not already installed, and either iOS Safari or a captured
// beforeinstallprompt) and timing (signed in, done at least one real thing,
// not recently dismissed) — except when reopened from Paramètres, which
// bypasses the timing gate on purpose.
export function PwaInstallBanner() {
  const { user } = useAuth()
  const { checked, hasActivity } = useHasRealActivity()
  const { platform, standalone, snoozed, forceOpen, install, dismiss } = usePwaInstall()

  const eligible = !standalone && platform !== 'unsupported'
  const gateOk = forceOpen || (!!user && checked && hasActivity && !snoozed)

  if (!eligible || !gateOk) return null

  return (
    <div
      className="fixed inset-x-4 z-40 mx-auto max-w-md"
      style={{ bottom: 'calc(5.75rem + env(safe-area-inset-bottom))' }}
      role="region"
      aria-label="Installer SaveUp"
    >
      <div className="glass flex items-start gap-3 rounded-2xl p-4 shadow-lg shadow-black/40">
        <span className="mt-0.5 text-2xl" aria-hidden="true">
          📲
        </span>
        <div className="min-w-0 flex-1">
          {platform === 'ios-safari' ? (
            <>
              <p className="text-sm font-semibold text-ink">Installe SaveUp sur ton écran d'accueil</p>
              <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted">
                Appuie sur
                <ShareIcon className="h-4 w-4 shrink-0 text-ink" />
                puis <span className="font-medium text-ink">« Ajouter à l'écran d'accueil »</span>.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-ink">Installe SaveUp sur cet appareil</p>
              <p className="mt-1 text-xs text-muted">
                Accès plus rapide, en plein écran, comme une vraie app.
              </p>
              <button
                type="button"
                onClick={install}
                className="mt-3 rounded-lg bg-primary-strong px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
              >
                Installer
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-overlay/5 hover:text-ink"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
