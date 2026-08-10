import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { emitExpensesChanged, onExpensesChanged } from '../lib/events'
import { useAuth } from './useAuth'

export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  spent_at: string
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

  return { loading, error, expenses, addExpense, updateExpense, removeExpense }
}
