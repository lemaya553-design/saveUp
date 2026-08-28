import { formatCurrency } from '../lib/format'

export function ContributionsVsInterestChart({
  totalContributions,
  interestEarned,
  finalValue,
}: {
  totalContributions: number
  interestEarned: number
  finalValue: number
}) {
  if (finalValue <= 0) {
    return (
      <p className="text-sm text-muted">
        Ajoute un montant initial ou une contribution mensuelle pour voir cette répartition.
      </p>
    )
  }

  const contribPct = Math.min(100, (totalContributions / finalValue) * 100)
  const interestPct = Math.max(0, 100 - contribPct)

  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-overlay/10" role="img" aria-label={`${Math.round(contribPct)}% contributions, ${Math.round(interestPct)}% intérêts`}>
        <div className="h-full bg-primary transition-all" style={{ width: `${contribPct}%` }} />
        <div className="h-full bg-success transition-all" style={{ width: `${interestPct}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span className="text-ink">Contributions</span>
          <span className="text-muted">
            {formatCurrency(totalContributions)} · {Math.round(contribPct)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
          <span className="text-ink">Intérêts gagnés</span>
          <span className="text-muted">
            {formatCurrency(interestEarned)} · {Math.round(interestPct)}%
          </span>
        </div>
      </div>
    </div>
  )
}
