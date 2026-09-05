import { useState } from 'react'
import { ProgressBar } from './ProgressBar'
import { formatTimeRemaining, getLeader, type Duel } from '../lib/duels'

const STATUS_LABEL: Record<Duel['status'], string> = {
  pending: "En attente d'un adversaire",
  active: 'En cours',
  completed: 'Terminé',
  abandoned: 'Abandonné',
}

export function DuelCard({
  duel,
  onCopyInvite,
  onAbandon,
  abandoning = false,
}: {
  duel: Duel
  onCopyInvite: (duel: Duel) => void
  onAbandon: (duelId: string) => void
  abandoning?: boolean
}) {
  const [confirmingAbandon, setConfirmingAbandon] = useState(false)
  const leader = getLeader(duel)
  const now = new Date()
  const canAbandon = duel.status === 'pending' || duel.status === 'active'

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
          {STATUS_LABEL[duel.status]}
        </span>
        {duel.status === 'active' && duel.endsAt && (
          <span className="text-xs text-muted">{formatTimeRemaining(duel.endsAt, now)}</span>
        )}
      </div>

      {duel.status === 'pending' ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Invitation envoyée — dès que ton adversaire l'accepte, le duel de {duel.durationDays} jours
            commence.
          </p>
          <button
            type="button"
            onClick={() => onCopyInvite(duel)}
            className="self-start rounded-lg border border-overlay/10 px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-overlay/5"
          >
            Copier le lien d'invitation
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className={`font-medium ${leader === 'me' ? 'text-success' : 'text-ink'}`}>
                Toi {leader === 'me' ? '— en tête' : ''}
              </span>
              <span className="font-semibold text-ink">{(duel.me?.progressPct ?? 0).toFixed(0)}%</span>
            </div>
            <ProgressBar value={duel.me?.progressPct ?? 0} colorClass="bg-primary" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className={`font-medium ${leader === 'opponent' ? 'text-success' : 'text-ink'}`}>
                {duel.opponent?.displayName ?? 'Adversaire'}{' '}
                {leader === 'opponent' ? '— en tête' : ''}
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
                ? 'Ce duel a été abandonné.'
                : leader === 'tie'
                  ? 'Égalité !'
                  : leader === 'me'
                    ? '🏆 Tu as gagné ce duel.'
                    : `🏆 ${duel.opponent?.displayName ?? 'Ton adversaire'} a gagné ce duel.`}
            </p>
          )}
        </div>
      )}

      {canAbandon && (
        <div className="mt-4 border-t border-overlay/10 pt-3">
          {confirmingAbandon ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Abandonner ce duel ?</span>
              <button
                type="button"
                onClick={() => onAbandon(duel.id)}
                disabled={abandoning}
                className="rounded-md px-2 py-1 font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
              >
                {abandoning ? 'Abandon...' : 'Confirmer'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingAbandon(false)}
                className="rounded-md px-2 py-1 text-muted hover:text-ink"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingAbandon(true)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Abandonner le duel
            </button>
          )}
        </div>
      )}
    </div>
  )
}
