import { useEffect, useMemo } from 'react'
import type { BadgeDef, StatusLevel } from '../lib/badges'
import type { Lang } from '../lib/i18n/language'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { BadgeMedal } from './BadgeMedal'

export type UnlockScreen =
  | { kind: 'badge'; def: BadgeDef; resultLabel: string; message: string }
  | { kind: 'status'; status: StatusLevel }

const CONFETTI_COLORS = ['#4A6CF7', '#8DA9FF', '#FFD700', '#FFE58A', '#FFFFFF']
const CONFETTI_COUNT = 36

function useConfettiPieces(enabled: boolean) {
  return useMemo(() => {
    if (!enabled) return []
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      duration: 2.4 + Math.random() * 1.6,
      delay: Math.random() * 0.6,
      size: 6 + Math.random() * 6,
    }))
  }, [enabled])
}

// Full-screen celebration shown by BadgeUnlockWatcher (mounted in Layout,
// so this can appear over any page) the moment a badge is auto-claimed, and
// again right after if that badge also crossed a new status threshold. One
// screen at a time — BadgeUnlockWatcher queues the rest.
export function BadgeUnlockOverlay({
  screen,
  lang,
  onDismiss,
}: {
  screen: UnlockScreen
  lang: Lang
  onDismiss: () => void
}) {
  const reducedMotion = usePrefersReducedMotion()
  const confetti = useConfettiPieces(!reducedMotion)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onDismiss])

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="badge-unlock-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((p) => (
          <span
            key={p.id}
            className="confetti-piece absolute top-0 rounded-sm"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex w-full max-w-xs flex-col items-center gap-5 text-center">
        {screen.kind === 'badge' ? (
          <>
            <div className="relative w-36 sm:w-44">
              <div className="badge-unlock-glow absolute inset-0 rounded-full bg-primary/50 blur-2xl" />
              <div className="badge-unlock-medal relative">
                <BadgeMedal rarity={screen.def.rarity} icon={screen.def.icon} resultLabel={screen.resultLabel} unlocked />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {lang === 'en' ? 'Badge unlocked!' : 'Badge débloqué !'}
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">{screen.def.name[lang]}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/85">{screen.message}</p>
            </div>
          </>
        ) : (
          <>
            <div className="badge-unlock-medal relative flex h-28 w-28 items-center justify-center">
              <div className="badge-unlock-glow absolute inset-0 rounded-full bg-primary/50 blur-2xl" />
              <span className="relative text-6xl">{screen.status.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {lang === 'en' ? 'New status' : 'Nouveau statut'}
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">{screen.status.name[lang]}</h2>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={onDismiss}
          autoFocus
          className="mt-2 rounded-full budget-btn-primary px-7 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
        >
          {lang === 'en' ? 'Thank you!' : 'Merci !'}
        </button>
      </div>
    </div>
  )
}
