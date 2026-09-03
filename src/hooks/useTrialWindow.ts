import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const TRIAL_WINDOW_MS = 24 * 60 * 60 * 1000

// Purely a marketing countdown (no PLAN_LIMITS effect) — trial_started_at is
// stamped by a signup trigger (see supabase/schema.sql), never written by
// the client, so this hook only ever reads. No row means either the account
// predates this feature or the 24h window is already long gone; either way
// there's nothing to show.
export function useTrialWindow() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
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

  return { loading, expiresAt }
}
