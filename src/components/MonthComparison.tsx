import { formatCurrency } from '../lib/format'

export function MonthComparison({
  currentAmount,
  previousAmount,
  previousLabel,
}: {
  currentAmount: number
  previousAmount: number
  previousLabel: string
}) {
  const hasPreviousData = previousAmount > 0
  const maxAmount = Math.max(currentAmount, previousAmount, 1)
  const currentPct = (currentAmount / maxAmount) * 100
  const previousPct = (previousAmount / maxAmount) * 100

  const spentLess = currentAmount < previousAmount
  const pctChange = hasPreviousData
    ? Math.round((Math.abs(currentAmount - previousAmount) / previousAmount) * 100)
    : null

  return (
    <div className="glass rounded-2xl p-5 shadow-lg shadow-black/30">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Ce mois vs le mois passé</h2>
          <p className="mt-1 text-xs text-muted">Combien tu as dépensé, comparé au mois précédent.</p>
        </div>
        {hasPreviousData && pctChange !== null && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              spentLess ? 'bg-success/15 text-success' : 'bg-red-400/15 text-red-400'
            }`}
          >
            <span aria-hidden="true">{spentLess ? '↓' : '↑'}</span>
            {pctChange}%
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted">Ce mois-ci</span>
            <span className="font-medium text-ink">{formatCurrency(currentAmount)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${currentPct}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted capitalize">{previousLabel}</span>
            <span className="text-muted">
              {hasPreviousData ? formatCurrency(previousAmount) : 'Pas de données'}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white/30 transition-all"
              style={{ width: `${previousPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
