import { useMemo, useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { useWorkHours } from '../hooks/useWorkHours'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { BUDGET } from '../lib/i18n/budget'
import { COMMON } from '../lib/i18n/common'
import type { Lang } from '../lib/i18n/language'
import type { Expense } from '../hooks/useExpenses'

const COLLAPSED_COUNT = 5

function EditRow({
  expense,
  lang,
  onSave,
  onCancel,
}: {
  expense: Expense
  lang: Lang
  onSave: (description: string, amount: number, category: string) => void
  onCancel: () => void
}) {
  const { categoryNames } = useCategories()
  const [description, setDescription] = useState(expense.description)
  const [amount, setAmount] = useState(String(expense.amount))
  const [category, setCategory] = useState(expense.category)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!description.trim() || !parsed || parsed <= 0) return
    onSave(description.trim(), parsed, category)
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 py-2">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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
      <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ink">
        {COMMON[lang].app.cancel}
      </button>
    </form>
  )
}

export function RecentExpenses({
  expenses,
  onUpdate,
  onRemove,
}: {
  expenses: Expense[]
  onUpdate: (id: string, description: string, amount: number, category: string) => void
  onRemove: (id: string) => void
}) {
  const { lang } = useLanguage()
  const t = BUDGET[lang].recentExpenses
  const formatMoney = useMoneyFormat()
  const workHours = useWorkHours()
  const { categoryNames } = useCategories()
  const [showAll, setShowAll] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const hasActiveFilters = search.trim() !== '' || categoryFilter !== '' || dateFrom !== '' || dateTo !== ''

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return expenses.filter((expense) => {
      if (query && !expense.description.toLowerCase().includes(query)) return false
      if (categoryFilter && expense.category !== categoryFilter) return false
      const spentAt = expense.spent_at.slice(0, 10)
      if (dateFrom && spentAt < dateFrom) return false
      if (dateTo && spentAt > dateTo) return false
      return true
    })
  }, [expenses, search, categoryFilter, dateFrom, dateTo])

  const visible = hasActiveFilters || showAll ? filtered : filtered.slice(0, COLLAPSED_COUNT)

  function clearFilters() {
    setSearch('')
    setCategoryFilter('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: 'color-mix(in srgb, var(--color-overlay) 10%, transparent)' }}
    >
      <h2 className="text-base font-semibold text-ink">{t.cardTitle}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{t.cardHint}</p>

      {expenses.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="budget-field min-w-[160px] flex-1 rounded-lg px-3 py-2 text-sm text-ink placeholder-muted"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="budget-field rounded-lg px-3 py-2 text-sm text-ink"
            >
              <option value="" className="bg-surface">
                {t.allCategories}
              </option>
              {categoryNames.map((cat) => (
                <option key={cat} value={cat} className="bg-surface">
                  {translateCategoryLabel(cat, lang)}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs text-muted">
              {t.from}
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="budget-field rounded-lg px-2 py-2 text-sm text-ink"
              />
            </label>
            <label className="flex items-center gap-1 text-xs text-muted">
              {t.to}
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="budget-field rounded-lg px-2 py-2 text-sm text-ink"
              />
            </label>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="budget-action-link -mx-2 -my-1 rounded-md px-2 py-1 text-sm"
              >
                {t.clearFilters}
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted">{t.noMatch}</p>
          ) : (
            <ul className="divide-y divide-overlay/10">
              {visible.map((expense) => {
                const hoursLabel = workHours(expense.amount)
                return editingId === expense.id ? (
                  <li key={expense.id}>
                    <EditRow
                      expense={expense}
                      lang={lang}
                      onCancel={() => setEditingId(null)}
                      onSave={(description, amount, category) => {
                        onUpdate(expense.id, description, amount, category)
                        setEditingId(null)
                      }}
                    />
                  </li>
                ) : (
                  <li key={expense.id} className="flex flex-wrap items-center justify-between gap-y-1 py-2">
                    <div>
                      <p className="text-ink">{expense.description}</p>
                      <p className="text-xs text-muted">
                        {new Date(expense.spent_at).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        · {translateCategoryLabel(expense.category, lang)}
                        {expense.account && (
                          <span className="ml-1.5 rounded-full bg-overlay/5 px-1.5 py-0.5 text-muted">
                            {expense.account}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="mr-2 flex flex-col items-end">
                        <span className="font-medium text-ink">{formatMoney(expense.amount)}</span>
                        {hoursLabel && <span className="text-[10px] leading-tight text-muted">{hoursLabel}</span>}
                      </div>
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
                        aria-label={t.deleteAria(expense.description)}
                      >
                        {COMMON[lang].app.delete}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {!hasActiveFilters && filtered.length > COLLAPSED_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="budget-action-link -mx-2 mt-3 rounded-md px-2 py-1.5 text-sm"
            >
              {showAll ? t.collapse : t.showAll(filtered.length)}
            </button>
          )}
        </>
      )}
    </section>
  )
}
