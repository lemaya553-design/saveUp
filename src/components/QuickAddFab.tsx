import { useMemo, useState } from 'react'
import { Modal } from './Modal'
import { UpgradePrompt } from './UpgradePrompt'
import { useToast } from './ToastProvider'
import { useExpenses } from '../hooks/useExpenses'
import { useCategories } from '../hooks/useCategories'
import { useRecurringExpenses } from '../hooks/useRecurringExpenses'
import { useSubscription } from '../hooks/useSubscription'
import { formatCurrency, getTodayDateString } from '../lib/format'
import { FALLBACK_CATEGORY } from '../lib/categories'
import { FREQUENCY_OPTIONS, type RecurringFrequency } from '../lib/recurringExpenses'

function PlusIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

interface FrequentExpense {
  description: string
  amount: number
  category: string
  count: number
}

// The 2-3 descriptions logged most often recently, so a repeat expense
// (coffee, a subscription) can be re-logged in one tap instead of retyping
// it. Requires at least 2 occurrences to count as "frequent."
function getFrequentExpenses(
  expenses: { description: string; amount: number; category: string }[],
): FrequentExpense[] {
  const groups = new Map<string, FrequentExpense>()
  for (const e of expenses) {
    const key = e.description.trim().toLowerCase()
    if (!key) continue
    const existing = groups.get(key)
    if (existing) {
      existing.count += 1
    } else {
      groups.set(key, { description: e.description, amount: e.amount, category: e.category, count: 1 })
    }
  }
  return [...groups.values()]
    .filter((g) => g.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
}

export function QuickAddFab() {
  const { expenses, addExpense } = useExpenses()
  const { categoryNames } = useCategories()
  const recurring = useRecurringExpenses()
  const subscription = useSubscription()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>(FALLBACK_CATEGORY)
  const [submitting, setSubmitting] = useState(false)

  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly')
  const [startDate, setStartDate] = useState(getTodayDateString())
  const [hasEndDate, setHasEndDate] = useState(false)
  const [endDate, setEndDate] = useState('')

  const frequentExpenses = useMemo(() => getFrequentExpenses(expenses), [expenses])

  const atRecurringLimit =
    subscription.limits.maxRecurringExpenses !== null &&
    recurring.rules.length >= subscription.limits.maxRecurringExpenses

  function closeAndReset() {
    setOpen(false)
    setDescription('')
    setAmount('')
    setIsRecurring(false)
    setFrequency('monthly')
    setStartDate(getTodayDateString())
    setHasEndDate(false)
    setEndDate('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!description.trim() || !parsed || parsed <= 0) return
    if (isRecurring && !startDate) return
    setSubmitting(true)
    const label = description.trim()
    if (isRecurring) {
      const ok = await recurring.addRecurringExpense(
        label,
        parsed,
        category,
        frequency,
        startDate,
        hasEndDate && endDate ? endDate : null,
      )
      setSubmitting(false)
      if (!ok) return
      closeAndReset()
      showToast(`Récurrence créée : ${label} — ${formatCurrency(parsed)}`)
      return
    }
    await addExpense(label, parsed, category)
    setSubmitting(false)
    closeAndReset()
    showToast(`Dépense ajoutée : ${label} — ${formatCurrency(parsed)}`)
  }

  async function logFrequent(item: FrequentExpense) {
    setSubmitting(true)
    await addExpense(item.description, item.amount, item.category)
    setSubmitting(false)
    setOpen(false)
    showToast(`Dépense ajoutée : ${item.description} — ${formatCurrency(item.amount)}`)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-strong text-white shadow-lg shadow-black/40 transition-all hover:brightness-110"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        aria-label="Ajouter une dépense"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      <Modal open={open} onClose={closeAndReset} title="Ajoute une dépense">
        {frequentExpenses.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs text-muted">Dépenses fréquentes</p>
            <div className="flex flex-wrap gap-2">
              {frequentExpenses.map((item) => (
                <button
                  key={item.description}
                  type="button"
                  onClick={() => logFrequent(item)}
                  disabled={submitting}
                  className="rounded-full border border-overlay/10 bg-overlay/5 px-3 py-2 text-sm text-ink transition-colors hover:border-primary/40 disabled:opacity-60"
                >
                  {item.description} · {formatCurrency(item.amount)}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (ex: Café)"
            autoFocus
            className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Montant"
              className="flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
            >
              {categoryNames.map((cat) => (
                <option key={cat} value={cat} className="bg-surface">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {atRecurringLimit && !isRecurring ? (
            <UpgradePrompt
              title={`Limite de ${subscription.limits.maxRecurringExpenses} récurrence${subscription.limits.maxRecurringExpenses === 1 ? '' : 's'} atteinte`}
              description="Passe à Standard pour créer des récurrences illimitées."
              minPlan="standard"
            />
          ) : (
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              🔁 Rendre récurrente
            </label>
          )}

          {isRecurring && (
            <div className="flex flex-col gap-3 rounded-lg border border-overlay/10 bg-overlay/[0.03] p-3">
              <label className="flex flex-col gap-1 text-xs text-muted">
                Fréquence
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                  className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                >
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value} className="bg-surface">
                      {f.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs text-muted">
                Première occurrence
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </label>
              {/* A past date is allowed on purpose — catch-up generation
                  backfills every missed occurrence up to today in one pass,
                  which is exactly what you want if you're only now setting
                  up tracking for something you've paid for a while. */}

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
                  className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-strong px-5 py-2.5 font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? 'Ajout...' : isRecurring ? 'Créer la récurrence' : 'Ajouter'}
          </button>
        </form>
      </Modal>
    </>
  )
}
