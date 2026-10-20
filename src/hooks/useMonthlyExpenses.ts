import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getMonthProgress, getMonthRange, getPreviousMonthRange } from '../lib/format'
import { onExpensesChanged } from '../lib/events'
import { useGuestMode } from './useGuestMode'
import { getGuestExpenses } from '../lib/guestStore'

export function useMonthlyExpenses() {
  const guest = useGuestMode()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [spentThisMonth, setSpentThisMonth] = useState(0)
  const [spentLastMonth, setSpentLastMonth] = useState(0)
  // Background refetches (from the expenses-changed event) must not flip
  // loading back to true — see useExpenses.ts for why.
  const hasLoadedOnce = useRef(false)

  const load = useCallback(async () => {
    const now = new Date()
    const thisMonth = getMonthRange(now)
    const lastMonth = getPreviousMonthRange(now)

    if (guest.active) {
      let thisSum = 0
      let lastSum = 0
      for (const row of getGuestExpenses()) {
        const spentAt = new Date(row.spent_at)
        if (spentAt >= thisMonth.start) thisSum += row.amount
        else if (spentAt >= lastMonth.start) lastSum += row.amount
      }
      setSpentThisMonth(thisSum)
      setSpentLastMonth(lastSum)
      setLoading(false)
      hasLoadedOnce.current = true
      return
    }

    if (!hasLoadedOnce.current) setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('expenses')
      .select('amount, spent_at')
      .gte('spent_at', lastMonth.start.toISOString())
      .lt('spent_at', thisMonth.end.toISOString())

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      hasLoadedOnce.current = true
      return
    }

    let thisSum = 0
    let lastSum = 0
    for (const row of data ?? []) {
      const spentAt = new Date(row.spent_at)
      if (spentAt >= thisMonth.start) thisSum += row.amount
      else if (spentAt >= lastMonth.start) lastSum += row.amount
    }
    setSpentThisMonth(thisSum)
    setSpentLastMonth(lastSum)
    setLoading(false)
    hasLoadedOnce.current = true
  }, [guest.active])

  useEffect(() => {
    load()
    return onExpensesChanged(load)
  }, [load])

  return {
    loading,
    error,
    spentThisMonth,
    spentLastMonth,
    monthProgress: getMonthProgress(new Date()),
  }
}
