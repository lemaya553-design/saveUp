import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { onExpensesChanged } from '../lib/events'

export interface ExpenseRecord {
  id: string
  description: string
  amount: number
  category: string
  spent_at: string
}

// Raw expense rows for the current month and `monthsBack` months before it —
// used to build the category breakdown, the monthly trend, and the
// auto-insight. Kept separate from useExpenses (which only loads the most
// recent 50 rows) so those stay accurate regardless of how many expenses
// exist. Default (2 → 3 months total) matches Budget's own 3-month views;
// Statistiques asks for more (5 → 6 months) for its longer trend line.
export function useExpenseHistory(monthsBack = 2) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [records, setRecords] = useState<ExpenseRecord[]>([])
  // Background refetches (from the expenses-changed event) must not flip
  // loading back to true — see useExpenses.ts for why.
  const hasLoadedOnce = useRef(false)

  const load = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true)
    setError(null)

    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)

    const { data, error: fetchError } = await supabase
      .from('expenses')
      .select('id, description, amount, category, spent_at')
      .gte('spent_at', start.toISOString())

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setRecords(data ?? [])
    }
    setLoading(false)
    hasLoadedOnce.current = true
  }, [monthsBack])

  useEffect(() => {
    load()
    return onExpensesChanged(load)
  }, [load])

  return { loading, error, records }
}
