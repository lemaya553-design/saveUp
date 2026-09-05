import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// "Has the user done at least one real thing" for the PWA install prompt's
// timing gate — checked against actual data rather than an in-session event
// flag, so it stays correct for a returning user even if this is a brand
// new page load. A cheap existence probe (id only, limit 1) per table
// instead of loading full records; monthly_income specifically must be > 0,
// not just "a row exists" — onboarding upserts 0 as a bare "I've been here"
// marker (see useIncome.ts) which shouldn't count as a real action.
export function useHasRealActivity() {
  const { user } = useAuth()
  const userId = user?.id
  const [checked, setChecked] = useState(false)
  const [hasActivity, setHasActivity] = useState(false)

  useEffect(() => {
    if (!userId) {
      setChecked(false)
      setHasActivity(false)
      return
    }
    let cancelled = false

    async function check() {
      const [expenses, goals, fixed, income] = await Promise.all([
        supabase.from('expenses').select('id').limit(1),
        supabase.from('savings_goals').select('id').limit(1),
        supabase.from('fixed_expenses').select('id').limit(1),
        supabase.from('budget_settings').select('monthly_income').maybeSingle(),
      ])
      if (cancelled) return
      const has =
        (expenses.data?.length ?? 0) > 0 ||
        (goals.data?.length ?? 0) > 0 ||
        (fixed.data?.length ?? 0) > 0 ||
        (income.data?.monthly_income ?? 0) > 0
      setHasActivity(has)
      setChecked(true)
    }

    check()
    return () => {
      cancelled = true
    }
  }, [userId])

  return { checked, hasActivity }
}
