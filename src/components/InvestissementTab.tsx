import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from './Card'
import { GrowthChart } from './GrowthChart'
import { ContributionsVsInterestChart } from './ContributionsVsInterestChart'
import { QuickAmountEdit } from './QuickAmountEdit'
import { BeforeAfterRow } from './BeforeAfterRow'
import { BudgetInsight } from './BudgetInsight'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useInvestmentBalance } from '../hooks/useInvestmentBalance'
import { useLanguage } from '../hooks/useLanguage'
import { formatCurrency, formatCurrencyEN } from '../lib/format'
import { EPARGNE } from '../lib/i18n/epargne'
import { COMMON } from '../lib/i18n/common'
import {
  PROJECTION_HORIZONS_YEARS,
  computeContributionsBreakdown,
  estimateMonthsToReachAmount,
  formatMonthsAsDuration,
  getRuleOf72Years,
  projectSeries,
  projectValue,
} from '../lib/investment'

// Self-contained (own hook instances) — was its own route, now the
// Investissement tab on Épargne. Kept independent of the Objectifs tab's
// already-loaded goals rather than threaded through props, same tradeoff as
// every other self-contained tab in this app (RecategorizeCard, etc.).
export function InvestissementTab() {
  const { lang } = useLanguage()
  const t = EPARGNE[lang].investissementTab
  const formatMoney = lang === 'fr' ? formatCurrency : formatCurrencyEN
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
      ? t.ruleOf72(input.annualRatePercent, ruleOf72Years.toFixed(1))
      : t.ruleOf72Fallback

  if (investmentBalance.loading) {
    return <p className="text-sm text-muted">{COMMON[lang].app.loading}</p>
  }

  const error = investmentBalance.error || goals.error

  return (
    <div>
      <QuickAmountEdit
        label={t.currentAmountLabel}
        amount={investmentBalance.currentAmount}
        onChange={investmentBalance.setCurrentAmount}
        hint={t.currentAmountHint}
      />

      {error && (
        <div className="mb-6 mt-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6">
        <Card title={t.settingsTitle} hint={t.settingsHint}>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm text-muted">
              {t.initialAmountLabel}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-muted">
              {t.annualRateLabel}
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={annualRatePercent}
                onChange={(e) => setAnnualRatePercent(e.target.value)}
                className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-muted">
              {t.monthlyContributionLabel}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </label>
          </div>
        </Card>

        <Card title={t.projectionTitle} hint={t.projectionHint}>
          <div className="mb-4 flex flex-wrap gap-2">
            {PROJECTION_HORIZONS_YEARS.map((years) => (
              <button
                key={years}
                type="button"
                onClick={() => setHorizonYears(years)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  horizonYears === years
                    ? 'bg-primary-strong text-white'
                    : 'bg-overlay/5 text-muted hover:text-ink'
                }`}
              >
                {t.years(years)}
              </button>
            ))}
          </div>

          <p className="text-3xl font-bold text-success sm:text-4xl">
            {formatMoney(breakdown.finalValue)}
          </p>
          <p className="mb-4 text-xs text-muted">{t.estimatedValueIn(horizonYears)}</p>

          <GrowthChart points={growthSeries} />
        </Card>

        <Card title={t.monthlyImpactTitle} hint={t.monthlyImpactHint(formatMoney(input.monthlyContribution), horizonYears)}>
          <BeforeAfterRow
            label={t.finalValueLabel}
            before={withoutContributionValue}
            after={breakdown.finalValue}
            formatValue={formatMoney}
            higherIsBetter
          />
        </Card>

        <Card title={t.whereMoneyTitle} hint={t.whereMoneyHint(horizonYears)}>
          <ContributionsVsInterestChart
            totalContributions={breakdown.totalContributions}
            interestEarned={breakdown.interestEarned}
            finalValue={breakdown.finalValue}
          />
        </Card>

        <BudgetInsight text={ruleOf72Text} />

        <Card title={t.goalsTitle} hint={t.goalsHint}>
          {goals.loading ? (
            <p className="text-sm text-muted">{COMMON[lang].app.loading}</p>
          ) : goals.goals.length === 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">{t.noGoalsHint}</p>
              <Link
                to="/epargne/objectifs"
                className="whitespace-nowrap rounded-lg bg-primary-strong px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
              >
                {t.setGoalButton}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-overlay/10">
              {goals.goals.map((goal) => {
                const alreadyMet = goal.targetAmount > 0 && goal.currentAmount >= goal.targetAmount
                const months = alreadyMet ? null : estimateMonthsToReachAmount(input, goal.targetAmount)

                return (
                  <li key={goal.id} className="py-3 text-sm">
                    <p className="font-medium text-ink">{goal.name}</p>
                    <p className="text-muted">
                      {alreadyMet
                        ? t.alreadyReached
                        : months !== null
                          ? t.wouldReachWithParams(formatMonthsAsDuration(months, lang))
                          : t.wouldNotReach}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <p className="text-xs text-muted">{t.disclaimer}</p>
      </div>
    </div>
  )
}
