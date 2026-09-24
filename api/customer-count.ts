import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from './_stripe.js'

// Public, unauthenticated — unlike every other route in this directory.
// Returns ONLY a single aggregate integer, never any row from
// `subscriptions` itself: getSupabaseAdmin's service-role client (bypasses
// RLS server-side) does the counting here specifically so nothing about
// any individual customer ever has a path to the browser. The landing
// page's public progress counter is the only caller.
//
// `status = 'active'` only (not 'trialing') — someone mid-trial hasn't
// actually paid yet; counting them would inflate a number whose whole
// point is being honest. plan is guaranteed in ('standard','premium')
// whenever status is 'active' (see api/stripe-webhook.ts's resolvePlan),
// so filtering on status alone is already sufficient — the plan filter
// below is just making that explicit rather than relying on it silently.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const { count, error } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('user_id', { count: 'exact', head: true })
      .in('plan', ['standard', 'premium'])
      .eq('status', 'active')

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    // Cached at Vercel's edge — a landing-page visit never reaches Supabase
    // directly. Refreshes at most once an hour; stale-while-revalidate
    // means a visitor is never blocked on a fresh query even right after
    // the cache expires.
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json({ count: count ?? 0 })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unexpected server error.' })
  }
}
