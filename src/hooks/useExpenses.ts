import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { emitExpensesChanged, onExpensesChanged } from '../lib/events'
import { pickCategory } from '../lib/importParsing'
import { FALLBACK_CATEGORY } from '../lib/categories'
import { useAuth } from './useAuth'

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  spent_at: string
  account: string | null
}

export function useExpenses() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  // Background refetches (triggered by the expenses-changed event, possibly
  // from an unrelated form elsewhere on the page) must not flip loading back
  // to true — pages gate their whole render on it, so that would unmount
  // every form on the page and wipe out whatever the user was mid-typing.
  const hasLoadedOnce = useRef(false)

  const load = useCallback(async () => {
    if (!userId) return
    if (!hasLoadedOnce.current) setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .order('spent_at', { ascending: false })
      .limit(50)
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setExpenses(data ?? [])
    }
    setLoading(false)
    hasLoadedOnce.current = true
  }, [userId])

  useEffect(() => {
    load()
    return onExpensesChanged(load)
  }, [load])

  const addExpense = useCallback(
    async (description: string, amount: number, category = 'Autre') => {
      if (!userId) return
      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert({ user_id: userId, description, amount, category })
        .select()
        .single()
      if (insertError || !data) {
        setError(insertError?.message ?? 'Insert failed')
        return
      }
      setExpenses((prev) => [data, ...prev])
      emitExpensesChanged()
    },
    [userId],
  )

  // Used by CSV/Excel import: inserted in batches (PostgREST payloads stay
  // reasonable-sized) rather than one request per row. Returns how many rows
  // actually made it in before an error, if any — so a mid-import failure
  // still reports partial progress instead of an all-or-nothing result.
  const addExpensesBulk = useCallback(
    async (
      rows: {
        description: string
        amount: number
        category: string
        spent_at: string
        account?: string | null
      }[],
    ): Promise<{ imported: number; error: string | null }> => {
      if (!userId || rows.length === 0) return { imported: 0, error: null }

      const BATCH_SIZE = 500
      let imported = 0

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE).map((row) => ({ ...row, user_id: userId }))
        const { data, error: insertError } = await supabase.from('expenses').insert(batch).select('id')
        if (insertError) {
          if (imported > 0) emitExpensesChanged()
          return { imported, error: insertError.message }
        }
        imported += data?.length ?? batch.length
      }

      emitExpensesChanged()
      return { imported, error: null }
    },
    [userId],
  )

  // A plain .select() only returns however many rows PostgREST's configured
  // max-rows allows per request (e.g. 15, 1000 — whatever the project has
  // set) and silently truncates the rest. Paginate with .range() until a
  // page comes back short, so every "Autre" expense gets picked up
  // regardless of that cap. Shared by recategorizeExpenses and
  // fetchFallbackExpenses (category-suggestion detection) — both need the
  // complete list, not just the first page.
  const fetchFallbackExpenses = useCallback(async (): Promise<{
    rows: { id: string; description: string }[]
    error: string | null
  }> => {
    if (!userId) return { rows: [], error: null }

    const PAGE_SIZE = 500
    const rows: { id: string; description: string }[] = []
    let from = 0
    for (;;) {
      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('id, description')
        .eq('category', FALLBACK_CATEGORY)
        .range(from, from + PAGE_SIZE - 1)

      if (fetchError) return { rows, error: fetchError.message }

      const page = data ?? []
      rows.push(...page)
      if (page.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }
    return { rows, error: null }
  }, [userId])

  // Re-runs the same merchant-keyword guess used by the import wizard
  // (pickCategory) against every existing expense still sitting in the
  // fallback category — e.g. after the user adds new categories, or after
  // this guessing logic itself improves. Only ever writes the `category`
  // column on rows that already exist; never inserts or deletes anything.
  const recategorizeExpenses = useCallback(
    async (
      categoryNames: string[],
      customKeywords: { keyword: string; category: string }[] = [],
    ): Promise<{
      checked: number
      updated: number
      error: string | null
      sample: { description: string; guessedCategory: string | null }[]
    }> => {
      if (!userId) return { checked: 0, updated: 0, error: null, sample: [] }

      const { rows, error: fetchError } = await fetchFallbackExpenses()
      if (fetchError) return { checked: rows.length, updated: 0, error: fetchError, sample: [] }

      const guesses = rows.map((row) => ({
        id: row.id,
        description: row.description,
        category: pickCategory(undefined, row.description, categoryNames, FALLBACK_CATEGORY, customKeywords)
          .category,
      }))

      // What the matcher actually saw and decided, for a handful of rows —
      // shown in the UI so a 0-match run is diagnosable without database
      // access. "No keyword fired" and "matched but the write silently
      // no-op'd" look identical from the outside otherwise.
      const sample = guesses.slice(0, 8).map((g) => ({
        description: g.description,
        guessedCategory: g.category === FALLBACK_CATEGORY ? null : g.category,
      }))

      const changes = guesses.filter((row) => row.category !== FALLBACK_CATEGORY)

      // .select('id') on the update is what makes `updated` trustworthy: a
      // row an RLS policy silently excludes from the write (wrong owner, a
      // stale id) comes back as { data: [], error: null } — no error, but
      // nothing was actually changed. Counting on `!error` alone would
      // report success for writes that touched zero rows.
      const results = await Promise.all(
        changes.map((change) =>
          supabase.from('expenses').update({ category: change.category }).eq('id', change.id).select('id'),
        ),
      )
      const updated = results.filter((r) => !r.error && (r.data?.length ?? 0) > 0).length
      const firstError = results.find((r) => r.error)?.error?.message ?? null

      if (updated > 0) emitExpensesChanged()
      return { checked: rows.length, updated, error: firstError, sample }
    },
    [userId, fetchFallbackExpenses],
  )

  // Reassigns a specific set of expense ids to `category` in one shot — used
  // by the category-suggestion confirm flow (Paramètres), which already
  // knows exactly which transactions a cluster covers, unlike
  // recategorizeExpenses which re-guesses from scratch.
  const reassignExpenses = useCallback(
    async (ids: string[], category: string): Promise<{ updated: number; error: string | null }> => {
      if (!userId || ids.length === 0) return { updated: 0, error: null }
      const results = await Promise.all(
        ids.map((id) => supabase.from('expenses').update({ category }).eq('id', id).select('id')),
      )
      const updated = results.filter((r) => !r.error && (r.data?.length ?? 0) > 0).length
      const firstError = results.find((r) => r.error)?.error?.message ?? null
      if (updated > 0) emitExpensesChanged()
      return { updated, error: firstError }
    },
    [userId],
  )

  const updateExpense = useCallback(
    async (id: string, description: string, amount: number, category: string) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, description, amount, category } : e)),
      )
      const { error: updateError } = await supabase
        .from('expenses')
        .update({ description, amount, category })
        .eq('id', id)
      if (updateError) setError(updateError.message)
      emitExpensesChanged()
    },
    [],
  )

  const removeExpense = useCallback(async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id))
    const { error: deleteError } = await supabase.from('expenses').delete().eq('id', id)
    if (deleteError) setError(deleteError.message)
    emitExpensesChanged()
  }, [])

  return {
    loading,
    error,
    expenses,
    addExpense,
    addExpensesBulk,
    fetchFallbackExpenses,
    recategorizeExpenses,
    reassignExpenses,
    updateExpense,
    removeExpense,
  }
}
