import { formatCurrency, formatCurrencyEN } from '../lib/format'
import { useLanguage } from '../hooks/useLanguage'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { CategoryMomChange } from '../lib/statistics'

export function CategoryMomList({ changes }: { changes: CategoryMomChange[] }) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].categoryMomList
  const formatMoney = lang === 'fr' ? formatCurrency : formatCurrencyEN
  const relevant = changes.filter((c) => c.thisMonth > 0 || c.lastMonth > 0)

  if (relevant.length === 0) {
    return <p className="text-sm text-muted">{t.empty}</p>
  }

  return (
    <ul className="divide-y divide-overlay/10">
      {relevant.map((change) => (
        <li key={change.category} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span className="min-w-0 flex-1 truncate text-ink">{translateCategoryLabel(change.category, lang)}</span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-muted">{formatMoney(change.thisMonth)}</span>
            {change.pctChange === null ? (
              <span className="text-xs text-muted">{t.new}</span>
            ) : change.pctChange === 0 ? (
              <span className="text-xs text-muted">{t.noChange}</span>
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
