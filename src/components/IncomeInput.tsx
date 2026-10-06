import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { usePreferences } from '../hooks/usePreferences'
import { getCurrencySymbol } from '../lib/format'
import { COMMON } from '../lib/i18n/common'

const CARD_BORDER = 'color-mix(in srgb, var(--color-overlay) 10%, transparent)'

export function IncomeInput({
  monthlyIncome,
  onChange,
}: {
  monthlyIncome: number
  onChange: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(monthlyIncome || ''))
  const { lang } = useLanguage()
  const { currency } = usePreferences()
  const t = COMMON[lang].incomeInput

  function commit() {
    const value = Math.max(0, Number(draft) || 0)
    onChange(value)
    setDraft(String(value))
  }

  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: CARD_BORDER }}
    >
      <h2 className="text-base font-semibold text-ink">{t.title}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{t.hint}</p>
      <label className="flex items-center gap-2">
        <span className="text-muted">{getCurrencySymbol(currency, lang)}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          placeholder="0.00"
          className="budget-field w-full rounded-lg px-3 py-2 text-lg text-ink placeholder-muted"
        />
      </label>
    </section>
  )
}
