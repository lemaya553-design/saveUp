import { useEffect, useRef, useState } from 'react'

interface HelpButtonProps {
  title: string
  purpose: string
  actions: string[]
  className?: string
}

// A small "?" toggle + popover, meant to sit in a page's top-right corner
// (see PageHeader, which renders this for every page that uses it — Tarifs
// doesn't use PageHeader, so it renders one directly instead). Content is
// per-page (purpose + a short list of the main actions), aimed at someone
// new to the app rather than a full help center.
export function HelpButton({ title, purpose, actions, className = '' }: HelpButtonProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className={`relative z-30 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Aide : ${title}`}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-muted backdrop-blur-sm transition-colors hover:border-white/25 hover:bg-white/10 hover:text-ink"
      >
        ?
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={`Aide : ${title}`}
          className="glass absolute right-0 top-full mt-2 w-72 rounded-2xl p-4 text-left shadow-lg shadow-black/40 sm:w-80"
        >
          <p className="text-sm font-semibold text-ink">{title}</p>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent">À quoi sert cette page</p>
          <p className="mt-1 text-sm text-muted">{purpose}</p>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-accent">Comment l'utiliser</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-muted">
            {actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
