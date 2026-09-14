import { useState } from 'react'
import { Card } from './Card'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { EPARGNE } from '../lib/i18n/epargne'
import type { SavingsGoal } from '../hooks/useSavingsGoals'

export function ContributeForm({
  goals,
  onContribute,
  discretionaryBudget,
  savingsThisMonth,
}: {
  goals: SavingsGoal[]
  onContribute: (goalId: string, amount: number) => Promise<void>
  discretionaryBudget: number
  savingsThisMonth: number
}) {
  const { lang } = useLanguage()
  const t = EPARGNE[lang].contributeForm
  const formatMoney = useMoneyFormat()
  const [goalId, setGoalId] = useState(goals[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const selectedGoalId = goals.some((g) => g.id === goalId) ? goalId : goals[0]?.id
  const parsedAmount = Number(amount) || 0
  // Soft, non-blocking heads-up: this contribution alone doesn't overdraw
  // anything (there's no real "savings account" to overdraw) — it just
  // means this month's savings would eat into money that was otherwise
  // available to spend.
  const remainingBeforeThis = discretionaryBudget - savingsThisMonth
  const wouldExceedBudget = parsedAmount > 0 && parsedAmount > remainingBeforeThis

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!selectedGoalId || !parsed || parsed <= 0 || submitting) return
    setSubmitting(true)
    await onContribute(selectedGoalId, parsed)
    setSubmitting(false)
    setAmount('')
  }

  return (
    <Card title={t.title} hint={t.hint}>
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        {goals.length > 1 && (
          <select
            value={selectedGoalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id} className="bg-surface">
                {g.name}
              </option>
            ))}
          </select>
        )}
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t.amountPlaceholder}
          className="flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-success px-6 py-2 font-semibold text-canvas transition-all hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? t.submitting : t.submitButton}
        </button>
      </form>

      {wouldExceedBudget && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-accent">
          <span aria-hidden="true">⚠</span>
          <span>
            {remainingBeforeThis > 0 ? t.overBudget(formatMoney(remainingBeforeThis)) : t.budgetExhausted}{' '}
            {t.canContinueAnyway}
          </span>
        </p>
      )}
    </Card>
  )
}
