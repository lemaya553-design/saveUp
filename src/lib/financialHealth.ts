function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function getScoreColorClass(score: number): string {
  if (score >= 70) return 'text-success'
  if (score >= 40) return 'text-accent'
  return 'text-red-400'
}

export interface ScoreExplanation {
  label: string
  value: number
  max: number
  detail: string
}

// Short, human-readable read on each of the three score components, so the
// score is never just a number with no way to know what to do about it.
export function getScoreExplanations(breakdown: FinancialHealthBreakdown): ScoreExplanation[] {
  return [
    {
      label: 'Rythme de dépenses',
      value: breakdown.budgetScore,
      max: 40,
      detail:
        breakdown.budgetScore >= 32
          ? 'Ton rythme de dépenses est bien aligné avec le mois.'
          : breakdown.budgetScore >= 20
            ? 'Tu dépenses un peu plus vite que le mois n’avance.'
            : 'Tu dépenses beaucoup plus vite que le mois n’avance — ralentis pour remonter ce score.',
    },
    {
      label: 'Régularité d’épargne',
      value: breakdown.savingsScore,
      max: 30,
      detail:
        breakdown.savingsScore >= 24
          ? 'Tu épargnes régulièrement, ça fait toute la différence.'
          : breakdown.savingsScore >= 12
            ? 'Épargne un peu plus souvent pour améliorer ce score.'
            : 'Aucune épargne régulière récente — même un petit montant chaque semaine aide.',
    },
    {
      label: 'Dépenses fixes vs revenu',
      value: breakdown.fixedRatioScore,
      max: 30,
      detail:
        breakdown.fixedRatioScore >= 24
          ? 'Tes dépenses fixes laissent une bonne marge de manœuvre.'
          : breakdown.fixedRatioScore >= 12
            ? 'Tes dépenses fixes prennent une part correcte de ton revenu.'
            : 'Tes dépenses fixes prennent une grande part de ton revenu, ce qui limite ta marge.',
    },
  ]
}

// Fraction (0-1) of the last `weeks` weeks that had at least one savings
// contribution — a proxy for "does the user save regularly" rather than
// just "how much have they saved in total".
export function computeSavingsRegularity(
  contributions: { created_at: string }[],
  now: Date,
  weeks = 8,
): number {
  if (weeks <= 0) return 0
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const cutoff = now.getTime() - weeks * msPerWeek
  const weeksWithContribution = new Set<number>()

  for (const contribution of contributions) {
    const time = new Date(contribution.created_at).getTime()
    if (time < cutoff || time > now.getTime()) continue
    weeksWithContribution.add(Math.floor((now.getTime() - time) / msPerWeek))
  }

  return Math.min(1, weeksWithContribution.size / weeks)
}

export interface FinancialHealthInput {
  monthlyIncome: number
  totalFixedExpenses: number
  spentThisMonth: number
  /** 0 (start of month) to 1 (end of month). */
  monthProgress: number
  contributions: { created_at: string }[]
  now?: Date
}

export interface FinancialHealthBreakdown {
  score: number
  budgetScore: number
  savingsScore: number
  fixedRatioScore: number
  /** Spending pace vs. time elapsed this month — 1 means right on pace, >1 means spending faster than the month is passing. */
  paceRatio: number
  fixedExpenseRatio: number
  savingsRegularity: number
}

export function computeBudgetScore(
  spentThisMonth: number,
  discretionaryBudget: number,
  monthProgress: number,
): number {
  const pace = discretionaryBudget > 0 ? spentThisMonth / discretionaryBudget : 1
  const progress = Math.max(monthProgress, 0.03)
  const paceRatio = pace / progress
  return Math.round(clamp(40 * (1 - Math.max(0, paceRatio - 1)), 0, 40))
}

export function computeFixedRatioScore(totalFixedExpenses: number, monthlyIncome: number): number {
  const fixedExpenseRatio = monthlyIncome > 0 ? totalFixedExpenses / monthlyIncome : 1
  return Math.round(clamp(30 * (1 - Math.max(0, (fixedExpenseRatio - 0.5) / 0.5)), 0, 30))
}

// Score out of 100, split three ways:
//  - 40 pts: are you spending your discretionary budget at a sane pace for
//    how far into the month we are (not just "under budget" — "on pace").
//  - 30 pts: do you save something most weeks, not just occasionally.
//  - 30 pts: how much of your income is already locked into fixed expenses
//    (a lower ratio leaves more room to absorb surprises).
export function computeFinancialHealth(input: FinancialHealthInput): FinancialHealthBreakdown {
  const now = input.now ?? new Date()

  const discretionaryBudget = Math.max(0, input.monthlyIncome - input.totalFixedExpenses)
  const paceRatio =
    (discretionaryBudget > 0 ? input.spentThisMonth / discretionaryBudget : 1) /
    Math.max(input.monthProgress, 0.03)
  const budgetScore = computeBudgetScore(input.spentThisMonth, discretionaryBudget, input.monthProgress)

  const savingsRegularity = computeSavingsRegularity(input.contributions, now)
  const savingsScore = Math.round(30 * savingsRegularity)

  const fixedExpenseRatio =
    input.monthlyIncome > 0 ? input.totalFixedExpenses / input.monthlyIncome : 1
  const fixedRatioScore = computeFixedRatioScore(input.totalFixedExpenses, input.monthlyIncome)

  const score = clamp(budgetScore + savingsScore + fixedRatioScore, 0, 100)

  return {
    score,
    budgetScore,
    savingsScore,
    fixedRatioScore,
    paceRatio,
    fixedExpenseRatio,
    savingsRegularity,
  }
}
