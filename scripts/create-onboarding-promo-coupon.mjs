// One-off script: creates the Stripe Coupon used by the onboarding quiz's
// Premium "first month at $7.99" offer — $7.00 off (1499 - 799 cents),
// applied once (Stripe's `duration: 'once'` means it only ever discounts
// the FIRST invoice; every invoice after that bills the full Premium price
// automatically, no code needed to "turn it back on"). Prints the
// resulting Coupon ID — copy it into STRIPE_PREMIUM_PROMO_COUPON in .env
// (and later Vercel's env vars) yourself; this script never prints or
// needs your secret key to be typed anywhere but your own .env.
//
// Run with: node --env-file=.env scripts/create-onboarding-promo-coupon.mjs
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

const coupon = await stripe.coupons.create({
  name: 'SaveUp Premium — premier mois',
  currency: 'cad',
  amount_off: 700, // 14.99 $ - 7.99 $ = 7.00 $ off, in cents
  duration: 'once',
})

console.log('\nAjoute cette ligne à ton .env (et plus tard aux variables d\'environnement Vercel) :\n')
console.log(`STRIPE_PREMIUM_PROMO_COUPON=${coupon.id}`)
