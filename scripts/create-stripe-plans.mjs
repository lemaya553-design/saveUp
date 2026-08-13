// One-off script: creates the "SaveUp Standard" and "SaveUp Premium"
// products + recurring monthly prices in Stripe (placeholder amounts,
// adjustable later directly in the Stripe dashboard). Prints the resulting
// Price IDs — copy those into STRIPE_PRICE_STANDARD / STRIPE_PRICE_PREMIUM
// in .env (and later in Vercel's env vars) yourself; this script never
// prints or needs your secret key to be typed anywhere but your own .env.
//
// Run with: node --env-file=.env scripts/create-stripe-plans.mjs
// (Requires Node 20.6+ for --env-file. On an older Node, export the vars in
// your shell first instead.)

import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) {
  console.error('STRIPE_SECRET_KEY is not set — nothing to do. Add it to .env first.')
  process.exit(1)
}
if (!secretKey.startsWith('sk_test_')) {
  console.error(
    'STRIPE_SECRET_KEY is not a test key (sk_test_...). Refusing to run against a live key from this script — swap in a test key first.',
  )
  process.exit(1)
}

const stripe = new Stripe(secretKey)

async function createPlan(name, unitAmountCents) {
  const product = await stripe.products.create({ name: `SaveUp ${name}` })
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'cad',
    unit_amount: unitAmountCents,
    recurring: { interval: 'month' },
  })
  return price.id
}

const standardPriceId = await createPlan('Standard', 799) // 7.99 $ CAD/mois — placeholder
const premiumPriceId = await createPlan('Premium', 1499) // 14.99 $ CAD/mois — placeholder

console.log('\nAjoute ces lignes à ton .env (et plus tard aux variables d\'environnement Vercel) :\n')
console.log(`STRIPE_PRICE_STANDARD=${standardPriceId}`)
console.log(`STRIPE_PRICE_PREMIUM=${premiumPriceId}`)
