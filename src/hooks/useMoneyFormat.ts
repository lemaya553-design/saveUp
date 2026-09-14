import { useCallback } from 'react'
import { useLanguage } from './useLanguage'
import { usePreferences } from './usePreferences'
import { formatMoney } from '../lib/format'

// The one hook every component reaches for to display a user-data amount —
// wraps lib/format.ts's formatMoney with the active language and the
// user's cosmetic currency preference, so no component has to know about
// either directly. Never use this for Stripe billing amounts (see
// formatBillingAmount) — those are always really charged in CAD.
export function useMoneyFormat() {
  const { lang } = useLanguage()
  const { currency } = usePreferences()
  return useCallback((amount: number) => formatMoney(amount, lang, currency), [lang, currency])
}
