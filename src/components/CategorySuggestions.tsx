import { useEffect, useMemo, useState } from 'react'
import { Card } from './Card'
import { UpgradePrompt } from './UpgradePrompt'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { useCustomKeywords } from '../hooks/useCustomKeywords'
import { useSubscription } from '../hooks/useSubscription'
import { useLanguage } from '../hooks/useLanguage'
import { BUDGET } from '../lib/i18n/budget'
import { COMMON } from '../lib/i18n/common'
import { detectCategorySuggestions, type CategorySuggestion } from '../lib/categorySuggestions'

// 3+ transactions from the same (or same-concept) merchant is enough to be
// worth a category of its own without being noisy for an account with only
// a handful of stray "Autre" transactions.
const SUGGESTION_THRESHOLD = 3

export function CategorySuggestions() {
  const { lang } = useLanguage()
  const t = BUDGET[lang].categorySuggestions
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
    () => detectCategorySuggestions(rows, categories.categoryNames, lang, SUGGESTION_THRESHOLD),
    [rows, categories.categoryNames, lang],
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
      setConfirmError(t.limitErrorMessage(subscription.limits.maxCategories ?? 0))
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
    <Card title={t.cardTitle} hint={t.cardHint}>
      {confirmError && <p className="mb-3 text-sm text-red-400">{confirmError}</p>}
      {atCategoryLimit && (
        <div className="mb-3">
          <UpgradePrompt
            title={t.limitReached(subscription.limits.maxCategories ?? 0)}
            description={t.limitDescription}
            minPlan="standard"
          />
        </div>
      )}
      <ul className="flex flex-col gap-4">
        {visible.map((suggestion) => (
          <li key={suggestion.id} className="rounded-lg border border-overlay/10 bg-overlay/5 p-3">
            <p className="text-sm text-ink">
              {t.detectedPrefix} <span className="font-semibold">{t.detectedCount(suggestion.count)}</span>{' '}
              {t.detectedAt} <span className="font-semibold">{suggestion.merchantLabel}</span> {t.detectedSuffix}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={nameFor(suggestion)}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [suggestion.id]: e.target.value }))}
                className="min-w-[10rem] flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
                aria-label={t.nameAriaLabel}
              />
              <button
                type="button"
                onClick={() => confirm(suggestion)}
                disabled={confirmingId === suggestion.id || !nameFor(suggestion).trim()}
                className="rounded-lg bg-primary-strong px-4 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
              >
                {confirmingId === suggestion.id ? t.creating : COMMON[lang].app.confirm}
              </button>
              <button
                type="button"
                onClick={() => dismiss(suggestion.id)}
                disabled={confirmingId === suggestion.id}
                className="text-sm text-muted hover:text-ink disabled:opacity-60"
              >
                {t.ignore}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
