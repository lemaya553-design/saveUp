import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'

export interface DialCountry {
  iso: CountryCode
  dial: string
  label: { fr: string; en: string }
}

// Deliberately short — SaveUp is a CAD app with a French/English Quebec
// audience, not a global one. Canada first (the default), United States
// next (shares NANP's "+1" with Canada but is a distinct ISO country for
// libphonenumber-js's numbering-plan validation), then a handful of other
// Francophone-relevant countries. Not meant to be exhaustive.
export const DIAL_COUNTRIES: DialCountry[] = [
  { iso: 'CA', dial: '+1', label: { fr: 'Canada', en: 'Canada' } },
  { iso: 'US', dial: '+1', label: { fr: 'États-Unis', en: 'United States' } },
  { iso: 'FR', dial: '+33', label: { fr: 'France', en: 'France' } },
  { iso: 'BE', dial: '+32', label: { fr: 'Belgique', en: 'Belgium' } },
  { iso: 'CH', dial: '+41', label: { fr: 'Suisse', en: 'Switzerland' } },
  { iso: 'GB', dial: '+44', label: { fr: 'Royaume-Uni', en: 'United Kingdom' } },
]

export const DEFAULT_DIAL_COUNTRY: CountryCode = 'CA'

// Validates `nationalNumber` against `country`'s real numbering plan (not
// just a digit-count check — libphonenumber-js knows which area
// codes/prefixes actually exist) and returns the E.164 form (e.g.
// "+15145550199") if valid, or null otherwise. Accepts common human
// formatting (spaces, dashes, parens) — callers don't need to pre-clean the
// input.
export function toE164(nationalNumber: string, country: CountryCode): string | null {
  const parsed = parsePhoneNumberFromString(nationalNumber, country)
  if (!parsed || !parsed.isValid()) return null
  return parsed.number
}
