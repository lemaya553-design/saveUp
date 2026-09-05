import { useState } from 'react'
import { Modal } from './Modal'
import { DUEL_DURATION_OPTIONS, type DuelDurationDays } from '../lib/duels'
import type { SavingsGoal } from '../hooks/useSavingsGoals'

export function CreateDuelModal({
  open,
  onClose,
  goal,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  goal: SavingsGoal
  onCreate: (durationDays: DuelDurationDays, displayName: string) => Promise<{ inviteToken: string | null; error: string | null }>
}) {
  const [durationDays, setDurationDays] = useState<DuelDurationDays>(30)
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function reset() {
    setDurationDays(30)
    setDisplayName('')
    setError(null)
    setInviteUrl(null)
    setCopied(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim()) {
      setError('Un prénom est requis.')
      return
    }
    setSubmitting(true)
    setError(null)
    const { inviteToken, error: createError } = await onCreate(durationDays, displayName.trim())
    setSubmitting(false)
    if (createError || !inviteToken) {
      setError(createError ?? 'Impossible de créer le duel.')
      return
    }
    setInviteUrl(`${window.location.origin}/duels/rejoindre/${inviteToken}`)
  }

  async function copyLink() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onClose={handleClose} title="Lancer un duel d'épargne">
      {inviteUrl ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Envoie ce lien à ton adversaire — dès qu'il l'ouvre et choisit un de ses objectifs, le
            duel commence pour {durationDays} jours.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              onClick={(e) => e.currentTarget.select()}
              className="flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 rounded-lg bg-primary-strong px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
            >
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-overlay/10 px-4 py-2 text-sm text-muted hover:text-ink"
          >
            Fermer
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Objectif : <span className="text-ink">{goal.name}</span>
          </p>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Durée du duel</p>
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
                  {d} jours
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm text-muted">
            Ton prénom (affiché à ton adversaire)
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex : Alex"
              autoFocus
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
            />
          </label>

          <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2.5 text-xs text-muted">
            <p className="font-medium text-ink">Ce que voit ton adversaire</p>
            <p className="mt-1">
              Seulement ton prénom et ton % de progression. Jamais tes montants en dollars, ni le
              nom de ton objectif.
            </p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? 'Création...' : 'Générer le lien'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-overlay/10 px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
