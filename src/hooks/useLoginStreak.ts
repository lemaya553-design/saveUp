import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toDateString } from '../lib/format'
import { computeStreak } from '../lib/streak'
import { useAuth } from './useAuth'

const WINDOW_DAYS = 60

// Records today as a visit (idempotent — unique on user_id+activity_date,
// duplicates ignored) and returns the current consecutive-day streak
// ending today. Call this from anywhere that should count as "the user
// showed up today" — see Layout.tsx, which calls it on every authenticated
// page load so the streak reflects real app usage, not just visits to the
// Récompenses page that happens to display it.
export function useLoginStreak() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!userId) return
    const uid = userId
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)

      const today = toDateString(new Date())
      const { error: upsertError } = await supabase
        .from('login_activity')
        .upsert(
          { user_id: uid, activity_date: today },
          { onConflict: 'user_id,activity_date', ignoreDuplicates: true },
        )
      if (upsertError && !cancelled) setError(upsertError.message)

      const since = new Date()
      since.setDate(since.getDate() - WINDOW_DAYS)
      const { data, error: fetchError } = await supabase
        .from('login_activity')
        .select('activity_date')
        .gte('activity_date', toDateString(since))

      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setStreak(computeStreak((data ?? []).map((row) => row.activity_date)))
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [userId])

  return { loading, error, streak }
}
