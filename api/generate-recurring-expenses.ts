import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin } from './_stripe.js'

// Vercel Cron (see vercel.json's `crons`) hits this once a day — the real
// mechanism behind "recurring expenses still generate even if you don't
// open the app for weeks." Runs as service role (bypasses RLS) and calls
// generate_all_due_recurring_expenses(), which loops every user with at
// least one due rule and backfills every missed occurrence in one pass —
// see supabase/schema.sql for the actual generation logic.
//
// Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` on cron
// invocations when a CRON_SECRET env var is set — checked here so this
// endpoint can't be triggered by an arbitrary public request.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = req.headers.authorization
      if (authHeader !== `Bearer ${cronSecret}`) {
        res.status(401).json({ error: 'Non autorisé.' })
        return
      }
    }

    const { data, error } = await getSupabaseAdmin().rpc('generate_all_due_recurring_expenses')
    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    res.status(200).json({ generated: data })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur inattendue.' })
  }
}
