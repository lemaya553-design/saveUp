import { useState } from 'react'
import { Card } from './Card'
import { UpgradePrompt } from './UpgradePrompt'
import { getTodayDateString } from '../lib/format'
import { useCategories } from '../hooks/useCategories'
import { useCustomKeywords } from '../hooks/useCustomKeywords'
import { useCategorySuggestion } from '../hooks/useCategorySuggestion'
import { useSubscription } from '../hooks/useSubscription'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { BUDGET } from '../lib/i18n/budget'
import { COMMON } from '../lib/i18n/common'
import type { Lang } from '../lib/i18n/language'
import {
  getFrequencyOptions,
  computeUpcomingOccurrencesInMonth,
  frequencyLabel,
  isRecurringExpenseEnded,
  type RecurringExpense,
  type RecurringFrequency,
} from '../lib/recurringExpenses'

function EditRow({
  rule,
  lang,
  onSave,
  onCancel,
}: {
  rule: RecurringExpense
  lang: Lang
  onSave: (
    fields: { description: string; amount: number; category: string },
    applyToPast: boolean,
  ) => void
  onCancel: () => void
}) {
  const t = BUDGET[lang].recurringExpenses
  const { categoryNames } = useCategories()
  const [description, setDescription] = useState(rule.description)
  const [amount, setAmount] = useState(String(rule.amount))
  const [category, setCategory] = useState(rule.category)
  const [applyToPast, setApplyToPast] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!description.trim() || !parsed || parsed <= 0) return
    onSave({ description: description.trim(), amount: parsed, category }, applyToPast)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-w-[120px] flex-1 rounded-lg budget-field px-3 py-1.5 text-sm text-ink"
        />
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24 rounded-lg budget-field px-3 py-1.5 text-sm text-ink"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg budget-field px-3 py-1.5 text-sm text-ink"
        >
          {categoryNames.map((cat) => (
            <option key={cat} value={cat} className="bg-surface">
              {translateCategoryLabel(cat, lang)}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={applyToPast}
          onChange={(e) => setApplyToPast(e.target.checked)}
          className="h-4 w-4 accent-[#FF7A00]"
        />
        {t.applyToPast}
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg budget-btn-primary px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
        >
          {COMMON[lang].app.save}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ink">
          {COMMON[lang].app.cancel}
        </button>
      </div>
    </form>
  )
}

function AddForm({
  lang,
  onAdd,
}: {
  lang: Lang
  onAdd: (
    description: string,
    amount: number,
    category: string,
    frequency: RecurringFrequency,
    startDate: string,
    endDate: string | null,
  ) => Promise<boolean>
}) {
  const t = BUDGET[lang].recurringExpenses
  const ct = COMMON[lang].categorySuggestion
  const { categoryNames, addCategory } = useCategories()
  const { keywords: customKeywords } = useCustomKeywords()
  const subscription = useSubscription()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly')
  const [startDate, setStartDate] = useState(getTodayDateString())
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const categoryField = useCategorySuggestion(
    description,
    categoryNames,
    customKeywords,
    lang,
    addCategory,
    subscription.limits.maxCategories,
  )

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!description.trim() || !parsed || parsed <= 0 || !startDate || submitting) return
    setSubmitting(true)
    const category = await categoryField.resolveCategoryForSubmit()
    const ok = await onAdd(
      description.trim(),
      parsed,
      category,
      frequency,
      startDate,
      hasEndDate && endDate ? endDate : null,
    )
    setSubmitting(false)
    if (ok) {
      setDescription('')
      setAmount('')
      setHasEndDate(false)
      setEndDate('')
      categoryField.reset()
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.namePlaceholder}
          className="min-w-[140px] flex-1 rounded-lg budget-field px-3 py-2 text-ink placeholder-muted"
        />
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t.amountPlaceholder}
          className="w-28 rounded-lg budget-field px-3 py-2 text-ink placeholder-muted"
        />
        <select
          value={categoryField.category}
          onChange={(e) => categoryField.setCategory(e.target.value)}
          className="rounded-lg budget-field px-3 py-2 text-ink"
        >
          {categoryNames.map((cat) => (
            <option key={cat} value={cat} className="bg-surface">
              {translateCategoryLabel(cat, lang)}
            </option>
          ))}
        </select>
      </div>

      {categoryField.suggestedCategory && !categoryField.categoryTouched && (
        <p className="-mt-1 text-xs text-muted">{ct.suggestedHint}</p>
      )}
      {categoryField.newCategorySuggestion && !categoryField.categoryTouched && (
        <p className="-mt-1 text-xs text-muted">{ct.newCategoryHint(categoryField.newCategorySuggestion.displayName)}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
          className="rounded-lg budget-field px-3 py-2 text-sm text-ink"
        >
          {getFrequencyOptions(lang).map((f) => (
            <option key={f.value} value={f.value} className="bg-surface">
              {f.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-muted">
          {t.firstOccurrence}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg budget-field px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={hasEndDate}
          onChange={(e) => setHasEndDate(e.target.checked)}
          className="h-4 w-4 accent-[#FF7A00]"
        />
        {t.endDateLabel}
      </label>
      {hasEndDate && (
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate}
          className="w-fit rounded-lg budget-field px-3 py-2 text-sm text-ink"
        />
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-lg budget-btn-primary px-4 py-2 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
      >
        {submitting ? t.creating : t.createButton}
      </button>
    </form>
  )
}

export function RecurringExpenses({
  rules,
  atLimit,
  maxRecurringExpenses,
  onAdd,
  onUpdate,
  onRemove,
}: {
  rules: RecurringExpense[]
  atLimit: boolean
  maxRecurringExpenses: number | null
  onAdd: (
    description: string,
    amount: number,
    category: string,
    frequency: RecurringFrequency,
    startDate: string,
    endDate: string | null,
  ) => Promise<boolean>
  onUpdate: (
    id: string,
    fields: { description: string; amount: number; category: string },
    applyToPast: boolean,
  ) => void
  onRemove: (id: string) => void
}) {
  const { lang } = useLanguage()
  const t = BUDGET[lang].recurringExpenses
  const formatMoney = useMoneyFormat()
  const [editingId, setEditingId] = useState<string | null>(null)
  const now = new Date()

  return (
    <Card title={t.cardTitle} hint={t.cardHint}>
      <ul className="mb-4 divide-y divide-overlay/10">
        {rules.length === 0 && <li className="py-2 text-sm text-muted">{t.empty}</li>}
        {rules.map((rule) => {
          const ended = isRecurringExpenseEnded(rule)
          const upcoming = ended ? [] : computeUpcomingOccurrencesInMonth(rule, now)

          return editingId === rule.id ? (
            <li key={rule.id}>
              <EditRow
                rule={rule}
                lang={lang}
                onCancel={() => setEditingId(null)}
                onSave={(fields, applyToPast) => {
                  onUpdate(rule.id, fields, applyToPast)
                  setEditingId(null)
                }}
              />
            </li>
          ) : (
            <li key={rule.id} className="flex flex-wrap items-center justify-between gap-y-1 py-2">
              <div>
                <span className="text-ink">{rule.description}</span>
                <span className="ml-2 text-xs text-muted">{translateCategoryLabel(rule.category, lang)}</span>
                <p className="text-xs text-muted">
                  {frequencyLabel(rule.frequency, lang)}
                  {ended ? ` · ${t.ended}` : upcoming.length > 0 ? ` · ${t.upcomingCount(upcoming.length)}` : ` · ${t.noneUpcoming}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="mr-2 font-medium text-ink">{formatMoney(rule.amount)}</span>
                <button
                  type="button"
                  onClick={() => setEditingId(rule.id)}
                  className="rounded-md px-2 py-1.5 text-sm budget-action-link"
                >
                  {COMMON[lang].app.modify}
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(rule.id)}
                  className="rounded-md px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  aria-label={t.deleteAria(rule.description)}
                >
                  {COMMON[lang].app.delete}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {atLimit ? (
        <UpgradePrompt
          title={t.limitReached(maxRecurringExpenses ?? 0)}
          description={t.limitDescription}
          variantClassName="border-[#FF7A00]/30 bg-[#FF7A00]/10"
          linkClassName="text-[#FF7A00] hover:opacity-80"
          minPlan="standard"
        />
      ) : (
        <AddForm lang={lang} onAdd={onAdd} />
      )}
    </Card>
  )
}
