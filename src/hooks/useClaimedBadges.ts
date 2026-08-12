import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// A tier's underlying achievement is always computed live (see
// lib/rewards.ts getUnlockedTiers) — this only tracks the separate,
// explicit "clicked reveal on it" action, so a claimed badge stays revealed
// on later visits instead of showing the claim button again.
export function useClaimedBadges() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('claimed_badges')
        .select('tier_id')
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setClaimedIds(new Set((data ?? []).map((row) => row.tier_id)))
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const claim = useCallback(
    async (tierId: string): Promise<boolean> => {
      if (!userId) return false
      // Already claimed (e.g. a stale double-click) — nothing to do,
      // and re-inserting would just hit the unique constraint.
      if (claimedIds.has(tierId)) return true

      setClaimedIds((prev) => new Set(prev).add(tierId))
      const { error: insertError } = await supabase
        .from('claimed_badges')
        .insert({ user_id: userId, tier_id: tierId })
      if (insertError) {
        setError(insertError.message)
        setClaimedIds((prev) => {
          const next = new Set(prev)
          next.delete(tierId)
          return next
        })
        return false
      }
      return true
    },
    [userId, claimedIds],
  )

  return { loading, error, claimedIds, claim }
}
