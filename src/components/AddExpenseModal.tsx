import { useState } from 'react'
import { Modal } from './Modal'
import { useCategories } from '../hooks/useCategories'
import { useCustomKeywords } from '../hooks/useCustomKeywords'
import { useCategorySuggestion } from '../hooks/useCategorySuggestion'
import { useSubscription } from '../hooks/useSubscription'
import { useLanguage } from '../hooks/useLanguage'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { BUDGET } from '../lib/i18n/budget'
import { COMMON } from '../lib/i18n/common'

// The hero's "Ajouter une dépense" button — a second, independent entry
// point into the exact same useExpenses().addExpense call the floating +
// button (QuickAddFab) already uses, deliberately NOT wired through
// QuickAddFab itself so its own logic stays untouched.
export function AddExpenseModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (description: string, amount: number, category: string) => Promise<void>
}) {
  const { lang } = useLanguage()
  const t = BUDGET[lang].addExpenseForm
  const ct = COMMON[lang].categorySuggestion
  const { categoryNames, addCategory } = useCategories()
  const { keywords: customKeywords } = useCustomKeywords()
  const subscription = useSubscription()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const categoryField = useCategorySuggestion(
    description,
    categoryNames,
    customKeywords,
    lang,
    addCategory,
    subscription.limits.maxCategories,
  )

  function reset() {
    setDescription('')
    setAmount('')
    categoryField.reset()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!description.trim() || !parsed || parsed <= 0 || submitting) return
    setSubmitting(true)
    const category = await categoryField.resolveCategoryForSubmit()
    await onAdd(description.trim(), parsed, category)
    setSubmitting(false)
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title={t.cardTitle}
    >
      <p className="-mt-2 mb-4 text-xs text-muted">{t.cardHint}</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.descriptionPlaceholder}
          autoFocus
          className="budget-field w-full rounded-lg px-3 py-2.5 text-ink placeholder-muted"
        />
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t.amountPlaceholder}
          className="budget-field w-full rounded-lg px-3 py-2.5 text-ink placeholder-muted"
        />
        <select
          value={categoryField.category}
          onChange={(e) => categoryField.setCategory(e.target.value)}
          className="budget-field w-full rounded-lg px-3 py-2.5 text-ink"
        >
          {categoryNames.map((cat) => (
            <option key={cat} value={cat} className="bg-surface">
              {translateCategoryLabel(cat, lang)}
            </option>
          ))}
        </select>

        {categoryField.suggestedCategory && !categoryField.categoryTouched && (
          <p className="-mt-1 text-xs text-muted">{ct.suggestedHint}</p>
        )}
        {categoryField.newCategorySuggestion && !categoryField.categoryTouched && (
          <p className="-mt-1 text-xs text-muted">{ct.newCategoryHint(categoryField.newCategorySuggestion.displayName)}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="budget-btn-primary mt-1 w-full rounded-lg px-4 py-2.5 font-medium transition-all disabled:opacity-60"
        >
          {submitting ? t.adding : COMMON[lang].app.add}
        </button>
      </form>
    </Modal>
  )
}
