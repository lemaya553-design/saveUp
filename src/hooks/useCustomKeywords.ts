import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface CustomKeywordRow {
  id: string
  keyword: string
  category: string
}

// Merchant-keyword -> category mappings this user personally confirmed from
// a "Autre" category suggestion (see lib/categorySuggestions.ts) — never
// written any other way. Consulted by pickCategory alongside the built-in
// dictionary, so a confirmed match keeps applying to future imports and
// recategorization runs, not just the transactions it was suggested from.
export function useCustomKeywords() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<CustomKeywordRow[]>([])

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('custom_category_keywords')
        .select('id, keyword, category')
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setKeywords(data ?? [])
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  // Bulk insert — a single confirmed suggestion can cover several near-name
  // variants of the same merchant (e.g. "sixt" and "sixt rent a car").
  // Upserts on (user_id, keyword) so confirming a suggestion twice (e.g. a
  // stale second click) re-points the keyword at the newest category choice
  // instead of erroring on the unique constraint.
  const addKeywords = useCallback(
    async (newKeywords: string[], category: string): Promise<boolean> => {
      if (!userId || newKeywords.length === 0) return false
      const rows = newKeywords.map((keyword) => ({ user_id: userId, keyword, category }))
      const { data, error: upsertError } = await supabase
        .from('custom_category_keywords')
        .upsert(rows, { onConflict: 'user_id,keyword' })
        .select('id, keyword, category')
      if (upsertError) {
        setError(upsertError.message)
        return false
      }
      setKeywords((prev) => {
        const kept = prev.filter((k) => !newKeywords.includes(k.keyword))
        return [...kept, ...(data ?? [])]
      })
      return true
    },
    [userId],
  )

  return { loading, error, keywords, addKeywords }
}
