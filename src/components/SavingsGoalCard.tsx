import { useState } from 'react'
import { ProgressBar } from './ProgressBar'
import { formatCurrency, getFarFutureDateString, getTodayDateString } from '../lib/format'
import {
  computeRequiredPace,
  computeWeeklyContributionDots,
  estimateMonthlyRate,
} from '../lib/savingsProjection'
import type { SavingsGoal } from '../hooks/useSavingsGoals'
import type { Contribution } from '../hooks/useSavingsContributions'

export function SavingsGoalCard({
  goal,
  contributionsForGoal,
  onSave,
  onRemove,
}: {
  goal: SavingsGoal
  contributionsForGoal: Contribution[]
  onSave: (id: string, name: string, targetAmount: number, targetDate: string | null) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(goal.name)
  const [target, setTarget] = useState(String(goal.targetAmount || ''))
  const [targetDate, setTargetDate] = useState(goal.targetDate ?? '')

  const progress =
    goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0

  const now = new Date()
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
  const monthlyRate = estimateMonthlyRate(contributionsForGoal, now)
  const requiredPace = goal.targetDate ? computeRequiredPace(remaining, goal.targetDate, now) : null
  const isAhead = requiredPace ? monthlyRate >= requiredPace.perMonth : null
  const weeklyDots = computeWeeklyContributionDots(contributionsForGoal, now)

  function saveGoal(e: React.FormEvent) {
    e.preventDefault()
    const parsedTarget = Math.max(0, Number(target) || 0)
    if (!name.trim() || parsedTarget <= 0) return
    onSave(goal.id, name.trim(), parsedTarget, targetDate || null)
    setEditing(false)
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
            className="min-w-[140px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Montant cible"
            className="w-32 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
          />
          <label className="flex flex-col gap-1 text-xs text-muted">
            Échéance (optionnel)
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={getTodayDateString()}
              max={getFarFutureDateString()}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            />
          </label>
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
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-5 shadow-lg shadow-black/30">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-medium text-ink">{goal.name}</p>
          {goal.targetDate && (
            <p className="text-xs text-muted">
              Échéance :{' '}
              {new Date(goal.targetDate).toLocaleDateString('fr-CA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-accent hover:text-accent/80"
          >
            Modifier
          </button>
          <button
            type="button"
            onClick={() => onRemove(goal.id)}
            className="text-sm text-red-400 hover:text-red-300"
            aria-label={`Supprimer ${goal.name}`}
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-ink">{formatCurrency(goal.currentAmount)}</span>
        <span className="text-muted">{formatCurrency(goal.targetAmount)}</span>
      </div>
      <ProgressBar value={progress} />
      <p className="mt-1 text-xs text-muted">{progress.toFixed(0)}% atteint</p>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
        <div>
          <p className="text-xs text-muted">Épargné à ce jour</p>
          <p className="font-semibold text-ink">{formatCurrency(goal.currentAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Restant</p>
          <p className="font-semibold text-ink">{formatCurrency(remaining)}</p>
        </div>
      </div>

      {remaining <= 0 ? (
        <p className="mt-3 text-xs text-success">🎉 Objectif atteint.</p>
      ) : !goal.targetDate ? (
        <p className="mt-3 text-xs text-muted">Ajoute une échéance pour comparer ton rythme.</p>
      ) : requiredPace ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs">
          <span className="text-muted">
            {formatCurrency(monthlyRate)}/mois actuel · {formatCurrency(requiredPace.perMonth)}/mois
            nécessaire
          </span>
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              isAhead ? 'text-success' : 'text-red-400'
            }`}
          >
            {isAhead ? '↑ En avance' : '↓ En retard'}
          </span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-red-400">Échéance dépassée.</p>
      )}

      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="mb-1.5 text-xs text-muted">Régularité (8 dernières semaines)</p>
        <div className="flex gap-1.5">
          {weeklyDots.map((hasContribution, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${hasContribution ? 'bg-success' : 'bg-white/10'}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
