import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
  )
}

// A 401 whose body mentions the JWT/token/session itself (expired,
// malformed, rejected for clock skew, etc.) means the whole cached session
// is unusable — no individual hook's query is going to succeed until the
// user signs in again. Without this, every data hook independently shows
// its own raw Postgrest/GoTrue error text verbatim in whatever banner that
// page already has (e.g. a real report: a stale session surfaced literally
// as "JWT issued at future" on the Dashboard) — confusing and not
// actionable for a user. A plain 401 with no such wording (e.g. a
// legitimate "not authorized for this row") is left alone.
function looksLikeInvalidSessionError(status: number, bodyText: string): boolean {
  if (status !== 401) return false
  const lower = bodyText.toLowerCase()
  return lower.includes('jwt') || lower.includes('token') || lower.includes('session') || lower.includes('pgrst301')
}

// Guards against the sign-out call below (itself a request through this
// same fetch) re-triggering this handler if it also comes back 401.
let handlingInvalidSession = false

async function fetchWithSessionGuard(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init)

  if (!handlingInvalidSession && response.status === 401) {
    const bodyText = await response
      .clone()
      .text()
      .catch(() => '')
    if (looksLikeInvalidSessionError(response.status, bodyText)) {
      handlingInvalidSession = true
      // Full reload (not client-side navigate) is deliberate — every hook
      // holding stale data/error state needs to be torn down, not just
      // routed away from.
      supabase.auth.signOut().finally(() => {
        window.location.href = '/connexion'
      })
    }
  }

  return response
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithSessionGuard },
})
