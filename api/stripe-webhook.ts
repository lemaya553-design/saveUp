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

    // TEMPORARY diagnostic — a prior attempt wrote this to a Supabase table,
    // but that write went through its own try/catch and never produced a
    // row, which is itself suspicious (a freshly-created table can be
    // invisible to PostgREST's schema cache for a bit, same as the
    // subscriptions table earlier) — a second silent-failure-prone channel
    // isn't useful. Attaching it directly to the error response instead
    // rides a channel already proven reliable all session: Stripe's own
    // dashboard, which has consistently shown the full response body for
    // every delivery attempt. No secret values or customer data — lengths
    // and 4-char edges only.
    const debugInfo = {
      contentType: request.headers.get('content-type'),
      contentLength: request.headers.get('content-length'),
      rawBodyLength: rawBody.length,
      rawBodyStart: JSON.stringify(rawBody.slice(0, 4)),
      rawBodyEnd: JSON.stringify(rawBody.slice(-4)),
      signatureHeaderLength: signature.length,
      signatureHeaderPreview: signature.slice(0, 30),
      secretLength: webhookSecret.length,
      secretStart: JSON.stringify(webhookSecret.slice(0, 4)),
      secretEnd: JSON.stringify(webhookSecret.slice(-4)),
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      return Response.json(
        { error: `Signature invalide: ${err instanceof Error ? err.message : err}`, debug: debugInfo },
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

    return Response.json({ received: true }, { status: 200 })
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : 'Erreur webhook.' },
      { status: 500 },
    )
  }
}
