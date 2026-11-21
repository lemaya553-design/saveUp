import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useGuestMode } from './useGuestMode'

// A badge's underlying achievement is always computed live (see
// lib/badges.ts isBadgeUnlocked / useBadgeProgress) — this only tracks the
// separate, persisted "has this been claimed yet" fact, now set
// automatically by BadgeUnlockWatcher the moment a badge is earned (no more
// manual claim button) so it stays claimed — and its one-time celebration
// stays shown — on every later visit.
export function useClaimedBadges() {
  const { user } = useAuth()
  const guest = useGuestMode()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set())
  // When each badge was claimed (claimed_badges.claimed_at) — shown as the
  // small "obtenu le ..." date under an unlocked medal.
  const [claimedAt, setClaimedAt] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    // A guest hasn't claimed anything — badges unlock live from real
    // progress (lib/badges.ts), this hook only tracks the separate
    // "clicked reveal" action, which has no guest-mode equivalent yet.
    if (guest.active) {
      setLoading(false)
      return
    }
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('claimed_badges')
        .select('tier_id, claimed_at')
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setClaimedIds(new Set((data ?? []).map((row) => row.tier_id)))
        setClaimedAt(new Map((data ?? []).map((row) => [row.tier_id, row.claimed_at])))
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId, guest.active])

  const claim = useCallback(
    async (tierId: string): Promise<boolean> => {
      if (!userId) return false
      // Already claimed (e.g. a stale double-click) — nothing to do,
      // and re-inserting would just hit the unique constraint.
      if (claimedIds.has(tierId)) return true

      const claimedNow = new Date().toISOString()
      setClaimedIds((prev) => new Set(prev).add(tierId))
      setClaimedAt((prev) => new Map(prev).set(tierId, claimedNow))
      const { data, error: insertError } = await supabase
        .from('claimed_badges')
        .insert({ user_id: userId, tier_id: tierId })
        .select('claimed_at')
        .single()
      if (insertError) {
        setError(insertError.message)
        setClaimedIds((prev) => {
          const next = new Set(prev)
          next.delete(tierId)
          return next
        })
        setClaimedAt((prev) => {
          const next = new Map(prev)
          next.delete(tierId)
          return next
        })
        return false
      }
      // Replace the optimistic timestamp with the server's real one (RLS
      // already scopes this to the row we just inserted).
      if (data) setClaimedAt((prev) => new Map(prev).set(tierId, data.claimed_at))
      return true
    },
    [userId, claimedIds],
  )

  return { loading, error, claimedIds, claimedAt, claim }
}
