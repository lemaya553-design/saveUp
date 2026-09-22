import { useMemo, useState } from 'react'
import { Card } from './Card'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { useCustomKeywords } from '../hooks/useCustomKeywords'
import { useRecurringExpenses } from '../hooks/useRecurringExpenses'
import { useLanguage } from '../hooks/useLanguage'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { BUDGET } from '../lib/i18n/budget'
import { FALLBACK_CATEGORY } from '../lib/categories'
import { pickCategory } from '../lib/importParsing'

// Recurring rules currently classified as the fallback category, for which
// the merchant-keyword dictionary can guess a real one — a per-row review
// list (never a silent bulk pass like the one-off button below) because a
// recurring item carries a choice the button's one-off equivalent doesn't
// have: apply the new category to occurrences already generated (past
// transactions) or only to occurrences not yet generated (future). That
// choice belongs to the user, every time — this list makes it explicit.
function RecurringRecategorizeSuggestions() {
  const { lang } = useLanguage()
  const t = BUDGET[lang].recategorizeCard.recurring
  const dismissLabel = BUDGET[lang].categorySuggestions.ignore
  const categories = useCategories()
  const recurring = useRecurringExpenses()
  const customKeywords = useCustomKeywords()
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const suggestions = useMemo(() => {
    return recurring.rules
      .filter((rule) => rule.category === FALLBACK_CATEGORY && !dismissedIds.has(rule.id))
      .map((rule) => ({
        rule,
        guessedCategory: pickCategory(
          undefined,
          rule.description,
          categories.categoryNames,
          FALLBACK_CATEGORY,
          customKeywords.keywords,
        ).category,
      }))
      .filter((s) => s.guessedCategory !== FALLBACK_CATEGORY)
  }, [recurring.rules, categories.categoryNames, customKeywords.keywords, dismissedIds])

  // No manual dismiss-on-success here: updateRecurringExpense reloads
  // `recurring.rules` internally, and a successful write moves this rule's
  // own `category` off the fallback value — it drops out of `suggestions`
  // on its own on the next render. On failure the rule is untouched, so it
  // correctly stays in the list with `recurring.error` now set for
  // RecategorizeCard to show.
  async function apply(ruleId: string, guessedCategory: string, applyToPast: boolean) {
    const rule = recurring.rules.find((r) => r.id === ruleId)
    if (!rule) return
    setApplyingId(ruleId)
    await recurring.updateRecurringExpense(
      ruleId,
      { description: rule.description, amount: rule.amount, category: guessedCategory },
      applyToPast,
    )
    setApplyingId(null)
  }

  if (suggestions.length === 0 && !recurring.error) return null

  return (
    <div className="mt-6 border-t border-overlay/10 pt-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">{t.sectionTitle}</p>
      {recurring.error && <p className="mb-3 text-sm text-red-400">{recurring.error}</p>}
      <ul className="flex flex-col gap-3">
        {suggestions.map(({ rule, guessedCategory }) => {
          const isApplying = applyingId === rule.id
          return (
            <li key={rule.id} className="rounded-lg border border-overlay/10 bg-overlay/5 p-3">
              <p className="text-sm text-ink">{t.itemLabel(rule.description, translateCategoryLabel(guessedCategory, lang))}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => apply(rule.id, guessedCategory, false)}
                  disabled={isApplying}
                  className="rounded-lg bg-primary-strong px-3 py-1.5 text-xs font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {isApplying ? t.applying : t.applyFutureOnly}
                </button>
                <button
                  type="button"
                  onClick={() => apply(rule.id, guessedCategory, true)}
                  disabled={isApplying}
                  className="rounded-lg border border-overlay/10 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
                >
                  {isApplying ? t.applying : t.applyAll}
                </button>
                <button
                  type="button"
                  onClick={() => setDismissedIds((prev) => new Set(prev).add(rule.id))}
                  disabled={isApplying}
                  className="text-xs text-muted hover:text-ink disabled:opacity-60"
                >
                  {dismissLabel}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

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

      <RecurringRecategorizeSuggestions />
    </Card>
  )
}
