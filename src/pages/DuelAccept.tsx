import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageSkeleton } from '../components/PageSkeleton'
import { useDuels } from '../hooks/useDuels'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useLanguage } from '../hooks/useLanguage'
import { isInviteExpired } from '../lib/duels'
import { DUEL_ACCEPT } from '../lib/i18n/duelAccept'

interface Preview {
  duelId: string
  creatorDisplayName: string
  durationDays: number
  inviteExpiresAt: string
}

export function DuelAccept() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const t = DUEL_ACCEPT[lang]
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
      setError(acceptError ?? t.acceptFailedFallback)
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
        <h1 className="text-2xl font-bold text-ink">{t.notFoundTitle}</h1>
        <p className="mt-2 text-sm text-muted">{t.notFoundBody}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-10">
      <h1 className="text-2xl font-bold text-ink">{t.inviteTitle(preview.creatorDisplayName)}</h1>
      <p className="mt-2 text-sm text-muted">{t.inviteBody(preview.durationDays)}</p>

      {availableGoals.length === 0 ? (
        <div className="glass mt-6 rounded-2xl border border-overlay/10 p-5 text-sm text-muted shadow-lg shadow-black/30">
          {goals.goals.length === 0 ? t.noGoalsAtAll : t.allGoalsBusy}
        </div>
      ) : (
        <form onSubmit={submit} className="glass mt-6 flex flex-col gap-4 rounded-2xl border border-overlay/10 p-5 shadow-lg shadow-black/30">
          <label className="flex flex-col gap-1 text-sm text-muted">
            {t.yourGoalLabel}
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              required
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
            >
              <option value="" className="bg-surface">
                {t.chooseOption}
              </option>
              {availableGoals.map((g) => (
                <option key={g.id} value={g.id} className="bg-surface">
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-muted">
            {t.displayNameLabel}
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.namePlaceholder}
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
            {t.shareGoalNameLabel}
          </label>

          <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2.5 text-xs text-muted">
            <p className="font-medium text-ink">{t.whatOpponentSeesTitle}</p>
            <p className="mt-1">{t.whatOpponentSeesBody}</p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !goalId || !displayName.trim()}
            className="rounded-lg bg-primary-strong px-4 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? t.accepting : t.acceptDuelButton}
          </button>
        </form>
      )}
    </div>
  )
}
