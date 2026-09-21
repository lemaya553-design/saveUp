import { useEffect, useRef, useState } from 'react'
import { usePreferences } from '../hooks/usePreferences'
import { useHasRealActivity } from '../hooks/useHasRealActivity'
import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'
import { CURRENCIES, type Currency } from '../lib/format'

// Sibling to LanguageSwitcher (same pill aesthetic — rounded, bordered,
// muted) but a compact trigger + dropdown rather than a row of buttons: 5
// currencies as a button row wouldn't fit next to the avatar on mobile the
// way FR/EN's 2 buttons do. Display-only — picking a currency here never
// converts a stored amount, it only changes which Intl.NumberFormat code
// renders it (see lib/format.ts). For an account with real data already
// entered, switching silently relabels every existing amount as if it had
// been entered in the new currency — genuinely misleading, not just a
// cosmetic detail — so that case gets an explicit confirm step first. A
// brand-new account (useHasRealActivity) picking its currency up front
// never sees it, on purpose.
export function CurrencySwitcher() {
  const { currency, setCurrency } = usePreferences()
  const { hasActivity } = useHasRealActivity()
  const { lang } = useLanguage()
  const t = COMMON[lang]
  const [open, setOpen] = useState(false)
  const [pendingCurrency, setPendingCurrency] = useState<Currency | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function closeAll() {
    setOpen(false)
    setPendingCurrency(null)
  }

  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeAll()
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAll()
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function select(value: Currency) {
    if (value === currency) {
      setOpen(false)
      return
    }
    if (hasActivity) {
      setPendingCurrency(value)
      return
    }
    setCurrency(value)
    setOpen(false)
  }

  function confirmChange() {
    if (!pendingCurrency) return
    setCurrency(pendingCurrency)
    closeAll()
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.currencySwitcher.ariaLabel}
        className="inline-flex items-center gap-1 rounded-full border border-overlay/10 bg-overlay/5 px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:text-ink"
      >
        {currency}
        <span aria-hidden="true" className="text-[9px]">
          ▾
        </span>
      </button>

      {open && pendingCurrency && (
        <div className="glass absolute right-0 top-full z-30 mt-1.5 w-64 rounded-xl p-3 text-xs shadow-lg shadow-black/40">
          <p className="font-semibold text-ink">{t.currencySwitcher.confirmTitle}</p>
          <p className="mt-1 text-muted">{t.currencySwitcher.confirmBody(currency, pendingCurrency)}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPendingCurrency(null)}
              className="rounded-md px-2 py-1 text-muted hover:text-ink"
            >
              {t.app.cancel}
            </button>
            <button
              type="button"
              onClick={confirmChange}
              className="rounded-md bg-primary-strong px-2.5 py-1 font-medium text-white hover:brightness-110"
            >
              {t.app.confirm}
            </button>
          </div>
        </div>
      )}

      {open && !pendingCurrency && (
        <ul
          role="listbox"
          aria-label={t.currencySwitcher.ariaLabel}
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
