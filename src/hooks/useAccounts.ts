import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useLanguage } from './useLanguage'
import { COMMON } from '../lib/i18n/common'
import { HOOK_ERRORS } from '../lib/i18n/hookErrors'

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
  const { lang } = useLanguage()
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
  // already exist" the same way. Always returns a real, specific message on
  // failure (never a silent null) — a stale/expired session (userId gone
  // after sitting on the CSV import wizard for a few minutes) used to fail
  // exactly like this with no explanation.
  const addAccount = useCallback(
    async (name: string): Promise<{ account: Account | null; error: string | null }> => {
      const trimmed = name.trim()
      if (!trimmed) return { account: null, error: HOOK_ERRORS[lang].accounts.nameEmpty }
      if (!userId) {
        return { account: null, error: COMMON[lang].app.sessionExpired }
      }

      const existing = accounts.find((a) => a.name.toLowerCase() === trimmed.toLowerCase())
      if (existing) return { account: existing, error: null }

      const { data, error: insertError } = await supabase
        .from('accounts')
        .insert({ user_id: userId, name: trimmed })
        .select()
        .single()
      if (insertError || !data) {
        const message =
          insertError?.code === '23505'
            ? HOOK_ERRORS[lang].accounts.nameExists
            : (insertError?.message ?? HOOK_ERRORS[lang].accounts.createFailed)
        setError(message)
        return { account: null, error: message }
      }
      setAccounts((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name, 'fr')))
      return { account: data, error: null }
    },
    [userId, accounts, lang],
  )

  return { loading, error, accounts, addAccount }
}
