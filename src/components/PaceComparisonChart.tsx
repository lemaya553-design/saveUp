import { formatCurrency } from '../lib/format'

export interface PaceComparisonEntry {
  id: string
  name: string
  monthlyRate: number
  requiredPerMonth: number
  isAhead: boolean
}

// Each goal gets its own row, scaled to its OWN larger value (not a shared
// scale across goals) — the point of this chart is "actuel vs nécessaire
// FOR THIS goal", not "which goal needs the most money", so a small goal's
// bars stay just as readable as a big one's.
export function PaceComparisonChart({ entries }: { entries: PaceComparisonEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted">
        Ajoute une échéance à un objectif pour voir son rythme actuel comparé à ce qu'il faudrait.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {entries.map((entry) => {
        const max = Math.max(entry.monthlyRate, entry.requiredPerMonth, 1)
        const actualPct = (entry.monthlyRate / max) * 100
        const requiredPct = (entry.requiredPerMonth / max) * 100

        return (
          <div key={entry.id}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">{entry.name}</span>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  entry.isAhead ? 'bg-success/15 text-success' : 'bg-red-400/15 text-red-400'
                }`}
              >
                {entry.isAhead ? '↑ En avance' : '↓ En retard'}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[11px] text-muted">Actuel</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-overlay/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${actualPct}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-xs font-medium text-ink">
                  {formatCurrency(entry.monthlyRate)}/mois
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[11px] text-muted">Nécessaire</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-overlay/10">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${requiredPct}%` }}
                  />
                </div>
                <span className="w-24 shrink-0 text-right text-xs font-medium text-ink">
                  {formatCurrency(entry.requiredPerMonth)}/mois
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
