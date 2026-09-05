import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useIncome } from '../hooks/useIncome'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { useExpenses } from '../hooks/useExpenses'
import { useMonthlyExpenses } from '../hooks/useMonthlyExpenses'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useSubscription } from '../hooks/useSubscription'
import { usePreferences } from '../hooks/usePreferences'
import { getMonthRange, formatCurrency } from '../lib/format'
import {
  computeCategoryBreakdown,
  computeMonthlyTrend,
  generateBudgetInsight,
  getSpendableBudgetCaption,
  sumThisMonth,
} from '../lib/budgetInsights'
import { getCategoryShareAlert } from '../lib/alerts'
import { canImportCsv, FREE_CSV_IMPORT_LIMIT } from '../lib/plans'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { EmptyState } from '../components/EmptyState'
import { AlertBanner } from '../components/AlertBanner'
import { IncomeInput } from '../components/IncomeInput'
import { FixedExpenses } from '../components/FixedExpenses'
import { RecentExpenses } from '../components/RecentExpenses'
import { CategoryBreakdown } from '../components/CategoryBreakdown'
import { ExpenseTrendChart } from '../components/ExpenseTrendChart'
import { BudgetInsight } from '../components/BudgetInsight'
import { PageSkeleton } from '../components/PageSkeleton'
import { TabBar, type TabDef } from '../components/TabBar'
import { CategoryManager } from '../components/CategoryManager'
import { CategorySuggestions } from '../components/CategorySuggestions'
import { RecategorizeCard } from '../components/RecategorizeCard'
import { ImportTransactionsModal } from '../components/ImportTransactionsModal'
import { UpgradePrompt } from '../components/UpgradePrompt'

type Tab = 'depenses' | 'categories' | 'import'
const TABS: Tab[] = ['depenses', 'categories', 'import']
const TAB_DEFS: TabDef<Tab>[] = [
  { key: 'depenses', label: 'Dépenses' },
  { key: 'categories', label: 'Catégories' },
  { key: 'import', label: 'Import' },
]

const DEPENSES_HELP = {
  title: 'Dépenses',
  purpose:
    'Suis tes dépenses par catégorie ce mois-ci, et compare-les à ton revenu et tes dépenses fixes.',
  actions: [
    'Ajoute ton revenu mensuel et tes dépenses fixes (loyer, abonnements...).',
    'Enregistre une dépense et choisis sa catégorie.',
    'Repère les catégories où tu dépasses ton budget habituel.',
  ],
}

const CATEGORIES_HELP = {
  title: 'Catégories',
  purpose: 'Gère tes catégories de dépenses, leur budget mensuel, et corrige leur classement.',
  actions: [
    'Ajoute, renomme ou fixe un budget mensuel pour une catégorie.',
    'Accepte les suggestions de nouvelles catégories détectées dans tes dépenses.',
    'Relance le classement automatique sur tes dépenses déjà enregistrées.',
  ],
}

const IMPORT_HELP = {
  title: 'Import',
  purpose: 'Importe un relevé bancaire au lieu de saisir tes dépenses une par une.',
  actions: [
    "Choisis un fichier .csv ou .xlsx depuis ta banque.",
    "Associe les colonnes du fichier aux bons champs.",
    'Confirme pour ajouter toutes les transactions à ton budget.',
  ],
}

const HELP_BY_TAB: Record<Tab, typeof DEPENSES_HELP> = {
  depenses: DEPENSES_HELP,
  categories: CATEGORIES_HELP,
  import: IMPORT_HELP,
}

export function Budget() {
  const { tab: tabParam } = useParams<{ tab: string }>()
  const navigate = useNavigate()
  const income = useIncome()
  const fixed = useFixedExpenses()
  const spending = useExpenses()
  const monthly = useMonthlyExpenses()
  const history = useExpenseHistory()
  const contributions = useSavingsContributions()
  const subscription = useSubscription()
  const preferences = usePreferences()
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const loading =
    income.loading ||
    fixed.loading ||
    spending.loading ||
    monthly.loading ||
    history.loading ||
    contributions.loading
  const error =
    income.error || fixed.error || spending.error || monthly.error || history.error || contributions.error

  const savingsThisMonth = useMemo(
    () => sumThisMonth(contributions.contributions),
    [contributions.contributions],
  )

  // What's left to spend this month, after fixed costs AND savings
  // contributions already made — not just fixed costs. Kept unclamped for
  // the "alloué" caption (so an over-committed month is explained rather
  // than showing an unexplained $0) and clamped for anything doing math
  // with it (percentages, the weekly split).
  const rawSpendableBudget = useMemo(
    () => income.monthlyIncome - fixed.totalFixedExpenses - savingsThisMonth,
    [income.monthlyIncome, fixed.totalFixedExpenses, savingsThisMonth],
  )
  const spendableBudget = Math.max(0, rawSpendableBudget)

  const thisMonthRecords = useMemo(() => {
    const { start, end } = getMonthRange(new Date())
    return history.records.filter((r) => {
      const d = new Date(r.spent_at)
      return d >= start && d < end
    })
  }, [history.records])

  const categoryBreakdown = useMemo(
    () => computeCategoryBreakdown(fixed.fixedExpenses, thisMonthRecords, savingsThisMonth),
    [fixed.fixedExpenses, thisMonthRecords, savingsThisMonth],
  )
  const monthlyTrend = useMemo(() => computeMonthlyTrend(history.records), [history.records])
  const insightText = useMemo(() => generateBudgetInsight(history.records), [history.records])
  const categoryShareAlert = useMemo(() => getCategoryShareAlert(history.records), [history.records])

  if (!tabParam || !TABS.includes(tabParam as Tab)) {
    return <Navigate to="/budget/depenses" replace />
  }
  const tab = tabParam as Tab

  if (tab === 'depenses' && loading) {
    return <PageSkeleton cards={5} />
  }

  if (tab === 'depenses' && income.monthlyIncome === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-10">
        <PageHeader
          title="Où va ton argent ce mois-ci"
          subtitle="Revenu, dépenses fixes et budget de la semaine."
          help={DEPENSES_HELP}
        />

        <TabBar tabs={TAB_DEFS} active={tab} onChange={(next) => navigate(`/budget/${next}`)} />

        {error && (
          <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {showIncomeForm ? (
          <IncomeInput monthlyIncome={income.monthlyIncome} onChange={income.setMonthlyIncome} />
        ) : (
          <EmptyState
            title="Tu n'as pas encore de budget"
            description="Commence par ajouter ton revenu mensuel — le reste se calcule automatiquement à partir de là."
            actionLabel="Ajouter mes revenus"
            onAction={() => setShowIncomeForm(true)}
          />
        )}
      </div>
    )
  }

  const remainingThisMonth = spendableBudget - monthly.spentThisMonth
  const isOverBudget = remainingThisMonth < 0
  const spentPct = spendableBudget > 0 ? (monthly.spentThisMonth / spendableBudget) * 100 : 100
  const monthProgressPct = monthly.monthProgress * 100

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Où va ton argent ce mois-ci"
        subtitle="Revenu, dépenses fixes et budget de la semaine."
        help={HELP_BY_TAB[tab]}
      />

      <TabBar tabs={TAB_DEFS} active={tab} onChange={(next) => navigate(`/budget/${next}`)} />

      {tab === 'depenses' && error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {tab === 'depenses' && (
        <>
          {subscription.limits.alerts && categoryShareAlert && (
            <div className="mb-6">
              <AlertBanner>{categoryShareAlert}</AlertBanner>
            </div>
          )}

          <div className="grid gap-4">
            <div className="glass rounded-xl p-4 shadow-lg shadow-black/30">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Il te reste ce mois-ci
              </p>
              <p
                className={`mt-1 text-3xl font-bold sm:text-4xl ${
                  isOverBudget ? 'text-red-400' : 'text-success'
                }`}
              >
                {formatCurrency(remainingThisMonth)}
              </p>

              <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-overlay/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverBudget ? 'bg-red-400' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, spentPct)}%` }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-overlay/70"
                  style={{ left: `${Math.min(100, monthProgressPct)}%` }}
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                {Math.round(spentPct)}% dépensé · {Math.round(monthProgressPct)}% du mois écoulé
                (repère blanc)
              </p>
              <p className={`mt-1 text-xs ${rawSpendableBudget < 0 ? 'text-red-400' : 'text-muted'}`}>
                {getSpendableBudgetCaption(rawSpendableBudget)}
                {savingsThisMonth > 0 && rawSpendableBudget >= 0 && (
                  <> — inclut {formatCurrency(savingsThisMonth)} déjà mis de côté ce mois-ci.</>
                )}
              </p>
            </div>

            <Card
              title="Répartition par catégorie"
              hint="Dépenses fixes, dépenses du mois et épargne, regroupées par catégorie."
              compact
            >
              <CategoryBreakdown categories={categoryBreakdown} />
            </Card>

            <IncomeInput monthlyIncome={income.monthlyIncome} onChange={income.setMonthlyIncome} compact />

            <FixedExpenses
              expenses={fixed.fixedExpenses}
              total={fixed.totalFixedExpenses}
              onAdd={fixed.addFixedExpense}
              onUpdate={fixed.updateFixedExpense}
              onRemove={fixed.removeFixedExpense}
              compact
            />

            <RecentExpenses
              expenses={spending.expenses}
              onUpdate={spending.updateExpense}
              onRemove={spending.removeExpense}
              compact
            />

            <Card
              title="Tendance sur 3 mois"
              hint="Total de tes dépenses du jour le jour, mois par mois."
              compact
            >
              <ExpenseTrendChart months={monthlyTrend} />
            </Card>

            <BudgetInsight text={insightText} />
          </div>
        </>
      )}

      {tab === 'categories' && (
        <div className="grid gap-6">
          <CategoryManager />
          <CategorySuggestions />
          <RecategorizeCard />
        </div>
      )}

      {tab === 'import' && (
        <div className="grid gap-6">
          <Card
            title="Importer des transactions"
            hint="Depuis un relevé de carte de crédit ou de compte (.csv, .xlsx)."
          >
            {canImportCsv(subscription.plan, preferences.csvImportCount) ? (
              <div>
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className="rounded-lg bg-primary-strong px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
                >
                  Importer un fichier
                </button>
                {subscription.plan === 'free' && (
                  <p className="mt-2 text-xs text-muted">
                    Il te reste {FREE_CSV_IMPORT_LIMIT - preferences.csvImportCount} import
                    {FREE_CSV_IMPORT_LIMIT - preferences.csvImportCount > 1 ? 's' : ''} gratuit
                    {FREE_CSV_IMPORT_LIMIT - preferences.csvImportCount > 1 ? 's' : ''} sur le plan
                    Gratuit.
                  </p>
                )}
              </div>
            ) : (
              <UpgradePrompt
                title="Import CSV — fonctionnalité Standard"
                description={
                  subscription.plan === 'free'
                    ? `Tu as utilisé tes ${FREE_CSV_IMPORT_LIMIT} imports gratuits — passe à Standard pour un import illimité.`
                    : 'Importe directement un relevé bancaire au lieu de saisir tes dépenses une par une.'
                }
                minPlan="standard"
              />
            )}
          </Card>
        </div>
      )}

      <ImportTransactionsModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
