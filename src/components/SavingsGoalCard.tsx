import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProgressBar } from './ProgressBar'
import { GoalPhotoPicker } from './GoalPhotoPicker'
import { formatCurrency, getFarFutureDateString, getTodayDateString } from '../lib/format'
import {
  computeRequiredPace,
  computeWeeklyContributionDots,
  estimateMonthlyRate,
} from '../lib/savingsProjection'
import { useSubscription } from '../hooks/useSubscription'
import type { SavingsGoal } from '../hooks/useSavingsGoals'
import type { Contribution } from '../hooks/useSavingsContributions'

function TargetIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

// Blue / mauve / green — cosmetic only (which color a goal's icon gets),
// deterministic on the name so it doesn't shuffle every render as goals
// reorder.
const ICON_STYLES = [
  { bg: 'bg-primary/15', text: 'text-primary' },
  { bg: 'bg-accent/15', text: 'text-accent' },
  { bg: 'bg-success/15', text: 'text-success' },
]

function iconStyleForGoal(name: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return ICON_STYLES[Math.abs(hash) % ICON_STYLES.length]
}

export function SavingsGoalCard({
  goal,
  contributionsForGoal,
  onSave,
  onRemove,
  onSetPhoto,
  onRemovePhoto,
  locked = false,
}: {
  goal: SavingsGoal
  contributionsForGoal: Contribution[]
  onSave: (id: string, name: string, targetAmount: number, targetDate: string | null) => void
  onRemove: (id: string) => void
  onSetPhoto: (goalId: string, file: File) => Promise<{ error: string | null }>
  onRemovePhoto: (goalId: string) => void
  // True once this goal is beyond the account's current plan limit — data
  // stays visible (nothing is deleted), but editing and new contributions
  // are blocked until either the account upgrades or an active goal is
  // removed to free up a slot.
  locked?: boolean
}) {
  const subscription = useSubscription()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(goal.name)
  const [target, setTarget] = useState(String(goal.targetAmount || ''))
  const [targetDate, setTargetDate] = useState(goal.targetDate ?? '')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const progress =
    goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0

  const now = new Date()
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
  const monthlyRate = estimateMonthlyRate(contributionsForGoal, now)
  const requiredPace = goal.targetDate ? computeRequiredPace(remaining, goal.targetDate, now) : null
  const isAhead = requiredPace ? monthlyRate >= requiredPace.perMonth : null
  const weeklyDots = computeWeeklyContributionDots(contributionsForGoal, now)
  const icon = iconStyleForGoal(goal.name)
  // A downgraded account keeps its already-uploaded photo in storage (never
  // deleted), but the card reverts to its plain look — same "data survives,
  // feature access doesn't" treatment as splitByLimit elsewhere.
  const showPhoto = subscription.limits.goalPhotos && !!goal.photoUrl

  function saveGoal(e: React.FormEvent) {
    e.preventDefault()
    const parsedTarget = Math.max(0, Number(target) || 0)
    if (!name.trim() || parsedTarget <= 0) return
    onSave(goal.id, name.trim(), parsedTarget, targetDate || null)
    setEditing(false)
  }

  async function handleSelectPhoto(file: File) {
    setPhotoError(null)
    setPhotoUploading(true)
    const { error } = await onSetPhoto(goal.id, file)
    setPhotoUploading(false)
    if (error) setPhotoError(error)
  }

  if (editing) {
    return (
      <div className="glass rounded-2xl p-5 shadow-lg shadow-black/30">
        <form onSubmit={saveGoal} className="flex flex-wrap gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'objectif"
            className="min-w-[140px] flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Montant cible"
            className="w-32 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
          />
          <label className="flex flex-col gap-1 text-xs text-muted">
            Échéance (optionnel)
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={getTodayDateString()}
              max={getFarFutureDateString()}
              className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </label>

          <div className="w-full">
            <p className="mb-1.5 text-xs text-muted">Photo (optionnel)</p>
            <GoalPhotoPicker
              photoUrl={goal.photoUrl}
              isPremium={subscription.limits.goalPhotos}
              uploading={photoUploading}
              error={photoError}
              onSelectFile={handleSelectPhoto}
              onError={setPhotoError}
              onRemove={() => onRemovePhoto(goal.id)}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-overlay/10 px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Photo present (and on Premium): full-bleed background image + a dark
  // scrim, with every text/icon token below swapped to a white-on-scrim
  // variant — the photo's own colors can't be trusted to contrast with the
  // theme's normal ink/muted tokens, so legibility can't depend on them.
  const textPrimary = showPhoto ? 'text-white' : 'text-ink'
  const textSecondary = showPhoto ? 'text-white/75' : 'text-muted'
  const iconBg = showPhoto ? 'bg-white/20' : icon.bg
  const iconText = showPhoto ? 'text-white' : icon.text
  const dividerBorder = showPhoto ? 'border-white/20' : 'border-overlay/10'
  const paceBg = showPhoto ? 'bg-black/30' : 'bg-overlay/5'
  const dotOff = showPhoto ? 'bg-white/20' : 'bg-overlay/10'

  return (
    <div
      // min-w-0: this card is a `grid` item (Epargne.tsx's `grid gap-4
      // sm:grid-cols-2`) — without it, its default min-content width
      // forces the whole shared column wider, same bug as Card.tsx.
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-2xl shadow-lg shadow-black/30 ${
        showPhoto ? '' : 'glass'
      } ${locked ? 'opacity-60' : ''}`}
    >
      {showPhoto && (
        <>
          <img src={goal.photoUrl ?? undefined} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        </>
      )}

      <div className="relative flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
              <TargetIcon className={`h-5 w-5 ${iconText}`} />
            </div>
            <div className="min-w-0">
              <p className={`truncate font-semibold ${textPrimary}`}>{goal.name}</p>
              {goal.targetDate && (
                <p className={`text-xs ${textSecondary}`}>
                  Échéance :{' '}
                  {new Date(goal.targetDate).toLocaleDateString('fr-CA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-3 pt-1.5">
            {!locked && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={`rounded-md px-2 py-1.5 text-sm ${
                  showPhoto ? 'text-white hover:bg-white/10' : 'text-accent hover:bg-accent/10 hover:text-accent/80'
                }`}
              >
                Modifier
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(goal.id)}
              className={`rounded-md px-2 py-1.5 text-sm ${
                showPhoto ? 'text-red-300 hover:bg-red-500/20' : 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
              }`}
              aria-label={`Supprimer ${goal.name}`}
            >
              Supprimer
            </button>
          </div>
        </div>

        {locked && (
          <Link
            to="/tarifs"
            className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent hover:bg-accent/25"
          >
            🔒 En pause — passe à Standard pour la réactiver
          </Link>
        )}

        <p className={`text-2xl font-bold ${textPrimary}`}>
          {formatCurrency(goal.currentAmount)}
          <span className={`ml-1.5 text-sm font-normal ${textSecondary}`}>
            / {formatCurrency(goal.targetAmount)}
          </span>
        </p>
        <div className="mt-3">
          <ProgressBar value={progress} colorClass={progress >= 100 ? 'bg-success' : 'bg-primary'} />
        </div>
        <p className={`mt-1.5 text-xs ${textSecondary}`}>
          {progress.toFixed(0)}% atteint
          {remaining > 0 && <> · {formatCurrency(remaining)} restant</>}
        </p>

        {remaining <= 0 ? (
          <p className="mt-3 text-xs text-success">🎉 Objectif atteint.</p>
        ) : !goal.targetDate ? (
          <p className={`mt-3 text-xs ${textSecondary}`}>Ajoute une échéance pour comparer ton rythme.</p>
        ) : requiredPace ? (
          <div className={`mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg ${paceBg} px-3 py-2 text-xs`}>
            <span className={textSecondary}>
              {formatCurrency(monthlyRate)}/mois actuel · {formatCurrency(requiredPace.perMonth)}/mois
              nécessaire
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                isAhead ? 'bg-success/15 text-success' : 'bg-red-400/15 text-red-400'
              }`}
            >
              {isAhead ? '↑ En avance' : '↓ En retard'}
            </span>
          </div>
        ) : (
          <p className="mt-3 text-xs text-red-400">Échéance dépassée.</p>
        )}

        <div className={`mt-4 border-t pt-3 ${dividerBorder}`}>
          <p className={`mb-1.5 text-xs ${textSecondary}`}>
            Régularité ({weeklyDots.filter(Boolean).length}/{weeklyDots.length} dernières semaines)
          </p>
          <div className="flex gap-1.5">
            {weeklyDots.map((hasContribution, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${hasContribution ? 'bg-success' : dotOff}`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
