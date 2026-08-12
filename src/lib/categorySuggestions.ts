import {
  CANONICAL_DISPLAY_NAMES,
  guessCanonicalCategory,
  normalizeDescription,
  resolveCategoryName,
  type CanonicalCategory,
} from './importParsing'

export interface CategorySuggestion {
  // Stable across renders for the same input — lets the UI track a
  // dismissed suggestion by id instead of by array position.
  id: string
  suggestedName: string
  // A few sample merchant names behind the count, for the confirmation
  // copy ("Sixt, Enterprise, Hertz").
  merchantLabel: string
  transactionIds: string[]
  count: number
  // Keywords to persist as custom_category_keywords if the user confirms.
  // Empty for a canonical-based suggestion — the built-in dictionary
  // already recognizes these merchants; only the destination category was
  // missing, so there's nothing new to teach it.
  newKeywords: string[]
}

// Small connector words that make poor cluster keys on their own (a French
// or English bank description like "LE MARCHE DU COIN" would otherwise
// cluster under "le").
const NOISE_WORDS = new Set([
  'inc', 'llc', 'ltd', 'corp', 'co', 'the', 'de', 'du', 'des', 'la', 'le', 'les', 'un', 'une',
])

// A rough but effective "merchant root" for grouping near-identical
// descriptions that only differ in store numbers or trailing city/reference
// codes — "SIXT #4521 MTL" and "SIXT RENT A CAR YUL" both reduce to "sixt".
// Purely local text processing, same normalizer already used for keyword
// matching (accents stripped, lowercased, punctuation → spaces).
function merchantKey(description: string): string | null {
  const normalized = normalizeDescription(description)
  const words = normalized
    .split(' ')
    .filter((w) => w.length >= 3 && !/^\d+$/.test(w) && !NOISE_WORDS.has(w))
  return words[0] ?? null
}

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// Scans "Autre" transactions for repeated merchant patterns worth their own
// category, in two tiers:
//
// 1. Rows the built-in dictionary already recognizes as a concept (e.g.
//    "electronics_software"), but for which none of the user's OWN
//    categories resolves it yet — grouped by that shared concept, so
//    differently-named merchants (Best Buy, Apple Store, Dell) that all mean
//    the same thing surface as one suggestion.
// 2. Rows the dictionary doesn't recognize at all, grouped by a raw
//    merchant-name match — catches a real repeated merchant this app simply
//    has no keyword for yet.
//
// Pure and read-only: never touches the database or creates anything. The
// caller (Paramètres) is the only place a suggestion turns into a write, and
// only after the user explicitly confirms it.
export function detectCategorySuggestions(
  rows: { id: string; description: string }[],
  categoryNames: string[],
  threshold = 3,
): CategorySuggestion[] {
  const suggestions: CategorySuggestion[] = []

  const canonicalGroups = new Map<CanonicalCategory, { ids: string[]; merchantKeys: Set<string> }>()
  const unmatchedRows: { id: string; description: string }[] = []

  for (const row of rows) {
    const canonical = guessCanonicalCategory(row.description)
    if (canonical) {
      if (resolveCategoryName(canonical, categoryNames)) continue // already resolves — not stuck
      let group = canonicalGroups.get(canonical)
      if (!group) {
        group = { ids: [], merchantKeys: new Set() }
        canonicalGroups.set(canonical, group)
      }
      group.ids.push(row.id)
      const key = merchantKey(row.description)
      if (key) group.merchantKeys.add(key)
    } else {
      unmatchedRows.push(row)
    }
  }

  for (const [canonical, group] of canonicalGroups) {
    if (group.ids.length < threshold) continue
    suggestions.push({
      id: `canonical:${canonical}`,
      suggestedName: CANONICAL_DISPLAY_NAMES[canonical],
      merchantLabel: [...group.merchantKeys].slice(0, 3).map(titleCase).join(', '),
      transactionIds: group.ids,
      count: group.ids.length,
      newKeywords: [],
    })
  }

  const rawGroups = new Map<string, string[]>()
  for (const row of unmatchedRows) {
    const key = merchantKey(row.description)
    if (!key) continue
    const ids = rawGroups.get(key) ?? []
    ids.push(row.id)
    rawGroups.set(key, ids)
  }
  for (const [key, ids] of rawGroups) {
    if (ids.length < threshold) continue
    suggestions.push({
      id: `merchant:${key}`,
      suggestedName: titleCase(key),
      merchantLabel: titleCase(key),
      transactionIds: ids,
      count: ids.length,
      newKeywords: [key],
    })
  }

  return suggestions.sort((a, b) => b.count - a.count)
}
