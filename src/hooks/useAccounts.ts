import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Account {
  id: string
  name: string
}

// Source-account labels ("Carte de crédit 1", "Débit") picked or created in
// the transaction import wizard, so a batch of imported transactions can be
// traced back to where it came from, and reused across future imports
// instead of retyped every time.
export function useAccounts() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('accounts')
        .select('*')
        .order('name', { ascending: true })
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setAccounts(data ?? [])
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  // Returns the existing account if the name already exists (case/whitespace
  // insensitive), instead of erroring on the unique constraint — lets the
  // caller treat "pick an existing one" and "type a new one that happens to
  // already exist" the same way.
  const addAccount = useCallback(
    async (name: string): Promise<Account | null> => {
      const trimmed = name.trim()
      if (!trimmed || !userId) return null

      const existing = accounts.find((a) => a.name.toLowerCase() === trimmed.toLowerCase())
      if (existing) return existing

      const { data, error: insertError } = await supabase
        .from('accounts')
        .insert({ user_id: userId, name: trimmed })
        .select()
        .single()
      if (insertError || !data) {
        setError(insertError?.message ?? 'Insert failed')
        return null
      }
      setAccounts((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name, 'fr')))
      return data
    },
    [userId, accounts],
  )

  return { loading, error, accounts, addAccount }
}
