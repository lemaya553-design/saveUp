import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { emitExpensesChanged } from '../lib/events'
import type { RecurringExpense, RecurringFrequency } from '../lib/recurringExpenses'
import { useAuth } from './useAuth'

function fromRow(row: {
  id: string
  description: string
  amount: number
  category: string
  account: string | null
  frequency: string
  start_date: string
  end_date: string | null
  next_occurrence_date: string
}): RecurringExpense {
  return {
    id: row.id,
    description: row.description,
    amount: row.amount,
    category: row.category,
    account: row.account,
    frequency: row.frequency as RecurringFrequency,
    startDate: row.start_date,
    endDate: row.end_date,
    nextOccurrenceDate: row.next_occurrence_date,
  }
}

export function useRecurringExpenses() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rules, setRules] = useState<RecurringExpense[]>([])

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('recurring_expenses')
      .select('*')
      .order('created_at', { ascending: true })
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setRules((data ?? []).map(fromRow))
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function loadWithCatchUp() {
      // Same-day safety net on top of the daily cron sweep — generates any
      // occurrence(s) missed since the last time this ran (including a
      // first-time backfill for a brand new rule whose start date is today
      // or earlier), so what's shown here and in the rest of the budget is
      // never stale just because the cron hasn't fired yet today.
      const { data: generatedCount, error: catchUpError } = await supabase.rpc('catch_up_my_recurring_expenses')
      if (cancelled) return
      if (catchUpError) {
        setError(catchUpError.message)
      } else if (typeof generatedCount === 'number' && generatedCount > 0) {
        emitExpensesChanged()
      }
      await load()
    }

    loadWithCatchUp()
    return () => {
      cancelled = true
    }
  }, [userId, load])

  const addRecurringExpense = useCallback(
    async (
      description: string,
      amount: number,
      category: string,
      frequency: RecurringFrequency,
      startDate: string,
      endDate: string | null,
      account: string | null = null,
    ): Promise<boolean> => {
      if (!userId) return false
      const { error: insertError } = await supabase.from('recurring_expenses').insert({
        user_id: userId,
        description,
        amount,
        category,
        account,
        frequency,
        start_date: startDate,
        end_date: endDate,
        next_occurrence_date: startDate,
      })
      if (insertError) {
        setError(insertError.message)
        return false
      }
      // Generates today's occurrence immediately if the start date is today
      // or already past, instead of making the user wait for the next cron
      // run to see anything happen.
      const { data: generatedCount } = await supabase.rpc('catch_up_my_recurring_expenses')
      if (typeof generatedCount === 'number' && generatedCount > 0) emitExpensesChanged()
      await load()
      return true
    },
    [userId, load],
  )

  const updateRecurringExpense = useCallback(
    async (
      id: string,
      fields: { description: string; amount: number; category: string },
      applyToPast: boolean,
    ): Promise<boolean> => {
      const { error: updateError } = await supabase
        .from('recurring_expenses')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (updateError) {
        setError(updateError.message)
        return false
      }
      if (applyToPast) {
        const { error: bulkError } = await supabase
          .from('expenses')
          .update(fields)
          .eq('recurring_expense_id', id)
        if (bulkError) setError(bulkError.message)
        emitExpensesChanged()
      }
      await load()
      return true
    },
    [load],
  )

  const removeRecurringExpense = useCallback(
    async (id: string) => {
      // Linked expenses detach on their own (recurring_expense_id -> null,
      // ON DELETE SET NULL) — past transactions stay real, nothing to do
      // here beyond removing the rule itself.
      const { error: deleteError } = await supabase.from('recurring_expenses').delete().eq('id', id)
      if (deleteError) {
        setError(deleteError.message)
        return
      }
      setRules((prev) => prev.filter((r) => r.id !== id))
    },
    [],
  )

  return { loading, error, rules, addRecurringExpense, updateRecurringExpense, removeRecurringExpense }
}
