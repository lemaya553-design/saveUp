import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface WishlistItem {
  id: string
  name: string
  price: number
  goalId: string | null
}

function fromRow(row: { id: string; name: string; price: number; goal_id: string | null }): WishlistItem {
  return { id: row.id, name: row.name, price: row.price, goalId: row.goal_id }
}

export function useWishlist() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<WishlistItem[]>([])

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('wishlist_items')
        .select('*')
        .order('created_at', { ascending: true })
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setItems((data ?? []).map(fromRow))
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const addItem = useCallback(
    async (name: string, price: number, goalId: string | null) => {
      if (!userId) return
      const { data, error: insertError } = await supabase
        .from('wishlist_items')
        .insert({ user_id: userId, name, price, goal_id: goalId })
        .select()
        .single()
      if (insertError || !data) {
        setError(insertError?.message ?? 'Insert failed')
        return
      }
      setItems((prev) => [...prev, fromRow(data)])
    },
    [userId],
  )

  const updateItem = useCallback(async (id: string, name: string, price: number, goalId: string | null) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, name, price, goalId } : item)))
    const { error: updateError } = await supabase
      .from('wishlist_items')
      .update({ name, price, goal_id: goalId })
      .eq('id', id)
    if (updateError) setError(updateError.message)
  }, [])

  const removeItem = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    const { error: deleteError } = await supabase.from('wishlist_items').delete().eq('id', id)
    if (deleteError) setError(deleteError.message)
  }, [])

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items])

  return { loading, error, items, total, addItem, updateItem, removeItem }
}
