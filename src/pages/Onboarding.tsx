import { useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useOnboardingQuiz } from '../hooks/useOnboardingQuiz'
import { usePreferences } from '../hooks/usePreferences'
import { useSubscription } from '../hooks/useSubscription'
import { ONBOARDING_QUIZ } from '../lib/i18n/onboardingQuiz'
import { TARIFS } from '../lib/i18n/tarifs'
import {
  QUIZ_QUESTION_IDS,
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
  const [sharing, setSharing] = useState(false)
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'downloaded' | 'error'>('idle')
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Already done this before (revisited the URL, or came back after
  // abandoning before picking a plan) — the quiz/result moment doesn't
  // replay, straight to the app. They can always upgrade later from
  // /tarifs.
  if (!quiz.loading && quiz.completed) {
    return <Navigate to="/dashboard" replace />
  }

  if (quiz.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#ff6b00]" />
      </div>
    )
  }

  async function finishQuiz(finalAnswers: QuizAnswers) {
    const computed = computeQuizResult(finalAnswers)
    setResult(computed)
    await quiz.saveResult({ ...computed, answers: finalAnswers })
    const mainGoal = mainGoalFromQuiz(finalAnswers)
    if (mainGoal) preferences.setOnboardingProfile(mainGoal, false, 'hebdomadaire')
    setPhase('result')
  }

  async function selectAnswer(optionId: string) {
    const questionId = QUIZ_QUESTION_IDS[questionIndex]
    const nextAnswers = { ...answers, [questionId]: optionId }
    setAnswers(nextAnswers)
    if (questionIndex < QUIZ_QUESTION_IDS.length - 1) {
      setQuestionIndex(questionIndex + 1)
    } else {
      await finishQuiz(nextAnswers)
    }
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

  async function handleShare() {
    if (!result || !cardRef.current) return
    setSharing(true)
    setShareState('idle')
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 })
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('canvas produced no blob')
      const file = new File([blob], 'saveup-profil-financier.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'SaveUp' })
        setShareState('idle')
      } else if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setShareState('copied')
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'saveup-profil-financier.png'
        a.click()
        URL.revokeObjectURL(url)
        setShareState('downloaded')
      }
    } catch {
      // A cancelled native share sheet also lands here (AbortError) —
      // indistinguishable from a real failure without over-parsing every
      // browser's own error shape, so this stays a quiet no-op.
      setShareState('idle')
    } finally {
      setSharing(false)
    }
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

  return (
    <div className="min-h-screen bg-black">
      {phase === 'quiz' && (
        <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs text-white/50">
              <span>{t.progressLabel(questionIndex + 1, QUIZ_QUESTION_IDS.length)}</span>
              <button type="button" onClick={skipQuiz} className="text-white/50 transition-colors hover:text-white">
                {t.skipLater}
              </button>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#ff6b00] transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / QUIZ_QUESTION_IDS.length) * 100}%` }}
              />
            </div>
          </div>

          <h1 className="text-balance text-2xl font-bold text-white sm:text-3xl">{question.text}</h1>

          <div className="mt-8 grid gap-3">
            {question.options.map((option) => (
              <button key={option.id} type="button" onClick={() => selectAnswer(option.id)} className={inputCardClass}>
                {option.label}
              </button>
            ))}
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
        <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#ff6b00]">{t.result.badge}</p>

          <div className="mt-6 w-full rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-6xl font-black leading-none text-[#ff6b00]">
              {result.score}
              <span className="text-2xl font-bold text-white/40">{t.result.scoreSuffix}</span>
            </p>
            <h1 className="mt-4 text-3xl font-bold text-white">{archetypeContent.name}</h1>
            <p className="mt-3 text-white/70">{archetypeContent.description}</p>
          </div>

          <div className="mt-6 flex w-full flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="w-full rounded-xl bg-[#ff6b00] px-5 py-3 font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              {sharing ? t.result.shareGenerating : t.result.shareButton}
            </button>
            {shareState === 'copied' && <p className="text-xs text-[#ff6b00]">{t.result.sharedConfirmation}</p>}
            {shareState === 'downloaded' && <p className="text-xs text-[#ff6b00]">{t.result.downloadedConfirmation}</p>}
            {shareState === 'error' && <p className="text-xs text-red-400">{t.result.shareError}</p>}

            <button
              type="button"
              onClick={() => setPhase('plans')}
              className="w-full rounded-xl border border-white/15 px-5 py-3 font-medium text-white transition-colors hover:bg-white/5"
            >
              {t.result.continueButton}
            </button>
          </div>
        </div>
      )}

      {phase === 'plans' && (
        <div className="mx-auto min-h-screen max-w-5xl px-6 py-10 sm:py-16">
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

      {/* Off-screen share card — html2canvas renders this exact node into the
          shared/downloaded image; same 1080×1080 square pattern as
          Calculateur.tsx's share card, never shown to the visitor directly. */}
      {result && archetypeContent && (
        <div className="pointer-events-none fixed left-0 top-0 -z-50 opacity-0" aria-hidden="true">
          <div
            ref={cardRef}
            className="flex h-[1080px] w-[1080px] flex-col items-center justify-center gap-6 bg-black p-24 text-center"
          >
            <span className="text-5xl font-bold">
              <span className="text-white">save</span>
              <span className="text-[#ff6b00]">Up</span>
            </span>
            <p className="mt-6 text-4xl font-medium text-white/50">{t.result.badge}</p>
            <p className="text-[200px] font-black leading-none text-[#ff6b00]">{result.score}</p>
            <p className="text-5xl font-bold text-white">{archetypeContent.name}</p>
            <p className="max-w-4xl text-3xl text-white/70">{archetypeContent.shareTagline}</p>
            <p className="mt-10 text-3xl text-white/40">{t.result.shareCardFooter}</p>
          </div>
        </div>
      )}
    </div>
  )
}
