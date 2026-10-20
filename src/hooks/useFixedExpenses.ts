import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useGuestMode } from './useGuestMode'
import { useLanguage } from './useLanguage'
import { COMMON } from '../lib/i18n/common'
import {
  addGuestFixedExpense,
  getGuestFixedExpenses,
  removeGuestFixedExpense,
  updateGuestFixedExpense,
} from '../lib/guestStore'

export interface FixedExpense {
  id: string
  name: string
  amount: number
  category: string
}

export function useFixedExpenses() {
  const { user } = useAuth()
  const guest = useGuestMode()
  const { lang } = useLanguage()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])

  useEffect(() => {
    if (guest.active) {
      setFixedExpenses(getGuestFixedExpenses())
      setLoading(false)
      return
    }
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('fixed_expenses')
        .select('*')
        .order('created_at', { ascending: true })
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setFixedExpenses(data ?? [])
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId, guest.active])

  const addFixedExpense = useCallback(
    async (name: string, amount: number, category = 'Autre') => {
      if (guest.active) {
        const created = addGuestFixedExpense(name, amount, category)
        setFixedExpenses((prev) => [...prev, created])
        return
      }
      if (!userId) return
      const { data, error: insertError } = await supabase
        .from('fixed_expenses')
        .insert({ user_id: userId, name, amount, category })
        .select()
        .single()
      if (insertError || !data) {
        setError(insertError?.message ?? COMMON[lang].app.saveFailed)
        return
      }
      setFixedExpenses((prev) => [...prev, data])
    },
    [userId, lang, guest.active],
  )

  const updateFixedExpense = useCallback(
    async (id: string, name: string, amount: number, category: string) => {
      setFixedExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, name, amount, category } : e)),
      )
      if (guest.active) {
        updateGuestFixedExpense(id, name, amount, category)
        return
      }
      const { error: updateError } = await supabase
        .from('fixed_expenses')
        .update({ name, amount, category })
        .eq('id', id)
      if (updateError) setError(updateError.message)
    },
    [guest.active],
  )

  const removeFixedExpense = useCallback(
    async (id: string) => {
      setFixedExpenses((prev) => prev.filter((e) => e.id !== id))
      if (guest.active) {
        removeGuestFixedExpense(id)
        return
      }
      const { error: deleteError } = await supabase.from('fixed_expenses').delete().eq('id', id)
      if (deleteError) setError(deleteError.message)
    },
    [guest.active],
  )

  const totalFixedExpenses = useMemo(
    () => fixedExpenses.reduce((sum, e) => sum + e.amount, 0),
    [fixedExpenses],
  )

  return {
    loading,
    error,
    fixedExpenses,
    addFixedExpense,
    updateFixedExpense,
    removeFixedExpense,
    totalFixedExpenses,
  }
}
