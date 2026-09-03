import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { emitGoalsChanged, onGoalsChanged } from '../lib/events'
import { deleteGoalPhoto, signGoalPhotoUrls, uploadGoalPhoto } from '../lib/goalPhoto'
import { useAuth } from './useAuth'

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string | null
  photoPath: string | null
  // Short-lived signed URL for photoPath (null until resolved, even when a
  // photo exists) — the bucket is private, so there's no stable public URL
  // to store or derive this from directly.
  photoUrl: string | null
}

function fromRow(row: {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  photo_path: string | null
}): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    targetDate: row.target_date,
    photoPath: row.photo_path,
    photoUrl: null,
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
      setLoading(false)
      hasLoadedOnce.current = true
      return
    }

    const loaded = (data ?? []).map(fromRow)
    const photoPaths = loaded.filter((g) => g.photoPath).map((g) => g.photoPath as string)
    const signedUrls = await signGoalPhotoUrls(photoPaths)
    setGoals(loaded.map((g) => (g.photoPath ? { ...g, photoUrl: signedUrls[g.photoPath] ?? null } : g)))
    setLoading(false)
    hasLoadedOnce.current = true
  }, [userId])

  useEffect(() => {
    load()
    return onGoalsChanged(load)
  }, [load])

  const addGoal = useCallback(
    async (name: string, targetAmount: number, targetDate: string | null): Promise<SavingsGoal | null> => {
      if (!userId) return null
      const { data, error: insertError } = await supabase
        .from('savings_goals')
        .insert({ user_id: userId, name, target_amount: targetAmount, target_date: targetDate })
        .select()
        .single()
      if (insertError || !data) {
        setError(insertError?.message ?? 'Insert failed')
        return null
      }
      const goal = fromRow(data)
      setGoals((prev) => [...prev, goal])
      emitGoalsChanged()
      return goal
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

  // Cleans up the storage object first (if any) — a goal row can't be
  // recovered once deleted, so an upload failure here would just leave an
  // orphaned file, never a dangling reference.
  const removeGoal = useCallback(
    async (id: string) => {
      const photoPath = goals.find((g) => g.id === id)?.photoPath
      if (photoPath) await deleteGoalPhoto(photoPath)
      setGoals((prev) => prev.filter((g) => g.id !== id))
      const { error: deleteError } = await supabase.from('savings_goals').delete().eq('id', id)
      if (deleteError) setError(deleteError.message)
      emitGoalsChanged()
    },
    [goals],
  )

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

  // Uploads (Premium-only — enforced by Storage RLS, see
  // supabase/schema.sql) and attaches in one step. Returns an error instead
  // of only setting the hook's shared `error`, so the photo picker can show
  // it inline right next to the file input rather than in the page's
  // generic error banner.
  const setGoalPhoto = useCallback(
    async (goalId: string, file: File): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Non connecté.' }
      const { path, error: uploadError } = await uploadGoalPhoto(userId, goalId, file)
      if (uploadError || !path) {
        return { error: uploadError ?? "Impossible d'envoyer la photo — réessaie." }
      }
      const { error: updateError } = await supabase
        .from('savings_goals')
        .update({ photo_path: path, updated_at: new Date().toISOString() })
        .eq('id', goalId)
      if (updateError) {
        return { error: updateError.message }
      }
      const signedUrls = await signGoalPhotoUrls([path])
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, photoPath: path, photoUrl: signedUrls[path] ?? null } : g)),
      )
      return { error: null }
    },
    [userId],
  )

  const removeGoalPhoto = useCallback(
    async (goalId: string) => {
      const photoPath = goals.find((g) => g.id === goalId)?.photoPath
      if (photoPath) await deleteGoalPhoto(photoPath)
      setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, photoPath: null, photoUrl: null } : g)))
      const { error: updateError } = await supabase
        .from('savings_goals')
        .update({ photo_path: null, updated_at: new Date().toISOString() })
        .eq('id', goalId)
      if (updateError) setError(updateError.message)
    },
    [goals],
  )

  return {
    loading,
    error,
    goals,
    addGoal,
    updateGoal,
    removeGoal,
    addContribution,
    setGoalPhoto,
    removeGoalPhoto,
  }
}
