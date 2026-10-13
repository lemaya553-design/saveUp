import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useLanguage } from './useLanguage'
import { COMMON } from '../lib/i18n/common'

// Single write-only action: insert a feedback row for the signed-in user.
// No read-back anywhere in the app (see feedback table's RLS/comment in
// schema.sql) — this hook only ever adds rows, never lists them.
export function useFeedback() {
  const { user } = useAuth()
  const { lang } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitFeedback = useCallback(
    async (message: string): Promise<boolean> => {
      if (!user) return false
      setSubmitting(true)
      setError(null)
      const { error: insertError } = await supabase.from('feedback').insert({ user_id: user.id, message })
      setSubmitting(false)
      if (insertError) {
        setError(insertError.message || COMMON[lang].feedback.errorFallback)
        return false
      }
      return true
    },
    [user, lang],
  )

  return { submitting, error, submitFeedback }
}
