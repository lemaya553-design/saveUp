import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { BUDGET } from '../lib/i18n/budget'
import type { CategoryTotal } from '../lib/budgetInsights'

export function CategoryBreakdown({ categories }: { categories: CategoryTotal[] }) {
  const { lang } = useLanguage()
  const formatMoney = useMoneyFormat()
  if (categories.length === 0) {
    return <p className="text-sm text-muted">{BUDGET[lang].categoryBreakdown.empty}</p>
  }

  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <div key={cat.category}>
          <div className="mb-0.5 flex items-center justify-between text-sm">
            <span className="text-ink">{translateCategoryLabel(cat.category, lang)}</span>
            <span className="text-muted">
              {formatMoney(cat.amount)} · {Math.round(cat.pct)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-overlay/10">
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
