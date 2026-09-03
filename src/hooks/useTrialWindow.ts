import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const TRIAL_WINDOW_MS = 24 * 60 * 60 * 1000

// Purely a marketing countdown (no PLAN_LIMITS effect) — trial_started_at is
// stamped by a signup trigger (see supabase/schema.sql), never written by
// the client, so this hook only ever reads. No row means either the account
// predates this feature or the 24h window is already long gone; either way
// there's nothing to show.
//
// The 1s tick lives here (not in each display component) so every consumer
// — Nav's badge, the marketing-page badge — shares one interval instead of
// each running its own.
export function useTrialWindow() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setExpiresAt(null)
      return
    }
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data } = await supabase.from('trial_windows').select('trial_started_at').maybeSingle()
      if (cancelled) return
      setExpiresAt(data ? new Date(data.trial_started_at).getTime() + TRIAL_WINDOW_MS : null)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (expiresAt === null) {
      setRemainingMs(null)
      return
    }
    const tick = () => setRemainingMs(Math.max(0, expiresAt - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return { loading, expiresAt, remainingMs }
}
