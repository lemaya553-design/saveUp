// Answer types for Onboarding.tsx's 10-question flow. File/path kept as
// "onboardingQuiz" for low churn — PAY_FREQUENCIES/PayFrequency here are
// shared with Paramètres' PayScheduleSettings.tsx and
// BudgetPayPeriodCard.tsx/lib/payPeriod.ts, which predate and are
// independent of the onboarding flow itself; don't rename/move them without
// updating those call sites too. The 15-question archetype quiz this file
// used to score (and its result/setup/plans "3-phase" flow) was replaced
// outright by the simpler 10-question flow below — see git history for the
// old scoring rubric if it's ever needed again.

export const PAY_FREQUENCIES = ['hebdomadaire', 'aux_deux_semaines', 'mensuelle', 'ca_change'] as const
export type PayFrequency = (typeof PAY_FREQUENCIES)[number]

export const WORK_STATUSES = ['etudiant', 'travail', 'les_deux'] as const
export type WorkStatus = (typeof WORK_STATUSES)[number]

export const INCOME_RANGES = ['moins_500', '500_1500', '1500_3000', '3000_plus'] as const
export type IncomeRange = (typeof INCOME_RANGES)[number]

// Rough midpoint per bracket, in dollars — the only numeric income value
// the new flow ever produces (Q3 is a clickable range, never a typed
// amount). Saved to budget_settings via useIncome.setMonthlyIncome so the
// rest of the app (Budget, NeedsLimitCard, health score) has a real number
// to work with immediately, same as the old onboarding always did; the raw
// bracket itself is kept too (user_preferences.income_range) for reference.
export const INCOME_RANGE_MIDPOINT: Record<IncomeRange, number> = {
  moins_500: 400,
  '500_1500': 1000,
  '1500_3000': 2250,
  '3000_plus': 3500,
}

export const FIXED_EXPENSES_RANGES = ['chez_parents', 'moins_500', '500_1500', 'plus_1500'] as const
export type FixedExpensesRange = (typeof FIXED_EXPENSES_RANGES)[number]

export const MONEY_LEAKS = ['restos', 'shopping', 'abonnements', 'sorties', 'jeux', 'sais_pas'] as const
export type MoneyLeak = (typeof MONEY_LEAKS)[number]

export const SAVINGS_GOAL_TYPES = ['voyage', 'auto', 'appart', 'urgence', 'autre'] as const
export type SavingsGoalType = (typeof SAVINGS_GOAL_TYPES)[number]

export const FINANCIAL_MOODS = ['en_controle', 'correct', 'stresse'] as const
export type FinancialMood = (typeof FINANCIAL_MOODS)[number]

export const WHATSAPP_STATUSES = ['given', 'declined'] as const
export type WhatsappStatus = (typeof WHATSAPP_STATUSES)[number]
