import { daysBetween, formatMonthsAndDays, monthsAndDaysBetween } from './savingsProjection'

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

export function formatTimeRemaining(endsAt: string, now: Date): string {
  const end = new Date(endsAt)
  const days = daysBetween(now, end)
  if (days <= 0) return 'Terminé'
  const { months, days: d } = monthsAndDaysBetween(now, end)
  return `${formatMonthsAndDays(months, d)} restant${days > 1 ? 's' : ''}`
}

export function isInviteExpired(expiresAt: string, now: Date): boolean {
  return new Date(expiresAt).getTime() <= now.getTime()
}
