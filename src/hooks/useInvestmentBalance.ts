import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// The real, tracked amount currently invested — separate from the
// Investissement page's projection calculator, which is a hypothetical,
// unpersisted "what if" tool and never writes here.
// One row per user (primary key user_id) — RLS scopes select/upsert to the
// signed-in user. maybeSingle() (not single()) because a brand-new user has
// no row yet.
export function useInvestmentBalance() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentAmount, setCurrentAmountState] = useState(0)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('investment_balance')
        .select('*')
        .maybeSingle()
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setCurrentAmountState(data?.current_amount ?? 0)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const setCurrentAmount = useCallback(
    async (value: number) => {
      if (!userId) return
      setCurrentAmountState(value)
      const { error: upsertError } = await supabase
        .from('investment_balance')
        .upsert(
          { user_id: userId, current_amount: value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )
      if (upsertError) setError(upsertError.message)
    },
    [userId],
  )

  return { loading, error, currentAmount, setCurrentAmount }
}
