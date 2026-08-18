import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getStripe, getSupabaseAdmin, getUserFromAuthHeader } from './_stripe.js'

function getOrigin(req: VercelRequest): string {
  if (typeof req.headers.origin === 'string') return req.headers.origin
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  return `${proto}://${req.headers.host}`
}

// Whole handler wrapped in one try/catch — see create-checkout-session.ts
// for why (a missing env var thrown outside any try/catch previously came
// back as a non-JSON crash the frontend couldn't parse, so it failed
// silently instead of showing an error).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const user = await getUserFromAuthHeader(req.headers.authorization)
    if (!user) {
      res.status(401).json({ error: 'Non authentifié.' })
      return
    }

    const { data, error } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error || !data?.stripe_customer_id) {
      // TEMPORARY diagnostic, folded directly into the visible error text
      // (the frontend only ever displays the `error` string, not a
      // separate debug field) — the exact queried user id and what the
      // query actually returned, so this can be confirmed against the row
      // in Supabase's Table Editor without needing DevTools or logs.
      res.status(400).json({
        error:
          `Aucun abonnement actif trouvé pour ce compte. ` +
          `[debug: queried user_id=${user.id}, supabase_error=${error?.message ?? 'none'}, row_found=${data !== null}, customer_id=${data?.stripe_customer_id ?? 'null'}]`,
      })
      return
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${getOrigin(req)}/parametres`,
    })
    res.status(200).json({ url: portalSession.url })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur inattendue.' })
  }
}
