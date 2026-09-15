import { useState } from 'react'
import { Modal } from './Modal'
import { DUEL_DURATION_OPTIONS, type DuelDurationDays } from '../lib/duels'
import { useLanguage } from '../hooks/useLanguage'
import { EPARGNE } from '../lib/i18n/epargne'
import { COMMON } from '../lib/i18n/common'
import type { SavingsGoal } from '../hooks/useSavingsGoals'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function CreateDuelModal({
  open,
  onClose,
  goals,
  busyGoalIds,
  onCreate,
  onGoToObjectifs,
}: {
  open: boolean
  onClose: () => void
  goals: SavingsGoal[]
  busyGoalIds: Set<string>
  onCreate: (
    goalId: string,
    durationDays: DuelDurationDays,
    displayName: string,
    email: string,
  ) => Promise<{ error: string | null }>
  onGoToObjectifs: () => void
}) {
  const { lang } = useLanguage()
  const t = EPARGNE[lang].createDuelModal
  const availableGoals = goals.filter((g) => !busyGoalIds.has(g.id))
  const [goalId, setGoalId] = useState('')
  const [durationDays, setDurationDays] = useState<DuelDurationDays>(30)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  function reset() {
    setGoalId('')
    setDurationDays(30)
    setDisplayName('')
    setEmail('')
    setError(null)
    setSentTo(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const selectedGoalId = goalId || availableGoals[0]?.id
    if (!selectedGoalId) return
    if (!displayName.trim()) {
      setError(t.nameRequired)
      return
    }
    const trimmedEmail = email.trim()
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError(t.invalidEmailFormat)
      return
    }
    setSubmitting(true)
    setError(null)
    const { error: createError } = await onCreate(selectedGoalId, durationDays, displayName.trim(), trimmedEmail)
    setSubmitting(false)
    if (createError) {
      setError(createError)
      return
    }
    setSentTo(trimmedEmail)
  }

  return (
    <Modal open={open} onClose={handleClose} title={t.modalTitle}>
      {sentTo ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink">{t.inviteSentTo(sentTo)}</p>
          <button
            type="button"
            onClick={handleClose}
            className="self-start rounded-lg bg-primary-strong px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
          >
            {COMMON[lang].app.close}
          </button>
        </div>
      ) : goals.length === 0 ? (
        <p className="text-sm text-muted">
          {t.noGoalsAtAll.before}
          <button type="button" onClick={onGoToObjectifs} className="text-accent hover:text-accent/80">
            {t.noGoalsAtAll.linkText}
          </button>
          {t.noGoalsAtAll.after}
        </p>
      ) : availableGoals.length === 0 ? (
        <p className="text-sm text-muted">{t.allGoalsBusy}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-muted">
            {t.goalLabel}
            <select
              value={goalId || availableGoals[0].id}
              onChange={(e) => setGoalId(e.target.value)}
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
            >
              {availableGoals.map((g) => (
                <option key={g.id} value={g.id} className="bg-surface">
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{t.durationLabel}</p>
            <div className="flex gap-2">
              {DUEL_DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationDays(d)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    durationDays === d
                      ? 'bg-primary-strong text-white'
                      : 'border border-overlay/10 text-muted hover:text-ink'
                  }`}
                >
                  {t.daysOption(d)}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm text-muted">
            {t.displayNameLabel}
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.namePlaceholder}
              autoFocus
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted">
            {t.emailLabel}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
            />
          </label>

          <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2.5 text-xs text-muted">
            <p className="font-medium text-ink">{t.whatOpponentSeesTitle}</p>
            <p className="mt-1">{t.whatOpponentSeesBody}</p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? t.creating : t.sendInvite}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-overlay/10 px-4 py-2 text-sm text-muted hover:text-ink"
            >
              {COMMON[lang].app.cancel}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
