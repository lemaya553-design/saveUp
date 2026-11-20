import type { PayFrequency } from './onboardingQuiz'

const MS_PER_DAY = 86400000

function daysBetween(from: Date, to: Date): number {
  return Math.max(0, (to.getTime() - from.getTime()) / MS_PER_DAY)
}

// Live "Ça fait X$ par paye" preview for onboarding Q8. "Ça change"
// (variable pay) has no pay-period length of its own, so — per spec — it
// falls back to a monthly pace, same as "mensuelle". A past/today target
// date clamps to 1 remaining period rather than dividing by ~0, so the
// result reads as "you need it all, now" instead of NaN/Infinity.
export function computeAmountPerPay(
  targetAmount: number,
  targetDate: string | null,
  payFrequency: PayFrequency | null,
  today: Date = new Date(),
): number | null {
  if (!(targetAmount > 0) || !targetDate) return null
  const target = new Date(targetDate)
  if (Number.isNaN(target.getTime())) return null

  const periodDays = payFrequency === 'hebdomadaire' ? 7 : payFrequency === 'aux_deux_semaines' ? 14 : 30
  const periods = Math.max(1, Math.round(daysBetween(today, target) / periodDays))
  return targetAmount / periods
}
