import { computeSavingsRegularity } from './financialHealth'

export interface RewardTier {
  id: string
  thresholdAmount: number | 'goal-complete'
  name: string
  description: string
}

// Exactly 4 tiers on purpose — more dilutes the motivation.
export const REWARD_TIERS: RewardTier[] = [
  {
    id: 'first-100',
    thresholdAmount: 100,
    name: 'Premier pas',
    description: 'Premier 100 $ épargné.',
  },
  {
    id: 'first-500',
    thresholdAmount: 500,
    name: 'Sur la bonne voie',
    description: '500 $ épargnés.',
  },
  {
    id: 'first-1000',
    thresholdAmount: 1000,
    name: 'Épargnant sérieux',
    description: '1 000 $ épargnés.',
  },
  {
    id: 'goal-complete',
    thresholdAmount: 'goal-complete',
    name: 'Objectif atteint',
    description: 'Objectif d’épargne complété.',
  },
]

export function isTierUnlocked(
  tier: RewardTier,
  currentAmount: number,
  targetAmount: number,
): boolean {
  if (tier.thresholdAmount === 'goal-complete') {
    return targetAmount > 0 && currentAmount >= targetAmount
  }
  return currentAmount >= tier.thresholdAmount
}

// With multiple goals, the dollar-threshold tiers look at the combined
// total saved, but "goal-complete" looks at whether ANY single goal is
// done — completing one goal shouldn't wait on the sum of every goal.
export function getUnlockedTiers(
  totalCurrentAmount: number,
  goals: { targetAmount: number; currentAmount: number }[],
): RewardTier[] {
  const anyGoalComplete = goals.some((g) => g.targetAmount > 0 && g.currentAmount >= g.targetAmount)
  return REWARD_TIERS.filter((tier) =>
    tier.thresholdAmount === 'goal-complete'
      ? anyGoalComplete
      : totalCurrentAmount >= tier.thresholdAmount,
  )
}

export interface SavingsScoreBreakdown {
  score: number
  amountScore: number
  regularityScore: number
  referenceAmount: number
}

// 0-100: how much has been saved relative to the active goal (or a $1000
// reference if no goal is set yet), blended with how regularly the user
// actually contributes — not just the total. Returns both sub-scores so
// the UI can explain what's moving the number, not just show it.
export function computeSavingsScoreBreakdown(
  currentAmount: number,
  targetAmount: number,
  contributions: { created_at: string }[],
  now = new Date(),
): SavingsScoreBreakdown {
  const referenceAmount = targetAmount > 0 ? targetAmount : 1000
  const amountScore = Math.round(Math.min(100, (currentAmount / referenceAmount) * 100))
  const regularityScore = Math.round(computeSavingsRegularity(contributions, now) * 100)
  const score = Math.round(0.6 * amountScore + 0.4 * regularityScore)
  return { score, amountScore, regularityScore, referenceAmount }
}

export interface SavingsScoreExplanation {
  label: string
  value: number
  max: number
  detail: string
}

export function getSavingsScoreExplanations(
  breakdown: SavingsScoreBreakdown,
): SavingsScoreExplanation[] {
  return [
    {
      label: 'Montant épargné',
      value: breakdown.amountScore,
      max: 100,
      detail:
        breakdown.amountScore >= 70
          ? 'Tu es bien avancé vers ton objectif.'
          : breakdown.amountScore >= 30
            ? 'Tu progresses — continue d’ajouter à ton épargne.'
            : 'Ajoute à ton épargne pour faire progresser ce score.',
    },
    {
      label: 'Régularité',
      value: breakdown.regularityScore,
      max: 100,
      detail:
        breakdown.regularityScore >= 70
          ? 'Tu épargnes régulièrement, ça fait toute la différence.'
          : breakdown.regularityScore >= 30
            ? 'Épargne un peu plus souvent pour améliorer ce score.'
            : 'Aucune épargne régulière récente — même un petit montant chaque semaine aide.',
    },
  ]
}

export interface TierRequirement {
  currentAmount: number
  requiredAmount: number
  missingAmount: number
  progressPct: number
  goalName?: string
}

// How much more is needed to unlock a given tier. For the dollar tiers
// this is straightforward (total saved vs. the threshold). For
// "goal-complete" there's no single dollar figure across goals, so it's
// measured against whichever active (incomplete) goal is closest to done.
// Returns null only when goal-complete is being asked about and there's no
// active goal to measure against.
export function getTierRequirement(
  tier: RewardTier,
  totalCurrentAmount: number,
  goals: { name: string; targetAmount: number; currentAmount: number }[],
): TierRequirement | null {
  if (tier.thresholdAmount === 'goal-complete') {
    const activeGoals = goals.filter((g) => g.targetAmount > 0 && g.currentAmount < g.targetAmount)
    if (activeGoals.length === 0) return null
    const closest = activeGoals.reduce((best, g) =>
      g.targetAmount - g.currentAmount < best.targetAmount - best.currentAmount ? g : best,
    )
    return {
      currentAmount: closest.currentAmount,
      requiredAmount: closest.targetAmount,
      missingAmount: Math.max(0, closest.targetAmount - closest.currentAmount),
      progressPct:
        closest.targetAmount > 0 ? Math.min(100, (closest.currentAmount / closest.targetAmount) * 100) : 0,
      goalName: closest.name,
    }
  }

  return {
    currentAmount: totalCurrentAmount,
    requiredAmount: tier.thresholdAmount,
    missingAmount: Math.max(0, tier.thresholdAmount - totalCurrentAmount),
    progressPct: Math.min(100, (totalCurrentAmount / tier.thresholdAmount) * 100),
  }
}

// The next locked tier (in order) plus its requirement — what the "keep
// going" panel and progress bar are built from. Null once every tier is
// unlocked, or when the next tier is goal-complete but there's no active
// goal to measure progress against.
export function getNextTierProgress(
  totalCurrentAmount: number,
  goals: { name: string; targetAmount: number; currentAmount: number }[],
): (TierRequirement & { tier: RewardTier }) | null {
  const unlockedIds = new Set(getUnlockedTiers(totalCurrentAmount, goals).map((t) => t.id))
  const nextTier = REWARD_TIERS.find((tier) => !unlockedIds.has(tier.id))
  if (!nextTier) return null

  const requirement = getTierRequirement(nextTier, totalCurrentAmount, goals)
  if (!requirement) return null

  return { tier: nextTier, ...requirement }
}

// A single goal's own progress toward finishing itself — the "Objectif
// atteint" badge, viewed through one specific goal rather than whichever
// one happens to be closest. Used when the rewards page is filtered to a
// single goal, since the dollar tiers only make sense in aggregate.
export function getGoalCompletionRequirement(goal: {
  name: string
  targetAmount: number
  currentAmount: number
}): TierRequirement {
  return {
    currentAmount: goal.currentAmount,
    requiredAmount: goal.targetAmount,
    missingAmount: Math.max(0, goal.targetAmount - goal.currentAmount),
    progressPct:
      goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0,
    goalName: goal.name,
  }
}

const SEEN_TIERS_KEY = 'saveup:seenRewardTiers'

export function getSeenTierIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_TIERS_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function saveSeenTierIds(ids: Set<string>): void {
  try {
    localStorage.setItem(SEEN_TIERS_KEY, JSON.stringify([...ids]))
  } catch {
    // localStorage unavailable (private browsing, etc.) — the unlock
    // animation just won't be remembered across visits, which is harmless.
  }
}
