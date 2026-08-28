import { formatCurrency } from '../lib/format'
import { useCategories } from '../hooks/useCategories'

export interface HypotheticalExpense {
  id: string
  name: string
  amount: number
  category: string
}

const DEFAULT_SLIDER_MAX = 200

// Same interaction as FixedExpenseSimRow's sliders for real expenses — drag
// and the impact updates live, no submit step in between. A hypothetical
// still needs a name/category (used if it's later applied as a real fixed
// expense), edited inline, but nothing here gates on a form submission.
export function HypotheticalExpenses({
  expenses,
  onAdd,
  onUpdate,
  onRemove,
}: {
  expenses: HypotheticalExpense[]
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Pick<HypotheticalExpense, 'name' | 'amount' | 'category'>>) => void
  onRemove: (id: string) => void
}) {
  const { categoryNames } = useCategories()

  return (
    <div>
      {expenses.length > 0 && (
        <ul className="mb-3 divide-y divide-overlay/10">
          {expenses.map((expense) => {
            const sliderMax = Math.max(expense.amount * 2, DEFAULT_SLIDER_MAX)
            return (
              <li key={expense.id} className="py-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={expense.name}
                    onChange={(e) => onUpdate(expense.id, { name: e.target.value })}
                    placeholder="Nom (ex: Nouvel abonnement)"
                    className="min-w-[120px] flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-2 py-1.5 text-sm text-ink placeholder-muted focus:border-primary focus:outline-none"
                  />
                  <select
                    value={expense.category}
                    onChange={(e) => onUpdate(expense.id, { category: e.target.value })}
                    className="rounded-lg border border-overlay/10 bg-overlay/5 px-2 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
                  >
                    {categoryNames.map((cat) => (
                      <option key={cat} value={cat} className="bg-surface">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">nouvelle</span>
                  <button
                    type="button"
                    onClick={() => onRemove(expense.id)}
                    className="rounded-md px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Retirer ${expense.name || 'cette dépense hypothétique'}`}
                  >
                    Retirer
                  </button>
                </div>

                <div className="mb-1 flex items-center justify-end text-sm">
                  <span className="font-medium text-red-400">+{formatCurrency(expense.amount)}/mois</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={sliderMax}
                  step={1}
                  value={Math.min(expense.amount, sliderMax)}
                  onChange={(e) => onUpdate(expense.id, { amount: Number(e.target.value) })}
                  className="w-full accent-primary"
                  aria-label={`Montant hypothétique pour ${expense.name || 'cette dépense'}`}
                />
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="w-full rounded-xl border-2 border-dashed border-overlay/15 px-4 py-3 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-ink"
      >
        + Ajouter une dépense hypothétique
      </button>
    </div>
  )
}
