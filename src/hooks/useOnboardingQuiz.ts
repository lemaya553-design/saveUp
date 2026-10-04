import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Archetype, QuizAnswers } from '../lib/onboardingQuiz'

// One row per user (primary key user_id) — same "no row = default" shape
// as useIncome.ts. `completed` (row exists) is what Dashboard.tsx now reads
// to decide whether to redirect to /onboarding, replacing the old
// financial-data-presence check: the new onboarding doesn't collect income/
// expenses/goals anymore, so hasIncomeRecord can't signal "done" on its own.
export function useOnboardingQuiz() {
  const { user } = useAuth()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [archetype, setArchetype] = useState<Archetype | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('onboarding_quiz_results')
        .select('score, archetype')
        .maybeSingle()
      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setCompleted(data != null)
        setScore(data?.score ?? null)
        setArchetype((data?.archetype as Archetype | null) ?? null)
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  // Returns whether the write actually succeeded — `completed`/`score`/
  // `archetype` only update AFTER that's confirmed, never optimistically.
  // An optimistic update here used to mean this hook's own `completed`
  // could read true even when the row was never actually written (e.g. the
  // table/migration missing, or an RLS rejection): Onboarding.tsx would
  // happily move on to the result/plans screens, but Dashboard's own
  // separate useOnboardingQuiz instance — which only ever reads the real
  // DB state — would correctly see "not completed" and redirect back to
  // /onboarding, which looked like "the quiz won't let me finish."
  const saveResult = useCallback(
    async (result: { score: number; archetype: Archetype; answers: QuizAnswers }): Promise<boolean> => {
      if (!userId) return false
      const { error: upsertError } = await supabase.from('onboarding_quiz_results').upsert(
        {
          user_id: userId,
          score: result.score,
          archetype: result.archetype,
          answers: result.answers,
        },
        { onConflict: 'user_id' },
      )
      if (upsertError) {
        setError(upsertError.message)
        return false
      }
      setCompleted(true)
      setScore(result.score)
      setArchetype(result.archetype)
      return true
    },
    [userId],
  )

  return { loading, error, completed, score, archetype, saveResult }
}
