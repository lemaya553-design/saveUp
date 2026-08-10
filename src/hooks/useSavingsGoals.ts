import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { emitGoalsChanged, onGoalsChanged } from '../lib/events'
import { useAuth } from './useAuth'

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string | null
}

function fromRow(row: {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
}): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    targetDate: row.target_date,
  }
}

export function useSavingsGoals() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  // Background refetches (from the goals-changed event — e.g. the nav
  // badge's own instance reacting to a contribution made on the Épargne
  // page) must not flip loading back to true — see useExpenses.ts for why.
  const hasLoadedOnce = useRef(false)

  const load = useCallback(async () => {
    if (!userId) return
    if (!hasLoadedOnce.current) setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at', { ascending: true })
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setGoals((data ?? []).map(fromRow))
    }
    setLoading(false)
    hasLoadedOnce.current = true
  }, [userId])

  useEffect(() => {
    load()
    return onGoalsChanged(load)
  }, [load])

  const addGoal = useCallback(
    async (name: string, targetAmount: number, targetDate: string | null) => {
      if (!userId) return
      const { data, error: insertError } = await supabase
        .from('savings_goals')
        .insert({ user_id: userId, name, target_amount: targetAmount, target_date: targetDate })
        .select()
        .single()
      if (insertError || !data) {
        setError(insertError?.message ?? 'Insert failed')
        return
      }
      setGoals((prev) => [...prev, fromRow(data)])
      emitGoalsChanged()
    },
    [userId],
  )

  const updateGoal = useCallback(
    async (id: string, name: string, targetAmount: number, targetDate: string | null) => {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, name, targetAmount, targetDate } : g)),
      )
      const { error: updateError } = await supabase
        .from('savings_goals')
        .update({
          name,
          target_amount: targetAmount,
          target_date: targetDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (updateError) setError(updateError.message)
      emitGoalsChanged()
    },
    [],
  )

  const removeGoal = useCallback(async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
    const { error: deleteError } = await supabase.from('savings_goals').delete().eq('id', id)
    if (deleteError) setError(deleteError.message)
    emitGoalsChanged()
  }, [])

  // Reads the current_amount fresh right before writing (rather than trusting
  // this hook instance's possibly-stale local `goals` state) so two rapid
  // contributions to the same goal don't clobber each other's total — the
  // second write would otherwise add its amount on top of a base that
  // doesn't yet reflect the first write.
  const addContribution = useCallback(
    async (goalId: string, amount: number) => {
      if (!userId) return
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g)),
      )

      const { data: freshGoal, error: fetchError } = await supabase
        .from('savings_goals')
        .select('current_amount')
        .eq('id', goalId)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else if (freshGoal) {
        const { error: updateError } = await supabase
          .from('savings_goals')
          .update({
            current_amount: freshGoal.current_amount + amount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', goalId)
        if (updateError) setError(updateError.message)
      }

      const { error: insertError } = await supabase
        .from('savings_contributions')
        .insert({ user_id: userId, amount, goal_id: goalId })
      if (insertError) setError(insertError.message)
      emitGoalsChanged()
    },
    [userId],
  )

  return { loading, error, goals, addGoal, updateGoal, removeGoal, addContribution }
}
