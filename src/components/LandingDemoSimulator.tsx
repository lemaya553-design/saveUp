import { useMemo, useState } from 'react'
import { formatCurrency } from '../lib/format'
import { computeBudgetScore, computeFixedRatioScore, getScoreColorClass } from '../lib/financialHealth'
import { ScoreTrendBadge } from './ScoreTrendBadge'
import type { ScoreTrend } from '../hooks/useFinancialHealth'

// Illustrative numbers only — this runs on the public landing page, so it
// uses sample data rather than a real (or nonexistent) visitor account.
const DEMO_INCOME = 3500
const DEMO_FIXED_TOTAL = 1200
const DEMO_SPENT_THIS_MONTH = 650
const DEMO_MONTH_PROGRESS = 0.5
const DEMO_SAVINGS_SCORE = 18 // out of 30 — held constant, see Simulateur for why
const DEMO_GOAL_REMAINING = 1400
const DEMO_MONTHLY_CONTRIBUTION_RATE = 150

const DEMO_EXPENSES = [
  { id: 'netflix', name: 'Netflix', amount: 20 },
  { id: 'gym', name: 'Abonnement gym', amount: 45 },
  { id: 'cafe', name: 'Café à emporter', amount: 60 },
]

function scoreFor(reduction: number) {
  const newTotalFixed = Math.max(0, DEMO_FIXED_TOTAL - reduction)
  const newDiscretionary = Math.max(0, DEMO_INCOME - newTotalFixed)
  const budgetScore = computeBudgetScore(DEMO_SPENT_THIS_MONTH, newDiscretionary, DEMO_MONTH_PROGRESS)
  const fixedRatioScore = computeFixedRatioScore(newTotalFixed, DEMO_INCOME)
  return Math.min(100, budgetScore + DEMO_SAVINGS_SCORE + fixedRatioScore)
}

const BASELINE_SCORE = scoreFor(0)

export function LandingDemoSimulator() {
  const [selectedId, setSelectedId] = useState(DEMO_EXPENSES[0].id)
  const [reduction, setReduction] = useState(0)
  const selected = DEMO_EXPENSES.find((e) => e.id === selectedId) ?? DEMO_EXPENSES[0]

  const projectedScore = useMemo(() => scoreFor(reduction), [reduction])
  const scoreDelta = projectedScore - BASELINE_SCORE
  const scoreTrend: ScoreTrend = scoreDelta === 0 ? null : scoreDelta > 0 ? 'up' : 'down'

  const newMonthlyRate = DEMO_MONTHLY_CONTRIBUTION_RATE + reduction
  const currentMonths = DEMO_GOAL_REMAINING / DEMO_MONTHLY_CONTRIBUTION_RATE
  const newMonths = DEMO_GOAL_REMAINING / newMonthlyRate
  const monthsSaved = currentMonths - newMonths

  return (
    <div className="glass rounded-2xl p-6 shadow-lg shadow-black/30 sm:p-8">
      <label className="flex flex-col gap-1 text-sm text-muted">
        Dépense fixe (exemple)
        <select
          value={selected.id}
          onChange={(e) => {
            setSelectedId(e.target.value)
            setReduction(0)
          }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
        >
          {DEMO_EXPENSES.map((expense) => (
            <option key={expense.id} value={expense.id} className="bg-surface">
              {expense.name} — {formatCurrency(expense.amount)}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-muted">Montant à réduire, par mois</span>
          <span className="font-medium text-ink">{formatCurrency(reduction)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={selected.amount}
          step={1}
          value={Math.min(reduction, selected.amount)}
          onChange={(e) => setReduction(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label={`Réduction sur ${selected.name}`}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Objectif d'épargne</p>
          <p className="mt-1 text-sm text-ink">
            {reduction > 0
              ? monthsSaved > 0.5
                ? `${monthsSaved.toFixed(1)} mois plus vite`
                : 'Impact minime à ce montant'
              : 'Ajuste le curseur pour voir l\'impact'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Score projeté</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${getScoreColorClass(projectedScore)}`}>
              {projectedScore}
            </span>
            <span className="text-xs text-muted">/100</span>
            <ScoreTrendBadge trend={scoreTrend} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        Exemple avec des chiffres fictifs — connecte tes propres données pour un calcul réel.
      </p>
    </div>
  )
}
