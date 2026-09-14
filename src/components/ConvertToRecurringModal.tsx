import { useState } from 'react'
import { Modal } from './Modal'
import { UpgradePrompt } from './UpgradePrompt'
import { getTodayDateString } from '../lib/format'
import { getFrequencyOptions, type RecurringFrequency } from '../lib/recurringExpenses'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { BUDGET } from '../lib/i18n/budget'
import type { FixedExpense } from '../hooks/useFixedExpenses'

// A fixed expense and a recurring expense are meant to be mutually
// exclusive for the same real-world cost — this is the one-click bridge
// between them, always explicit and user-initiated, never automatic. On
// success the fixed_expense row is removed, so the budget never counts the
// same cost twice (once via the fixed-expenses subtraction, once via the
// generated transaction).
export function ConvertToRecurringModal({
  expense,
  atLimit,
  maxRecurringExpenses,
  onConvert,
  onClose,
}: {
  expense: FixedExpense | null
  atLimit: boolean
  maxRecurringExpenses: number | null
  onConvert: (
    description: string,
    amount: number,
    category: string,
    frequency: RecurringFrequency,
    startDate: string,
    endDate: string | null,
  ) => Promise<boolean>
  onClose: () => void
}) {
  const { lang } = useLanguage()
  const t = BUDGET[lang].convertModal
  const formatMoney = useMoneyFormat()
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly')
  const [startDate, setStartDate] = useState(getTodayDateString())
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!expense || !startDate) return
    setSubmitting(true)
    const ok = await onConvert(
      expense.name,
      expense.amount,
      expense.category,
      frequency,
      startDate,
      hasEndDate && endDate ? endDate : null,
    )
    setSubmitting(false)
    if (ok) onClose()
  }

  return (
    <Modal open={expense !== null} onClose={onClose} title={t.title}>
      {expense && atLimit ? (
        <UpgradePrompt
          title={t.limitReached(maxRecurringExpenses ?? 0)}
          description={t.limitDescription}
          minPlan="standard"
        />
      ) : (
        expense && (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <p className="text-sm text-muted">{t.description(expense.name, formatMoney(expense.amount))}</p>

          <label className="flex flex-col gap-1 text-sm text-muted">
            {t.frequency}
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
            >
              {getFrequencyOptions(lang).map((f) => (
                <option key={f.value} value={f.value} className="bg-surface">
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted">
            {t.firstOccurrence}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={hasEndDate}
              onChange={(e) => setHasEndDate(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            {t.endDateLabel}
          </label>
          {hasEndDate && (
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
            />
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-strong px-5 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? t.converting : t.convertButton}
          </button>
        </form>
        )
      )}
    </Modal>
  )
}
