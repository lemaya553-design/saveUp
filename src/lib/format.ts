import type { Lang } from './i18n/language'

export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP' | 'CHF'
export const CURRENCIES: Currency[] = ['CAD', 'USD', 'EUR', 'GBP', 'CHF']

function localeFor(lang: Lang): string {
  return lang === 'fr' ? 'fr-CA' : 'en-CA'
}

const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(lang: Lang, currency: Currency): Intl.NumberFormat {
  const key = `${lang}:${currency}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(localeFor(lang), { style: 'currency', currency })
    formatterCache.set(key, formatter)
  }
  return formatter
}

// The one place a dollar amount gets turned into display text anywhere in
// the app. `currency` is purely cosmetic — it changes which symbol/format
// Intl.NumberFormat renders, never the underlying stored number, and there
// is no exchange-rate conversion anywhere. `lang` picks the number
// convention (1 234,56 € vs. €1,234.56 for the same EUR amount), independent
// of which currency is selected.
export function formatMoney(amount: number, lang: Lang, currency: Currency): string {
  return getFormatter(lang, currency).format(amount)
}

// For real billing amounts (Stripe subscription pricing) only — these are
// actually charged in CAD regardless of the user's cosmetic display-currency
// preference, so showing them in another currency would misstate what gets
// charged. Never wire this to the currency preference.
export function formatBillingAmount(amount: number, lang: Lang): string {
  return formatMoney(amount, lang, 'CAD')
}

// Just the symbol/code (e.g. "$", "€", "CHF"), for a raw number input's
// adornment rather than a fully formatted amount.
export function getCurrencySymbol(currency: Currency, lang: Lang): string {
  const part = getFormatter(lang, currency)
    .formatToParts(0)
    .find((p) => p.type === 'currency')
  return part?.value ?? currency
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
