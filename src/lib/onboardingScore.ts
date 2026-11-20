import { computeAmountPerPay } from './onboardingGoalPace'
import {
  INCOME_RANGE_MIDPOINT,
  type FinancialMood,
  type FixedExpensesRange,
  type IncomeRange,
  type MoneyLeak,
  type PayFrequency,
} from './onboardingQuiz'

// Rough midpoint per bracket, same convention as INCOME_RANGE_MIDPOINT
// (onboardingQuiz.ts) — Q5 is a clickable range, never a typed amount, so
// this is the only numeric fixed-expenses figure the score can work with.
// "chez_parents" scores as $0 of fixed expenses — not literally true (rent
// money still moves somewhere), but there's no bracket for it to pick from
// and treating it as the lightest bracket is the least wrong assumption.
export const FIXED_EXPENSES_RANGE_MIDPOINT: Record<FixedExpensesRange, number> = {
  chez_parents: 0,
  moins_500: 400,
  '500_1500': 1000,
  plus_1500: 1800,
}

// Converts a monthly income figure to "per pay period", matching
// computeAmountPerPay's own frequency handling (lib/onboardingGoalPace.ts)
// — variable pay ("ça change") and unset both fall back to a monthly
// pace, so the two numbers being compared (income per pay, goal amount
// per pay) always use the same period length.
function incomePerPayPeriod(monthlyIncome: number, payFrequency: PayFrequency | null): number {
  if (payFrequency === 'hebdomadaire') return (monthlyIncome * 12) / 52
  if (payFrequency === 'aux_deux_semaines') return (monthlyIncome * 12) / 26
  return monthlyIncome
}

export type ScoreTier = 'great' | 'good' | 'tight' | 'strained'

export interface OnboardingScoreInput {
  incomeRange: IncomeRange
  fixedExpensesRange: FixedExpensesRange
  moneyLeaks: MoneyLeak[]
  financialMood: FinancialMood
  goalAmount: number
  goalDate: string | null
  payFrequency: PayFrequency | null
}

export interface OnboardingScoreResult {
  score: number
  monthlyIncome: number
  fixedExpensesRatio: number
  fixedExpensesTier: ScoreTier
  // null when there's no target date to pace against (Q8's date is
  // optional) — the goal itself still gets created either way, there's
  // just nothing to compare its pace to.
  goalPacePctOfIncome: number | null
  goalPaceTier: ScoreTier | 'unknown'
  leaksCount: number
  leaksUnknown: boolean
  topLeak: MoneyLeak | null
  moodTier: ScoreTier
}

// Simple, fully deterministic point rules (no AI, no hidden model) — four
// factors, each worth a fixed share of the 100-point total:
//  - fixed expenses / income ratio (40 pts): the single biggest predictor
//    of how much breathing room a budget has.
//  - goal pace vs. income (25 pts): computeAmountPerPay's "$ per paycheck"
//    figure, as a % of income per the same pay period — a goal asking for
//    40% of every paycheck is a very different proposition than one
//    asking for 5%.
//  - money leaks awareness (20 pts): fewer identified leaks (or, worse,
//    not knowing) scores lower than a couple of named, specific ones —
//    naming them is itself a sign of awareness.
//  - how they feel about money (15 pts): self-reported, taken at face
//    value.
export function computeOnboardingScore(
  input: OnboardingScoreInput,
  today: Date = new Date(),
): OnboardingScoreResult {
  const monthlyIncome = INCOME_RANGE_MIDPOINT[input.incomeRange]
  const fixedExpenses = FIXED_EXPENSES_RANGE_MIDPOINT[input.fixedExpensesRange]
  const fixedExpensesRatio = monthlyIncome > 0 ? fixedExpenses / monthlyIncome : 0

  let fixedExpensesPoints: number
  let fixedExpensesTier: ScoreTier
  if (fixedExpensesRatio <= 0.3) {
    fixedExpensesPoints = 40
    fixedExpensesTier = 'great'
  } else if (fixedExpensesRatio <= 0.5) {
    fixedExpensesPoints = 30
    fixedExpensesTier = 'good'
  } else if (fixedExpensesRatio <= 0.7) {
    fixedExpensesPoints = 15
    fixedExpensesTier = 'tight'
  } else {
    fixedExpensesPoints = 5
    fixedExpensesTier = 'strained'
  }

  const perPay = computeAmountPerPay(input.goalAmount, input.goalDate, input.payFrequency, today)
  const incomePerPay = incomePerPayPeriod(monthlyIncome, input.payFrequency)
  let goalPoints: number
  let goalPacePctOfIncome: number | null = null
  let goalPaceTier: ScoreTier | 'unknown' = 'unknown'
  if (perPay === null || incomePerPay <= 0) {
    // No date to pace against (or no income on file, which shouldn't
    // happen by this point) — neither a good nor a bad sign either way,
    // so this factor contributes its midpoint rather than penalizing.
    goalPoints = 15
  } else {
    goalPacePctOfIncome = (perPay / incomePerPay) * 100
    if (goalPacePctOfIncome <= 10) {
      goalPoints = 25
      goalPaceTier = 'great'
    } else if (goalPacePctOfIncome <= 20) {
      goalPoints = 18
      goalPaceTier = 'good'
    } else if (goalPacePctOfIncome <= 35) {
      goalPoints = 10
      goalPaceTier = 'tight'
    } else {
      goalPoints = 4
      goalPaceTier = 'strained'
    }
  }

  const leaksUnknown = input.moneyLeaks.includes('sais_pas')
  const namedLeaks = input.moneyLeaks.filter((l): l is Exclude<MoneyLeak, 'sais_pas'> => l !== 'sais_pas')
  const leaksCount = namedLeaks.length
  const topLeak = namedLeaks[0] ?? null
  let leaksPoints: number
  if (leaksUnknown) leaksPoints = 10
  else if (leaksCount === 0) leaksPoints = 20
  else if (leaksCount <= 2) leaksPoints = 15
  else if (leaksCount <= 4) leaksPoints = 8
  else leaksPoints = 3

  let moodPoints: number
  let moodTier: ScoreTier
  if (input.financialMood === 'en_controle') {
    moodPoints = 15
    moodTier = 'great'
  } else if (input.financialMood === 'correct') {
    moodPoints = 9
    moodTier = 'good'
  } else {
    moodPoints = 3
    moodTier = 'strained'
  }

  const score = Math.round(fixedExpensesPoints + goalPoints + leaksPoints + moodPoints)

  return {
    score,
    monthlyIncome,
    fixedExpensesRatio,
    fixedExpensesTier,
    goalPacePctOfIncome,
    goalPaceTier,
    leaksCount,
    leaksUnknown,
    topLeak,
    moodTier,
  }
}
