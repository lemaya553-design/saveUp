import { useState } from 'react'
import { Card } from './Card'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { useCustomKeywords } from '../hooks/useCustomKeywords'
import { useLanguage } from '../hooks/useLanguage'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { BUDGET } from '../lib/i18n/budget'
import { FALLBACK_CATEGORY } from '../lib/categories'

// Self-contained (own hook instances, like CategorySuggestions) so it can be
// dropped into any page — currently Paramètres and Statistiques — without
// wiring anything from the parent. Both instances stay in sync via the
// existing expenses-changed/categories-changed event bus each hook already
// listens to.
export function RecategorizeCard() {
  const { lang } = useLanguage()
  const t = BUDGET[lang].recategorizeCard
  const expenses = useExpenses()
  const categories = useCategories()
  const customKeywords = useCustomKeywords()

  const [recategorizing, setRecategorizing] = useState(false)
  const [recategorizeResult, setRecategorizeResult] = useState<{
    checked: number
    updated: number
    error: string | null
    sample: { description: string; guessedCategory: string | null }[]
  } | null>(null)

  async function handleRecategorize() {
    setRecategorizing(true)
    setRecategorizeResult(null)
    const result = await expenses.recategorizeExpenses(categories.categoryNames, customKeywords.keywords)
    setRecategorizing(false)
    setRecategorizeResult(result)
  }

  return (
    <Card title={t.cardTitle} hint={t.cardHint}>
      <button
        type="button"
        onClick={handleRecategorize}
        disabled={recategorizing || categories.loading}
        className="rounded-lg bg-primary-strong px-5 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
      >
        {recategorizing ? t.running : t.button}
      </button>

      {recategorizeResult && (
        <>
          <p className={`mt-3 text-sm ${recategorizeResult.error ? 'text-red-400' : 'text-success'}`}>
            {recategorizeResult.error
              ? t.errorPrefix(recategorizeResult.error)
              : recategorizeResult.checked === 0
                ? t.none(translateCategoryLabel(FALLBACK_CATEGORY, lang))
                : t.result(recategorizeResult.updated, recategorizeResult.checked)}
          </p>

          {recategorizeResult.sample.length > 0 && (
            <div className="mt-3 rounded-lg border border-overlay/10 bg-overlay/5 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{t.previewTitle}</p>
              <ul className="space-y-1.5 text-xs">
                {recategorizeResult.sample.map((s, i) => (
                  <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="min-w-0 flex-1 truncate text-ink">{s.description}</span>
                    <span className={s.guessedCategory ? 'text-success' : 'text-muted'}>
                      {s.guessedCategory ? translateCategoryLabel(s.guessedCategory, lang) : t.noMatch}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
