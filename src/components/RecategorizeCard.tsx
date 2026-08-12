import { useState } from 'react'
import { Card } from './Card'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { useCustomKeywords } from '../hooks/useCustomKeywords'

// Self-contained (own hook instances, like CategorySuggestions) so it can be
// dropped into any page — currently Paramètres and Statistiques — without
// wiring anything from the parent. Both instances stay in sync via the
// existing expenses-changed/categories-changed event bus each hook already
// listens to.
export function RecategorizeCard() {
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
    <Card
      title="Recatégorisation automatique"
      hint="Ré-essaie de deviner la catégorie de tes dépenses classées « Autre », à partir du nom du commerçant."
    >
      <button
        type="button"
        onClick={handleRecategorize}
        disabled={recategorizing || categories.loading}
        className="rounded-lg bg-primary-strong px-5 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
      >
        {recategorizing ? 'Recatégorisation en cours...' : 'Recatégoriser mes dépenses existantes'}
      </button>

      {recategorizeResult && (
        <>
          <p className={`mt-3 text-sm ${recategorizeResult.error ? 'text-red-400' : 'text-success'}`}>
            {recategorizeResult.error
              ? `Une erreur est survenue : ${recategorizeResult.error}`
              : recategorizeResult.checked === 0
                ? "Aucune dépense classée « Autre » à recatégoriser."
                : `${recategorizeResult.updated} transaction${recategorizeResult.updated > 1 ? 's' : ''} recatégorisée${recategorizeResult.updated > 1 ? 's' : ''} sur ${recategorizeResult.checked}.`}
          </p>

          {recategorizeResult.sample.length > 0 && (
            <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Aperçu de ce qui a été vérifié
              </p>
              <ul className="space-y-1.5 text-xs">
                {recategorizeResult.sample.map((s, i) => (
                  <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <span className="min-w-0 flex-1 truncate text-ink">{s.description}</span>
                    <span className={s.guessedCategory ? 'text-success' : 'text-muted'}>
                      {s.guessedCategory ?? 'aucune correspondance'}
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
