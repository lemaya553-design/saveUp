import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const key = process.env.STRIPE_SECRET_KEY

    if (!key) {
      return res.status(500).json({ ok: false, error: 'STRIPE_SECRET_KEY manquante' })
    }

    const stripe = new Stripe(key)
    const account = await stripe.accounts.retrieve()

    return res.status(200).json({
      ok: true,
      stripeConnected: true,
      livemode: account.livemode,
    })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      stripeConnected: false,
      error: err instanceof Error ? err.message : 'Erreur inconnue',
    })
  }
}
