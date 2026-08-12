import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { LogoMark } from './Logo'

export interface Screenshot {
  key: string
  label: string
  description: string
  src: string
  path: string
}

// Drop the real PNG/JPG files at these paths (public/ is served at the site
// root by Vite) to replace the placeholder state below — nothing else needs
// to change. The frame has no fixed aspect ratio of its own — it sizes to
// whatever the image's real dimensions are (see ScreenshotFrame), so
// nothing is ever cropped regardless of each screenshot's own ratio.
const SCREENSHOTS: Screenshot[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    description: 'Ton portrait financier en un coup d’œil.',
    src: '/screenshots/dashboard.png',
    path: 'saveup.app/dashboard',
  },
  {
    key: 'budget',
    label: 'Budget',
    description: 'Chaque dépense, chaque catégorie, à jour automatiquement.',
    src: '/screenshots/budget.png',
    path: 'saveup.app/budget',
  },
  {
    key: 'epargne',
    label: 'Épargne',
    description: 'Tes objectifs, et le simulateur « et si » pour les tester.',
    src: '/screenshots/epargne.png',
    path: 'saveup.app/epargne',
  },
  {
    key: 'statistiques',
    label: 'Statistiques',
    description: 'Tendances et comparaisons mensuelles, visualisées.',
    src: '/screenshots/statistiques.png',
    path: 'saveup.app/statistiques',
  },
  {
    key: 'recompenses',
    label: 'Récompenses',
    description: 'Des badges qui se méritent, pas des points arbitraires.',
    src: '/screenshots/recompenses.png',
    path: 'saveup.app/recompenses',
  },
]

function ArrowIcon({ className, flip }: { className: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  )
}

// Minimal browser-window chrome — works for any screenshot aspect ratio
// (unlike a phone bezel, which only looks right at one), and reads as "real
// product" rather than an illustration.
//
// Deliberately no aspect-ratio/object-cover on the image box: that combo
// crops to fill a fixed shape, which is exactly what produced the "cut off"
// bug. Instead the <img> renders at its own natural ratio, scaled only by
// width (h-auto) — the frame's height is *whatever the image's height
// works out to*, so every pixel of the source file is always shown.
function ScreenshotFrame({ shot }: { shot: Screenshot }) {
  const [errored, setErrored] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-black/50">
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/[0.04] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/60" aria-hidden="true" />
        <span className="ml-2 truncate rounded-md bg-white/5 px-2.5 py-1 text-[11px] text-muted">
          {shot.path}
        </span>
      </div>

      <div className="bg-canvas">
        {!errored ? (
          <img
            src={shot.src}
            alt={`Aperçu de la page ${shot.label} de SaveUp`}
            className="block h-auto w-full select-none"
            draggable={false}
            loading="lazy"
            onError={() => setErrored(true)}
          />
        ) : (
          // No image to size the box, so the fallback needs its own ratio.
          <div className="flex aspect-[4/5] flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 text-center">
            <LogoMark className="h-9 w-9 opacity-30" />
            <p className="text-sm text-muted">Capture de {shot.label} à venir</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function ScreenshotCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startX: number; startScrollLeft: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function updateArrows() {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [])

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-carousel-item]')
    const amount = card ? card.offsetWidth + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: amount * direction, behavior: 'smooth' })
  }

  // Click-and-drag is a mouse-only affordance here — touch already gets
  // native momentum scrolling/swipe on this same scrollable element for
  // free, and hooking pointer events for touch too would fight that instead
  // of complementing it.
  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return
    const el = scrollerRef.current
    if (!el) return
    drag.current = { startX: e.clientX, startScrollLeft: el.scrollLeft }
    setDragging(true)
    el.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    const el = scrollerRef.current
    if (!el) return
    el.scrollLeft = drag.current.startScrollLeft - (e.clientX - drag.current.startX)
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    scrollerRef.current?.releasePointerCapture(e.pointerId)
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className={`no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 ${
          dragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {SCREENSHOTS.map((shot) => (
          // Each slide is the full width of the scroller — exactly one
          // screenshot fills the view at rest, no peek of the next one. The
          // card itself fills that slide almost edge to edge (px-12/16 just
          // clears the floating arrow buttons, which sit half-overlapping
          // the outer edge) rather than being capped to a small fixed width.
          <div key={shot.key} data-carousel-item className="w-full shrink-0 snap-center px-4 sm:px-16">
            <ScreenshotFrame shot={shot} />
            <p className="mt-4 text-center font-semibold text-ink">{shot.label}</p>
            <p className="mx-auto max-w-xs text-center text-sm text-muted">{shot.description}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        disabled={!canScrollLeft}
        aria-label="Capture précédente"
        className="glass absolute left-0 top-[38%] hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-ink shadow-lg shadow-black/40 disabled:opacity-0 sm:flex"
      >
        <ArrowIcon className="h-5 w-5" flip />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        disabled={!canScrollRight}
        aria-label="Capture suivante"
        className="glass absolute right-0 top-[38%] hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full text-ink shadow-lg shadow-black/40 disabled:opacity-0 sm:flex"
      >
        <ArrowIcon className="h-5 w-5" />
      </button>
    </div>
  )
}
