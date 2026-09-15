import { useState } from 'react'
import { ProgressBar } from './ProgressBar'
import { getTimeRemainingLabel, getLeader, type Duel } from '../lib/duels'
import { useLanguage } from '../hooks/useLanguage'
import { EPARGNE } from '../lib/i18n/epargne'
import { DUEL_ACCEPT } from '../lib/i18n/duelAccept'
import { COMMON } from '../lib/i18n/common'
import type { SavingsGoal } from '../hooks/useSavingsGoals'

// Inline accept/decline form for a duel someone else created and addressed
// to me (duel.me === null — I haven't joined as a participant yet, only
// the RLS-visible invited_user_id lets me see this row at all). Reuses
// DUEL_ACCEPT's copy (same goal-picker/share-checkbox pattern as the
// legacy standalone /duels/rejoindre page) rather than duplicating it.
function ReceivedInviteForm({
  duel,
  goals,
  busyGoalIds,
  onAccept,
  onDecline,
  onGoToObjectifs,
}: {
  duel: Duel
  goals: SavingsGoal[]
  busyGoalIds: Set<string>
  onAccept: (duelId: string, goalId: string, displayName: string, shareGoalName: boolean) => Promise<{ error: string | null }>
  onDecline: (duelId: string) => Promise<{ error: string | null }>
  onGoToObjectifs: () => void
}) {
  const { lang } = useLanguage()
  const t = EPARGNE[lang].duelCard
  const at = DUEL_ACCEPT[lang]
  const availableGoals = goals.filter((g) => !busyGoalIds.has(g.id))
  const [goalId, setGoalId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [shareGoalName, setShareGoalName] = useState(false)
  const [submitting, setSubmitting] = useState<'accept' | 'decline' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault()
    const selectedGoalId = goalId || availableGoals[0]?.id
    if (!selectedGoalId || !displayName.trim()) return
    setSubmitting('accept')
    setError(null)
    const { error: acceptError } = await onAccept(duel.id, selectedGoalId, displayName.trim(), shareGoalName)
    setSubmitting(null)
    if (acceptError) setError(acceptError)
  }

  async function handleDecline() {
    setSubmitting('decline')
    setError(null)
    const { error: declineError } = await onDecline(duel.id)
    setSubmitting(null)
    if (declineError) setError(declineError)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink">{t.invitedYouFor(duel.opponent?.displayName ?? t.opponentFallback, duel.durationDays)}</p>

      {goals.length === 0 ? (
        <p className="text-sm text-muted">
          {t.noGoalsToAccept.before}
          <button type="button" onClick={onGoToObjectifs} className="text-accent hover:text-accent/80">
            {t.noGoalsToAccept.linkText}
          </button>
          {t.noGoalsToAccept.after}
        </p>
      ) : availableGoals.length === 0 ? (
        <p className="text-sm text-muted">{at.allGoalsBusy}</p>
      ) : (
        <form onSubmit={handleAccept} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-muted">
            {at.yourGoalLabel}
            <select
              value={goalId || availableGoals[0].id}
              onChange={(e) => setGoalId(e.target.value)}
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              {availableGoals.map((g) => (
                <option key={g.id} value={g.id} className="bg-surface">
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted">
            {at.displayNameLabel}
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={at.namePlaceholder}
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-sm text-ink placeholder-muted focus:border-primary focus:outline-none"
            />
          </label>

          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={shareGoalName}
              onChange={(e) => setShareGoalName(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            {at.shareGoalNameLabel}
          </label>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting !== null || !displayName.trim()}
              className="rounded-lg bg-primary-strong px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              {submitting === 'accept' ? t.accepting : t.accept}
            </button>
            <button
              type="button"
              onClick={handleDecline}
              disabled={submitting !== null}
              className="rounded-lg border border-overlay/10 px-4 py-2 text-sm text-muted transition-colors hover:text-ink disabled:opacity-60"
            >
              {submitting === 'decline' ? t.declining : t.decline}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export function DuelCard({
  duel,
  goals,
  busyGoalIds,
  onAccept,
  onDecline,
  onAbandon,
  onGoToObjectifs,
  abandoning = false,
}: {
  duel: Duel
  goals: SavingsGoal[]
  busyGoalIds: Set<string>
  onAccept: (duelId: string, goalId: string, displayName: string, shareGoalName: boolean) => Promise<{ error: string | null }>
  onDecline: (duelId: string) => Promise<{ error: string | null }>
  onAbandon: (duelId: string) => void
  onGoToObjectifs: () => void
  abandoning?: boolean
}) {
  const { lang } = useLanguage()
  const t = EPARGNE[lang].duelCard
  const [confirmingAbandon, setConfirmingAbandon] = useState(false)
  const leader = getLeader(duel)
  const now = new Date()
  const isReceivedInvite = duel.status === 'pending' && duel.me === null
  const canAbandon = duel.me !== null && (duel.status === 'pending' || duel.status === 'active')
  const timeRemainingLabel = duel.endsAt ? getTimeRemainingLabel(duel.endsAt, now, lang) : null

  return (
    <div className="glass rounded-2xl p-5 shadow-lg shadow-black/30">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            duel.status === 'active'
              ? 'bg-success/15 text-success'
              : duel.status === 'pending'
                ? 'bg-accent/15 text-accent'
                : 'bg-overlay/10 text-muted'
          }`}
        >
          {t.statusLabel[duel.status]}
        </span>
        {duel.status === 'active' && duel.endsAt && (
          <span className="text-xs text-muted">
            {timeRemainingLabel ? t.timeRemaining(timeRemainingLabel) : t.duelOver}
          </span>
        )}
      </div>

      {isReceivedInvite ? (
        <ReceivedInviteForm
          duel={duel}
          goals={goals}
          busyGoalIds={busyGoalIds}
          onAccept={onAccept}
          onDecline={onDecline}
          onGoToObjectifs={onGoToObjectifs}
        />
      ) : duel.status === 'pending' ? (
        <p className="text-sm text-muted">{t.inviteSentWaiting}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className={`font-medium ${leader === 'me' ? 'text-success' : 'text-ink'}`}>
                {t.you} {leader === 'me' ? t.leadingSuffix : ''}
              </span>
              <span className="font-semibold text-ink">{(duel.me?.progressPct ?? 0).toFixed(0)}%</span>
            </div>
            <ProgressBar value={duel.me?.progressPct ?? 0} colorClass="bg-primary" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className={`font-medium ${leader === 'opponent' ? 'text-success' : 'text-ink'}`}>
                {duel.opponent?.displayName ?? t.opponentFallback}{' '}
                {leader === 'opponent' ? t.leadingSuffix : ''}
                {duel.opponent?.shareGoalName && duel.opponent.goalName ? (
                  <span className="font-normal text-muted"> · {duel.opponent.goalName}</span>
                ) : null}
              </span>
              <span className="font-semibold text-ink">{(duel.opponent?.progressPct ?? 0).toFixed(0)}%</span>
            </div>
            <ProgressBar value={duel.opponent?.progressPct ?? 0} colorClass="bg-accent" />
          </div>

          {(duel.status === 'completed' || duel.status === 'abandoned') && (
            <p className="rounded-lg bg-overlay/5 px-3 py-2 text-sm text-ink">
              {duel.status === 'abandoned'
                ? t.abandonedMessage
                : leader === 'tie'
                  ? t.tie
                  : leader === 'me'
                    ? t.youWon
                    : t.theyWon(duel.opponent?.displayName ?? t.opponentFallback)}
            </p>
          )}
        </div>
      )}

      {canAbandon && (
        <div className="mt-4 border-t border-overlay/10 pt-3">
          {confirmingAbandon ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">{t.confirmAbandonPrompt}</span>
              <button
                type="button"
                onClick={() => onAbandon(duel.id)}
                disabled={abandoning}
                className="rounded-md px-2 py-1 font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
              >
                {abandoning ? t.abandoning : COMMON[lang].app.confirm}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingAbandon(false)}
                className="rounded-md px-2 py-1 text-muted hover:text-ink"
              >
                {COMMON[lang].app.cancel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingAbandon(true)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              {t.abandonDuelButton}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
