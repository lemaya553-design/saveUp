import { useMemo, useState } from 'react'
import { formatCurrency, getFarFutureDateString, getTodayDateString } from '../lib/format'
import { computeRequiredPace } from '../lib/savingsProjection'

export function AddGoalCard({
  onAdd,
  defaultOpen = false,
}: {
  onAdd: (name: string, targetAmount: number, targetDate: string | null) => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const requiredPace = useMemo(() => {
    const parsedTarget = Number(target)
    if (!parsedTarget || parsedTarget <= 0 || !targetDate) return null
    return computeRequiredPace(parsedTarget, targetDate)
  }, [target, targetDate])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsedTarget = Math.max(0, Number(target) || 0)
    if (!name.trim() || parsedTarget <= 0) return
    onAdd(name.trim(), parsedTarget, targetDate || null)
    setName('')
    setTarget('')
    setTargetDate('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass flex min-h-[96px] items-center justify-center rounded-2xl border-2 border-dashed border-white/15 p-5 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-ink"
      >
        + Nouvel objectif
      </button>
    )
  }

  return (
    <div className="glass rounded-2xl p-5 shadow-lg shadow-black/30">
      <h2 className="text-lg font-semibold text-ink">Nouvel objectif</h2>
      <p className="mb-4 mt-1 text-xs text-muted">Un nom, un montant à atteindre, et une échéance si tu en as une.</p>
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom (ex: Voyage)"
          autoFocus
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
            Créer
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-muted hover:text-ink"
          >
            Annuler
          </button>
        </div>
      </form>

      {requiredPace && (
        <p className="mt-3 text-xs text-accent">
          Pour l'atteindre à temps, épargne environ {formatCurrency(requiredPace.perWeek)} par semaine
          (ou {formatCurrency(requiredPace.perMonth)} par mois).
        </p>
      )}
      {target && Number(target) > 0 && targetDate && !requiredPace && (
        <p className="mt-3 text-xs text-red-400">L'échéance choisie est déjà passée.</p>
      )}
    </div>
  )
}
