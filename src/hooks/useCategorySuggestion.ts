import { useEffect, useMemo, useState } from 'react'
import {
  pickCategory,
  guessCanonicalCategory,
  resolveCategoryName,
  CANONICAL_DISPLAY_NAMES,
  type CustomKeyword,
} from '../lib/importParsing'
import { FALLBACK_CATEGORY } from '../lib/categories'
import type { Lang } from '../lib/i18n/language'
import type { Category } from './useCategories'

interface NewCategorySuggestion {
  // Shown to the user, in their active language.
  displayName: string
  // What actually gets stored — always the canonical French form, so it
  // translates correctly forever via categoryLabels.ts, the same as the
  // six reserved default categories. Storing displayName instead would
  // strand an English-created category with an untranslatable English name.
  storageName: string
}

// Shared by every manual expense-entry form (QuickAddFab, FixedExpenses,
// RecurringExpenses' add form) — same merchant-keyword dictionary the CSV
// import wizard uses (lib/importParsing.ts), so a category taught there,
// or via a confirmed suggestion (useCustomKeywords), applies here too.
// Owns the category <select>'s value so a form only needs to read
// `category`/`setCategory` and call `resolveCategoryForSubmit()` once, at
// submit — never on every keystroke, so closing the form without
// submitting never leaves behind a category nobody asked for.
export function useCategorySuggestion(
  description: string,
  categoryNames: string[],
  customKeywords: CustomKeyword[],
  lang: Lang,
  addCategory: (name: string) => Promise<Category | null>,
  maxCategories: number | null,
) {
  const [category, setCategoryState] = useState<string>(FALLBACK_CATEGORY)
  const [categoryTouched, setCategoryTouched] = useState(false)

  const suggestedCategory = useMemo(() => {
    if (!description.trim()) return null
    const result = pickCategory(undefined, description, categoryNames, FALLBACK_CATEGORY, customKeywords)
    return result.guessed ? result.category : null
  }, [description, categoryNames, customKeywords])

  // The dictionary recognizes the merchant concept (e.g. "Best Buy" ->
  // electronics) but none of this user's own categories resolves it yet.
  const newCategorySuggestion = useMemo<NewCategorySuggestion | null>(() => {
    if (!description.trim() || suggestedCategory) return null
    const canonical = guessCanonicalCategory(description)
    if (!canonical || resolveCategoryName(canonical, categoryNames)) return null
    return {
      displayName: CANONICAL_DISPLAY_NAMES[canonical][lang],
      storageName: CANONICAL_DISPLAY_NAMES[canonical].fr,
    }
  }, [description, categoryNames, suggestedCategory, lang])

  useEffect(() => {
    if (categoryTouched || !suggestedCategory) return
    setCategoryState(suggestedCategory)
  }, [suggestedCategory, categoryTouched])

  function setCategory(value: string) {
    setCategoryState(value)
    setCategoryTouched(true)
  }

  function reset() {
    setCategoryState(FALLBACK_CATEGORY)
    setCategoryTouched(false)
  }

  // Called once, at submit — creates the new category right along with
  // saving the expense itself, atomically, rather than the instant a
  // matching description is typed. Silently falls back to Autre if the
  // account is already at its plan's category limit — same as "nothing
  // matched," no error, no blocked submit.
  async function resolveCategoryForSubmit(): Promise<string> {
    if (categoryTouched || !newCategorySuggestion) return category
    if (maxCategories !== null && categoryNames.length >= maxCategories) return FALLBACK_CATEGORY
    const created = await addCategory(newCategorySuggestion.storageName)
    return created?.name ?? FALLBACK_CATEGORY
  }

  return {
    category,
    setCategory,
    categoryTouched,
    suggestedCategory,
    newCategorySuggestion,
    resolveCategoryForSubmit,
    reset,
  }
}
