// Pure computation — no i18n, no React. useWorkHours.ts wraps this with the
// active language's copy; useHourlyRateInput (Paramètres) reuses the annual
// conversion. A fixed 8h workday (not the user's own weekly hours) is the
// unit for the "23 jours" figure — a stable, universal convention rather
// than one that would silently change meaning if the user later edits their
// weekly hours.
const WORK_DAY_HOURS = 8

export type WorkHoursBreakdown =
  | { unit: 'minutes'; minutes: number }
  | { unit: 'hours'; hours: number }
  | { unit: 'hoursAndDays'; hours: number; days: number }

// null covers every "nothing to show" case in one place: no rate set, a
// non-positive rate, or a non-positive amount (a $0 or refunded line has no
// meaningful time cost).
export function computeWorkHours(amount: number, hourlyRate: number | null): WorkHoursBreakdown | null {
  if (!hourlyRate || hourlyRate <= 0 || amount <= 0) return null
  const hours = amount / hourlyRate
  if (hours < 1) return { unit: 'minutes', minutes: Math.round(hours * 60) }
  if (hours <= 40) return { unit: 'hours', hours: Math.round(hours) }
  return { unit: 'hoursAndDays', hours: Math.round(hours), days: Math.round(hours / WORK_DAY_HOURS) }
}

// Net annual salary + hours worked per week -> net hourly rate. Only the
// resulting rate is ever persisted (see usePreferences) — this is called at
// the moment the Paramètres form is saved, never stored itself.
export function computeHourlyRateFromAnnual(annualSalary: number, hoursPerWeek: number): number | null {
  if (!annualSalary || annualSalary <= 0 || !hoursPerWeek || hoursPerWeek <= 0) return null
  return annualSalary / (hoursPerWeek * 52)
}
