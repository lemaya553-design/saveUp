import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Contribution {
  id: string
  amount: number
  goal_id: string | null
  created_at: string
}

// Read-only: contributions are written from useSavingsGoals.addContribution,
// which is the single place a contribution is actually made.
// daysBack defaults to 90 (Dashboard/Budget/Épargne only ever need "recent"
// contributions); Statistiques passes a wider window to match its 6-month
// category-chart month picker.
export function useSavingsContributions(daysBack = 90) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const since = new Date()
      since.setDate(since.getDate() - daysBack)

      const { data, error: fetchError } = await supabase
        .from('savings_contributions')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setContributions(data ?? [])
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [daysBack])

  return { loading, error, contributions }
}
