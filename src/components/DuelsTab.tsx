import { useState } from 'react'
import { EmptyState } from './EmptyState'
import { DuelCard } from './DuelCard'
import { useDuels } from '../hooks/useDuels'
import { useToast } from './ToastProvider'

// Self-contained (own useDuels() instance) — was its own route, now the
// Duels tab on Épargne. The Objectifs tab keeps its own separate useDuels()
// instance for the goal-card "Lancer un duel" wiring; the small double-fetch
// this causes matches the tradeoff every other self-contained tab in this
// app already makes (RecategorizeCard, etc.).
export function DuelsTab({ onGoToObjectifs }: { onGoToObjectifs: () => void }) {
  const { loading, error, duels, abandonDuel } = useDuels()
  const { showToast } = useToast()
  const [abandoning, setAbandoning] = useState<string | null>(null)

  async function handleCopyInvite(duel: { inviteToken: string }) {
    const url = `${window.location.origin}/duels/rejoindre/${duel.inviteToken}`
    await navigator.clipboard.writeText(url)
    showToast('Lien copié.')
  }

  async function handleAbandon(duelId: string) {
    setAbandoning(duelId)
    const { error: abandonError } = await abandonDuel(duelId)
    setAbandoning(null)
    if (abandonError) showToast(abandonError)
  }

  if (loading) {
    return <p className="text-sm text-muted">Chargement...</p>
  }

  const active = duels.filter((d) => d.status === 'pending' || d.status === 'active')
  const past = duels.filter((d) => d.status === 'completed' || d.status === 'abandoned')

  return (
    <div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {duels.length === 0 ? (
        <EmptyState
          title="Aucun duel pour l'instant"
          description="Lance un duel depuis un de tes objectifs d'épargne, dans l'onglet Objectifs, pour affronter un ami."
          actionLabel="Voir mes objectifs"
          onAction={onGoToObjectifs}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {active.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">En cours</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {active.map((duel) => (
                  <DuelCard
                    key={duel.id}
                    duel={duel}
                    onCopyInvite={handleCopyInvite}
                    onAbandon={handleAbandon}
                    abandoning={abandoning === duel.id}
                  />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Terminés</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {past.map((duel) => (
                  <DuelCard key={duel.id} duel={duel} onCopyInvite={handleCopyInvite} onAbandon={handleAbandon} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
