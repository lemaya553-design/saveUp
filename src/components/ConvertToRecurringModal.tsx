import { useState } from 'react'
import { Modal } from './Modal'
import { UpgradePrompt } from './UpgradePrompt'
import { formatCurrency, getTodayDateString } from '../lib/format'
import { FREQUENCY_OPTIONS, type RecurringFrequency } from '../lib/recurringExpenses'
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
    <Modal open={expense !== null} onClose={onClose} title="Convertir en récurrence">
      {expense && atLimit ? (
        <UpgradePrompt
          title={`Limite de ${maxRecurringExpenses} récurrence${maxRecurringExpenses === 1 ? '' : 's'} atteinte`}
          description="Le plan Gratuit est limité en nombre de récurrences actives. Passe à Standard pour en créer autant que tu veux."
          minPlan="standard"
        />
      ) : (
        expense && (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            <span className="font-medium text-ink">{expense.name}</span> —{' '}
            {formatCurrency(expense.amount)} deviendra une vraie transaction générée automatiquement à
            chaque échéance, et sera retirée de tes dépenses fixes.
          </p>

          <label className="flex flex-col gap-1 text-sm text-muted">
            Fréquence
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
            >
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} className="bg-surface">
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted">
            Première occurrence
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
            Date de fin (optionnel)
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
            {submitting ? 'Conversion...' : 'Convertir'}
          </button>
        </form>
        )
      )}
    </Modal>
  )
}
