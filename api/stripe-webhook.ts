import type Stripe from 'stripe'
import { getStripe, getSupabaseAdmin } from './_stripe.js'
import { planForPriceId } from './_plans.js'

// Deliberately NOT the VercelRequest/VercelResponse + `export const config =
// { api: { bodyParser: false } }` convention used by the other two
// functions in this folder — that config option only exists for Next.js API
// routes and is silently ignored for standalone Vercel functions, meaning
// Vercel had already parsed (and re-serialized) the body before the handler
// ever ran. Signature verification needs the exact original bytes, so any
// re-serialization breaks it — this is Vercel's own currently-documented
// fix: a Web-standard Request/Response handler, reading the body via
// request.text() before anything else touches it.

// 'trialing' counts as full access to the plan — the whole point of the
// trial is that it isn't gated any differently from a paid, active
// subscription. Every other status (canceled, past_due, incomplete, etc.)
// falls back to 'free' rather than leaving the last-known paid plan in
// place, so a lapsed/failed subscription doesn't silently keep unlocking
// features. Single source of truth, used by both webhook handlers below so
// they can never disagree with each other on this.
function resolvePlan(status: Stripe.Subscription.Status, plan: ReturnType<typeof planForPriceId>) {
  return status === 'active' || status === 'trialing' ? (plan ?? 'free') : 'free'
}

async function upsertFromSubscription(customerId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id
  const plan = priceId ? planForPriceId(priceId) : null
  const periodEndUnix = subscription.items.data[0]?.current_period_end
  const { error } = await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      plan: resolvePlan(subscription.status, plan),
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)
  if (error) throw new Error(`Supabase update (subscription.updated) failed: ${error.message}`)
}

export async function POST(request: Request): Promise<Response> {
  try {
    const signature = request.headers.get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!signature || !webhookSecret) {
      return Response.json({ error: 'Missing signature or webhook secret.' }, { status: 400 })
    }

    // Must be read before anything else awaits/touches the request — this
    // is the exact raw byte string Stripe signed.
    const rawBody = await request.text()
    const stripe = getStripe()

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      return Response.json(
        { error: `Signature invalide: ${err instanceof Error ? err.message : err}` },
        { status: 400 },
      )
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription?.id

        // Every write in this file used to swallow its own error silently
        // (an upsert/update's `{ error }` was never even read) — a failure
        // here or in the write below would previously look identical to
        // success from the outside: 200, "received": true, nothing in the
        // table. Surfacing missing fields as a real 400 (visible in
        // Stripe's dashboard, the one channel that's worked reliably all
        // session) instead of a silent `break` is what actually shows us
        // what's wrong instead of guessing again.
        if (!userId || !customerId || !subscriptionId) {
          return Response.json(
            {
              error: 'checkout.session.completed missing required fields — nothing written.',
              debug: { hasUserId: !!userId, hasCustomerId: !!customerId, hasSubscriptionId: !!subscriptionId },
            },
            { status: 400 },
          )
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId ? planForPriceId(priceId) : null
        const periodEndUnix = subscription.items.data[0]?.current_period_end

        const { error } = await getSupabaseAdmin()
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan: resolvePlan(subscription.status, plan),
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          )
        if (error) {
          return Response.json(
            { error: `Supabase upsert (checkout.session.completed) failed: ${error.message}` },
            { status: 500 },
          )
        }
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
        const { error } = await getSupabaseAdmin()
          .from('subscriptions')
          .update({ plan: 'free', status: 'canceled', updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', customerId)
        if (error) {
          return Response.json(
            { error: `Supabase update (subscription.deleted) failed: ${error.message}` },
            { status: 500 },
          )
        }
        break
      }

      default:
        break
    }

    return Response.json({ received: true }, { status: 200 })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Erreur webhook.' },
      { status: 500 },
    )
  }
}
