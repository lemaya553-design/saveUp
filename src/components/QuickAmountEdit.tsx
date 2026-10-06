import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { usePreferences } from '../hooks/usePreferences'
import { getCurrencySymbol } from '../lib/format'
import { COMMON } from '../lib/i18n/common'

export function QuickAmountEdit({
  label,
  amount,
  onChange,
  hint,
}: {
  label: string
  amount: number
  onChange: (value: number) => void
  hint?: string
}) {
  const { lang } = useLanguage()
  const { currency } = usePreferences()
  const formatMoney = useMoneyFormat()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(amount || ''))

  function save(e: React.FormEvent) {
    e.preventDefault()
    const value = Math.max(0, Number(draft) || 0)
    onChange(value)
    setEditing(false)
  }

  function cancel() {
    setDraft(String(amount || ''))
    setEditing(false)
  }

  return (
    <div className="mb-6">
      {editing ? (
        <form onSubmit={save} className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <span className="text-muted">{label} :</span>
          <span className="text-muted">{getCurrencySymbol(currency, lang)}</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="budget-field w-28 rounded-lg px-2 py-1 text-ink"
          />
          <button
            type="submit"
            className="budget-btn-primary rounded-lg px-3 py-1 font-medium transition-all"
          >
            {COMMON[lang].app.save}
          </button>
          <button type="button" onClick={cancel} className="text-muted hover:text-ink">
            {COMMON[lang].app.cancel}
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted">{label} :</span>
          <span className="font-medium text-ink">{formatMoney(amount)}</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="budget-action-link"
          >
            {COMMON[lang].app.modify}
          </button>
        </div>
      )}
      {hint && <p className="mt-1 text-right text-xs text-muted">{hint}</p>}
    </div>
  )
}
