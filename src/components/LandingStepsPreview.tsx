import { useState } from 'react'
import { formatCurrency, WEEKS_PER_MONTH } from '../lib/format'

export function LandingStepsPreview() {
  const [incomeDraft, setIncomeDraft] = useState('3500')
  const income = Math.max(0, Number(incomeDraft) || 0)
  const roughWeeklyBudget = income / WEEKS_PER_MONTH

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="glass rounded-2xl p-6 shadow-lg shadow-black/30 ring-1 ring-primary/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Étape 1 · essaie-la</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">C'est quoi ton revenu mensuel ?</h3>
        <p className="mt-1 text-sm text-muted">
          On calcule tout de suite un aperçu de ton budget hebdomadaire.
        </p>
        <label className="mt-4 flex items-center gap-2">
          <span className="text-muted">$</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={incomeDraft}
            onChange={(e) => setIncomeDraft(e.target.value)}
            className="w-full rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
          />
        </label>
        <p className="mt-3 text-sm text-ink">
          ≈ <span className="font-semibold text-success">{formatCurrency(roughWeeklyBudget)}</span>{' '}
          <span className="text-muted">par semaine, avant tes dépenses fixes.</span>
        </p>
      </div>

      <div className="glass flex flex-col rounded-2xl p-6 opacity-60 shadow-lg shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Étape 2</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">Tes dépenses fixes</h3>
        <p className="mt-1 text-sm text-muted">
          Loyer, abonnements — pour affiner ton budget réel.
        </p>
      </div>

      <div className="glass flex flex-col rounded-2xl p-6 opacity-60 shadow-lg shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Étape 3</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">Ton premier objectif</h3>
        <p className="mt-1 text-sm text-muted">
          Un montant, une date, et une progression à suivre.
        </p>
      </div>
    </div>
  )
}
