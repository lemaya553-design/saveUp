import { useState } from 'react'
import { Card } from './Card'
import { formatCurrency } from '../lib/format'
import { useCategories } from '../hooks/useCategories'
import { FALLBACK_CATEGORY } from '../lib/categories'
import type { FixedExpense } from '../hooks/useFixedExpenses'

function EditRow({
  expense,
  onSave,
  onCancel,
}: {
  expense: FixedExpense
  onSave: (name: string, amount: number, category: string) => void
  onCancel: () => void
}) {
  const { categoryNames } = useCategories()
  const [name, setName] = useState(expense.name)
  const [amount, setAmount] = useState(String(expense.amount))
  const [category, setCategory] = useState(expense.category)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!name.trim() || !parsed || parsed <= 0) return
    onSave(name.trim(), parsed, category)
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 py-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-w-[120px] flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
      />
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-24 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
      >
        {categoryNames.map((cat) => (
          <option key={cat} value={cat} className="bg-surface">
            {cat}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-lg bg-primary-strong px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
      >
        Enregistrer
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-muted hover:text-ink"
      >
        Annuler
      </button>
    </form>
  )
}

export function FixedExpenses({
  expenses,
  total,
  onAdd,
  onUpdate,
  onRemove,
  compact = false,
}: {
  expenses: FixedExpense[]
  total: number
  onAdd: (name: string, amount: number, category: string) => Promise<void>
  onUpdate: (id: string, name: string, amount: number, category: string) => void
  onRemove: (id: string) => void
  compact?: boolean
}) {
  const { categoryNames } = useCategories()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>(FALLBACK_CATEGORY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!name.trim() || !parsed || parsed <= 0 || submitting) return
    setSubmitting(true)
    await onAdd(name.trim(), parsed, category)
    setSubmitting(false)
    setName('')
    setAmount('')
  }

  return (
    <Card
      title="Dépenses fixes"
      hint="Loyer, abonnements, assurances — tout ce qui revient chaque mois."
      compact={compact}
    >
      <ul className="mb-4 divide-y divide-overlay/10">
        {expenses.length === 0 && (
          <li className="py-2 text-sm text-muted">
            Aucune dépense fixe pour l'instant — ajoute ton loyer ou un abonnement ci-dessous.
          </li>
        )}
        {expenses.map((expense) =>
          editingId === expense.id ? (
            <li key={expense.id}>
              <EditRow
                expense={expense}
                onCancel={() => setEditingId(null)}
                onSave={(newName, newAmount, newCategory) => {
                  onUpdate(expense.id, newName, newAmount, newCategory)
                  setEditingId(null)
                }}
              />
            </li>
          ) : (
            <li key={expense.id} className="flex flex-wrap items-center justify-between gap-y-1 py-2">
              <div>
                <span className="text-ink">{expense.name}</span>
                <span className="ml-2 text-xs text-muted">{expense.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="mr-2 font-medium text-ink">{formatCurrency(expense.amount)}</span>
                <button
                  type="button"
                  onClick={() => setEditingId(expense.id)}
                  className="rounded-md px-2 py-1.5 text-sm text-accent hover:bg-accent/10 hover:text-accent/80"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(expense.id)}
                  className="rounded-md px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  aria-label={`Supprimer ${expense.name}`}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom (ex: Loyer)"
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
          className="rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        Total: <span className="font-semibold text-ink">{formatCurrency(total)}</span>
      </p>
    </Card>
  )
}
