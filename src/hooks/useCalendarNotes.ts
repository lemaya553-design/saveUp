import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toDateString } from '../lib/format'
import { useAuth } from './useAuth'
import { useGuestMode } from './useGuestMode'

export interface CalendarNote {
  dateStr: string
  rating: number
  description: string
}

// One row per day (see supabase/migrations/20261017000000_add_calendar_notes.sql),
// fetched a range at a time (Calendrier.tsx passes both the browsed month
// and the current year, unioned into a single range — see that file for
// why) so navigating/editing never pulls more than necessary. RLS scopes
// every read/write to the signed-in user; no manual .eq('user_id', ...)
// filter needed on the select, same convention as useIncome.ts/useExpenseHistory.ts.
export function useCalendarNotes(rangeStart: Date, rangeEnd: Date) {
  const { user } = useAuth()
  const guest = useGuestMode()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<Map<string, CalendarNote>>(new Map())

  const startStr = toDateString(rangeStart)
  const endStr = toDateString(rangeEnd)

  const load = useCallback(async () => {
    // Calendar notes aren't part of the sample dataset and aren't persisted
    // for a guest (unlike the budget/goal data in lib/guestStore.ts) — a
    // guest can still try rating a day while exploring, it just won't
    // survive leaving this page. Just resolves loading so the page doesn't
    // hang; saveNote/deleteNote below handle the actual in-session edits.
    if (guest.active) {
      setLoading(false)
      return
    }
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('calendar_notes')
      .select('note_date, rating, description')
      .gte('note_date', startStr)
      .lt('note_date', endStr)
    if (fetchError) {
      setError(fetchError.message)
    } else {
      const map = new Map<string, CalendarNote>()
      for (const row of data ?? []) {
        map.set(row.note_date, { dateStr: row.note_date, rating: row.rating, description: row.description })
      }
      setNotes(map)
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, guest.active, startStr, endStr])

  useEffect(() => {
    load()
  }, [load])

  // Returns whether the write succeeded — the autosave indicator in
  // CalendarNoteModal needs this per-attempt, not a page-level error banner
  // (a single failed autosave is retryable inline, not a "couldn't load
  // your data" situation), so failures here are NOT written to `error`.
  const saveNote = useCallback(
    async (dateStr: string, rating: number, description: string): Promise<boolean> => {
      if (guest.active) {
        setNotes((prev) => new Map(prev).set(dateStr, { dateStr, rating, description }))
        return true
      }
      if (!userId) return false
      const { error: upsertError } = await supabase
        .from('calendar_notes')
        .upsert(
          { user_id: userId, note_date: dateStr, rating, description, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,note_date' },
        )
      if (upsertError) return false
      setNotes((prev) => new Map(prev).set(dateStr, { dateStr, rating, description }))
      return true
    },
    [userId, guest.active],
  )

  const deleteNote = useCallback(
    async (dateStr: string): Promise<boolean> => {
      if (guest.active) {
        setNotes((prev) => {
          const next = new Map(prev)
          next.delete(dateStr)
          return next
        })
        return true
      }
      if (!userId) return false
      const { error: deleteError } = await supabase.from('calendar_notes').delete().eq('note_date', dateStr)
      if (deleteError) return false
      setNotes((prev) => {
        const next = new Map(prev)
        next.delete(dateStr)
        return next
      })
      return true
    },
    [userId, guest.active],
  )

  return { loading, error, notes, saveNote, deleteNote }
}
