import { useEffect, useRef, useState } from 'react'
import { usePreferences } from '../hooks/usePreferences'
import { CURRENCIES, type Currency } from '../lib/format'

// Sibling to LanguageSwitcher (same pill aesthetic — rounded, bordered,
// muted) but a compact trigger + dropdown rather than a row of buttons: 5
// currencies as a button row wouldn't fit next to the avatar on mobile the
// way FR/EN's 2 buttons do. Display-only — picking a currency here never
// converts a stored amount, it only changes which Intl.NumberFormat code
// renders it (see lib/format.ts).
export function CurrencySwitcher() {
  const { currency, setCurrency } = usePreferences()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function select(value: Currency) {
    setCurrency(value)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choisir la devise / Choose currency"
        className="inline-flex items-center gap-1 rounded-full border border-overlay/10 bg-overlay/5 px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:text-ink"
      >
        {currency}
        <span aria-hidden="true" className="text-[9px]">
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Choisir la devise / Choose currency"
          className="glass absolute right-0 top-full z-30 mt-1.5 w-24 overflow-hidden rounded-xl py-1 text-xs shadow-lg shadow-black/40"
        >
          {CURRENCIES.map((c) => (
            <li key={c}>
              <button
                type="button"
                role="option"
                aria-selected={currency === c}
                onClick={() => select(c)}
                className={`flex w-full items-center px-3 py-1.5 text-left font-medium transition-colors ${
                  currency === c ? 'bg-primary-strong text-white' : 'text-muted hover:bg-overlay/5 hover:text-ink'
                }`}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
