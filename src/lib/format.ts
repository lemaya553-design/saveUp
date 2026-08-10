const currencyFormatter = new Intl.NumberFormat('fr-CA', {
  style: 'currency',
  currency: 'CAD',
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

// Monday 00:00:00 local time of the week containing `date`.
export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMonday)
  d.setHours(0, 0, 0, 0)
  return d
}

export const WEEKS_PER_MONTH = 52 / 12

export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  return { start, end }
}

export function getPreviousMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth() - 1, 1)
  const end = new Date(date.getFullYear(), date.getMonth(), 1)
  return { start, end }
}

// 0 (start of month) to 1 (end of month), how far into the current month `date` is.
export function getMonthProgress(date: Date): number {
  const { start, end } = getMonthRange(date)
  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = date.getTime() - start.getTime()
  return Math.min(1, Math.max(0, elapsedMs / totalMs))
}

export function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Explicit min/max bounds for `<input type="date">` fields (e.g. a savings
// goal's échéance): today at the earliest, decades out at the latest —
// generous enough that no realistic goal date ever bumps into it.
export function getTodayDateString(): string {
  return toDateString(new Date())
}

export function getFarFutureDateString(yearsAhead = 50): string {
  const future = new Date()
  future.setFullYear(future.getFullYear() + yearsAhead)
  return toDateString(future)
}
