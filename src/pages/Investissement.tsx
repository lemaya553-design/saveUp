import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { GrowthChart } from '../components/GrowthChart'
import { ContributionsVsInterestChart } from '../components/ContributionsVsInterestChart'
import { QuickAmountEdit } from '../components/QuickAmountEdit'
import { BeforeAfterRow } from '../components/BeforeAfterRow'
import { BudgetInsight } from '../components/BudgetInsight'
import { PageSkeleton } from '../components/PageSkeleton'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useInvestmentBalance } from '../hooks/useInvestmentBalance'
import { formatCurrency } from '../lib/format'
import {
  PROJECTION_HORIZONS_YEARS,
  computeContributionsBreakdown,
  estimateMonthsToReachAmount,
  formatMonthsAsDuration,
  getRuleOf72Years,
  projectSeries,
  projectValue,
} from '../lib/investment'

export function Investissement() {
  const goals = useSavingsGoals()
  const investmentBalance = useInvestmentBalance()
  const [initialAmount, setInitialAmount] = useState('1000')
  const [annualRatePercent, setAnnualRatePercent] = useState('5')
  const [monthlyContribution, setMonthlyContribution] = useState('100')
  const [horizonYears, setHorizonYears] = useState(5)

  const input = {
    initialAmount: Math.max(0, Number(initialAmount) || 0),
    annualRatePercent: Number(annualRatePercent) || 0,
    monthlyContribution: Math.max(0, Number(monthlyContribution) || 0),
  }

  const growthSeries = useMemo(
    () => projectSeries(input, horizonYears),
    [input.initialAmount, input.annualRatePercent, input.monthlyContribution, horizonYears],
  )

  const breakdown = useMemo(
    () => computeContributionsBreakdown(input, horizonYears),
    [input.initialAmount, input.annualRatePercent, input.monthlyContribution, horizonYears],
  )

  const withoutContributionValue = useMemo(
    () => projectValue({ ...input, monthlyContribution: 0 }, horizonYears),
    [input.initialAmount, input.annualRatePercent, horizonYears],
  )

  const ruleOf72Years = useMemo(
    () => getRuleOf72Years(input.annualRatePercent),
    [input.annualRatePercent],
  )

  const ruleOf72Text =
    ruleOf72Years !== null
      ? `La règle du 72 : à ${input.annualRatePercent}% par année, un montant placé double environ tous les ${ruleOf72Years.toFixed(1)} ans, grâce à l'intérêt composé.`
      : "La règle du 72 estime le temps pour doubler un placement (72 ÷ taux). Choisis un taux de rendement positif ci-dessus pour voir l'estimation."

  if (investmentBalance.loading) {
    return <PageSkeleton cards={4} />
  }

  const error = investmentBalance.error || goals.error

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Combien ça pourrait rapporter"
        subtitle="Projette la croissance d'un placement avec intérêt composé."
      />

      <QuickAmountEdit
        label="Montant actuellement investi"
        amount={investmentBalance.currentAmount}
        onChange={investmentBalance.setCurrentAmount}
        hint="Ton vrai montant investi à ce jour."
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <Card
          title="Paramètres"
          hint="Un scénario hypothétique — n'affecte pas ton montant réellement investi ci-dessus."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm text-muted">
              Montant initial
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-muted">
              Taux de rendement annuel estimé (%)
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={annualRatePercent}
                onChange={(e) => setAnnualRatePercent(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-muted">
              Contribution mensuelle
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </label>
          </div>
        </Card>

        <Card title="Projection" hint="Ce que ton placement pourrait valoir, selon l'horizon choisi.">
          <div className="mb-4 flex flex-wrap gap-2">
            {PROJECTION_HORIZONS_YEARS.map((years) => (
              <button
                key={years}
                type="button"
                onClick={() => setHorizonYears(years)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  horizonYears === years
                    ? 'bg-primary-strong text-white'
                    : 'bg-white/5 text-muted hover:text-ink'
                }`}
              >
                {years} an{years > 1 ? 's' : ''}
              </button>
            ))}
          </div>

          <p className="text-3xl font-bold text-success sm:text-4xl">
            {formatCurrency(breakdown.finalValue)}
          </p>
          <p className="mb-4 text-xs text-muted">
            Valeur estimée dans {horizonYears} an{horizonYears > 1 ? 's' : ''}.
          </p>

          <GrowthChart points={growthSeries} />
        </Card>

        <Card
          title="Impact de ta contribution mensuelle"
          hint={`Ce que ${formatCurrency(input.monthlyContribution)}/mois change sur ${horizonYears} an${horizonYears > 1 ? 's' : ''}.`}
        >
          <BeforeAfterRow
            label="Valeur finale"
            before={withoutContributionValue}
            after={breakdown.finalValue}
            formatValue={formatCurrency}
            higherIsBetter
          />
        </Card>

        <Card
          title="D'où vient l'argent"
          hint={`Répartition entre tes contributions et les intérêts gagnés, sur ${horizonYears} an${horizonYears > 1 ? 's' : ''}.`}
        >
          <ContributionsVsInterestChart
            totalContributions={breakdown.totalContributions}
            interestEarned={breakdown.interestEarned}
            finalValue={breakdown.finalValue}
          />
        </Card>

        <BudgetInsight text={ruleOf72Text} />

        <Card
          title="Tes objectifs d'épargne"
          hint="Combien de temps il te faudrait pour les atteindre avec ces paramètres."
        >
          {goals.loading ? (
            <p className="text-sm text-muted">Chargement...</p>
          ) : goals.goals.length === 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Fixe un objectif dans Épargne pour voir combien de temps il te faudrait pour
                l'atteindre avec ces paramètres.
              </p>
              <Link
                to="/epargne"
                className="whitespace-nowrap rounded-lg bg-primary-strong px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
              >
                Fixer un objectif
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {goals.goals.map((goal) => {
                const alreadyMet = goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount
                const months = alreadyMet ? null : estimateMonthsToReachAmount(input, goal.targetAmount)

                return (
                  <li key={goal.id} className="py-3 text-sm">
                    <p className="font-medium text-ink">{goal.name}</p>
                    <p className="text-muted">
                      {alreadyMet
                        ? '🎉 Déjà atteint.'
                        : months !== null
                          ? `Avec ces paramètres, tu l'atteindrais en environ ${formatMonthsAsDuration(months)}.`
                          : "Avec ces paramètres, tu ne l'atteindrais pas dans un horizon raisonnable — augmente le montant initial, la contribution ou le taux."}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <p className="text-xs text-muted">
          Ceci est un outil éducatif basé sur un calcul d'intérêt composé théorique et ne
          constitue pas un conseil financier. Les rendements réels varient et peuvent être
          négatifs.
        </p>
      </div>
    </div>
  )
}
