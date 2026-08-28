import { formatCurrency } from '../lib/format'
import type { CategoryMomChange } from '../lib/statistics'

export function CategoryMomList({ changes }: { changes: CategoryMomChange[] }) {
  const relevant = changes.filter((c) => c.thisMonth > 0 || c.lastMonth > 0)

  if (relevant.length === 0) {
    return <p className="text-sm text-muted">Pas encore assez de données pour comparer au mois dernier.</p>
  }

  return (
    <ul className="divide-y divide-overlay/10">
      {relevant.map((change) => (
        <li key={change.category} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span className="min-w-0 flex-1 truncate text-ink">{change.category}</span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-muted">{formatCurrency(change.thisMonth)}</span>
            {change.pctChange === null ? (
              <span className="text-xs text-muted">nouveau</span>
            ) : change.pctChange === 0 ? (
              <span className="text-xs text-muted">— 0%</span>
            ) : (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  change.pctChange > 0 ? 'text-red-400' : 'text-success'
                }`}
              >
                <span aria-hidden="true">{change.pctChange > 0 ? '↑' : '↓'}</span>
                {Math.abs(change.pctChange).toFixed(0)}%
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
