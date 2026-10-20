import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toDateString } from '../lib/format'
import { useAuth } from './useAuth'
import { useGuestMode } from './useGuestMode'
import { getGuestContributions } from '../lib/guestStore'

// Distinct from useSavingsContributions.ts (a rolling "last N days" window
// for Dashboard/Budget/Épargne/Statistiques) — Calendrier can navigate to
// any past month, arbitrarily far back, so it needs its own arbitrary-range
// fetch instead of a fixed daysBack window.
export function useMonthSavingsContributions(monthStart: Date, monthEnd: Date) {
  const { user } = useAuth()
  const guest = useGuestMode()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Local calendar date (not full timestamp) a contribution landed on —
  // Calendrier only needs "which days had one," never the exact time.
  const [contributionDays, setContributionDays] = useState<Set<string>>(new Set())
  const [total, setTotal] = useState(0)

  const startIso = monthStart.toISOString()
  const endIso = monthEnd.toISOString()

  useEffect(() => {
    if (guest.active) {
      const rows = getGuestContributions().filter((c) => c.created_at >= startIso && c.created_at < endIso)
      setContributionDays(new Set(rows.map((r) => toDateString(new Date(r.created_at)))))
      setTotal(rows.reduce((sum, r) => sum + r.amount, 0))
      setLoading(false)
      return
    }
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('savings_contributions')
        .select('amount, created_at')
        .gte('created_at', startIso)
        .lt('created_at', endIso)
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        const rows = data ?? []
        setContributionDays(new Set(rows.map((r) => toDateString(new Date(r.created_at)))))
        setTotal(rows.reduce((sum, r) => sum + r.amount, 0))
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId, guest.active, startIso, endIso])

  return { loading, error, contributionDays, total }
}
