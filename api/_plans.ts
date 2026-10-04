// Maps a plan name to its Stripe Price ID via env vars (not hardcoded) so
// swapping in real prices later never requires a code change/redeploy.
export type PayablePlan = 'standard' | 'premium'

export function priceIdForPlan(plan: PayablePlan): string {
  const envVar = plan === 'standard' ? 'STRIPE_PRICE_STANDARD' : 'STRIPE_PRICE_PREMIUM'
  const value = process.env[envVar]
  if (!value) throw new Error(`Missing required env var: ${envVar}`)
  return value
}

export function planForPriceId(priceId: string): PayablePlan | null {
  if (priceId === process.env.STRIPE_PRICE_STANDARD) return 'standard'
  if (priceId === process.env.STRIPE_PRICE_PREMIUM) return 'premium'
  return null
}

export function isPayablePlan(value: unknown): value is PayablePlan {
  return value === 'standard' || value === 'premium'
}

// Stripe Coupon ID for the onboarding quiz's Premium "first month at
// $7.99" offer (duration: 'once' — Stripe reverts to full price starting
// the 2nd invoice on its own). Created once via
// scripts/create-onboarding-promo-coupon.mjs.
export function premiumPromoCouponId(): string {
  const value = process.env.STRIPE_PREMIUM_PROMO_COUPON
  if (!value) throw new Error('Missing required env var: STRIPE_PREMIUM_PROMO_COUPON')
  return value
}
