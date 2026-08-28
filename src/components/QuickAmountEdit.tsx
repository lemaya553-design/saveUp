import { useState } from 'react'
import { formatCurrency } from '../lib/format'

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
          <span className="text-muted">$</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-28 rounded-lg border border-overlay/10 bg-overlay/5 px-2 py-1 text-ink focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary-strong px-3 py-1 font-medium text-white transition-all hover:brightness-110"
          >
            Enregistrer
          </button>
          <button type="button" onClick={cancel} className="text-muted hover:text-ink">
            Annuler
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted">{label} :</span>
          <span className="font-medium text-ink">{formatCurrency(amount)}</span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-accent hover:text-accent/80"
          >
            Modifier
          </button>
        </div>
      )}
      {hint && <p className="mt-1 text-right text-xs text-muted">{hint}</p>}
    </div>
  )
}
