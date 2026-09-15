import { useState } from 'react'
import { EmptyState } from './EmptyState'
import { DuelCard } from './DuelCard'
import { CreateDuelModal } from './CreateDuelModal'
import { useDuels } from '../hooks/useDuels'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useToast } from './ToastProvider'
import { useLanguage } from '../hooks/useLanguage'
import { EPARGNE } from '../lib/i18n/epargne'
import { COMMON } from '../lib/i18n/common'

// Self-contained (own useDuels()/useSavingsGoals() instances) — the only
// place in the app a duel can be created or responded to. Goals no longer
// carry their own "start a duel" entry point (SavingsGoalCard); the goal
// itself is picked inside CreateDuelModal / the inline accept form instead.
export function DuelsTab({ onGoToObjectifs }: { onGoToObjectifs: () => void }) {
  const { lang } = useLanguage()
  const t = EPARGNE[lang].duelsTab
  const { loading, error, duels, busyGoalIds, createDuelInvite, acceptDuelInviteById, declineDuelInvite, abandonDuel } =
    useDuels()
  const goals = useSavingsGoals()
  const { showToast } = useToast()
  const [abandoning, setAbandoning] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  async function handleAbandon(duelId: string) {
    setAbandoning(duelId)
    const { error: abandonError } = await abandonDuel(duelId)
    setAbandoning(null)
    if (abandonError) showToast(abandonError)
  }

  async function handleAccept(duelId: string, goalId: string, displayName: string, shareGoalName: boolean) {
    const result = await acceptDuelInviteById(duelId, goalId, displayName, shareGoalName)
    if (result.error) showToast(result.error)
    return result
  }

  async function handleDecline(duelId: string) {
    const result = await declineDuelInvite(duelId)
    if (result.error) showToast(result.error)
    return result
  }

  if (loading || goals.loading) {
    return <p className="text-sm text-muted">{COMMON[lang].app.loading}</p>
  }

  const received = duels.filter((d) => d.status === 'pending' && d.me === null)
  const active = duels.filter((d) => d.status === 'active' || (d.status === 'pending' && d.me !== null))
  const past = duels.filter((d) => d.status === 'completed' || d.status === 'abandoned')

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {duels.length > 0 && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-primary-strong px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
          >
            {t.createDuelButton}
          </button>
        </div>
      )}

      {duels.length === 0 ? (
        <EmptyState
          title={t.emptyTitle}
          description={t.emptyDescription}
          actionLabel={t.createDuelButton}
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {received.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t.receivedSection}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {received.map((duel) => (
                  <DuelCard
                    key={duel.id}
                    duel={duel}
                    goals={goals.goals}
                    busyGoalIds={busyGoalIds}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onAbandon={handleAbandon}
                    onGoToObjectifs={onGoToObjectifs}
                  />
                ))}
              </div>
            </div>
          )}

          {active.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t.activeSection}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {active.map((duel) => (
                  <DuelCard
                    key={duel.id}
                    duel={duel}
                    goals={goals.goals}
                    busyGoalIds={busyGoalIds}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onAbandon={handleAbandon}
                    onGoToObjectifs={onGoToObjectifs}
                    abandoning={abandoning === duel.id}
                  />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{t.pastSection}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {past.map((duel) => (
                  <DuelCard
                    key={duel.id}
                    duel={duel}
                    goals={goals.goals}
                    busyGoalIds={busyGoalIds}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onAbandon={handleAbandon}
                    onGoToObjectifs={onGoToObjectifs}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateDuelModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        goals={goals.goals}
        busyGoalIds={busyGoalIds}
        onCreate={createDuelInvite}
        onGoToObjectifs={onGoToObjectifs}
      />
    </div>
  )
}
