import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'

export interface DialCountry {
  iso: CountryCode
  dial: string
  label: { fr: string; en: string }
}

export const DEFAULT_DIAL_COUNTRY: CountryCode = 'CA'

const regionNameFr = new Intl.DisplayNames(['fr'], { type: 'region' })
const regionNameEn = new Intl.DisplayNames(['en'], { type: 'region' })

// Every country/territory libphonenumber-js has a numbering plan for (~245)
// — built from its own metadata rather than a hand-maintained list, so it
// can never drift out of sync with what toE164 below actually validates.
// Localized names come from the runtime's own Intl.DisplayNames, not a
// second hand-translated list to keep up to date. Canada sorts first
// (SaveUp's primary market, and the default everywhere a country picker
// appears); everything else is alphabetical by its French name.
export const DIAL_COUNTRIES: DialCountry[] = getCountries()
  .map((iso) => ({
    iso,
    dial: `+${getCountryCallingCode(iso)}`,
    label: { fr: regionNameFr.of(iso) ?? iso, en: regionNameEn.of(iso) ?? iso },
  }))
  .sort((a, b) => {
    if (a.iso === DEFAULT_DIAL_COUNTRY) return -1
    if (b.iso === DEFAULT_DIAL_COUNTRY) return 1
    return a.label.fr.localeCompare(b.label.fr, 'fr')
  })

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
