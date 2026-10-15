import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabaseAdmin, getUserFromAuthHeader } from './_stripe.js'

const GOAL_PHOTO_BUCKET = 'goal-photos'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const user = await getUserFromAuthHeader(req.headers.authorization)
    if (!user) {
      res.status(401).json({ error: 'Non authentifié.' })
      return
    }

    const admin = getSupabaseAdmin()

    // Storage objects aren't covered by Postgres FK cascade — the
    // goal-photos bucket is private and folder-scoped per user
    // (src/lib/goalPhoto.ts: "{user_id}/{goal_id}.webp"), so clean those up
    // explicitly before deleting the auth user. Best-effort: a photo-listing
    // or -removal failure shouldn't block the rest of account deletion —
    // an orphaned private file nobody can ever again get a signed URL for
    // (the user_id folder match in storage RLS requires auth.uid(), which
    // no longer exists once deleteUser below succeeds) is a far smaller
    // problem than leaving the whole account undeleted.
    try {
      const { data: files } = await admin.storage.from(GOAL_PHOTO_BUCKET).list(user.id)
      if (files && files.length > 0) {
        await admin.storage.from(GOAL_PHOTO_BUCKET).remove(files.map((f) => `${user.id}/${f.name}`))
      }
    } catch (err) {
      console.error('delete-account: goal photo cleanup failed, continuing anyway:', err)
    }

    // Every user-owned table's user_id column references auth.users(id)
    // on delete cascade (see supabase/schema.sql) — deleting the auth user
    // is enough to remove every row across every table in one atomic
    // database-level step. No per-table deletes needed here.
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur inattendue.' })
  }
}
