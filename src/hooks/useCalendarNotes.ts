import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toDateString } from '../lib/format'
import { useAuth } from './useAuth'

export interface CalendarNote {
  dateStr: string
  rating: number
  description: string
}

// One row per day (see supabase/migrations/20261017000000_add_calendar_notes.sql),
// fetched a month at a time so navigating the Calendrier page never pulls
// more than one month's worth of rows — refetches whenever the visible
// month range changes. RLS scopes every read/write to the signed-in user;
// no manual .eq('user_id', ...) filter needed on the select, same
// convention as useIncome.ts/useExpenseHistory.ts.
export function useCalendarNotes(monthStart: Date, monthEnd: Date) {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState<Map<string, CalendarNote>>(new Map())

  const startStr = toDateString(monthStart)
  const endStr = toDateString(monthEnd)

  const load = useCallback(async () => {
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
  }, [userId, startStr, endStr])

  useEffect(() => {
    load()
  }, [load])

  const saveNote = useCallback(
    async (dateStr: string, rating: number, description: string) => {
      if (!userId) return
      const { error: upsertError } = await supabase
        .from('calendar_notes')
        .upsert(
          { user_id: userId, note_date: dateStr, rating, description, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,note_date' },
        )
      if (upsertError) {
        setError(upsertError.message)
        return
      }
      setNotes((prev) => new Map(prev).set(dateStr, { dateStr, rating, description }))
    },
    [userId],
  )

  const deleteNote = useCallback(
    async (dateStr: string) => {
      if (!userId) return
      const { error: deleteError } = await supabase.from('calendar_notes').delete().eq('note_date', dateStr)
      if (deleteError) {
        setError(deleteError.message)
        return
      }
      setNotes((prev) => {
        const next = new Map(prev)
        next.delete(dateStr)
        return next
      })
    },
    [userId],
  )

  return { loading, error, notes, saveNote, deleteNote }
}
