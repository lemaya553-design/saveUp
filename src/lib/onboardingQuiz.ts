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

// "Why this score" insights for the result page — 2-3 concrete, specific
// reasons pulled straight from the answers, not just a generic line about
// the archetype. Organized into categories (stress, tracking, savings,
// spending, goal, emergency) with a positive and a constructive phrasing
// per category; at most ONE insight per category, so the 3 shown cover 3
// different themes instead of circling the same one. Text lives in
// lib/i18n/onboardingQuiz.ts, keyed by these ids.
export type InsightId =
  | 'stress-high'
  | 'stress-low'
  | 'tracking-none'
  | 'tracking-good'
  | 'savings-strong'
  | 'savings-weak'
  | 'impulsive-high'
  | 'impulsive-low'
  | 'goal-none'
  | 'goal-clear'
  | 'emergency-ready'
  | 'emergency-not-ready'

export const INSIGHT_POLARITY: Record<InsightId, 'positive' | 'constructive'> = {
  'stress-high': 'constructive',
  'stress-low': 'positive',
  'tracking-none': 'constructive',
  'tracking-good': 'positive',
  'savings-strong': 'positive',
  'savings-weak': 'constructive',
  'impulsive-high': 'constructive',
  'impulsive-low': 'positive',
  'goal-none': 'constructive',
  'goal-clear': 'positive',
  'emergency-ready': 'positive',
  'emergency-not-ready': 'constructive',
}

interface InsightCheck {
  id: InsightId
  matches: (a: QuizAnswers) => boolean
}

const INSIGHT_CATEGORIES: InsightCheck[][] = [
  [
    { id: 'stress-high', matches: (a) => a.q9 === 'c' || a.q9 === 'd' || a.q11 === 'c' },
    { id: 'stress-low', matches: (a) => a.q9 === 'a' },
  ],
  [
    { id: 'tracking-none', matches: (a) => a.q13 === 'c' },
    { id: 'tracking-good', matches: (a) => a.q13 === 'a' },
  ],
  [
    { id: 'savings-strong', matches: (a) => a.q8 === 'a' || a.q5 === 'a' },
    { id: 'savings-weak', matches: (a) => a.q8 === 'd' || a.q5 === 'c' },
  ],
  [
    { id: 'impulsive-high', matches: (a) => a.q3 === 'c' || a.q3 === 'd' },
    { id: 'impulsive-low', matches: (a) => a.q3 === 'a' },
  ],
  [
    { id: 'goal-none', matches: (a) => a.q6 === 'c' },
    { id: 'goal-clear', matches: (a) => a.q6 === 'a' },
  ],
  [
    { id: 'emergency-not-ready', matches: (a) => a.q7 === 'c' || a.q7 === 'd' },
    { id: 'emergency-ready', matches: (a) => a.q7 === 'a' },
  ],
]

export function computeQuizInsights(answers: QuizAnswers): InsightId[] {
  const insights: InsightId[] = []
  for (const category of INSIGHT_CATEGORIES) {
    const match = category.find((check) => check.matches(answers))
    if (match) insights.push(match.id)
    if (insights.length >= 3) break
  }
  return insights
}

// Pre-fills the "how much do you want to save per month" field on the
// post-result setup step — Q8 already asked roughly what fraction of
// income they currently save, so reuse it as a starting suggestion rather
// than defaulting everyone to the same flat number. Someone who already
// saves nothing (d) or skipped the question still gets a modest, non-zero
// suggestion (10%) rather than $0, which would just read as "there's no
// point."
const Q8_TO_SUGGESTED_SAVINGS_PCT: Record<string, number> = {
  a: 0.2,
  b: 0.15,
  c: 0.1,
  d: 0.1,
}
const DEFAULT_SUGGESTED_SAVINGS_PCT = 0.1

export function suggestedSavingsPct(answers: QuizAnswers): number {
  const answer = answers.q8
  return (answer && Q8_TO_SUGGESTED_SAVINGS_PCT[answer]) || DEFAULT_SUGGESTED_SAVINGS_PCT
}

// Default monthly budget per category, as a fraction of monthly income —
// rough, common-sense splits (used to pre-fill the setup step's category
// allocations so a brand-new account's Budget page shows real numbers
// instead of $0 everywhere). Deliberately NOT exhaustive or
// authoritative — just a reasonable starting point the user can change
// immediately from Budget once they land there.
export const SETUP_CATEGORY_IDS = ['epicerie', 'transport', 'loisirs', 'logement', 'sante', 'abonnements'] as const
export type SetupCategoryId = (typeof SETUP_CATEGORY_IDS)[number]

export const SETUP_CATEGORY_INCOME_PCT: Record<SetupCategoryId, number> = {
  epicerie: 0.1,
  transport: 0.08,
  loisirs: 0.05,
  logement: 0.25,
  sante: 0.04,
  abonnements: 0.03,
}

export const PAY_FREQUENCIES = ['hebdomadaire', 'aux_deux_semaines', 'mensuelle'] as const
export type PayFrequency = (typeof PAY_FREQUENCIES)[number]

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
