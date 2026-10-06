import { getScoreExplanations, type FinancialHealthBreakdown } from '../lib/financialHealth'

const ORANGE_VIF = '#FF7A00'

export function DashboardScoreFactors({ breakdown }: { breakdown: FinancialHealthBreakdown }) {
  const factors = getScoreExplanations(breakdown)

  return (
    <ul className="flex flex-col gap-4">
      {factors.map((factor) => {
        const pct = factor.max > 0 ? Math.min(100, (factor.value / factor.max) * 100) : 0
        return (
          <li key={factor.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-ink">{factor.label}</span>
              <span className="shrink-0 text-xs text-muted">
                {factor.value}/{factor.max}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-overlay/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: ORANGE_VIF }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted">{factor.detail}</p>
          </li>
        )
      })}
    </ul>
  )
}
