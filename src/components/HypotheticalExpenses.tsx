import { useState } from 'react'
import { formatCurrency } from '../lib/format'
import { useCategories } from '../hooks/useCategories'
import { FALLBACK_CATEGORY } from '../lib/categories'

export interface HypotheticalExpense {
  id: string
  name: string
  amount: number
  category: string
}

export function HypotheticalExpenses({
  expenses,
  onAdd,
  onRemove,
}: {
  expenses: HypotheticalExpense[]
  onAdd: (name: string, amount: number, category: string) => void
  onRemove: (id: string) => void
}) {
  const { categoryNames } = useCategories()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>(FALLBACK_CATEGORY)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!name.trim() || !parsed || parsed <= 0) return
    onAdd(name.trim(), parsed, category)
    setName('')
    setAmount('')
    setOpen(false)
  }

  return (
    <div>
      {expenses.length > 0 && (
        <ul className="mb-3 divide-y divide-white/10">
          {expenses.map((expense) => (
            <li key={expense.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <span className="text-ink">{expense.name}</span>
                <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                  nouvelle
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-red-400">+{formatCurrency(expense.amount)}</span>
                <button
                  type="button"
                  onClick={() => onRemove(expense.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                  aria-label={`Retirer ${expense.name}`}
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom (ex: Nouvel abonnement)"
            autoFocus
            className="min-w-[140px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant / mois"
            className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
          >
            {categoryNames.map((cat) => (
              <option key={cat} value={cat} className="bg-surface">
                {cat}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-xl border-2 border-dashed border-white/15 px-4 py-3 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-ink"
        >
          + Ajouter une dépense à tester
        </button>
      )}
    </div>
  )
}
