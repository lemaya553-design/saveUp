// Single source of truth for what each plan unlocks — every gating point in
// the app (categories, goals, CSV import, statistics, simulator, alerts,
// badges, data export) reads from PLAN_LIMITS rather than checking `plan`
// directly, so the actual numbers/flags only ever live in one place.

export type Plan = 'free' | 'standard' | 'premium'

// Both paid plans share the same trial length — one constant so
// Tarifs/Paramètres/the checkout API can never drift out of sync on it.
export const TRIAL_DAYS = 7

export interface PlanLimits {
  label: string
  monthlyPrice: number
  maxCategories: number | null
  maxGoals: number | null
  csvImport: boolean
  fullStatistics: boolean
  advancedSimulator: boolean
  alerts: boolean
  dataExport: boolean
  allBadges: boolean
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    label: 'Gratuit',
    monthlyPrice: 0,
    maxCategories: 5,
    maxGoals: 1,
    csvImport: false,
    fullStatistics: false,
    advancedSimulator: false,
    alerts: false,
    dataExport: false,
    allBadges: false,
  },
  standard: {
    label: 'Standard',
    monthlyPrice: 7.99,
    maxCategories: null,
    maxGoals: null,
    csvImport: true,
    fullStatistics: true,
    advancedSimulator: false,
    alerts: false,
    dataExport: false,
    allBadges: true,
  },
  premium: {
    label: 'Premium',
    monthlyPrice: 14.99,
    maxCategories: null,
    maxGoals: null,
    csvImport: true,
    fullStatistics: true,
    advancedSimulator: true,
    alerts: true,
    dataExport: true,
    allBadges: true,
  },
}

export const PLAN_ORDER: Plan[] = ['free', 'standard', 'premium']

export function isAtLeast(plan: Plan, minPlan: Plan): boolean {
  return PLAN_ORDER.indexOf(plan) >= PLAN_ORDER.indexOf(minPlan)
}

// Free doesn't get unlimited CSV import (PLAN_LIMITS.free.csvImport stays
// false, which is what every other check in the app should keep reading),
// but gets a taste of it — up to 2 imports total, tracked by
// usePreferences().csvImportCount. Every CSV-import entry point should call
// this instead of reading `limits.csvImport` directly.
export const FREE_CSV_IMPORT_LIMIT = 2

export function canImportCsv(plan: Plan, csvImportCount: number): boolean {
  return PLAN_LIMITS[plan].csvImport || (plan === 'free' && csvImportCount < FREE_CSV_IMPORT_LIMIT)
}

// Enforcement for count-limited features (goals, categories): blocking NEW
// creation past the limit isn't enough on its own — an account that already
// has more items than its current plan allows (created before the limit
// existed, or after a downgrade) must not keep all of them fully usable, or
// the restriction is just cosmetic. `active` is what the rest of the app
// should treat as real/usable; `over` stays visible (data is never deleted)
// but excluded from anything that lets it actually DO something. Oldest
// items win the active slots, since every caller already fetches items in
// creation order.
export function splitByLimit<T>(items: T[], limit: number | null): { active: T[]; over: T[] } {
  if (limit === null) return { active: items, over: [] }
  return { active: items.slice(0, limit), over: items.slice(limit) }
}
