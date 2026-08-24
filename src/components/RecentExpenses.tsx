import { useMemo, useState } from 'react'
import { Card } from './Card'
import { formatCurrency } from '../lib/format'
import { useCategories } from '../hooks/useCategories'
import type { Expense } from '../hooks/useExpenses'

const COLLAPSED_COUNT = 5

function EditRow({
  expense,
  onSave,
  onCancel,
}: {
  expense: Expense
  onSave: (description: string, amount: number, category: string) => void
  onCancel: () => void
}) {
  const { categoryNames } = useCategories()
  const [description, setDescription] = useState(expense.description)
  const [amount, setAmount] = useState(String(expense.amount))
  const [category, setCategory] = useState(expense.category)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!description.trim() || !parsed || parsed <= 0) return
    onSave(description.trim(), parsed, category)
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 py-2">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-w-[120px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
      />
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
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
      <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ink">
        Annuler
      </button>
    </form>
  )
}

export function RecentExpenses({
  expenses,
  onUpdate,
  onRemove,
  compact = false,
}: {
  expenses: Expense[]
  onUpdate: (id: string, description: string, amount: number, category: string) => void
  onRemove: (id: string) => void
  compact?: boolean
}) {
  const { categoryNames } = useCategories()
  const [showAll, setShowAll] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const hasActiveFilters = search.trim() !== '' || categoryFilter !== '' || dateFrom !== '' || dateTo !== ''

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return expenses.filter((expense) => {
      if (query && !expense.description.toLowerCase().includes(query)) return false
      if (categoryFilter && expense.category !== categoryFilter) return false
      const spentAt = expense.spent_at.slice(0, 10)
      if (dateFrom && spentAt < dateFrom) return false
      if (dateTo && spentAt > dateTo) return false
      return true
    })
  }, [expenses, search, categoryFilter, dateFrom, dateTo])

  const visible = hasActiveFilters || showAll ? filtered : filtered.slice(0, COLLAPSED_COUNT)

  function clearFilters() {
    setSearch('')
    setCategoryFilter('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <Card
      title="Dépenses récentes"
      hint="Tes dernières dépenses (jusqu'à 50), les plus récentes en premier."
      compact={compact}
    >
      {expenses.length === 0 ? (
        <p className="text-sm text-muted">Aucune dépense enregistrée pour l'instant.</p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une description..."
              className="min-w-[160px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink placeholder-muted focus:border-primary focus:outline-none"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option value="" className="bg-surface">
                Toutes les catégories
              </option>
              {categoryNames.map((cat) => (
                <option key={cat} value={cat} className="bg-surface">
                  {cat}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs text-muted">
              Du
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-1 text-xs text-muted">
              Au
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </label>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="-mx-2 -my-1 rounded-md px-2 py-1 text-sm text-accent hover:bg-accent/10 hover:text-accent/80"
              >
                Effacer les filtres
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted">Aucune dépense ne correspond à ces filtres.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {visible.map((expense) =>
                editingId === expense.id ? (
                  <li key={expense.id}>
                    <EditRow
                      expense={expense}
                      onCancel={() => setEditingId(null)}
                      onSave={(description, amount, category) => {
                        onUpdate(expense.id, description, amount, category)
                        setEditingId(null)
                      }}
                    />
                  </li>
                ) : (
                  <li key={expense.id} className="flex flex-wrap items-center justify-between gap-y-1 py-2">
                    <div>
                      <p className="text-ink">{expense.description}</p>
                      <p className="text-xs text-muted">
                        {new Date(expense.spent_at).toLocaleDateString('fr-CA', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        · {expense.category}
                        {expense.account && (
                          <span className="ml-1.5 rounded-full bg-white/5 px-1.5 py-0.5 text-muted">
                            {expense.account}
                          </span>
                        )}
                      </p>
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
                        aria-label={`Supprimer ${expense.description}`}
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}

          {!hasActiveFilters && filtered.length > COLLAPSED_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="-mx-2 mt-3 rounded-md px-2 py-1.5 text-sm text-accent hover:bg-accent/10 hover:text-accent/80"
            >
              {showAll ? 'Réduire' : `Voir tout l'historique (${filtered.length})`}
            </button>
          )}
        </>
      )}
    </Card>
  )
}
