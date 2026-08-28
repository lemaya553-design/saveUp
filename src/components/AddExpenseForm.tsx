import { useState } from 'react'
import { Card } from './Card'
import { useCategories } from '../hooks/useCategories'
import { FALLBACK_CATEGORY } from '../lib/categories'

function PlusIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function AddExpenseForm({
  onAdd,
}: {
  onAdd: (description: string, amount: number, category: string) => Promise<void>
}) {
  const { categoryNames } = useCategories()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>(FALLBACK_CATEGORY)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!description.trim() || !parsed || parsed <= 0 || submitting) return
    setSubmitting(true)
    await onAdd(description.trim(), parsed, category)
    setSubmitting(false)
    setDescription('')
    setAmount('')
  }

  return (
    <Card title="Ajoute une dépense" hint="Note-la en 5 secondes pour garder ton budget à jour.">
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (ex: Café)"
          className="min-w-[140px] flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
        />
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Montant"
          className="w-28 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
        >
          {categoryNames.map((cat) => (
            <option key={cat} value={cat} className="bg-surface">
              {cat}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-primary-strong px-6 py-3 text-base font-semibold text-white shadow-[0_0_20px_rgba(74,108,247,0.35)] transition-all hover:brightness-110 disabled:opacity-60"
        >
          <PlusIcon className="h-5 w-5" />
          {submitting ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>
    </Card>
  )
}
