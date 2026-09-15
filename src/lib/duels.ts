import { daysBetween, formatMonthsAndDays, monthsAndDaysBetween } from './savingsProjection'
import { HOOK_ERRORS } from './i18n/hookErrors'
import type { Lang } from './i18n/language'

export type DuelStatus = 'pending' | 'active' | 'completed' | 'abandoned'
export const DUEL_DURATION_OPTIONS = [30, 60, 90] as const
export type DuelDurationDays = (typeof DUEL_DURATION_OPTIONS)[number]

export interface DuelParticipant {
  userId: string
  displayName: string
  shareGoalName: boolean
  goalName: string | null
  progressPct: number
}

export interface Duel {
  id: string
  status: DuelStatus
  durationDays: number
  inviteToken: string
  inviteExpiresAt: string
  startedAt: string | null
  endsAt: string | null
  endedReason: 'completed' | 'abandoned' | null
  endedBy: string | null
  createdBy: string
  me: DuelParticipant | null
  opponent: DuelParticipant | null
}

// Who's ahead right now — meaningful both mid-duel ("who's currently
// winning") and once it's over ("who won"), same comparison either way.
export function getLeader(duel: Duel): 'me' | 'opponent' | 'tie' | null {
  if (!duel.me || !duel.opponent) return null
  if (duel.me.progressPct === duel.opponent.progressPct) return 'tie'
  return duel.me.progressPct > duel.opponent.progressPct ? 'me' : 'opponent'
}

// Null means the duel is over — callers show their own localized "over"
// label instead; otherwise the raw duration ("4 months, 2 days") for the
// caller to wrap in its own "X remaining" phrasing.
export function getTimeRemainingLabel(endsAt: string, now: Date, lang: Lang): string | null {
  const end = new Date(endsAt)
  const days = daysBetween(now, end)
  if (days <= 0) return null
  const { months, days: d } = monthsAndDaysBetween(now, end)
  return formatMonthsAndDays(months, d, lang)
}

export function isInviteExpired(expiresAt: string, now: Date): boolean {
  return new Date(expiresAt).getTime() <= now.getTime()
}

// Maps the short, stable codes raised by create_duel_invite /
// accept_duel_invite_by_id / decline_duel_invite (supabase/schema.sql) to a
// translated message — same "map known codes, pass through a fallback for
// anything else" shape as useAuth.tsx's mapAuthError. `fallback` is the
// caller's own generic message (createFailed/acceptFailed/declineFailed),
// used when the error doesn't match one of these exact codes (including
// when there's no rpcError.message at all).
export function mapDuelErrorCode(code: string | null | undefined, lang: Lang, fallback: string): string {
  const t = HOOK_ERRORS[lang].duels
  switch (code) {
    case 'invalid_email':
      return t.invalidEmail
    case 'invitee_not_found':
      return t.inviteeNotFound
    case 'cannot_invite_self':
      return t.cannotInviteSelf
    case 'goal_not_found':
      return t.goalNotFound
    case 'invite_not_found':
      return t.inviteNotFound
    default:
      return fallback
  }
}
