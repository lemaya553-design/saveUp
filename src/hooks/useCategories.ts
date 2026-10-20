import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { emitCategoriesChanged, emitExpensesChanged, onCategoriesChanged } from '../lib/events'
import { FALLBACK_CATEGORY } from '../lib/categories'
import { useAuth } from './useAuth'
import { useGuestMode } from './useGuestMode'
import { useLanguage } from './useLanguage'
import { COMMON } from '../lib/i18n/common'
import { HOOK_ERRORS } from '../lib/i18n/hookErrors'
import {
  addGuestCategory,
  getGuestCategories,
  getGuestExpenses,
  getGuestFixedExpenses,
  removeGuestCategory,
  renameGuestCategory,
  setGuestCategoryBudget,
} from '../lib/guestStore'

export interface Category {
  id: string
  name: string
  monthlyBudget: number | null
}

function fromRow(row: { id: string; name: string; monthly_budget: number | null }): Category {
  return { id: row.id, name: row.name, monthlyBudget: row.monthly_budget }
}

// Alphabetical, but "Autre" (the catch-all fallback) always sorts last —
// matches the order the old hardcoded list used.
function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    if (a.name === FALLBACK_CATEGORY) return 1
    if (b.name === FALLBACK_CATEGORY) return -1
    return a.name.localeCompare(b.name, 'fr')
  })
}

export function useCategories() {
  const { user } = useAuth()
  const guest = useGuestMode()
  const { lang } = useLanguage()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  // Background refetches (from the categories-changed event, possibly
  // triggered by an unrelated form elsewhere on the page) must not flip
  // loading back to true — see useExpenses.ts for why.
  const hasLoadedOnce = useRef(false)

  const load = useCallback(async () => {
    if (guest.active) {
      setCategories(sortCategories(getGuestCategories()))
      setLoading(false)
      hasLoadedOnce.current = true
      return
    }
    if (!userId) return
    if (!hasLoadedOnce.current) setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase.from('categories').select('*')
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCategories(sortCategories((data ?? []).map(fromRow)))
    }
    setLoading(false)
    hasLoadedOnce.current = true
  }, [userId, guest.active])

  useEffect(() => {
    load()
    return onCategoriesChanged(load)
  }, [load])

  // Returns the created row (or the pre-existing one, see below) so a
  // caller that needs it immediately — useCategorySuggestion's
  // resolveCategoryForSubmit — doesn't have to wait for the next render's
  // `categories` state to catch up.
  const addCategory = useCallback(
    async (name: string): Promise<Category | null> => {
      const trimmed = name.trim()
      if (!trimmed) return null
      if (guest.active) {
        const created = addGuestCategory(trimmed)
        setCategories((prev) => sortCategories([...prev, created]))
        return created
      }
      if (!userId) return null
      const { data, error: insertError } = await supabase
        .from('categories')
        .insert({ user_id: userId, name: trimmed })
        .select()
        .single()
      if (insertError || !data) {
        setError(insertError?.message ?? COMMON[lang].app.saveFailed)
        return null
      }
      const created = fromRow(data)
      setCategories((prev) => sortCategories([...prev, created]))
      emitCategoriesChanged()
      return created
    },
    [userId, lang, guest.active],
  )

  const setCategoryBudget = useCallback(
    async (id: string, monthlyBudget: number | null) => {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, monthlyBudget } : c)))
      if (guest.active) {
        setGuestCategoryBudget(id, monthlyBudget)
        return
      }
      const { error: updateError } = await supabase
        .from('categories')
        .update({ monthly_budget: monthlyBudget })
        .eq('id', id)
      if (updateError) setError(updateError.message)
      emitCategoriesChanged()
    },
    [guest.active],
  )

  // Renaming updates the category row AND every fixed_expenses/expenses
  // row that references the old name by text — there's no foreign key
  // tying them together, so this is the only way they stay in sync.
  const renameCategory = useCallback(
    async (id: string, newName: string) => {
      const category = categories.find((c) => c.id === id)
      const trimmed = newName.trim()
      if (!category || !trimmed || trimmed === category.name) return

      setCategories((prev) => sortCategories(prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c))))

      if (guest.active) {
        renameGuestCategory(id, trimmed)
        return
      }

      const { error: updateError } = await supabase
        .from('categories')
        .update({ name: trimmed })
        .eq('id', id)
      if (updateError) {
        setError(updateError.message)
        return
      }

      await Promise.all([
        supabase.from('fixed_expenses').update({ category: trimmed }).eq('category', category.name),
        supabase.from('expenses').update({ category: trimmed }).eq('category', category.name),
      ])
      emitCategoriesChanged()
      emitExpensesChanged()
    },
    [categories, guest.active],
  )

  const getUsageCount = useCallback(
    async (name: string): Promise<number> => {
      if (guest.active) {
        return (
          getGuestFixedExpenses().filter((f) => f.category === name).length +
          getGuestExpenses().filter((e) => e.category === name).length
        )
      }
      const [fixedRes, expensesRes] = await Promise.all([
        supabase.from('fixed_expenses').select('id', { count: 'exact', head: true }).eq('category', name),
        supabase.from('expenses').select('id', { count: 'exact', head: true }).eq('category', name),
      ])
      return (fixedRes.count ?? 0) + (expensesRes.count ?? 0)
    },
    [guest.active],
  )

  // Deleting a category in use requires `reassignTo` — every expense row
  // using it gets moved there first (normally "Autre") so nothing is left
  // pointing at a category that no longer exists.
  const removeCategory = useCallback(
    async (id: string, opts?: { reassignTo?: string }) => {
      const category = categories.find((c) => c.id === id)
      if (!category) return
      if (category.name === FALLBACK_CATEGORY) {
        setError(HOOK_ERRORS[lang].categories.cannotDeleteFallback(FALLBACK_CATEGORY))
        return
      }

      if (guest.active) {
        setCategories((prev) => prev.filter((c) => c.id !== id))
        removeGuestCategory(id, opts?.reassignTo)
        return
      }

      if (opts?.reassignTo) {
        await Promise.all([
          supabase
            .from('fixed_expenses')
            .update({ category: opts.reassignTo })
            .eq('category', category.name),
          supabase.from('expenses').update({ category: opts.reassignTo }).eq('category', category.name),
        ])
      }

      setCategories((prev) => prev.filter((c) => c.id !== id))
      const { error: deleteError } = await supabase.from('categories').delete().eq('id', id)
      if (deleteError) setError(deleteError.message)
      emitCategoriesChanged()
      if (opts?.reassignTo) emitExpensesChanged()
    },
    [categories, lang, guest.active],
  )

  return {
    loading,
    error,
    categories,
    categoryNames: categories.map((c) => c.name),
    addCategory,
    renameCategory,
    removeCategory,
    setCategoryBudget,
    getUsageCount,
  }
}
