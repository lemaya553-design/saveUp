import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useIncome } from './useIncome'
import { useFixedExpenses } from './useFixedExpenses'
import { useMonthlyExpenses } from './useMonthlyExpenses'
import { useSavingsContributions } from './useSavingsContributions'
import { useAuth } from './useAuth'
import { computeFinancialHealth } from '../lib/financialHealth'
import { toDateString } from '../lib/format'

export interface ScoreSnapshot {
  score_date: string
  score: number
}

export type ScoreTrend = 'up' | 'down' | 'flat' | null

export function useFinancialHealth() {
  const { user } = useAuth()
  const userId = user?.id
  const income = useIncome()
  const fixed = useFixedExpenses()
  const monthly = useMonthlyExpenses()
  const contributions = useSavingsContributions()

  const [history, setHistory] = useState<ScoreSnapshot[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [snapshotError, setSnapshotError] = useState<string | null>(null)

  const inputsLoading = income.loading || fixed.loading || monthly.loading || contributions.loading
  const loading = inputsLoading || historyLoading

  const breakdown = useMemo(
    () =>
      computeFinancialHealth({
        monthlyIncome: income.monthlyIncome,
        totalFixedExpenses: fixed.totalFixedExpenses,
        spentThisMonth: monthly.spentThisMonth,
        monthProgress: monthly.monthProgress,
        contributions: contributions.contributions,
      }),
    [
      income.monthlyIncome,
      fixed.totalFixedExpenses,
      monthly.spentThisMonth,
      monthly.monthProgress,
      contributions.contributions,
    ],
  )

  useEffect(() => {
    if (inputsLoading || !userId) return
    const uid = userId
    let cancelled = false

    async function persistAndLoadHistory() {
      const today = toDateString(new Date())
      const { error: upsertError } = await supabase
        .from('financial_health_snapshots')
        .upsert(
          { user_id: uid, score_date: today, score: breakdown.score },
          { onConflict: 'user_id,score_date' },
        )
      if (upsertError && !cancelled) setSnapshotError(upsertError.message)

      const { data, error: fetchError } = await supabase
        .from('financial_health_snapshots')
        .select('*')
        .order('score_date', { ascending: false })
        .limit(30)

      if (cancelled) return
      if (fetchError) {
        setSnapshotError(fetchError.message)
      } else {
        setHistory((data ?? []).slice().reverse())
      }
      setHistoryLoading(false)
    }

    persistAndLoadHistory()
    return () => {
      cancelled = true
    }
    // Re-run only when the computed score actually changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputsLoading, breakdown.score, userId])

  const trend: ScoreTrend = useMemo(() => {
    if (history.length < 2) return null
    const latest = history[history.length - 1].score
    const previous = history[history.length - 2].score
    if (latest === previous) return 'flat'
    return latest > previous ? 'up' : 'down'
  }, [history])

  return {
    loading,
    error: snapshotError ?? income.error ?? fixed.error ?? monthly.error ?? contributions.error,
    breakdown,
    history,
    trend,
    monthlyIncome: income.monthlyIncome,
    hasIncomeRecord: income.hasIncomeRecord,
    setMonthlyIncome: income.setMonthlyIncome,
    totalFixedExpenses: fixed.totalFixedExpenses,
    discretionaryBudget: Math.max(0, income.monthlyIncome - fixed.totalFixedExpenses),
    spentThisMonth: monthly.spentThisMonth,
    spentLastMonth: monthly.spentLastMonth,
    monthProgress: monthly.monthProgress,
  }
}
