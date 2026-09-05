import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageSkeleton } from '../components/PageSkeleton'
import { useDuels } from '../hooks/useDuels'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { isInviteExpired } from '../lib/duels'

interface Preview {
  duelId: string
  creatorDisplayName: string
  durationDays: number
  inviteExpiresAt: string
}

export function DuelAccept() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { getInvitePreview, acceptInvite, busyGoalIds, loading: duelsLoading } = useDuels()
  const goals = useSavingsGoals()

  const [loadingPreview, setLoadingPreview] = useState(true)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [goalId, setGoalId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [shareGoalName, setShareGoalName] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    async function load() {
      setLoadingPreview(true)
      const { preview: p, error: previewError } = await getInvitePreview(token as string)
      if (cancelled) return
      if (previewError || !p || isInviteExpired(p.inviteExpiresAt, new Date())) {
        setNotFound(true)
      } else {
        setPreview(p)
      }
      setLoadingPreview(false)
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const availableGoals = goals.goals.filter((g) => !busyGoalIds.has(g.id))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !goalId || !displayName.trim()) return
    setSubmitting(true)
    setError(null)
    const { duelId, error: acceptError } = await acceptInvite(token, goalId, displayName.trim(), shareGoalName)
    setSubmitting(false)
    if (acceptError || !duelId) {
      setError(acceptError ?? "Impossible d'accepter ce duel.")
      return
    }
    navigate('/epargne/duels', { replace: true })
  }

  if (loadingPreview || goals.loading || duelsLoading) {
    return <PageSkeleton cards={1} />
  }

  if (notFound || !preview) {
    return (
      <div className="mx-auto max-w-md px-4 pb-10 pt-10 text-center">
        <h1 className="text-2xl font-bold text-ink">Invitation introuvable</h1>
        <p className="mt-2 text-sm text-muted">
          Ce lien est invalide, déjà utilisé, ou a expiré. Demande un nouveau lien à ton ami.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-10">
      <h1 className="text-2xl font-bold text-ink">
        {preview.creatorDisplayName} t'invite à un duel d'épargne
      </h1>
      <p className="mt-2 text-sm text-muted">
        Un duel de {preview.durationDays} jours — chacun garde son propre objectif et son propre
        argent. Vous verrez seulement le % de progression de l'autre.
      </p>

      {availableGoals.length === 0 ? (
        <div className="glass mt-6 rounded-2xl border border-overlay/10 p-5 text-sm text-muted shadow-lg shadow-black/30">
          {goals.goals.length === 0
            ? "Tu n'as pas encore d'objectif d'épargne — crées-en un avant d'accepter ce duel."
            : 'Tous tes objectifs sont déjà engagés dans un autre duel.'}
        </div>
      ) : (
        <form onSubmit={submit} className="glass mt-6 flex flex-col gap-4 rounded-2xl border border-overlay/10 p-5 shadow-lg shadow-black/30">
          <label className="flex flex-col gap-1 text-sm text-muted">
            Ton objectif
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              required
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
            >
              <option value="" className="bg-surface">
                — Choisir —
              </option>
              {availableGoals.map((g) => (
                <option key={g.id} value={g.id} className="bg-surface">
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted">
            Ton prénom (affiché à ton adversaire)
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex : Alex"
              required
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
            />
          </label>

          <label className="flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={shareGoalName}
              onChange={(e) => setShareGoalName(e.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            Partager le nom de mon objectif avec mon adversaire (optionnel)
          </label>

          <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2.5 text-xs text-muted">
            <p className="font-medium text-ink">Ce que voit ton adversaire</p>
            <p className="mt-1">
              Seulement ton prénom et ton % de progression. Jamais tes montants en dollars — et le
              nom de ton objectif seulement si tu coches la case ci-dessus.
            </p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !goalId || !displayName.trim()}
            className="rounded-lg bg-primary-strong px-4 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? 'Acceptation...' : 'Accepter le duel'}
          </button>
        </form>
      )}
    </div>
  )
}
