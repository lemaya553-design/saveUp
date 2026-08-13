import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PLAN_LIMITS, type Plan } from '../lib/plans'
import { useAuth } from './useAuth'

// Same "no row = default" convention as useIncome.ts (hasIncomeRecord) — a
// user only ever gets a `subscriptions` row once the Stripe webhook writes
// one after a real checkout, so absence of a row means `free`, not an error.
export function useSubscription() {
  const { user, session } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<Plan>('free')
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('subscriptions')
      .select('plan, stripe_customer_id')
      .maybeSingle()
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setPlan((data?.plan as Plan | undefined) ?? 'free')
      setStripeCustomerId(data?.stripe_customer_id ?? null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  // Called after returning from Stripe Checkout — the webhook usually beats
  // the redirect back, but not always, so the page that handles
  // `?checkout=success` can force a fresh read instead of waiting for the
  // next natural reload.
  const refresh = useCallback(() => load(), [load])

  // Everything here is wrapped so a failure ALWAYS sets `error` — a bare
  // `await fetch(...)`/`await res.json()` with no try/catch used to let a
  // network failure or a non-JSON response (e.g. the API route not existing
  // at all, or a serverless function crashing before it could call
  // res.json) reject silently: the caller's `await startCheckout(...)`
  // would throw, skip the `if (url)` redirect, and — with no try/catch in
  // Tarifs.tsx either — leave the button stuck on "Redirection..." with
  // nothing visible telling the user anything went wrong.
  async function callBillingApi(path: string, body: Record<string, unknown>): Promise<string | null> {
    if (!session) {
      setError('Ta session a expiré — reconnecte-toi et réessaie.')
      return null
    }
    setError(null)
    try {
      const res = await fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      })

      const isJson = res.headers.get('content-type')?.includes('application/json')
      const parsed = isJson ? await res.json().catch(() => null) : null

      if (!res.ok) {
        setError(
          parsed?.error ??
            (isJson
              ? "Une erreur est survenue — réessaie."
              : `Le service de paiement n'a pas répondu correctement (code ${res.status}) — réessaie dans un instant.`),
        )
        return null
      }
      if (!parsed?.url) {
        setError("Réponse inattendue du service de paiement — réessaie.")
        return null
      }
      return parsed.url as string
    } catch {
      setError('Impossible de contacter le service de paiement — vérifie ta connexion et réessaie.')
      return null
    }
  }

  const startCheckout = useCallback(
    (targetPlan: 'standard' | 'premium') => callBillingApi('/api/create-checkout-session', { plan: targetPlan }),
    [session],
  )

  const openBillingPortal = useCallback(() => callBillingApi('/api/create-portal-session', {}), [session])

  return {
    loading,
    error,
    plan,
    stripeCustomerId,
    limits: PLAN_LIMITS[plan],
    refresh,
    startCheckout,
    openBillingPortal,
  }
}
