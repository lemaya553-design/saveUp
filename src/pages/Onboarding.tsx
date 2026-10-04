import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useOnboardingQuiz } from '../hooks/useOnboardingQuiz'
import { usePreferences } from '../hooks/usePreferences'
import { useSubscription } from '../hooks/useSubscription'
import { ONBOARDING_QUIZ } from '../lib/i18n/onboardingQuiz'
import { TARIFS } from '../lib/i18n/tarifs'
import {
  QUIZ_QUESTION_IDS,
  INSIGHT_POLARITY,
  computeQuizInsights,
  computeQuizResult,
  mainGoalFromQuiz,
  type QuizAnswers,
  type QuizResult,
} from '../lib/onboardingQuiz'
import { PLAN_LIMITS, TRIAL_DAYS, type Plan } from '../lib/plans'
import { formatBillingAmount } from '../lib/format'

// Three-phase flow replacing the old income/expenses/goal wizard: a
// 15-question quiz, a scored archetype result (shareable as an image), then
// plan selection with Premium's "first month at $7.99" launch offer. Styled
// black/orange throughout, independent of the app's own theme tokens — the
// same literal-color approach Connexion.tsx uses, so this reads as a
// continuation of the landing page / connexion visual identity rather than
// switching to the app's internal (currently dark-blue) chrome right after
// signup.
//
// Unlike the old flow, this one never collects income/expenses/goals — the
// app's "fresh user" gate (Dashboard.tsx) now reads useOnboardingQuiz's
// `completed` instead, so an account can reach a real, if mostly empty,
// Dashboard straight after choosing a plan. Budget/Épargne's own empty
// states pick up from there organically.

type Phase = 'quiz' | 'result' | 'plans'

const inputCardClass =
  'rounded-2xl border border-white/15 bg-white/5 p-4 text-left font-medium text-white transition-all hover:border-[#ff6b00]/50 hover:bg-white/10'

export function Onboarding() {
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const t = ONBOARDING_QUIZ[lang]
  const tarifs = TARIFS[lang]
  const quiz = useOnboardingQuiz()
  const preferences = usePreferences()
  const subscription = useSubscription()
  const fmt = (amount: number) => formatBillingAmount(amount, lang)

  const [phase, setPhase] = useState<Phase>('quiz')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [exiting, setExiting] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  // "Already completed" is checked ONCE, when loading first resolves, and
  // locked into a ref rather than read reactively from quiz.completed —
  // completing the quiz THIS session also flips quiz.completed to true
  // (saveResult sets it optimistically before its own network write
  // finishes), and reading it reactively here used to fire this exact
  // redirect right after the last question, before setPhase('result') ever
  // ran. That sent the page to /dashboard while the result row was still
  // being written; Dashboard's own fresh completion check would sometimes
  // race ahead of that write, see nothing yet, and bounce back to
  // /onboarding — which remounted with all state reset, i.e. "the quiz
  // restarts from question 1". Locking the check to initial load only
  // means finishing the quiz never re-triggers it.
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const alreadyCompletedRef = useRef(false)

  useEffect(() => {
    if (!quiz.loading && !initialCheckDone) {
      alreadyCompletedRef.current = quiz.completed
      setInitialCheckDone(true)
    }
  }, [quiz.loading, quiz.completed, initialCheckDone])

  if (!initialCheckDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#ff6b00]" />
      </div>
    )
  }

  // Already done this before (revisited the URL, or came back after
  // abandoning before picking a plan) — the quiz/result moment doesn't
  // replay, straight to the app. They can always upgrade later from
  // /tarifs.
  if (alreadyCompletedRef.current) {
    return <Navigate to="/dashboard" replace />
  }

  async function finishQuiz(finalAnswers: QuizAnswers) {
    const computed = computeQuizResult(finalAnswers)
    setResult(computed)
    // Still shows the result/plans screens even if this fails (the score
    // and archetype are computed client-side, not dependent on the write)
    // — if it really did fail, quiz.error now surfaces on Dashboard instead
    // of silently bouncing back here, see useOnboardingQuiz.ts.
    await quiz.saveResult({ ...computed, answers: finalAnswers })
    const mainGoal = mainGoalFromQuiz(finalAnswers)
    if (mainGoal) preferences.setOnboardingProfile(mainGoal, false, 'hebdomadaire')
    setPhase('result')
  }

  // Selecting an answer pulses the clicked button orange and slides/fades
  // the question out before the next one slides/fades in (CSS classes
  // .answer-pulse / .question-exit / .question-enter in index.css) — the
  // actual data update and advance are deliberately delayed until that
  // plays out, skipped entirely under prefers-reduced-motion.
  async function selectAnswer(optionId: string) {
    if (transitioning) return
    setTransitioning(true)
    setSelectedOptionId(optionId)
    setExiting(true)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise((resolve) => setTimeout(resolve, 340))
    }
    const questionId = QUIZ_QUESTION_IDS[questionIndex]
    const nextAnswers = { ...answers, [questionId]: optionId }
    setAnswers(nextAnswers)
    if (questionIndex < QUIZ_QUESTION_IDS.length - 1) {
      setQuestionIndex((i) => i + 1)
    } else {
      await finishQuiz(nextAnswers)
    }
    setSelectedOptionId(null)
    setExiting(false)
    setTransitioning(false)
  }

  function goBack() {
    setQuestionIndex((i) => Math.max(0, i - 1))
  }

  // Escape hatch for anyone who doesn't want to answer 15 questions —
  // unanswered questions default to their 2nd option (a middling, neither
  // best-nor-worst answer) so the score isn't artificially tanked by
  // treating "skipped" as "worst possible", then the normal result/plans
  // phases still play out instead of dumping them straight on the
  // (currently empty) Dashboard.
  async function skipQuiz() {
    const filled: QuizAnswers = { ...answers }
    for (const id of QUIZ_QUESTION_IDS) {
      if (!filled[id]) filled[id] = 'b'
    }
    setAnswers(filled)
    await finishQuiz(filled)
  }

  async function handleChoosePlan(planId: Exclude<Plan, 'free'>) {
    setPendingPlan(planId)
    try {
      const url = await subscription.startCheckout(planId, planId === 'premium' ? { promo: true } : undefined)
      if (url) window.location.href = url
    } finally {
      setPendingPlan(null)
    }
  }

  const question = t.questions[questionIndex]
  const archetypeContent = result ? t.result.archetypes[result.archetype] : null
  const insights = result ? computeQuizInsights(answers) : []

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0c]">
      {/* Same black-gradient/blur texture as the landing page's "Pourquoi
          SaveUp" / "Comment ça marche" sections — one diagonal sheen plus
          two blurred glow blobs on this single outer wrapper so there's no
          seam between phases (see Home.tsx's own fix for exactly that bug:
          two separately-painted black sections each clipping their own glow
          at their own edge produces a visible line even with identical base
          colors — one shared wrapper owning the texture avoids it). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="mesh-blob-c pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-[#ff6b00]/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="mesh-blob-b pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#ff6b00]/10 blur-[120px]"
      />

      {phase === 'quiz' && (
        <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs text-white/50">
              <span>{t.progressLabel(questionIndex + 1, QUIZ_QUESTION_IDS.length)}</span>
              <button type="button" onClick={skipQuiz} className="text-white/50 transition-colors hover:text-white">
                {t.skipLater}
              </button>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#ff6b00] transition-[width] duration-500 ease-out"
                style={{ width: `${((questionIndex + 1) / QUIZ_QUESTION_IDS.length) * 100}%` }}
              />
            </div>
          </div>

          <div key={questionIndex} className={exiting ? 'question-exit' : 'question-enter'}>
            <h1 className="text-balance text-2xl font-bold text-white sm:text-3xl">{question.text}</h1>

            <div className="mt-8 grid gap-3">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectAnswer(option.id)}
                  disabled={transitioning}
                  className={`${inputCardClass} disabled:cursor-default ${
                    selectedOptionId === option.id ? 'answer-pulse' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {questionIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="mt-6 self-start text-sm text-white/50 transition-colors hover:text-white"
            >
              ← {t.back}
            </button>
          )}
        </div>
      )}

      {phase === 'result' && result && archetypeContent && (
        <div className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#ff6b00]">{t.result.badge}</p>

          {/* The score is the focal point of the page — big enough that
              everything else (archetype name, insights, CTA) reads as
              supporting detail underneath it. */}
          <p className="mt-4 text-[clamp(5.5rem,22vw,9rem)] font-black leading-none text-[#ff6b00]">
            {result.score}
            <span className="text-3xl font-bold text-white/40">{t.result.scoreSuffix}</span>
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">{archetypeContent.name}</h1>
          <p className="mt-3 text-white/70">{archetypeContent.description}</p>

          <div className="mt-8 w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">{t.result.insightsHeading}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {insights.map((insightId) => (
                <li key={insightId} className="flex items-start gap-3 text-sm text-white/80">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 font-bold ${
                      INSIGHT_POLARITY[insightId] === 'positive' ? 'text-[#ff6b00]' : 'text-white/40'
                    }`}
                  >
                    {INSIGHT_POLARITY[insightId] === 'positive' ? '✓' : '→'}
                  </span>
                  {t.result.insights[insightId]}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setPhase('plans')}
            className="mt-8 w-full rounded-xl bg-[#ff6b00] px-5 py-3 font-semibold text-white transition-all hover:brightness-110"
          >
            {t.result.continueButton}
          </button>
        </div>
      )}

      {phase === 'plans' && (
        <div className="relative mx-auto min-h-screen max-w-5xl px-6 py-10 sm:py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{t.plans.heading}</h1>
            <p className="mt-2 text-white/60">{t.plans.subtitle}</p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
            {/* Free — shown for comparison, its only real CTA is the
                discreet link below, not a button on this card. */}
            <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white">{tarifs.plans.free.name}</h3>
              <p className="mt-1 text-sm text-white/60">{tarifs.plans.free.description}</p>
              <p className="mt-4 text-3xl font-bold text-white">{fmt(0)}</p>
              <ul className="mt-6 flex-1 space-y-2">
                {tarifs.plans.free.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="mt-0.5 text-white/40">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Standard */}
            <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white">{tarifs.plans.standard.name}</h3>
              <p className="mt-1 text-sm text-white/60">{tarifs.plans.standard.description}</p>
              <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#ff6b00]/15 px-3 py-1 text-xs font-semibold text-[#ff6b00]">
                {tarifs.trialBadge(TRIAL_DAYS)}
              </span>
              <p className="mt-3 text-3xl font-bold text-white">
                {fmt(PLAN_LIMITS.standard.monthlyPrice)}
                <span className="text-base font-normal text-white/50">{tarifs.perMonth}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2">
                {tarifs.plans.standard.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="mt-0.5 text-[#ff6b00]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleChoosePlan('standard')}
                disabled={pendingPlan === 'standard'}
                className="mt-6 w-full rounded-xl border border-white/20 px-4 py-2.5 font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
              >
                {pendingPlan === 'standard' ? t.plans.redirecting : t.plans.standardCta}
              </button>
            </div>

            {/* Premium — visually emphasized with the launch-offer promo. */}
            <div className="relative flex flex-col rounded-3xl border-2 border-[#ff6b00] bg-white/5 p-6 shadow-[0_0_40px_-10px_rgba(255,107,0,0.5)] sm:-translate-y-2">
              <span className="absolute -top-3 left-6 rounded-full bg-[#ff6b00] px-3 py-1 text-xs font-bold text-white">
                {t.plans.promoBadge}
              </span>
              <h3 className="font-semibold text-white">{tarifs.plans.premium.name}</h3>
              <p className="mt-1 text-sm text-white/60">{tarifs.plans.premium.description}</p>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">
                  {fmt(7.99)}
                  <span className="text-base font-normal text-white/50">{t.plans.promoPerMonth}</span>
                </p>
                <span className="text-sm text-white/40 line-through">{t.plans.promoWasPrice}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2">
                {tarifs.plans.premium.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="mt-0.5 text-[#ff6b00]">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-white/40">{t.plans.promoDisclaimer}</p>
              <button
                type="button"
                onClick={() => handleChoosePlan('premium')}
                disabled={pendingPlan === 'premium'}
                className="mt-4 w-full rounded-xl bg-[#ff6b00] px-4 py-3 font-semibold text-white shadow-lg shadow-[#ff6b00]/30 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {pendingPlan === 'premium' ? t.plans.redirecting : t.plans.premiumCta}
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-white/50">
            <button type="button" onClick={() => navigate('/dashboard')} className="underline hover:text-white">
              {t.plans.freeLink}
            </button>
          </p>
        </div>
      )}

    </div>
  )
}
