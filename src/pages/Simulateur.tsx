import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { BeforeAfterRow } from '../components/BeforeAfterRow'
import { FixedExpenseSimRow } from '../components/FixedExpenseSimRow'
import { HypotheticalExpenses, type HypotheticalExpense } from '../components/HypotheticalExpenses'
import { SavingsComparisonChart } from '../components/SavingsComparisonChart'
import { PageSkeleton } from '../components/PageSkeleton'
import { useFinancialHealth } from '../hooks/useFinancialHealth'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { formatCurrency } from '../lib/format'
import { sumThisMonth } from '../lib/budgetInsights'
import { computeBudgetScore, computeFixedRatioScore } from '../lib/financialHealth'
import { estimateMonthlyRate } from '../lib/savingsProjection'
import { formatMonthsAsDuration } from '../lib/investment'

const GRAPH_MONTHS = 12

function makeHypotheticalId(): string {
  return `hypo-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function Simulateur() {
  const health = useFinancialHealth()
  const fixed = useFixedExpenses()
  const goals = useSavingsGoals()
  const contributions = useSavingsContributions()

  const [simulatedAmounts, setSimulatedAmounts] = useState<Record<string, number>>({})
  const [hypotheticalExpenses, setHypotheticalExpenses] = useState<HypotheticalExpense[]>([])
  const [showApplyConfirm, setShowApplyConfirm] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)

  const loading = health.loading || fixed.loading || goals.loading || contributions.loading
  const error = health.error || fixed.error || goals.error || contributions.error

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

  function updateSimulatedAmount(id: string, amount: number) {
    setSimulatedAmounts((prev) => ({ ...prev, [id]: amount }))
  }

  function addHypothetical(name: string, amount: number, category: string) {
    setHypotheticalExpenses((prev) => [...prev, { id: makeHypotheticalId(), name, amount, category }])
  }

  function removeHypothetical(id: string) {
    setHypotheticalExpenses((prev) => prev.filter((e) => e.id !== id))
  }

  const simulatedExistingTotal = fixed.fixedExpenses.reduce(
    (sum, e) => sum + (simulatedAmounts[e.id] ?? e.amount),
    0,
  )
  const hypotheticalTotal = hypotheticalExpenses.reduce((sum, e) => sum + e.amount, 0)
  const simulatedTotalFixed = simulatedExistingTotal + hypotheticalTotal
  const freedUpAmount = fixed.totalFixedExpenses - simulatedTotalFixed

  const savingsThisMonth = useMemo(
    () => sumThisMonth(contributions.contributions),
    [contributions.contributions],
  )

  const discretionaryBudgetAfter = Math.max(0, health.monthlyIncome - simulatedTotalFixed)
  const spendableBudgetBefore = Math.max(0, health.discretionaryBudget - savingsThisMonth)
  const spendableBudgetAfter = Math.max(0, discretionaryBudgetAfter - savingsThisMonth)

  const scoreBefore = health.breakdown.score
  const scoreAfter = useMemo(() => {
    const budgetScoreAfter = computeBudgetScore(
      health.spentThisMonth,
      discretionaryBudgetAfter,
      health.monthProgress,
    )
    const fixedRatioScoreAfter = computeFixedRatioScore(simulatedTotalFixed, health.monthlyIncome)
    return Math.min(100, budgetScoreAfter + health.breakdown.savingsScore + fixedRatioScoreAfter)
  }, [
    health.spentThisMonth,
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
  const addedCount = hypotheticalExpenses.length
  const hasChanges = changedCount > 0 || addedCount > 0

  async function applyChanges() {
    setApplying(true)
    for (const expense of fixed.fixedExpenses) {
      const newAmount = simulatedAmounts[expense.id]
      if (newAmount !== undefined && newAmount !== expense.amount) {
        await fixed.updateFixedExpense(expense.id, expense.name, newAmount, expense.category)
      }
    }
    for (const hypo of hypotheticalExpenses) {
      await fixed.addFixedExpense(hypo.name, hypo.amount, hypo.category)
    }
    setHypotheticalExpenses([])
    setShowApplyConfirm(false)
    setApplying(false)
    setApplySuccess(true)
    setTimeout(() => setApplySuccess(false), 4000)
  }

  if (loading) {
    return <PageSkeleton cards={4} />
  }

  const applyClauses = [
    changedCount > 0 ? `${changedCount} dépense(s) modifiée(s)` : null,
    addedCount > 0 ? `${addedCount} nouvelle(s) dépense(s) ajoutée(s)` : null,
  ].filter(Boolean)

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Simulateur « et si »"
        subtitle="Teste des changements à ton budget et vois l'impact sur ton épargne et ton score — sans rien changer pour de vrai."
      />

      <p className="mb-6 text-xs text-muted">
        Rien n'est modifié tant que tu n'as pas cliqué sur « Appliquer pour de vrai ».
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {applySuccess && (
        <div className="mb-6 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          Modifications appliquées à tes vraies dépenses fixes ✓
        </div>
      )}

      <div className="grid gap-6">
        <Card
          title="Dépenses fixes à tester"
          hint="Ajuste chaque dépense, ou ajoute-en une nouvelle à tester — sans rien changer pour de vrai."
        >
          {fixed.fixedExpenses.length === 0 ? (
            <p className="mb-3 text-sm text-muted">
              Aucune dépense fixe pour l'instant —{' '}
              <Link to="/budget" className="text-accent hover:text-accent/80">
                ajoutes-en dans Budget
              </Link>{' '}
              ou teste-en une hypothétique ci-dessous.
            </p>
          ) : (
            <div className="mb-3 divide-y divide-white/10">
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
            onRemove={removeHypothetical}
          />
        </Card>

        <Card title="Avant → après" hint="L'impact de ce scénario sur ton budget et ton score.">
          <BeforeAfterRow
            label="Budget disponible ce mois-ci"
            before={spendableBudgetBefore}
            after={spendableBudgetAfter}
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

        <Card
          title="Impact sur ton épargne"
          hint="Basé sur le rythme de tes contributions récentes, par objectif."
        >
          {goals.goals.length === 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Fixe un objectif dans Épargne pour voir l'impact de ce scénario sur ton épargne.
              </p>
              <Link
                to="/epargne"
                className="whitespace-nowrap rounded-lg bg-primary-strong px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
              >
                Fixer un objectif
              </Link>
            </div>
          ) : (
            <>
              <div className="divide-y divide-white/10">
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

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                  Épargne totale — {GRAPH_MONTHS} prochains mois
                </p>
                <SavingsComparisonChart
                  current={comparisonSeries.current}
                  simulated={comparisonSeries.simulated}
                />
              </div>
            </>
          )}
        </Card>

        {hasChanges && (
          <Card title="Prêt à l'appliquer ?" hint="Ceci modifiera tes vraies dépenses fixes.">
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
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-muted hover:text-ink"
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
          </Card>
        )}
      </div>
    </div>
  )
}
