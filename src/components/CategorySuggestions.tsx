import { useEffect, useMemo, useState } from 'react'
import { Card } from './Card'
import { UpgradePrompt } from './UpgradePrompt'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { useCustomKeywords } from '../hooks/useCustomKeywords'
import { useSubscription } from '../hooks/useSubscription'
import { detectCategorySuggestions, type CategorySuggestion } from '../lib/categorySuggestions'

// 3+ transactions from the same (or same-concept) merchant is enough to be
// worth a category of its own without being noisy for an account with only
// a handful of stray "Autre" transactions.
const SUGGESTION_THRESHOLD = 3

export function CategorySuggestions() {
  const expenses = useExpenses()
  const categories = useCategories()
  const customKeywords = useCustomKeywords()
  const subscription = useSubscription()
  const atCategoryLimit =
    subscription.limits.maxCategories !== null && categories.categories.length >= subscription.limits.maxCategories

  const [rows, setRows] = useState<{ id: string; description: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  async function loadRows() {
    setLoading(true)
    const { rows: fetched } = await expenses.fetchFallbackExpenses()
    setRows(fetched)
    setLoading(false)
  }

  // Read-only scan, safe to run automatically — detection never writes
  // anything on its own. Re-runs after a confirm so the transactions that
  // just got reassigned drop out of the next pass.
  useEffect(() => {
    loadRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const suggestions = useMemo(
    () => detectCategorySuggestions(rows, categories.categoryNames, SUGGESTION_THRESHOLD),
    [rows, categories.categoryNames],
  )
  const visible = suggestions.filter((s) => !dismissedIds.has(s.id))

  function nameFor(suggestion: CategorySuggestion): string {
    return drafts[suggestion.id] ?? suggestion.suggestedName
  }

  function dismiss(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id))
  }

  async function confirm(suggestion: CategorySuggestion) {
    const name = nameFor(suggestion).trim()
    if (!name) return

    setConfirmingId(suggestion.id)
    setConfirmError(null)

    const existing = categories.categories.find((c) => c.name.trim().toLowerCase() === name.toLowerCase())
    if (!existing && atCategoryLimit) {
      setConfirmError(
        `Limite de ${subscription.limits.maxCategories} catégories atteinte — passe à Standard pour en créer d'autres.`,
      )
      setConfirmingId(null)
      return
    }
    if (!existing) {
      await categories.addCategory(name)
    }
    const finalName = existing?.name ?? name

    const { error } = await expenses.reassignExpenses(suggestion.transactionIds, finalName)
    if (error) {
      setConfirmError(error)
      setConfirmingId(null)
      return
    }

    if (suggestion.newKeywords.length > 0) {
      await customKeywords.addKeywords(suggestion.newKeywords, finalName)
    }

    setConfirmingId(null)
    dismiss(suggestion.id)
    await loadRows()
  }

  if (loading || visible.length === 0) return null

  return (
    <Card
      title="Catégories suggérées"
      hint="Des dépenses « Autre » qui reviennent souvent — tu peux créer une catégorie pour elles en un clic, ou ignorer."
    >
      {confirmError && <p className="mb-3 text-sm text-red-400">{confirmError}</p>}
      {atCategoryLimit && (
        <div className="mb-3">
          <UpgradePrompt
            title={`Limite de ${subscription.limits.maxCategories} catégories atteinte`}
            description="Tu peux toujours réassigner vers une catégorie existante ci-dessous, mais créer une nouvelle catégorie demande de passer à Standard."
            minPlan="standard"
          />
        </div>
      )}
      <ul className="flex flex-col gap-4">
        {visible.map((suggestion) => (
          <li key={suggestion.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-sm text-ink">
              On a détecté <span className="font-semibold">{suggestion.count} dépenses</span> chez{' '}
              <span className="font-semibold">{suggestion.merchantLabel}</span> — ça ressemble à une
              catégorie à part.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={nameFor(suggestion)}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [suggestion.id]: e.target.value }))}
                className="min-w-[10rem] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
                aria-label="Nom de la catégorie suggérée"
              />
              <button
                type="button"
                onClick={() => confirm(suggestion)}
                disabled={confirmingId === suggestion.id || !nameFor(suggestion).trim()}
                className="rounded-lg bg-primary-strong px-4 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
              >
                {confirmingId === suggestion.id ? 'Création...' : 'Confirmer'}
              </button>
              <button
                type="button"
                onClick={() => dismiss(suggestion.id)}
                disabled={confirmingId === suggestion.id}
                className="text-sm text-muted hover:text-ink disabled:opacity-60"
              >
                Ignorer
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
