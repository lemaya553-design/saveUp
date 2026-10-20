import { useEffect, useMemo, useRef, useState } from 'react'
import type { CountryCode } from 'libphonenumber-js'
import { DIAL_COUNTRIES } from '../lib/phone'
import type { Lang } from '../lib/i18n/language'

// Strips accents so "quebec" / "côte" both match "Québec" / "Côte d'Ivoire"
// regardless of how the user typed it.
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

// Searchable dropdown over the full DIAL_COUNTRIES list (~245 entries) — a
// plain <select> with that many <option>s is usable but slow to scan on a
// phone; this adds a filter-as-you-type search on top of the same list.
// Styled to match WhatsappOptIn.tsx's literal black/orange pre-dashboard
// look (not the app's theme-aware chrome), the one place this is used.
export function CountrySelect({
  value,
  onChange,
  label,
  searchPlaceholder,
  lang,
}: {
  value: CountryCode
  onChange: (iso: CountryCode) => void
  label: string
  searchPlaceholder: string
  lang: Lang
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = DIAL_COUNTRIES.find((c) => c.iso === value) ?? DIAL_COUNTRIES[0]

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return DIAL_COUNTRIES
    return DIAL_COUNTRIES.filter(
      (c) => normalize(c.label[lang]).includes(q) || c.dial.replace('+', '').startsWith(q.replace('+', '')),
    )
  }, [query, lang])

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus()
    function handlePointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function selectCountry(iso: CountryCode) {
    onChange(iso)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative w-[7.5rem] shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex h-full w-full items-center justify-between rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-left text-white"
      >
        <span className="truncate">{selected.dial}</span>
        <span className="ml-1 text-white/40">▾</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-20 mt-1.5 w-64 overflow-hidden rounded-xl border border-white/15 bg-[#161618] shadow-2xl shadow-black/50"
        >
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full border-b border-white/10 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/35 focus:outline-none"
          />
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && <li className="px-3 py-2 text-sm text-white/40">—</li>}
            {filtered.map((c) => (
              <li key={c.iso}>
                <button
                  type="button"
                  onClick={() => selectCountry(c.iso)}
                  aria-selected={c.iso === value}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                    c.iso === value ? 'text-[#ff6b00]' : 'text-white/85'
                  }`}
                >
                  <span className="truncate">{c.label[lang]}</span>
                  <span className="ml-2 shrink-0 text-white/40">{c.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
