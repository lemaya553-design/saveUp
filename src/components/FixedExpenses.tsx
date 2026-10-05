import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useCustomKeywords } from '../hooks/useCustomKeywords'
import { useCategorySuggestion } from '../hooks/useCategorySuggestion'
import { useSubscription } from '../hooks/useSubscription'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { budgetColorForCategory } from '../lib/budgetChartColors'
import { BUDGET } from '../lib/i18n/budget'
import { COMMON } from '../lib/i18n/common'
import type { Lang } from '../lib/i18n/language'
import type { FixedExpense } from '../hooks/useFixedExpenses'

const CARD_BORDER = 'color-mix(in srgb, var(--color-overlay) 10%, transparent)'

function RepeatIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h13l-3-3m3 3-3 3M20 17H7l3 3m-3-3 3-3" />
    </svg>
  )
}

function EditRow({
  expense,
  lang,
  onSave,
  onCancel,
}: {
  expense: FixedExpense
  lang: Lang
  onSave: (name: string, amount: number, category: string) => void
  onCancel: () => void
}) {
  const { categoryNames } = useCategories()
  const [name, setName] = useState(expense.name)
  const [amount, setAmount] = useState(String(expense.amount))
  const [category, setCategory] = useState(expense.category)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!name.trim() || !parsed || parsed <= 0) return
    onSave(name.trim(), parsed, category)
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 py-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="budget-field min-w-[120px] flex-1 rounded-lg px-3 py-1.5 text-sm text-ink"
      />
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="budget-field w-24 rounded-lg px-3 py-1.5 text-sm text-ink"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="budget-field rounded-lg px-3 py-1.5 text-sm text-ink"
      >
        {categoryNames.map((cat) => (
          <option key={cat} value={cat} className="bg-surface">
            {translateCategoryLabel(cat, lang)}
          </option>
        ))}
      </select>
      <button type="submit" className="budget-btn-primary rounded-lg px-3 py-1.5 text-sm font-medium transition-all">
        {COMMON[lang].app.save}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-muted hover:text-ink"
      >
        {COMMON[lang].app.cancel}
      </button>
    </form>
  )
}

export function FixedExpenses({
  expenses,
  total,
  onAdd,
  onUpdate,
  onRemove,
  onConvertToRecurring,
}: {
  expenses: FixedExpense[]
  total: number
  onAdd: (name: string, amount: number, category: string) => Promise<void>
  onUpdate: (id: string, name: string, amount: number, category: string) => void
  onRemove: (id: string) => void
  onConvertToRecurring?: (expense: FixedExpense) => void
}) {
  const { lang } = useLanguage()
  const t = BUDGET[lang].fixedExpenses
  const ct = COMMON[lang].categorySuggestion
  const formatMoney = useMoneyFormat()
  const { categoryNames, addCategory } = useCategories()
  const { keywords: customKeywords } = useCustomKeywords()
  const subscription = useSubscription()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const categoryField = useCategorySuggestion(
    name,
    categoryNames,
    customKeywords,
    lang,
    addCategory,
    subscription.limits.maxCategories,
  )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!name.trim() || !parsed || parsed <= 0 || submitting) return
    setSubmitting(true)
    const category = await categoryField.resolveCategoryForSubmit()
    await onAdd(name.trim(), parsed, category)
    setSubmitting(false)
    setName('')
    setAmount('')
    categoryField.reset()
  }

  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: CARD_BORDER }}
    >
      <h2 className="text-base font-semibold text-ink">{t.cardTitle}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{t.cardHint}</p>

      <ul className="mb-4 divide-y divide-overlay/10">
        {expenses.length === 0 && <li className="py-2 text-sm text-muted">{t.empty}</li>}
        {expenses.map((expense) =>
          editingId === expense.id ? (
            <li key={expense.id}>
              <EditRow
                expense={expense}
                lang={lang}
                onCancel={() => setEditingId(null)}
                onSave={(newName, newAmount, newCategory) => {
                  onUpdate(expense.id, newName, newAmount, newCategory)
                  setEditingId(null)
                }}
              />
            </li>
          ) : (
            <li key={expense.id} className="flex flex-wrap items-center justify-between gap-y-1 py-2.5">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: budgetColorForCategory(expense.category) }}
                />
                <RepeatIcon className="h-4 w-4 shrink-0 text-muted" />
                <div>
                  <span className="text-ink">{expense.name}</span>
                  <span className="ml-2 text-xs text-muted">{translateCategoryLabel(expense.category, lang)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="mr-2 font-medium text-ink">{formatMoney(expense.amount)}</span>
                {onConvertToRecurring && (
                  <button
                    type="button"
                    onClick={() => onConvertToRecurring(expense)}
                    className="budget-action-link rounded-md px-2 py-1.5 text-sm"
                    title={t.recurringButtonTitle}
                  >
                    {t.recurringButton}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingId(expense.id)}
                  className="budget-action-link rounded-md px-2 py-1.5 text-sm"
                >
                  {COMMON[lang].app.modify}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(expense.id)}
                  className="rounded-md px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  aria-label={t.deleteAria(expense.name)}
                >
                  {COMMON[lang].app.delete}
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      <form onSubmit={submit} className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="budget-field min-w-[140px] flex-1 rounded-lg px-3 py-2 text-ink placeholder-muted"
          />
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={t.amountPlaceholder}
            className="budget-field w-28 rounded-lg px-3 py-2 text-ink placeholder-muted"
          />
          <select
            value={categoryField.category}
            onChange={(e) => categoryField.setCategory(e.target.value)}
            className="budget-field rounded-lg px-3 py-2 text-ink"
          >
            {categoryNames.map((cat) => (
              <option key={cat} value={cat} className="bg-surface">
                {translateCategoryLabel(cat, lang)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="budget-btn-primary rounded-lg px-4 py-2 font-medium transition-all disabled:opacity-60"
          >
            {submitting ? t.adding : COMMON[lang].app.add}
          </button>
        </div>

        {categoryField.suggestedCategory && !categoryField.categoryTouched && (
          <p className="text-xs text-muted">{ct.suggestedHint}</p>
        )}
        {categoryField.newCategorySuggestion && !categoryField.categoryTouched && (
          <p className="text-xs text-muted">{ct.newCategoryHint(categoryField.newCategorySuggestion.displayName)}</p>
        )}
      </form>

      <p className="mt-4 text-sm text-muted">
        {t.total} <span className="font-semibold text-ink">{formatMoney(total)}</span>
      </p>
    </section>
  )
}
