import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from './Card'
import { BeforeAfterRow } from './BeforeAfterRow'
import { FixedExpenseSimRow } from './FixedExpenseSimRow'
import { CategorySimRow } from './CategorySimRow'
import { HypotheticalExpenses, type HypotheticalExpense } from './HypotheticalExpenses'
import { SavingsComparisonChart } from './SavingsComparisonChart'
import type { useFinancialHealth } from '../hooks/useFinancialHealth'
import type { useFixedExpenses } from '../hooks/useFixedExpenses'
import type { useSavingsGoals } from '../hooks/useSavingsGoals'
import type { useSavingsContributions } from '../hooks/useSavingsContributions'
import type { CategorySpendingEntry } from '../lib/categorySpending'
import { formatCurrency } from '../lib/format'
import { FALLBACK_CATEGORY } from '../lib/categories'
import { sumThisMonth } from '../lib/budgetInsights'
import { computeBudgetScore, computeFixedRatioScore } from '../lib/financialHealth'
import { estimateMonthlyRate } from '../lib/savingsProjection'
import { formatMonthsAsDuration } from '../lib/investment'

const GRAPH_MONTHS = 12

function makeHypotheticalId(): string {
  return `hypo-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// "et si" scenario tool — takes the same hook instances the Objectifs tab
// already loaded (passed down rather than called again here) so switching
// tabs doesn't trigger a second round of fetches for the same data.
export function SimulateurTab({
  health,
  fixed,
  goals,
  contributions,
  categorySpending,
  onGoToObjectifs,
}: {
  health: ReturnType<typeof useFinancialHealth>
  fixed: ReturnType<typeof useFixedExpenses>
  goals: ReturnType<typeof useSavingsGoals>
  contributions: ReturnType<typeof useSavingsContributions>
  categorySpending: CategorySpendingEntry[]
  onGoToObjectifs: () => void
}) {
  const [simulatedAmounts, setSimulatedAmounts] = useState<Record<string, number>>({})
  const [simulatedCategoryAmounts, setSimulatedCategoryAmounts] = useState<Record<string, number>>({})
  const [simulatedSavings, setSimulatedSavings] = useState<number | null>(null)
  const [hypotheticalExpenses, setHypotheticalExpenses] = useState<HypotheticalExpense[]>([])
  const [showApplyConfirm, setShowApplyConfirm] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)

  // Seed each fixed expense's simulated amount from its real amount, once,
  // without clobbering a value the user has already dragged.
  useEffect(() => {
    setSimulatedAmounts((prev) => {
      let changed = false
      const next = { ...prev }
      for (const expense of fixed.fixedExpenses) {
        if (!(expense.id in next)) {
          next[expense.id] = expense.amount
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [fixed.fixedExpenses])

  // Same seeding pattern, one slider per real spending category this month
  // (Nourriture, Autre, Golf, whatever the account actually has).
  useEffect(() => {
    setSimulatedCategoryAmounts((prev) => {
      let changed = false
      const next = { ...prev }
      for (const entry of categorySpending) {
        if (!(entry.category in next)) {
          next[entry.category] = entry.total
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [categorySpending])

  function updateSimulatedAmount(id: string, amount: number) {
    setSimulatedAmounts((prev) => ({ ...prev, [id]: amount }))
  }

  function updateSimulatedCategoryAmount(category: string, amount: number) {
    setSimulatedCategoryAmounts((prev) => ({ ...prev, [category]: amount }))
  }

  // Added immediately (blank name, $0), then edited in place — the slider
  // and name/category fields update live, with no submit step gating when
  // they start counting toward the simulation.
  function addHypothetical() {
    setHypotheticalExpenses((prev) => [
      ...prev,
      { id: makeHypotheticalId(), name: '', amount: 0, category: FALLBACK_CATEGORY },
    ])
  }

  function updateHypothetical(id: string, patch: Partial<Pick<HypotheticalExpense, 'name' | 'amount' | 'category'>>) {
    setHypotheticalExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  function removeHypothetical(id: string) {
    setHypotheticalExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  // A hypothetical row is added instantly (blank name, $0) then edited in
  // place — "meaningful" filters out a row the user opened but never
  // actually named/dragged, so it doesn't count toward the total, the
  // "prêt à appliquer" summary, or get applied as a real $0/unnamed expense.
  const meaningfulHypotheticals = hypotheticalExpenses.filter((e) => e.name.trim() && e.amount > 0)

  const simulatedExistingTotal = fixed.fixedExpenses.reduce(
    (sum, e) => sum + (simulatedAmounts[e.id] ?? e.amount),
    0,
  )
  const hypotheticalTotal = meaningfulHypotheticals.reduce((sum, e) => sum + e.amount, 0)
  const simulatedTotalFixed = simulatedExistingTotal + hypotheticalTotal

  // actualCategoryTotal is deliberately the sum of `categorySpending` (the
  // same data the sliders below are seeded from), not health.spentThisMonth
  // — a separately-fetched figure that should match in practice but isn't
  // guaranteed to reconcile to the cent. Using the same source the sliders
  // start from keeps "before" always equal to "every slider at its actual
  // position", so the numbers on screen never contradict each other.
  const actualCategoryTotal = categorySpending.reduce((sum, e) => sum + e.total, 0)
  const simulatedCategoryTotal = categorySpending.reduce(
    (sum, e) => sum + (simulatedCategoryAmounts[e.category] ?? e.total),
    0,
  )

  const savingsThisMonth = useMemo(
    () => sumThisMonth(contributions.contributions),
    [contributions.contributions],
  )
  // Seeded once from the real value, without clobbering a drag in progress —
  // same pattern as the fixed-expense amounts above.
  useEffect(() => {
    setSimulatedSavings((prev) => (prev === null ? savingsThisMonth : prev))
  }, [savingsThisMonth])
  const effectiveSimulatedSavings = simulatedSavings ?? savingsThisMonth

  function updateSimulatedSavings(amount: number) {
    setSimulatedSavings(amount)
  }

  // Every slider's contribution to "money freed up this month", blended
  // into one pool: less on fixed costs or a spending category frees money
  // up; dragging Épargne UP is treated the same way reducing an expense
  // would be — both mean more is available to go toward goals.
  const freedUpAmount =
    fixed.totalFixedExpenses -
    simulatedTotalFixed +
    (actualCategoryTotal - simulatedCategoryTotal) +
    (effectiveSimulatedSavings - savingsThisMonth)

  const discretionaryBudgetAfter = Math.max(0, health.monthlyIncome - simulatedTotalFixed)
  const spendableBudgetBefore = Math.max(0, health.discretionaryBudget - savingsThisMonth)
  const spendableBudgetAfter = Math.max(0, discretionaryBudgetAfter - effectiveSimulatedSavings)
  const remainingBefore = spendableBudgetBefore - actualCategoryTotal
  const remainingAfter = spendableBudgetAfter - simulatedCategoryTotal

  const scoreBefore = health.breakdown.score
  const scoreAfter = useMemo(() => {
    const budgetScoreAfter = computeBudgetScore(
      simulatedCategoryTotal,
      discretionaryBudgetAfter,
      health.monthProgress,
    )
    const fixedRatioScoreAfter = computeFixedRatioScore(simulatedTotalFixed, health.monthlyIncome)
    return Math.min(100, budgetScoreAfter + health.breakdown.savingsScore + fixedRatioScoreAfter)
  }, [
    simulatedCategoryTotal,
    discretionaryBudgetAfter,
    health.monthProgress,
    simulatedTotalFixed,
    health.monthlyIncome,
    health.breakdown.savingsScore,
  ])

  const now = new Date()
  const goalProjections = goals.goals.map((goal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)
    const contributionsForGoal = contributions.contributions.filter((c) => c.goal_id === goal.id)
    const currentRate = estimateMonthlyRate(contributionsForGoal, now)
    const newRate = Math.max(0, currentRate + freedUpAmount)
    const monthsBefore = remaining <= 0 ? 0 : currentRate > 0 ? Math.ceil(remaining / currentRate) : null
    const monthsAfter = remaining <= 0 ? 0 : newRate > 0 ? Math.ceil(remaining / newRate) : null
    return { goal, remaining, monthsBefore, monthsAfter }
  })

  const totalCurrentSaved = goals.goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const blendedCurrentRate = estimateMonthlyRate(contributions.contributions, now)
  const blendedNewRate = Math.max(0, blendedCurrentRate + freedUpAmount)

  const comparisonSeries = useMemo(() => {
    const current = []
    const simulated = []
    for (let month = 0; month <= GRAPH_MONTHS; month++) {
      current.push({ month, value: totalCurrentSaved + blendedCurrentRate * month })
      simulated.push({ month, value: totalCurrentSaved + blendedNewRate * month })
    }
    return { current, simulated }
  }, [totalCurrentSaved, blendedCurrentRate, blendedNewRate])

  const changedCount = fixed.fixedExpenses.filter(
    (e) => (simulatedAmounts[e.id] ?? e.amount) !== e.amount,
  ).length
  const addedCount = meaningfulHypotheticals.length
  const hasChanges = changedCount > 0 || addedCount > 0

  // Separate from hasChanges above (which only tracks what "Appliquer pour
  // de vrai" can act on) — this tracks every slider that's been moved away
  // from its real starting value, fixed expenses and categories/épargne
  // alike, to decide whether "Réinitialiser" has anything to do.
  const categoryChangedCount = categorySpending.filter(
    (e) => (simulatedCategoryAmounts[e.category] ?? e.total) !== e.total,
  ).length
  const savingsChanged = effectiveSimulatedSavings !== savingsThisMonth
  const hasSliderChanges = changedCount > 0 || categoryChangedCount > 0 || savingsChanged

  // Clearing each map/scalar back to "unset" is enough — every read site
  // already falls back to the real value (`simulatedAmounts[id] ?? amount`),
  // so this takes effect immediately without needing the seeding effects
  // above to re-run.
  function resetSimulation() {
    setSimulatedAmounts({})
    setSimulatedCategoryAmounts({})
    setSimulatedSavings(null)
  }

  async function applyChanges() {
    setApplying(true)
    for (const expense of fixed.fixedExpenses) {
      const newAmount = simulatedAmounts[expense.id]
      if (newAmount !== undefined && newAmount !== expense.amount) {
        await fixed.updateFixedExpense(expense.id, expense.name, newAmount, expense.category)
      }
    }
    for (const hypo of meaningfulHypotheticals) {
      await fixed.addFixedExpense(hypo.name, hypo.amount, hypo.category)
    }
    setHypotheticalExpenses([])
    setShowApplyConfirm(false)
    setApplying(false)
    setApplySuccess(true)
    setTimeout(() => setApplySuccess(false), 4000)
  }

  const applyClauses = [
    changedCount > 0 ? `${changedCount} dépense(s) modifiée(s)` : null,
    addedCount > 0 ? `${addedCount} nouvelle(s) dépense(s) ajoutée(s)` : null,
  ].filter(Boolean)

  // Purely a display aggregate for the header pill below — doesn't feed into
  // any of the simulation math above.
  const totalAdjustedCount = changedCount + categoryChangedCount + (savingsChanged ? 1 : 0)

  return (
    <div className="grid gap-6">
      <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
        <p className="text-xs text-muted">
          Rien n'est modifié tant que tu n'as pas cliqué sur « Appliquer pour de vrai ».
        </p>
        {hasSliderChanges && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
              {totalAdjustedCount} ajustement{totalAdjustedCount > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={resetSimulation}
              className="rounded-full border border-overlay/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-overlay/20 hover:text-ink"
            >
              ↺ Réinitialiser
            </button>
          </div>
        )}
      </div>

      {applySuccess && (
        <div className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          Modifications appliquées à tes vraies dépenses fixes ✓
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Ajuste ton scénario</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Dépenses fixes" hint="Ajuste chaque dépense, ou ajoute-en une nouvelle à tester.">
            {fixed.fixedExpenses.length === 0 ? (
              <p className="mb-3 text-sm text-muted">
                Aucune dépense fixe pour l'instant —{' '}
                <Link to="/budget" className="text-accent hover:text-accent/80">
                  ajoutes-en dans Budget
                </Link>{' '}
                ou teste-en une hypothétique ci-dessous.
              </p>
            ) : (
              <div className="mb-3 divide-y divide-overlay/10">
                {fixed.fixedExpenses.map((expense) => (
                  <FixedExpenseSimRow
                    key={expense.id}
                    expense={expense}
                    simulatedAmount={simulatedAmounts[expense.id] ?? expense.amount}
                    onChange={updateSimulatedAmount}
                  />
                ))}
              </div>
            )}

            <HypotheticalExpenses
              expenses={hypotheticalExpenses}
              onAdd={addHypothetical}
              onUpdate={updateHypothetical}
              onRemove={removeHypothetical}
            />
          </Card>

          <Card title="Dépenses du mois" hint="Tes dépenses ponctuelles par catégorie, et ton épargne.">
            {categorySpending.length === 0 ? (
              <p className="mb-3 text-sm text-muted">
                Aucune dépense ponctuelle enregistrée ce mois-ci pour l'instant.
              </p>
            ) : (
              <div className="mb-1 divide-y divide-overlay/10">
                {categorySpending.map((entry) => (
                  <CategorySimRow
                    key={entry.category}
                    label={entry.category}
                    actualAmount={entry.total}
                    simulatedAmount={simulatedCategoryAmounts[entry.category] ?? entry.total}
                    onChange={(amount) => updateSimulatedCategoryAmount(entry.category, amount)}
                  />
                ))}
              </div>
            )}

            <div className="border-t border-overlay/10 pt-1">
              <CategorySimRow
                label="Épargne"
                actualAmount={savingsThisMonth}
                simulatedAmount={effectiveSimulatedSavings}
                onChange={updateSimulatedSavings}
              />
            </div>
          </Card>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Résultats</p>
        <div className="grid gap-4">
          <Card title="Avant → après" hint="L'impact de ce scénario sur ton budget et ton score.">
            <BeforeAfterRow
              label="Budget disponible ce mois-ci"
              before={spendableBudgetBefore}
              after={spendableBudgetAfter}
              formatValue={formatCurrency}
              higherIsBetter
            />
            <BeforeAfterRow
              label="Reste à dépenser ce mois-ci"
              before={remainingBefore}
              after={remainingAfter}
              formatValue={formatCurrency}
              higherIsBetter
            />
            <BeforeAfterRow
              label="Score de santé financière"
              before={scoreBefore}
              after={scoreAfter}
              formatValue={(v) => `${Math.round(v)}/100`}
              higherIsBetter
            />
          </Card>

          <Card title="Impact sur ton épargne" hint="Basé sur le rythme de tes contributions récentes, par objectif.">
            {goals.goals.length === 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  Fixe un objectif pour voir l'impact de ce scénario sur ton épargne.
                </p>
                <button
                  type="button"
                  onClick={onGoToObjectifs}
                  className="whitespace-nowrap rounded-lg bg-primary-strong px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
                >
                  Fixer un objectif
                </button>
              </div>
            ) : (
              <>
                <div className="divide-y divide-overlay/10">
                  {goalProjections.map(({ goal, remaining, monthsBefore, monthsAfter }) => {
                    if (remaining <= 0) {
                      return (
                        <p key={goal.id} className="py-2 text-sm text-success">
                          🎉 {goal.name} — déjà atteint.
                        </p>
                      )
                    }
                    if (monthsBefore === null && monthsAfter === null) {
                      return (
                        <p key={goal.id} className="py-2 text-sm text-muted">
                          {goal.name} : pas assez d'historique de contributions pour estimer un rythme.
                        </p>
                      )
                    }
                    if (monthsAfter === null) {
                      return (
                        <p key={goal.id} className="py-2 text-sm text-red-400">
                          {goal.name} : avec ce scénario, tu ne progresserais plus vers cet objectif.
                        </p>
                      )
                    }
                    if (monthsBefore === null) {
                      return (
                        <p key={goal.id} className="py-2 text-sm text-ink">
                          {goal.name} : avec ce scénario, tu l'atteindrais en environ{' '}
                          {formatMonthsAsDuration(monthsAfter)}.
                        </p>
                      )
                    }
                    return (
                      <BeforeAfterRow
                        key={goal.id}
                        label={goal.name}
                        before={monthsBefore}
                        after={monthsAfter}
                        formatValue={(v) => formatMonthsAsDuration(v)}
                        higherIsBetter={false}
                      />
                    )
                  })}
                </div>

                <div className="mt-5 border-t border-overlay/10 pt-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                    Épargne totale — {GRAPH_MONTHS} prochains mois
                  </p>
                  <SavingsComparisonChart current={comparisonSeries.current} simulated={comparisonSeries.simulated} />
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {hasChanges && (
        <div className="glass rounded-2xl border border-success/30 p-5 shadow-lg shadow-black/30">
          <h2 className="text-lg font-semibold text-ink">Prêt à l'appliquer ?</h2>
          <p className="mb-4 mt-1 text-xs text-muted">Ceci modifiera tes vraies dépenses fixes.</p>
          {showApplyConfirm ? (
            <div>
              <p className="text-sm text-ink">
                Ceci va appliquer {applyClauses.join(' et ')} à tes vraies dépenses fixes.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={applyChanges}
                  disabled={applying}
                  className="rounded-lg bg-success px-5 py-2 font-semibold text-canvas transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {applying ? 'Application...' : 'Confirmer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyConfirm(false)}
                  className="rounded-lg border border-overlay/10 px-4 py-2 text-sm text-muted hover:text-ink"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowApplyConfirm(true)}
              className="rounded-lg bg-success px-5 py-2 font-semibold text-canvas transition-all hover:brightness-110"
            >
              Appliquer pour de vrai
            </button>
          )}
        </div>
      )}
    </div>
  )
}
