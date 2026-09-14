import type { Lang } from './language'

// Display-only translation for the app's own reserved category labels —
// NOT user data. Two kinds: the 6 categories seeded server-side for every
// new account (supabase/schema.sql: Logement, Alimentation, Transport,
// Loisirs, Santé, Autre) and 2 computed grouping labels used only for
// display (lib/categoryColors.ts's SAVINGS_CATEGORY/AVAILABLE_LABEL —
// never stored as a `categories` row at all).
//
// The stored/compared value is ALWAYS the French string, forever — every
// `category === 'Autre'` comparison, every FALLBACK_CATEGORY default,
// every DB row, stays exactly as-is. This function only changes what's
// rendered on screen. A category the user renamed (or created themselves)
// no longer matches any key here, so it silently falls through unchanged
// — exactly like today, in both languages.
const CATEGORY_LABELS_EN: Record<string, string> = {
  Logement: 'Housing',
  Alimentation: 'Groceries',
  Transport: 'Transport',
  Loisirs: 'Fun money',
  Santé: 'Health',
  Autre: 'Other',
  Épargne: 'Savings',
  Disponible: 'Available',
}

export function translateCategoryLabel(name: string, lang: Lang): string {
  if (lang === 'fr') return name
  return CATEGORY_LABELS_EN[name] ?? name
}
