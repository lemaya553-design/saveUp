import { useCallback } from 'react'
import { useLanguage } from './useLanguage'
import { usePreferences } from './usePreferences'
import { computeWorkHours } from '../lib/workHours'
import { COMMON } from '../lib/i18n/common'

// Mirrors useMoneyFormat's shape exactly — (amount) => string — so any call
// site can drop it in next to formatMoney(amount) with no extra plumbing.
// Returns null whenever there's nothing to show (feature off, no rate set,
// non-positive amount) so callers can write a plain
// `{hoursLabel && <span className="...">{hoursLabel}</span>}` and never
// render an empty/broken fragment.
export function useWorkHours() {
  const { lang } = useLanguage()
  const { hourlyRate, workHoursEnabled } = usePreferences()
  const t = COMMON[lang].workHours

  return useCallback(
    (amount: number): string | null => {
      if (!workHoursEnabled) return null
      const breakdown = computeWorkHours(amount, hourlyRate)
      if (!breakdown) return null
      if (breakdown.unit === 'minutes') return t.minutes(breakdown.minutes)
      if (breakdown.unit === 'hours') return t.hours(breakdown.hours)
      return t.hoursAndDays(breakdown.hours, breakdown.days)
    },
    [workHoursEnabled, hourlyRate, t],
  )
}
