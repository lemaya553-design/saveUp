import { computeCategoryMonthOverMonth } from './statistics'
import { computeRequiredPace, estimateMonthlyRate } from './savingsProjection'
import { formatCurrency, formatCurrencyEN } from './format'
import type { MainGoal } from './onboardingProfile'
import { translateCategoryLabel } from './i18n/categoryLabels'
import type { Lang } from './i18n/language'

export interface Tip {
  id: string
  tone: 'warning' | 'positive' | 'neutral'
  message: string
}

interface Goal {
  id: string
  name: string
  currentAmount: number
  targetAmount: number
  targetDate: string | null
}

interface Contribution {
  amount: number
  created_at: string
  goal_id: string | null
}

interface TipInput {
  expenseRecords: { amount: number; category: string; spent_at: string }[]
  goals: Goal[]
  contributions: Contribution[]
  // What the user said their main goal was during onboarding (optional —
  // absent for accounts that onboarded before this question existed, or
  // skipped it). Only ever changes WORDING below, never which tips fire or
  // their thresholds — the underlying numbers are the same for everyone.
  mainGoal?: MainGoal | null
}

// Below this, a category's month-over-month % swing is noise (e.g. $8 ->
// $12 is "+50%" but not something worth telling anyone about).
const MIN_CATEGORY_AMOUNT = 20
const MIN_PCT_CHANGE = 20
// A goal counts as "ahead of pace" only once the margin is comfortable —
// right at 100% of the required rate is "on track," not tip-worthy.
const AHEAD_OF_PACE_MARGIN = 1.15
const CLOSE_TO_GOAL_THRESHOLD = 0.6

// Biggest category increase (warning) and biggest decrease (positive
// reinforcement) this month vs. last — real categories, real numbers, both
// sides only surfaced above the noise floor so a tip always means something.
function categoryChangeTips(
  records: { amount: number; category: string; spent_at: string }[],
  now: Date,
  mainGoal: MainGoal | null | undefined,
  lang: Lang,
): Tip[] {
  const money = lang === 'fr' ? formatCurrency : formatCurrencyEN
  const changes = computeCategoryMonthOverMonth(records, now).filter(
    (c) => c.pctChange !== null && c.lastMonth >= MIN_CATEGORY_AMOUNT && c.thisMonth >= MIN_CATEGORY_AMOUNT,
  )

  const tips: Tip[] = []

  const biggestIncrease = changes
    .filter((c) => (c.pctChange as number) >= MIN_PCT_CHANGE)
    .sort((a, b) => (b.pctChange as number) - (a.pctChange as number))[0]
  if (biggestIncrease) {
    const category = translateCategoryLabel(biggestIncrease.category, lang)
    const pct = Math.round(biggestIncrease.pctChange as number)
    const thisMonth = money(biggestIncrease.thisMonth)
    const lastMonth = money(biggestIncrease.lastMonth)
    // Someone who told us they're trying to get out of debt cares more
    // about an overspending signal than someone just exploring the app —
    // same number, more direct framing, still their real spending.
    const message =
      lang === 'fr'
        ? `${
            mainGoal === 'dettes' ? 'Pour atteindre ton objectif de réduire tes dettes : tes dépenses' : 'Tes dépenses'
          } en ${category} ont augmenté de ${pct} % ce mois-ci (${thisMonth} contre ${lastMonth} le mois dernier).`
        : `${
            mainGoal === 'dettes' ? 'To reach your goal of paying down debt: your' : 'Your'
          } ${category} spending is up ${pct}% this month (${thisMonth} vs. ${lastMonth} last month).`
    tips.push({
      id: `category-increase-${biggestIncrease.category}`,
      tone: 'warning',
      message,
    })
  }

  const biggestDecrease = changes
    .filter((c) => (c.pctChange as number) <= -MIN_PCT_CHANGE)
    .sort((a, b) => (a.pctChange as number) - (b.pctChange as number))[0]
  if (biggestDecrease) {
    const category = translateCategoryLabel(biggestDecrease.category, lang)
    const pct = Math.round(Math.abs(biggestDecrease.pctChange as number))
    const thisMonth = money(biggestDecrease.thisMonth)
    const lastMonth = money(biggestDecrease.lastMonth)
    const message =
      lang === 'fr'
        ? `Tes dépenses en ${category} ont baissé de ${pct} % ce mois-ci (${thisMonth} contre ${lastMonth} le mois dernier) ${
            mainGoal === 'dettes' ? '— chaque dollar économisé peut aller vers tes dettes.' : '— bien joué.'
          }`
        : `Your ${category} spending is down ${pct}% this month (${thisMonth} vs. ${lastMonth} last month) ${
            mainGoal === 'dettes' ? '— every dollar saved can go toward your debt.' : '— nice work.'
          }`
    tips.push({
      id: `category-decrease-${biggestDecrease.category}`,
      tone: 'positive',
      message,
    })
  }

  return tips
}

// One goal-related tip: prefer a deadline-bound goal that's meaningfully
// ahead of the pace it needs, and fall back to "closest to done" for goals
// with no deadline (or not ahead) but real, visible progress.
function goalTip(
  goals: Goal[],
  contributions: Contribution[],
  now: Date,
  mainGoal: MainGoal | null | undefined,
  lang: Lang,
): Tip | null {
  const money = lang === 'fr' ? formatCurrency : formatCurrencyEN
  const activeGoals = goals.filter((g) => g.targetAmount > 0 && g.currentAmount < g.targetAmount)
  if (activeGoals.length === 0) return null

  // Someone who specifically said "épargner pour un projet" gets a more
  // celebratory framing on the exact tip that matters most to them —
  // everyone else still sees the same real numbers, just less fanfare.
  const celebratory = mainGoal === 'epargner'

  for (const goal of activeGoals) {
    if (!goal.targetDate) continue
    const remaining = goal.targetAmount - goal.currentAmount
    const requiredPace = computeRequiredPace(remaining, goal.targetDate, now)
    if (!requiredPace) continue
    const goalContributions = contributions.filter((c) => c.goal_id === goal.id)
    const monthlyRate = estimateMonthlyRate(goalContributions, now)
    if (monthlyRate > 0 && monthlyRate >= requiredPace.perMonth * AHEAD_OF_PACE_MARGIN) {
      const message =
        lang === 'fr'
          ? `${celebratory ? '🎯 ' : ''}Tu épargnes ${money(monthlyRate)}/mois pour « ${goal.name} », au-delà des ${money(
              requiredPace.perMonth,
            )}/mois nécessaires pour respecter ton échéance.`
          : `${celebratory ? '🎯 ' : ''}You're saving ${money(monthlyRate)}/month for "${goal.name}", ahead of the ${money(
              requiredPace.perMonth,
            )}/month you need to hit your deadline.`
      return { id: `goal-ahead-${goal.id}`, tone: 'positive', message }
    }
  }

  const closest = [...activeGoals].sort(
    (a, b) => b.currentAmount / b.targetAmount - a.currentAmount / a.targetAmount,
  )[0]
  const progress = closest.currentAmount / closest.targetAmount
  if (progress >= CLOSE_TO_GOAL_THRESHOLD) {
    const remaining = closest.targetAmount - closest.currentAmount
    const message =
      lang === 'fr'
        ? `${celebratory ? '🎯 ' : ''}Tu es à ${Math.round(progress * 100)} % de ton objectif « ${closest.name} » — encore ${money(
            remaining,
          )} à épargner.`
        : `${celebratory ? '🎯 ' : ''}You're ${Math.round(progress * 100)}% of the way to "${closest.name}" — ${money(
            remaining,
          )} to go.`
    return { id: `goal-progress-${closest.id}`, tone: 'positive', message }
  }

  return null
}

// Simple rule-based tips from real numbers only — no generative/AI copy
// yet. Every message either fires from a real threshold or doesn't appear;
// nothing here is a generic filler line except the final no-data fallback.
export function generatePersonalizedTips(input: TipInput, lang: Lang, now = new Date()): Tip[] {
  const tips: Tip[] = [...categoryChangeTips(input.expenseRecords, now, input.mainGoal, lang)]
  const g = goalTip(input.goals, input.contributions, now, input.mainGoal, lang)
  if (g) tips.push(g)

  if (tips.length === 0) {
    return [
      {
        id: 'not-enough-data',
        tone: 'neutral',
        message:
          lang === 'fr'
            ? "Continue à utiliser SaveUp — dès que tu as un peu plus d'historique, des conseils basés sur tes vraies habitudes apparaîtront ici."
            : "Keep using SaveUp — once you've got a bit more history, tips based on your real habits will start showing up here.",
      },
    ]
  }

  return tips.slice(0, 3)
}
