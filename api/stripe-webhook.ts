import type { VercelRequest, VercelResponse } from '@vercel/node'
import type Stripe from 'stripe'
import { getStripe, getSupabaseAdmin } from './_stripe'
import { planForPriceId } from './_plans'

// Stripe signature verification needs the exact raw request bytes — Vercel's
// default body parsing (JSON) would re-serialize the body and break the
// signature check, so it's disabled here and the raw buffer is read by hand.
export const config = {
  api: { bodyParser: false },
}

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function upsertFromSubscription(customerId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id
  const plan = priceId ? planForPriceId(priceId) : null
  const periodEndUnix = subscription.items.data[0]?.current_period_end
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      plan: subscription.status === 'active' || subscription.status === 'trialing' ? (plan ?? 'free') : 'free',
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const signature = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || typeof signature !== 'string' || !webhookSecret) {
    res.status(400).json({ error: 'Missing signature or webhook secret.' })
    return
  }

  const rawBody = await readRawBody(req)
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    res.status(400).json({ error: `Signature invalide: ${err instanceof Error ? err.message : err}` })
    return
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        if (!userId || !customerId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId ? planForPriceId(priceId) : null
        const periodEndUnix = subscription.items.data[0]?.current_period_end

        await getSupabaseAdmin()
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan: plan ?? 'free',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          )
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
        await upsertFromSubscription(customerId, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
        await getSupabaseAdmin()
          .from('subscriptions')
          .update({ plan: 'free', status: 'canceled', updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId)
        break
      }

      default:
        break
    }
    res.status(200).json({ received: true })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur webhook.' })
  }
}
