import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Duel, DuelDurationDays, DuelParticipant } from '../lib/duels'
import { useAuth } from './useAuth'

interface InvitePreview {
  duelId: string
  creatorDisplayName: string
  durationDays: number
  inviteExpiresAt: string
}

function toParticipant(row: {
  user_id: string
  display_name: string
  share_goal_name: boolean
  goal_name: string | null
  progress_pct: number
}): DuelParticipant {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    shareGoalName: row.share_goal_name,
    goalName: row.goal_name,
    progressPct: row.progress_pct,
  }
}

export function useDuels() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [duels, setDuels] = useState<Duel[]>([])
  // Which of MY OWN goals are already tied up in a pending/active duel —
  // used only to grey those out in the goal picker before someone tries
  // and hits the server-side "already dueling" rejection instead. Reads
  // savings_duel_entries scoped to my own rows only (that table's RLS has
  // no "same duel" exception — this never touches an opponent's data).
  const [busyGoalIds, setBusyGoalIds] = useState<Set<string>>(new Set())

  // Two flat queries + a client-side join, not an embedded select — this
  // hand-maintained Database type has no FK relationship metadata for
  // supabase-js to resolve `savings_duels.select('*, savings_duel_participants(*)')`
  // against, and no other hook in this codebase relies on embedded selects
  // either.
  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    const { data: entries } = await supabase
      .from('savings_duel_entries')
      .select('goal_id, duel_id')
      .eq('user_id', userId)

    const { data: duelRows, error: fetchError } = await supabase
      .from('savings_duels')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setLoading(false)
      return
    }

    const statusByDuelId = new Map((duelRows ?? []).map((d) => [d.id, d.status]))
    setBusyGoalIds(
      new Set(
        (entries ?? [])
          .filter((e) => {
            const status = statusByDuelId.get(e.duel_id)
            return status === 'pending' || status === 'active'
          })
          .map((e) => e.goal_id),
      ),
    )

    // Lazily flip any active duel whose time is up — harmless/idempotent
    // if another visit (by either side) already did this.
    const now = Date.now()
    const toFinalizeIds = new Set(
      (duelRows ?? [])
        .filter((d) => d.status === 'active' && d.ends_at && new Date(d.ends_at).getTime() <= now)
        .map((d) => d.id),
    )
    if (toFinalizeIds.size > 0) {
      await Promise.all(
        Array.from(toFinalizeIds).map((id) => supabase.rpc('finalize_duel_if_ended', { p_duel_id: id })),
      )
    }

    const { data: participantRows } = await supabase.from('savings_duel_participants').select('*')
    const participantsByDuel = new Map<string, ReturnType<typeof toParticipant>[]>()
    for (const row of participantRows ?? []) {
      const list = participantsByDuel.get(row.duel_id) ?? []
      list.push(toParticipant(row))
      participantsByDuel.set(row.duel_id, list)
    }

    const mapped: Duel[] = (duelRows ?? []).map((row) => {
      const participants = participantsByDuel.get(row.id) ?? []
      const me = participants.find((p) => p.userId === userId) ?? null
      const opponent = participants.find((p) => p.userId !== userId) ?? null
      return {
        id: row.id,
        status: (toFinalizeIds.has(row.id) && row.status === 'active' ? 'completed' : row.status) as Duel['status'],
        durationDays: row.duration_days,
        inviteToken: row.invite_token,
        inviteExpiresAt: row.invite_expires_at,
        startedAt: row.started_at,
        endsAt: row.ends_at,
        endedReason: row.ended_reason as Duel['endedReason'],
        endedBy: row.ended_by,
        createdBy: row.created_by,
        me,
        opponent,
      }
    })

    setDuels(mapped)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const createDuel = useCallback(
    async (
      goalId: string,
      durationDays: DuelDurationDays,
      displayName: string,
    ): Promise<{ inviteToken: string | null; error: string | null }> => {
      const { data, error: rpcError } = await supabase.rpc('create_duel', {
        p_goal_id: goalId,
        p_duration_days: durationDays,
        p_display_name: displayName,
      })
      if (rpcError || !data?.[0]) {
        return { inviteToken: null, error: rpcError?.message ?? 'Impossible de créer le duel.' }
      }
      await load()
      return { inviteToken: data[0].invite_token, error: null }
    },
    [load],
  )

  const getInvitePreview = useCallback(
    async (token: string): Promise<{ preview: InvitePreview | null; error: string | null }> => {
      const { data, error: rpcError } = await supabase.rpc('get_duel_invite_preview', { p_token: token })
      if (rpcError) return { preview: null, error: rpcError.message }
      const row = data?.[0]
      if (!row) return { preview: null, error: null }
      return {
        preview: {
          duelId: row.duel_id,
          creatorDisplayName: row.creator_display_name,
          durationDays: row.duration_days,
          inviteExpiresAt: row.invite_expires_at,
        },
        error: null,
      }
    },
    [],
  )

  const acceptInvite = useCallback(
    async (
      token: string,
      goalId: string,
      displayName: string,
      shareGoalName: boolean,
    ): Promise<{ duelId: string | null; error: string | null }> => {
      const { data, error: rpcError } = await supabase.rpc('accept_duel_invite', {
        p_token: token,
        p_goal_id: goalId,
        p_display_name: displayName,
        p_share_goal_name: shareGoalName,
      })
      if (rpcError || !data?.[0]) {
        return { duelId: null, error: rpcError?.message ?? "Impossible d'accepter ce duel." }
      }
      await load()
      return { duelId: data[0].duel_id, error: null }
    },
    [load],
  )

  const abandonDuel = useCallback(
    async (duelId: string): Promise<{ error: string | null }> => {
      const { error: rpcError } = await supabase.rpc('abandon_duel', { p_duel_id: duelId })
      if (rpcError) return { error: rpcError.message }
      await load()
      return { error: null }
    },
    [load],
  )

  return {
    loading,
    error,
    duels,
    busyGoalIds,
    createDuel,
    getInvitePreview,
    acceptInvite,
    abandonDuel,
    refresh: load,
  }
}
