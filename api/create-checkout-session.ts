import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getStripe, getUserFromAuthHeader } from './_stripe.js'
import { isPayablePlan, priceIdForPlan } from './_plans.js'

function getOrigin(req: VercelRequest): string {
  if (typeof req.headers.origin === 'string') return req.headers.origin
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https'
  return `${proto}://${req.headers.host}`
}

// Every early-return AND every awaited call below is inside this one
// try/catch — a missing env var (SUPABASE_SERVICE_ROLE_KEY,
// STRIPE_PRICE_STANDARD/PREMIUM) throws synchronously from a helper, and
// without this wrapping the whole handler, that crash would bypass res.json
// entirely and come back as Vercel's generic non-JSON error page. The
// frontend's fetch call expects JSON no matter what went wrong, so an
// unhandled crash here previously surfaced as a silently-stuck "Redirection..."
// button with no visible error at all.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const user = await getUserFromAuthHeader(req.headers.authorization)
    if (!user || !user.email) {
      res.status(401).json({ error: 'Non authentifié.' })
      return
    }

    const { plan } = (req.body ?? {}) as { plan?: unknown }
    if (!isPayablePlan(plan)) {
      res.status(400).json({ error: 'Plan invalide.' })
      return
    }

    const origin = getOrigin(req)
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceIdForPlan(plan), quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email,
      success_url: `${origin}/parametres?checkout=success`,
      cancel_url: `${origin}/tarifs?checkout=cancelled`,
      // 7-day free trial on both paid plans, card required up front (this
      // is Checkout's default — the card is collected and validated at
      // signup, just not charged until the trial ends). Cancelling before
      // day 7 never triggers a charge; see stripe-webhook.ts for how
      // 'trialing' is treated as full plan access, and 'canceled' before
      // the trial ends resets the account to free without ever billing it.
      subscription_data: { trial_period_days: 7 },
      // Managed Payments (Stripe acting as merchant of record, with
      // automatic tax) is on by default for new accounts and requires a
      // tax_code on every product — ours don't have one set. Disabling it
      // here is the direct fix Stripe's own error message points to;
      // switching back on later just means setting a tax_code on the
      // Standard/Premium products in the dashboard first.
      managed_payments: { enabled: false },
    })
    res.status(200).json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur inattendue.' })
  }
}
