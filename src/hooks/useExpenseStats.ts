import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { onExpensesChanged } from '../lib/events'
import { useGuestMode } from './useGuestMode'
import { getGuestExpenses } from '../lib/guestStore'

// How far back to look for the "budget respecté" badges (useBadgeProgress) —
// matches Statistiques' own 6-month category-chart window (see
// useSavingsContributions' daysBack comment), rather than scanning full
// history.
const BUDGET_HISTORY_MONTHS = 6

export interface MonthlyTotal {
  /** YYYY-MM, in the browser's local time zone. */
  monthKey: string
  total: number
}

export function monthKeyOf(dateString: string): string {
  const d = new Date(dateString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function bucketByMonth(rows: { amount: number; spent_at: string }[]): MonthlyTotal[] {
  const sums = new Map<string, number>()
  for (const row of rows) {
    const key = monthKeyOf(row.spent_at)
    sums.set(key, (sums.get(key) ?? 0) + row.amount)
  }
  return [...sums.entries()]
    .map(([monthKey, total]) => ({ monthKey, total }))
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
}

// Total expense count (all-time, not the 50-row cap useExpenses.ts applies
// for display) plus per-month totals for the last few months — the two
// inputs the "dépenses notées" and "budget respecté" badges need that no
// existing hook already exposes.
export function useExpenseStats() {
  const guest = useGuestMode()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [recentMonthlyTotals, setRecentMonthlyTotals] = useState<MonthlyTotal[]>([])

  useEffect(() => {
    if (guest.active) {
      const rows = getGuestExpenses()
      setTotalCount(rows.length)
      setRecentMonthlyTotals(bucketByMonth(rows))
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { count, error: countError } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
      if (cancelled) return
      if (countError) {
        setError(countError.message)
      } else {
        setTotalCount(count ?? 0)
      }

      const since = new Date()
      since.setMonth(since.getMonth() - BUDGET_HISTORY_MONTHS)
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('amount, spent_at')
        .gte('spent_at', since.toISOString())
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setRecentMonthlyTotals(bucketByMonth(data ?? []))
      }
      setLoading(false)
    }

    load()
    const unsubscribe = onExpensesChanged(load)
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [guest.active])

  return { loading, error, totalCount, recentMonthlyTotals }
}
