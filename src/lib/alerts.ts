import { getMonthRange } from './format'

export interface BudgetPaceAlertInput {
  spentThisMonth: number
  discretionaryBudget: number
  monthProgress: number
}

// Flags spending that's running well ahead of how far the month has gotten
// (not just "over budget" — "on track to be over budget").
export function getBudgetPaceAlert(input: BudgetPaceAlertInput): string | null {
  if (input.discretionaryBudget <= 0) return null

  const spentPct = input.spentThisMonth / input.discretionaryBudget
  const paceRatio = spentPct / Math.max(input.monthProgress, 0.03)

  if (spentPct >= 0.6 && paceRatio >= 1.4) {
    const spentPctRounded = Math.round(spentPct * 100)
    const remainingMonthPct = Math.round((1 - input.monthProgress) * 100)
    return `Tu as déjà dépensé ${spentPctRounded}% de ton budget du mois, avec encore ${remainingMonthPct}% du mois à venir.`
  }
  return null
}

export interface SavingsGoalLateAlertInput {
  name: string
  currentAmount: number
  targetAmount: number
  targetDate: string | null
}

// Flags a goal with a deadline that's either already passed, or close
// enough that the current progress won't realistically get there in time.
export function getSavingsGoalLateAlert(
  input: SavingsGoalLateAlertInput,
  now = new Date(),
): string | null {
  if (!input.targetDate || input.targetAmount <= 0) return null
  if (input.currentAmount >= input.targetAmount) return null

  const target = new Date(input.targetDate)
  const daysUntilTarget = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const progress = input.currentAmount / input.targetAmount

  if (daysUntilTarget < 0) {
    return `L'échéance de « ${input.name} » est passée et l'objectif n'est pas encore atteint.`
  }
  if (daysUntilTarget <= 14 && progress < 0.8) {
    const dayLabel = daysUntilTarget === 1 ? 'jour' : 'jours'
    return `Il reste ${daysUntilTarget} ${dayLabel} pour « ${input.name} » et tu es à ${Math.round(
      progress * 100,
    )}% — le rythme actuel risque de ne pas suffire.`
  }
  return null
}

// Flags a category that's taking up an unusually large slice of this
// month's spending compared to its usual share (or, with no history yet,
// simply a dominant slice) — not just "you spent a lot," but "this one
// category is out of proportion."
export function getCategoryShareAlert(
  records: { amount: number; category: string; spent_at: string }[],
  now = new Date(),
): string | null {
  const { start: thisMonthStart, end: thisMonthEnd } = getMonthRange(now)
  const thisMonthRecords = records.filter((r) => {
    const d = new Date(r.spent_at)
    return d >= thisMonthStart && d < thisMonthEnd
  })
  if (thisMonthRecords.length < 3) return null

  const thisMonthTotal = thisMonthRecords.reduce((sum, r) => sum + r.amount, 0)
  if (thisMonthTotal <= 0) return null

  const priorRecords = records.filter((r) => new Date(r.spent_at) < thisMonthStart)
  const priorTotal = priorRecords.reduce((sum, r) => sum + r.amount, 0)

  const thisMonthByCategory = new Map<string, number>()
  for (const r of thisMonthRecords) {
    thisMonthByCategory.set(r.category, (thisMonthByCategory.get(r.category) ?? 0) + r.amount)
  }
  const priorByCategory = new Map<string, number>()
  for (const r of priorRecords) {
    priorByCategory.set(r.category, (priorByCategory.get(r.category) ?? 0) + r.amount)
  }

  let flaggedCategory: string | null = null
  let flaggedShare = 0
  let biggestDelta = 0

  for (const [category, amount] of thisMonthByCategory) {
    const currentShare = amount / thisMonthTotal
    const historicalShare = priorTotal > 0 ? (priorByCategory.get(category) ?? 0) / priorTotal : 0
    const delta = currentShare - historicalShare
    // Both conditions matter: a big share alone can just be "you don't
    // have many categories yet," and a big jump alone can be noise on a
    // small amount — together they single out a real, sizeable shift.
    if (currentShare >= 0.3 && delta >= 0.15 && delta > biggestDelta) {
      biggestDelta = delta
      flaggedShare = currentShare
      flaggedCategory = category
    }
  }

  if (!flaggedCategory) return null
  return `${flaggedCategory} représente déjà ${Math.round(flaggedShare * 100)}% de tes dépenses ce mois-ci.`
}
