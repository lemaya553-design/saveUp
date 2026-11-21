import { useMemo } from 'react'
import { useSavingsGoals } from './useSavingsGoals'
import { useIncome } from './useIncome'
import { useFixedExpenses } from './useFixedExpenses'
import { useLoginStreak } from './useLoginStreak'
import { useExpenseStats, monthKeyOf } from './useExpenseStats'
import { usePreferences } from './usePreferences'
import { useSubscription } from './useSubscription'
import { splitByLimit } from '../lib/plans'
import type { BadgeContext } from '../lib/badges'

// Builds the one BadgeContext every badge's progress/unlock check reads
// from (lib/badges.ts) — shared by RecompensesTab (display) and
// BadgeUnlockWatcher (global detection), so both always agree on what's
// unlocked.
export function useBadgeProgress() {
  const goals = useSavingsGoals()
  const income = useIncome()
  const fixed = useFixedExpenses()
  const streak = useLoginStreak()
  const expenseStats = useExpenseStats()
  const preferences = usePreferences()
  const subscription = useSubscription()

  const loading =
    goals.loading ||
    income.loading ||
    fixed.loading ||
    streak.loading ||
    expenseStats.loading ||
    preferences.loading ||
    subscription.loading
  const error = goals.error || income.error || fixed.error || expenseStats.error || streak.error

  // Same active/paused split as the Épargne page and the old reward tiers —
  // a goal past the plan's limit doesn't count toward goal-COMPLETION
  // badges. Dollar-amount badges are the one exception (see totalSaved
  // below): those reflect every dollar actually saved, paused goals
  // included, exactly like the old REWARD_TIERS dollar tiers did.
  const activeGoals = useMemo(
    () => splitByLimit(goals.goals, subscription.limits.maxGoals).active,
    [goals.goals, subscription.limits.maxGoals],
  )

  const totalSaved = useMemo(
    () => goals.goals.reduce((sum, g) => sum + g.currentAmount, 0),
    [goals.goals],
  )
  const completedGoalsCount = useMemo(
    () => activeGoals.filter((g) => g.targetAmount > 0 && g.currentAmount >= g.targetAmount).length,
    [activeGoals],
  )

  const discretionaryBudget = Math.max(0, income.monthlyIncome - fixed.totalFixedExpenses)

  // "Budget respecté" counts past COMPLETE months (the current one is still
  // in progress, so it's excluded either way) whose total spend stayed at
  // or under what the discretionary budget is RIGHT NOW. That's a
  // simplification — a past month is judged against today's income/fixed
  // expenses, not whatever they actually were that month — but it's the
  // same "live-computed, not historically pinned" approach the original
  // dollar-tier badges already used for total saved, and avoids needing to
  // store a month-by-month budget history that nothing else in the app
  // tracks today.
  const budgetMonthsRespected = useMemo(() => {
    if (discretionaryBudget <= 0) return 0
    const currentMonthKey = monthKeyOf(new Date().toISOString())
    return expenseStats.recentMonthlyTotals.filter(
      (m) => m.monthKey !== currentMonthKey && m.total <= discretionaryBudget,
    ).length
  }, [expenseStats.recentMonthlyTotals, discretionaryBudget])

  const ctx: BadgeContext = {
    totalSaved,
    completedGoalsCount,
    streakDays: streak.streak,
    expenseCount: expenseStats.totalCount,
    csvImportCount: preferences.csvImportCount,
    budgetMonthsRespected,
    hasIncomeRecord: income.hasIncomeRecord,
  }

  return { loading, error, ctx, plan: subscription.plan, activeGoals }
}
