import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// One row per user (primary key user_id) — RLS scopes select/upsert to the
// signed-in user, so no manual .eq('user_id', ...) filter is needed on read.
// maybeSingle() (not single()) because a brand-new user has no row yet.
export function useIncome() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [monthlyIncome, setMonthlyIncomeState] = useState(0)
  // Distinct from monthlyIncome === 0: a fresh account has no row at all,
  // while an account that explicitly set 0 (or skipped onboarding, which
  // upserts 0 as a deliberate "I've been here" marker) has one. Dashboard
  // uses this to tell "never touched" from "touched, still zero".
  const [hasIncomeRecord, setHasIncomeRecord] = useState(false)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('budget_settings')
        .select('*')
        .maybeSingle()
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setMonthlyIncomeState(data?.monthly_income ?? 0)
        setHasIncomeRecord(data != null)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const setMonthlyIncome = useCallback(
    async (value: number) => {
      if (!userId) return
      setMonthlyIncomeState(value)
      setHasIncomeRecord(true)
      const { error: upsertError } = await supabase
        .from('budget_settings')
        .upsert(
          { user_id: userId, monthly_income: value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )
      if (upsertError) setError(upsertError.message)
    },
    [userId],
  )

  return { loading, error, monthlyIncome, hasIncomeRecord, setMonthlyIncome }
}
