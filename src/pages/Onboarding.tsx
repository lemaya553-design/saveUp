import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProgressBar } from '../components/ProgressBar'
import { ImportTransactionsModal } from '../components/ImportTransactionsModal'
import { UpgradePrompt } from '../components/UpgradePrompt'
import { formatCurrency, getFarFutureDateString, getTodayDateString } from '../lib/format'
import { useIncome } from '../hooks/useIncome'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useCategories } from '../hooks/useCategories'
import { useExpenses } from '../hooks/useExpenses'
import { useSubscription } from '../hooks/useSubscription'
import {
  DEMO_CATEGORY_NAMES,
  DEMO_CONTRIBUTIONS,
  DEMO_FIXED_EXPENSES,
  DEMO_GOAL,
  DEMO_INCOME,
  buildDemoExpenseRows,
} from '../lib/demoData'

const STEPS = ['Données de départ', 'Revenu', 'Dépenses fixes', 'Objectif d’épargne']

export function Onboarding() {
  const navigate = useNavigate()
  const income = useIncome()
  const fixed = useFixedExpenses()
  const goals = useSavingsGoals()
  const categories = useCategories()
  const expenses = useExpenses()
  const subscription = useSubscription()

  const [step, setStep] = useState(0)
  const [importOpen, setImportOpen] = useState(false)
  const [seedingDemo, setSeedingDemo] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const [incomeDraft, setIncomeDraft] = useState('')
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [goalName, setGoalName] = useState('Mon premier objectif')
  const [goalAmount, setGoalAmount] = useState('')
  const [goalDate, setGoalDate] = useState('')

  function finish() {
    navigate('/dashboard')
  }

  // Fills every part of the account (income, categories, fixed expenses,
  // 3 months of varied transactions, a goal with contributions already in
  // progress) so a brand-new account looks like one that's actually been
  // used, without needing real data. Sequential, not parallel — categories
  // must exist before fixed expenses/goal reference them by name, and each
  // step's own hook already updates its local state as it goes.
  async function handleFillDemo() {
    setSeedingDemo(true)
    setDemoError(null)
    try {
      await income.setMonthlyIncome(DEMO_INCOME)
      // The demo data must respect the account's own plan limits too — a
      // Free account seeding 6 example categories against a 5-category cap
      // would land it over its own limit before the user ever touched
      // anything themselves.
      const categoryNamesToSeed =
        subscription.limits.maxCategories === null
          ? DEMO_CATEGORY_NAMES
          : DEMO_CATEGORY_NAMES.slice(0, subscription.limits.maxCategories)
      for (const name of categoryNamesToSeed) {
        await categories.addCategory(name)
      }
      for (const fx of DEMO_FIXED_EXPENSES) {
        await fixed.addFixedExpense(fx.name, fx.amount, fx.category)
      }
      const { error: importError } = await expenses.addExpensesBulk(buildDemoExpenseRows())
      if (importError) throw new Error(importError)
      const goal = await goals.addGoal(DEMO_GOAL.name, DEMO_GOAL.targetAmount, DEMO_GOAL.targetDate)
      if (goal) {
        for (const amount of DEMO_CONTRIBUTIONS) {
          await goals.addContribution(goal.id, amount)
        }
      }
      finish()
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : "Impossible de générer l'exemple — réessaie.")
      setSeedingDemo(false)
    }
  }

  // Whether "fresh account" is decided by real data now (see Dashboard's
  // isFreshUser), not a flag. Skipping before ever submitting the income
  // step means no budget_settings row exists yet, which would look
  // identical to "never seen onboarding" and bounce them right back here —
  // so explicitly persist the (possibly still-0) income value to create
  // that row and mark the account as touched.
  async function skip() {
    await income.setMonthlyIncome(income.monthlyIncome)
    navigate('/dashboard')
  }

  async function handleIncomeSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = Math.max(0, Number(incomeDraft) || 0)
    await income.setMonthlyIncome(value)
    setStep(2)
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(expenseAmount)
    if (!expenseName.trim() || !parsed || parsed <= 0) return
    await fixed.addFixedExpense(expenseName.trim(), parsed)
    setExpenseName('')
    setExpenseAmount('')
  }

  async function handleGoalSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Math.max(0, Number(goalAmount) || 0)
    if (!goalName.trim() || parsed <= 0) return
    await goals.addGoal(goalName.trim(), parsed, goalDate || null)
    finish()
  }

  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass w-full max-w-lg rounded-2xl p-8 shadow-2xl shadow-black/40">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>
              Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
            </span>
            <button type="button" onClick={skip} className="text-muted hover:text-ink">
              Passer pour l’instant
            </button>
          </div>
          <ProgressBar value={((step + 1) / STEPS.length) * 100} colorClass="bg-primary" />
        </div>

        {step === 0 && (
          <div>
            <h1 className="text-2xl font-bold text-ink">Remplis ton compte pour voir l’app en action</h1>
            <p className="mt-2 text-sm text-muted">
              Un compte tout neuf est vide, ce qui rend difficile de voir à quoi ça ressemble en
              usage réel. Importe tes vraies transactions, ou remplis ton compte avec un exemple —
              les deux sont optionnels.
            </p>

            <div className="mt-6 grid gap-3">
              {subscription.limits.csvImport ? (
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className="glass rounded-2xl p-4 text-left transition-colors hover:bg-white/5"
                >
                  <p className="font-semibold text-ink">📄 Importer mon relevé bancaire</p>
                  <p className="mt-1 text-sm text-muted">
                    Depuis un fichier .csv ou .xlsx exporté de ta banque — tes vraies transactions,
                    catégorisées automatiquement.
                  </p>
                </button>
              ) : (
                <UpgradePrompt
                  title="Import CSV — fonctionnalité Standard"
                  description="Sur le plan Gratuit, ajoute tes dépenses à la main — ou passe à Standard pour importer un relevé bancaire directement."
                  minPlan="standard"
                />
              )}

              <button
                type="button"
                onClick={handleFillDemo}
                disabled={seedingDemo}
                className="glass rounded-2xl p-4 text-left transition-colors hover:bg-white/5 disabled:opacity-60"
              >
                <p className="font-semibold text-ink">✨ Voir un exemple</p>
                <p className="mt-1 text-sm text-muted">
                  {seedingDemo
                    ? 'Génération des données d’exemple...'
                    : 'Remplis ton compte avec des données fictives réalistes, pour explorer l’app tout de suite.'}
                </p>
              </button>
            </div>

            {demoError && (
              <p className="mt-3 rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
                {demoError}
              </p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-white/5"
              >
                Continuer sans importer →
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleIncomeSubmit}>
            <h1 className="text-2xl font-bold text-ink">C’est quoi ton revenu mensuel ?</h1>
            <p className="mt-2 text-sm text-muted">
              On s’en sert pour calculer ce que tu peux dépenser chaque semaine, automatiquement.
            </p>
            <label className="mt-6 flex items-center gap-2">
              <span className="text-muted">$</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                autoFocus
                value={incomeDraft}
                onChange={(e) => setIncomeDraft(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-lg text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110"
            >
              Continuer
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-ink">Tes dépenses fixes principales</h1>
            <p className="mt-2 text-sm text-muted">
              Loyer, abonnements, assurances — tout ce qui revient chaque mois. Tu pourras en
              ajouter d’autres plus tard.
            </p>

            <form onSubmit={handleAddExpense} className="mt-6 flex flex-wrap gap-2">
              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="Nom (ex: Loyer)"
                className="min-w-[140px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Montant"
                className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110"
              >
                Ajouter
              </button>
            </form>

            {fixed.fixedExpenses.length > 0 && (
              <ul className="mt-4 divide-y divide-white/10">
                {fixed.fixedExpenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-ink">{expense.name}</span>
                    <span className="text-muted">{formatCurrency(expense.amount)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-white/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-white/5"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 rounded-lg bg-primary-strong px-5 py-2 font-medium text-white transition-all hover:brightness-110"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleGoalSubmit}>
            <h1 className="text-2xl font-bold text-ink">Fixe un premier objectif d’épargne</h1>
            <p className="mt-2 text-sm text-muted">
              Un montant à atteindre, et une date si tu en as une en tête. Tu pourras l’ajuster
              n’importe quand.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="Nom de l’objectif"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="Montant cible"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
              <label className="flex flex-col gap-1 text-xs text-muted">
                Échéance (optionnel)
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  min={getTodayDateString()}
                  max={getFarFutureDateString()}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-white/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-white/5"
              >
                Retour
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-success px-5 py-2 font-semibold text-canvas transition-all hover:brightness-110"
              >
                Terminer
              </button>
            </div>
          </form>
        )}
      </div>

      <ImportTransactionsModal
        open={importOpen}
        onClose={() => {
          setImportOpen(false)
          setStep(1)
        }}
      />
    </div>
  )
}
