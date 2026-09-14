import { formatCurrency, formatCurrencyEN } from '../lib/format'
import { useLanguage } from '../hooks/useLanguage'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { CategoryBudgetStatus } from '../lib/statistics'

// The track itself (the full-width band) IS the budget — mauve/accent, so
// "how big is the bar" already reads as "how big is my budget" before any
// fill is drawn on top. The fill on top is the actual spend: primary blue
// while comfortably under, amber approaching the limit, red past it — the
// app's established over-budget color, reused rather than inventing a new one.
function fillColorClass(status: CategoryBudgetStatus): string {
  if (status.overBudget) return 'bg-red-400'
  if (status.pctUsed >= 80) return 'bg-amber-400'
  return 'bg-primary'
}

export function BudgetVsActualChart({ statuses }: { statuses: CategoryBudgetStatus[] }) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].budgetVsActualChart
  const formatMoney = lang === 'fr' ? formatCurrency : formatCurrencyEN

  if (statuses.length === 0) {
    return <p className="text-sm text-muted">{t.empty}</p>
  }

  return (
    <div className="flex flex-col gap-5">
      {statuses.map((status) => {
        const category = translateCategoryLabel(status.category, lang)
        return (
          <div key={status.category}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="text-sm font-medium text-ink">{category}</span>
              <span className={`text-xs font-semibold ${status.overBudget ? 'text-red-400' : 'text-muted'}`}>
                {t.pctUsed(status.pctUsed)}
              </span>
            </div>

            <div
              className="relative h-4 w-full overflow-hidden rounded-full bg-accent/30"
              role="progressbar"
              aria-valuenow={Math.round(status.pctUsed)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t.ariaLabel(category, formatMoney(status.actual), formatMoney(status.budget))}
            >
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${fillColorClass(status)}`}
                style={{ width: `${Math.min(100, status.pctUsed)}%` }}
              />
            </div>

            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 text-xs text-muted">
              <span>{t.spent(formatMoney(status.actual))}</span>
              <span>{t.budget(formatMoney(status.budget))}</span>
            </div>

            {status.overBudget && (
              <p className="mt-1 text-xs text-red-400">{t.overBudget(formatMoney(status.actual - status.budget))}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
