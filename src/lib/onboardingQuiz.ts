import type { MainGoal } from './onboardingProfile'

// Scoring rubric for the 15-question onboarding quiz. Question/option TEXT
// lives in lib/i18n/onboardingQuiz.ts (bilingual); this file only knows
// about option ids ('a'/'b'/.../'d') and numbers, so the rubric itself
// never needs to change when copy is tweaked or translated.
//
// 13 of the 15 questions feed the 0-100 score (Q14/Q15 are purely
// descriptive — "what's blocking you" and "what's your main goal" don't
// have a real better/worse answer, so they inform the archetype/tips
// instead of the number). Stress (Q9/Q10/Q11/Q12), savings (Q5/Q7/Q8) and
// habits (Q3/Q13) questions carry more weight than the general ones, per
// the brief — expressed here as a higher `points` ceiling per option
// rather than a separate multiplier, so the final score is just "sum of
// points earned / sum of points possible".

export type Archetype = 'stressed' | 'impulsive' | 'cautious' | 'master'

export const QUIZ_QUESTION_IDS = [
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15',
] as const
export type QuizQuestionId = (typeof QUIZ_QUESTION_IDS)[number]

export type QuizAnswers = Partial<Record<QuizQuestionId, string>>

interface ScoredOption {
  points: number
}

// Per-question option -> points. Unscored questions (q14, q15) are simply
// absent here. maxPoints per question is derived as the max of its own
// option values, so SCORE_RUBRIC is the single source of truth — no
// separate "max" table to keep in sync.
const SCORE_RUBRIC: Partial<Record<QuizQuestionId, Record<string, ScoredOption>>> = {
  q1: { a: { points: 3 }, b: { points: 4 }, c: { points: 2 }, d: { points: 0 } },
  q2: { a: { points: 4 }, b: { points: 3 }, c: { points: 1 }, d: { points: 0 } },
  q3: { a: { points: 6 }, b: { points: 4.5 }, c: { points: 1.5 }, d: { points: 0 } },
  q4: { a: { points: 4 }, b: { points: 2 }, c: { points: 0 } },
  q5: { a: { points: 6 }, b: { points: 3 }, c: { points: 0 } },
  q6: { a: { points: 4 }, b: { points: 2 }, c: { points: 0 } },
  q7: { a: { points: 6 }, b: { points: 4.5 }, c: { points: 1.5 }, d: { points: 0 } },
  q8: { a: { points: 6 }, b: { points: 4.5 }, c: { points: 1.5 }, d: { points: 0 } },
  q9: { a: { points: 8 }, b: { points: 5 }, c: { points: 2 }, d: { points: 0 } },
  q10: { a: { points: 6 }, b: { points: 3 }, c: { points: 0 } },
  q11: { a: { points: 6 }, b: { points: 3 }, c: { points: 0 } },
  q12: { a: { points: 1.5 }, b: { points: 1.5 }, c: { points: 0 }, d: { points: 6 } },
  q13: { a: { points: 8 }, b: { points: 3 }, c: { points: 0 } },
}

const MAX_POSSIBLE_POINTS = Object.values(SCORE_RUBRIC).reduce((sum, options) => {
  const max = Math.max(...Object.values(options).map((o) => o.points))
  return sum + max
}, 0)

export function computeQuizScore(answers: QuizAnswers): number {
  let total = 0
  for (const [questionId, options] of Object.entries(SCORE_RUBRIC) as [QuizQuestionId, Record<string, ScoredOption>][]) {
    const answer = answers[questionId]
    total += (answer && options[answer]?.points) || 0
  }
  return Math.round((total / MAX_POSSIBLE_POINTS) * 100)
}

// Signals used for archetype classification, independent of the numeric
// score — two people can land on the same score for very different
// reasons (a stressed-but-disciplined saver vs. a calm impulsive
// spender), and the archetype is meant to capture WHY, not just how much.
function getSignals(answers: QuizAnswers) {
  return {
    highStress: answers.q9 === 'c' || answers.q9 === 'd',
    comparesOften: answers.q10 === 'c',
    avoidsBills: answers.q11 === 'c',
    panicsOnEmergency: answers.q7 === 'd',
    impulsiveSpender: answers.q3 === 'c' || answers.q3 === 'd',
    noTracking: answers.q13 === 'c',
  }
}

export function computeArchetype(score: number, answers: QuizAnswers): Archetype {
  const s = getSignals(answers)

  // Stress signals take priority over a middling score — someone actively
  // anxious about money needs a different first message than someone who's
  // just disorganized, even if their raw numbers land in the same range.
  if (score < 55 && (s.highStress || s.avoidsBills || s.panicsOnEmergency)) {
    return 'stressed'
  }
  if (s.impulsiveSpender && s.noTracking) {
    return 'impulsive'
  }
  if (score >= 75) {
    return 'master'
  }
  return 'cautious'
}

export interface QuizResult {
  score: number
  archetype: Archetype
}

export function computeQuizResult(answers: QuizAnswers): QuizResult {
  const score = computeQuizScore(answers)
  const archetype = computeArchetype(score, answers)
  return { score, archetype }
}

// Q15 ("what's your main goal right now") doubles as the same signal the
// old onboarding's dedicated question captured — mapped onto the existing
// MainGoal type so lib/tips.ts keeps tailoring Dashboard tips without any
// change on its end.
const Q15_TO_MAIN_GOAL: Record<string, MainGoal> = {
  a: 'dettes',
  b: 'epargner',
  c: 'epargner',
  d: 'comprendre',
}

export function mainGoalFromQuiz(answers: QuizAnswers): MainGoal | null {
  const answer = answers.q15
  return answer ? (Q15_TO_MAIN_GOAL[answer] ?? null) : null
}
