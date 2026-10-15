import { useState } from 'react'
import { useAuth } from './useAuth'
import { useLanguage } from './useLanguage'
import { COMMON } from '../lib/i18n/common'
import { PARAMETRES } from '../lib/i18n/parametres'

// Calls api/delete-account.ts — the only code path allowed to touch the
// Supabase service-role key, which stays server-side (see that file's own
// comments). This hook never gets that key; it only authenticates the
// request with the signed-in user's own access token, same pattern as
// useSubscription's callBillingApi.
export function useDeleteAccount() {
  const { session, signOut } = useAuth()
  const { lang } = useLanguage()
  const t = PARAMETRES[lang].compte.dangerZone
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function deleteAccount(): Promise<boolean> {
    if (!session) {
      setError(COMMON[lang].app.sessionExpired)
      return false
    }
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const isJson = res.headers.get('content-type')?.includes('application/json')
      const parsed = isJson ? await res.json().catch(() => null) : null

      if (!res.ok) {
        setError(parsed?.error ?? t.errorFallback)
        setDeleting(false)
        return false
      }

      // The account (and every row FK-cascading from it) is already gone
      // server-side at this point — signOut() just clears the now-dangling
      // local session/tokens instead of waiting for the next request to
      // 401 (see supabase.ts's fetchWithSessionGuard, which would otherwise
      // eventually catch this too, just with an extra round trip first).
      await signOut()
      return true
    } catch {
      setError(t.errorFallback)
      setDeleting(false)
      return false
    }
  }

  return { deleting, error, deleteAccount }
}
