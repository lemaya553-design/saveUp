import { formatCurrency } from '../lib/format'
import type { CategoryTotal } from '../lib/budgetInsights'

export function CategoryBreakdown({ categories }: { categories: CategoryTotal[] }) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted">
        Ajoute des dépenses fixes ou quotidiennes pour voir la répartition par catégorie.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <div key={cat.category}>
          <div className="mb-0.5 flex items-center justify-between text-sm">
            <span className="text-ink">{cat.category}</span>
            <span className="text-muted">
              {formatCurrency(cat.amount)} · {Math.round(cat.pct)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${cat.colorClass}`}
              style={{ width: `${cat.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
