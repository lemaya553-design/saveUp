import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useIncome } from '../hooks/useIncome'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { usePreferences } from '../hooks/usePreferences'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSubscription } from '../hooks/useSubscription'
import { useToast } from '../components/ToastProvider'
import { CountrySelect } from '../components/CountrySelect'
import { OnboardingScoreRing } from '../components/OnboardingScoreRing'
import { DEFAULT_DIAL_COUNTRY, toE164 } from '../lib/phone'
import { ONBOARDING_QUIZ, type OnboardingQuizContent } from '../lib/i18n/onboardingQuiz'
import { TARIFS } from '../lib/i18n/tarifs'
import { computeAmountPerPay } from '../lib/onboardingGoalPace'
import { computeOnboardingScore, type OnboardingScoreResult } from '../lib/onboardingScore'
import {
  INCOME_RANGE_MIDPOINT,
  PAY_FREQUENCIES,
  type FinancialMood,
  type FixedExpensesRange,
  type IncomeRange,
  type MoneyLeak,
  type PayFrequency,
  type SavingsGoalType,
  type WorkStatus,
} from '../lib/onboardingQuiz'
import { PLAN_LIMITS, TRIAL_DAYS, type Plan } from '../lib/plans'
import { formatBillingAmount } from '../lib/format'
import type { CountryCode } from 'libphonenumber-js'

// 10-question onboarding (replaces the old 15-question archetype quiz +
// "Configure ton compte" setup phase — see lib/onboardingQuiz.ts's header
// comment for where that went), followed by a score reveal screen. Styled
// black/blue throughout, independent of the app's own theme tokens — same
// literal-color approach as Connexion.tsx, so this reads as a continuation
// of the landing page / connexion visual identity rather than switching to
// the app's internal chrome right after signup.
//
// Answers are collected across all 10 screens in local state and only
// written to Supabase once, at the very end (finishOnboarding, triggered by
// Q10) — see usePreferences.tsx's completeOnboarding for why that specific
// moment was chosen (onboardingCompletedAt is Dashboard.tsx's only gate, so
// it must only be set once the flow has genuinely finished).
//
// The score result screen sits between the questions and the kept
// plan-selection step (Free/Standard/Premium cards) — "Voir mon tableau de
// bord" on the result screen advances to 'plans', whose own "Continuer
// avec le plan gratuit" link is what actually reaches /dashboard (same
// resume semantics as before: onboardingCompletedAt/the score are both
// already saved by the time 'result' renders, so abandoning the plans step
// never replays the questions).
type Phase = 'questions' | 'result' | 'plans'
const TOTAL_QUESTIONS = 10

const bigButtonClass = (active: boolean) =>
  `rounded-2xl border px-4 py-4 text-left font-medium transition-all sm:px-6 sm:py-5 sm:text-lg ${
    active
      ? 'border-primary bg-primary/15 text-white'
      : 'border-white/15 bg-white/5 text-white hover:border-primary/50 hover:bg-white/10'
  }`

const fieldClass =
  'rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white placeholder-white/35 focus:border-primary focus:outline-none sm:px-4 sm:py-3.5 sm:text-lg'

const primaryButtonClass =
  'w-full rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-lg'

// Three simple, deterministic rule sets (no AI) turning the computed score
// breakdown (lib/onboardingScore.ts) into 1-3 short, specific lines each —
// every possible line is pre-written copy (see ONBOARDING_QUIZ[lang].result
// for the French/English text), picked by which tier/condition matched,
// never generated. "Good" always has a fallback: an account that happens
// to land in the "tight" tier on every single factor should still see a
// genuine, true (not spun) encouraging line, not an empty section.
function buildGoodPoints(t: OnboardingQuizContent['result'], r: OnboardingScoreResult): string[] {
  const points: string[] = []
  if (r.fixedExpensesTier === 'great' || r.fixedExpensesTier === 'good') points.push(t.good.fixedExpenses)
  if (r.goalPaceTier === 'great' || r.goalPaceTier === 'good') points.push(t.good.goalPace)
  if (!r.leaksUnknown && r.leaksCount <= 2) points.push(t.good.leaksAware)
  if (r.moodTier === 'great') points.push(t.good.moodGood)
  if (points.length === 0) points.push(t.good.fallback)
  return points.slice(0, 3)
}

function buildWatchPoints(t: OnboardingQuizContent['result'], r: OnboardingScoreResult): string[] {
  const points: string[] = []
  if (r.fixedExpensesTier === 'tight' || r.fixedExpensesTier === 'strained') points.push(t.watch.fixedExpenses)
  if (r.goalPaceTier === 'tight' || r.goalPaceTier === 'strained') points.push(t.watch.goalPace)
  if (r.leaksUnknown) points.push(t.watch.leaksUnknown)
  else if (r.topLeak) points.push(t.watch.leaksTop(t.leakLabels[r.topLeak]))
  if (r.moodTier === 'strained') points.push(t.watch.moodStressed)
  return points.slice(0, 3)
}

// Always grounded in real, shipped features (never invented) — goal
// creation always applies (it just happened), budget-by-category always
// applies (every account has it); the third line depends on whether
// there's anything to import/detect yet.
function buildHelpPoints(t: OnboardingQuizContent['result'], goalName: string, r: OnboardingScoreResult): string[] {
  const points = [t.help.goalCreated(goalName), t.help.budgetCategories]
  points.push(r.leaksUnknown || r.leaksCount >= 1 ? t.help.importStatement : t.help.statsAndRewards)
  return points.slice(0, 3)
}

export function Onboarding() {
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const t = ONBOARDING_QUIZ[lang]
  const tarifs = TARIFS[lang]
  const preferences = usePreferences()
  const subscription = useSubscription()
  const income = useIncome()
  const goals = useSavingsGoals()
  const formatMoney = useMoneyFormat()
  const { showToast } = useToast()
  const fmt = (amount: number) => formatBillingAmount(amount, lang)

  const [phase, setPhase] = useState<Phase>('questions')
  const [qIndex, setQIndex] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [scoreResult, setScoreResult] = useState<OnboardingScoreResult | null>(null)
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null)

  const [firstName, setFirstName] = useState('')
  const [firstNameError, setFirstNameError] = useState<string | null>(null)
  const [workStatus, setWorkStatus] = useState<WorkStatus | null>(null)
  const [incomeRange, setIncomeRange] = useState<IncomeRange | null>(null)
  const [payFrequency, setPayFrequency] = useState<PayFrequency | null>(null)
  const [fixedExpensesRange, setFixedExpensesRange] = useState<FixedExpensesRange | null>(null)
  const [moneyLeaks, setMoneyLeaks] = useState<MoneyLeak[]>([])
  const [savingsGoalType, setSavingsGoalType] = useState<SavingsGoalType | null>(null)
  const [customGoalName, setCustomGoalName] = useState('')
  const [customGoalNameError, setCustomGoalNameError] = useState<string | null>(null)
  const [goalAmount, setGoalAmount] = useState('')
  const [goalAmountError, setGoalAmountError] = useState<string | null>(null)
  const [goalDate, setGoalDate] = useState('')
  const [financialMood, setFinancialMood] = useState<FinancialMood | null>(null)

  const [country, setCountry] = useState<CountryCode>(DEFAULT_DIAL_COUNTRY)
  const [phoneDraft, setPhoneDraft] = useState('')
  const [consent, setConsent] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [finishing, setFinishing] = useState(false)

  // Checked once, when preferences first resolves — an account that
  // already has onboardingCompletedAt set skips straight to /dashboard, the
  // same way the old quiz/setup flow did once quiz+income were both on
  // file. No mid-flow resume: the 10 questions are quick enough that
  // restarting from Q1 if abandoned early isn't worth the extra state.
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  const alreadyDoneRef = useRef(false)

  useEffect(() => {
    if (preferences.loading || initialCheckDone) return
    if (preferences.onboardingCompletedAt) alreadyDoneRef.current = true
    setInitialCheckDone(true)
  }, [preferences.loading, preferences.onboardingCompletedAt, initialCheckDone])

  if (!initialCheckDone) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#4A6CF7]" />
      </div>
    )
  }

  if (alreadyDoneRef.current) {
    return <Navigate to="/dashboard" replace />
  }

  // Same pulse-then-slide transition as the old quiz (.question-exit/
  // .question-enter in index.css), skipped under prefers-reduced-motion.
  // `mutate` (if given) runs before the exit delay so a single-choice
  // button's selected state visibly updates before the question slides
  // away; omitted for explicit "Continuer" buttons, which already applied
  // their state change before calling this.
  async function advance(mutate?: () => void) {
    if (transitioning) return
    setTransitioning(true)
    mutate?.()
    setExiting(true)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise((resolve) => setTimeout(resolve, 340))
    }
    setQIndex((i) => Math.min(TOTAL_QUESTIONS - 1, i + 1))
    setExiting(false)
    setTransitioning(false)
  }

  function goBack() {
    setQIndex((i) => Math.max(0, i - 1))
  }

  function toggleMoneyLeak(leak: MoneyLeak) {
    setMoneyLeaks((prev) => (prev.includes(leak) ? prev.filter((l) => l !== leak) : [...prev, leak]))
  }

  function submitQ1(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim()) {
      setFirstNameError(t.q1.emptyError)
      return
    }
    setFirstNameError(null)
    advance()
  }

  function submitQ7Custom(e: React.FormEvent) {
    e.preventDefault()
    if (!customGoalName.trim()) {
      setCustomGoalNameError(t.q7.customNameEmptyError)
      return
    }
    setCustomGoalNameError(null)
    advance()
  }

  function submitQ8(e: React.FormEvent) {
    e.preventDefault()
    if (!(Number(goalAmount) > 0)) {
      setGoalAmountError(t.q8.amountEmptyError)
      return
    }
    setGoalAmountError(null)
    advance()
  }

  async function handleChoosePlan(planId: Exclude<Plan, 'free'>) {
    setPendingPlan(planId)
    try {
      const url = await subscription.startCheckout(planId, { promo: planId === 'premium', cancelPath: '/onboarding' })
      if (url) {
        window.location.href = url
      } else {
        console.error('startCheckout returned no url', { planId, error: subscription.error })
        showToast(subscription.error ?? t.plans.checkoutFailed)
      }
    } finally {
      setPendingPlan(null)
    }
  }

  // The single write-everything-to-Supabase moment for Q1-Q9 (via
  // completeOnboarding), Q10's own WhatsApp opt-in/decline, the real
  // numeric income (derived from the Q3 bracket — see
  // INCOME_RANGE_MIDPOINT's header comment), and the first savings goal —
  // then computes the score from the same answers and hands off to the
  // result screen.
  async function finishOnboarding(whatsappE164: string | null) {
    if (finishing) return
    setFinishing(true)
    try {
      const targetAmount = Math.max(0, Number(goalAmount) || 0)
      const score = computeOnboardingScore({
        incomeRange: incomeRange as IncomeRange,
        fixedExpensesRange: fixedExpensesRange as FixedExpensesRange,
        moneyLeaks,
        financialMood: financialMood as FinancialMood,
        goalAmount: targetAmount,
        goalDate: goalDate || null,
        payFrequency,
      })

      preferences.completeOnboarding({
        firstName: firstName.trim(),
        workStatus: workStatus as WorkStatus,
        incomeRange: incomeRange as IncomeRange,
        payFrequency: payFrequency as PayFrequency,
        fixedExpensesRange: fixedExpensesRange as FixedExpensesRange,
        moneyLeaks,
        savingsGoalType: savingsGoalType as SavingsGoalType,
        savingsGoalName: savingsGoalType === 'autre' ? customGoalName.trim() : null,
        financialMood: financialMood as FinancialMood,
        onboardingScore: score.score,
      })
      if (whatsappE164) {
        preferences.setWhatsappOptIn(whatsappE164)
      } else {
        preferences.setWhatsappDeclined()
      }
      await income.setMonthlyIncome(INCOME_RANGE_MIDPOINT[incomeRange as IncomeRange])

      const goalOption = t.q7.options.find((o) => o.id === savingsGoalType)
      const finalGoalName = savingsGoalType === 'autre' ? customGoalName.trim() : (goalOption?.name ?? '')
      if (finalGoalName && targetAmount > 0) {
        await goals.addGoal(finalGoalName, targetAmount, goalDate || null)
      }

      setScoreResult(score)
      setPhase('result')
    } finally {
      setFinishing(false)
    }
  }

  function handleQ10Submit(e: React.FormEvent) {
    e.preventDefault()
    if (finishing) return
    const trimmed = phoneDraft.trim()
    if (!trimmed) {
      finishOnboarding(null)
      return
    }
    if (!consent) return
    const e164 = toE164(trimmed, country)
    if (!e164) {
      setPhoneError(t.q10.invalidNumberError)
      return
    }
    setPhoneError(null)
    finishOnboarding(e164)
  }

  function handleQ10Decline() {
    if (finishing) return
    finishOnboarding(null)
  }

  const perPayAmount = computeAmountPerPay(Number(goalAmount) || 0, goalDate || null, payFrequency)
  const hasPhoneDraft = phoneDraft.trim().length > 0
  const canSubmitQ10 = !hasPhoneDraft || consent

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0c]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="mesh-blob-c pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-primary/15 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="mesh-blob-b pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]"
      />

      {phase === 'questions' && (
        <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10 sm:max-w-2xl sm:px-10 lg:max-w-3xl">
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs text-white/50">
              <span>{t.progressLabel(qIndex + 1, TOTAL_QUESTIONS)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${((qIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
          </div>

          <div key={qIndex} className={exiting ? 'question-exit' : 'question-enter'}>
            {qIndex === 0 && (
              <form onSubmit={submitQ1}>
                <h1 className="text-balance text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{t.q1.title}</h1>
                <input
                  type="text"
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t.q1.placeholder}
                  className={`${fieldClass} mt-6 w-full`}
                />
                {firstNameError && <p className="mt-2 text-sm text-red-400">{firstNameError}</p>}
                <button type="submit" className={`${primaryButtonClass} mt-6`}>
                  {t.q1.continueButton}
                </button>
              </form>
            )}

            {qIndex === 1 && (
              <div>
                <h1 className="text-balance text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{t.q2.title}</h1>
                <div className="mt-8 grid gap-3">
                  {t.q2.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={transitioning}
                      onClick={() => advance(() => setWorkStatus(option.id))}
                      className={bigButtonClass(workStatus === option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {qIndex === 2 && (
              <div>
                <h1 className="text-balance text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{t.q3.title}</h1>
                <div className="mt-8 grid gap-3">
                  {t.q3.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={transitioning}
                      onClick={() => advance(() => setIncomeRange(option.id))}
                      className={bigButtonClass(incomeRange === option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {qIndex === 3 && (
              <div>
                <h1 className="text-balance text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{t.q4.title}</h1>
                <div className="mt-8 grid gap-3">
                  {PAY_FREQUENCIES.map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      disabled={transitioning}
                      onClick={() => advance(() => setPayFrequency(freq))}
                      className={bigButtonClass(payFrequency === freq)}
                    >
                      {t.payFrequencies[freq]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {qIndex === 4 && (
              <div>
                <h1 className="text-balance text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{t.q5.title}</h1>
                <div className="mt-8 grid gap-3">
                  {t.q5.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={transitioning}
                      onClick={() => advance(() => setFixedExpensesRange(option.id))}
                      className={bigButtonClass(fixedExpensesRange === option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {qIndex === 5 && (
              <div>
                <h1 className="text-balance text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{t.q6.title}</h1>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {t.q6.options.map((option) => {
                    const checked = moneyLeaks.includes(option.id)
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={checked}
                        onClick={() => toggleMoneyLeak(option.id)}
                        className={bigButtonClass(checked)}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
                <button type="button" onClick={() => advance()} className={`${primaryButtonClass} mt-6`}>
                  {t.q6.continueButton}
                </button>
              </div>
            )}

            {qIndex === 6 && (
              <div>
                <h1 className="text-balance text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{t.q7.title}</h1>
                <div className="mt-8 grid gap-3">
                  {t.q7.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={transitioning}
                      onClick={() => {
                        if (option.id === 'autre') {
                          setSavingsGoalType('autre')
                          return
                        }
                        advance(() => setSavingsGoalType(option.id))
                      }}
                      className={bigButtonClass(savingsGoalType === option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {savingsGoalType === 'autre' && (
                  <form onSubmit={submitQ7Custom} className="mt-4">
                    <input
                      type="text"
                      autoFocus
                      value={customGoalName}
                      onChange={(e) => setCustomGoalName(e.target.value)}
                      placeholder={t.q7.customNamePlaceholder}
                      className={`${fieldClass} w-full`}
                    />
                    {customGoalNameError && <p className="mt-2 text-sm text-red-400">{customGoalNameError}</p>}
                    <button type="submit" className={`${primaryButtonClass} mt-4`}>
                      {t.q7.continueButton}
                    </button>
                  </form>
                )}
              </div>
            )}

            {qIndex === 7 && (
              <form onSubmit={submitQ8}>
                <h1 className="text-balance text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{t.q8.title}</h1>
                <div className="mt-6 flex flex-col gap-4">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    autoFocus
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder={t.q8.amountPlaceholder}
                    className={fieldClass}
                  />
                  <label className="flex flex-col gap-1.5 text-sm text-white/60">
                    {t.q8.dateLabel}
                    <input
                      type="date"
                      value={goalDate}
                      onChange={(e) => setGoalDate(e.target.value)}
                      style={{ colorScheme: 'dark' }}
                      className={fieldClass}
                    />
                  </label>
                </div>
                {goalAmountError && <p className="mt-2 text-sm text-red-400">{goalAmountError}</p>}
                {perPayAmount !== null && (
                  <p className="mt-3 text-sm font-semibold text-primary">{t.q8.perPayLine(formatMoney(perPayAmount))}</p>
                )}
                <button type="submit" className={`${primaryButtonClass} mt-6`}>
                  {t.q8.continueButton}
                </button>
              </form>
            )}

            {qIndex === 8 && (
              <div>
                <h1 className="text-balance text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{t.q9.title}</h1>
                <div className="mt-8 grid gap-3">
                  {t.q9.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={transitioning}
                      onClick={() => advance(() => setFinancialMood(option.id))}
                      className={bigButtonClass(financialMood === option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {qIndex === 9 && (
              <form onSubmit={handleQ10Submit}>
                <h1 className="text-balance text-2xl font-bold text-white sm:text-4xl lg:text-5xl">{t.q10.title}</h1>
                <div className="mt-6 flex gap-2">
                  <CountrySelect
                    value={country}
                    onChange={setCountry}
                    label={t.q10.countryLabel}
                    searchPlaceholder={t.q10.countrySearchPlaceholder}
                    lang={lang}
                  />
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phoneDraft}
                    onChange={(e) => setPhoneDraft(e.target.value)}
                    placeholder={t.q10.phonePlaceholder}
                    data-clarity-mask="true"
                    className={`${fieldClass} min-w-0 flex-1`}
                  />
                </div>
                <p className="mt-1.5 text-xs text-white/50">{t.q10.privacyNote}</p>

                {hasPhoneDraft && (
                  <label className="mt-3 flex items-start gap-2.5 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ accentColor: '#4A6CF7' }}
                    />
                    {t.q10.consentLabel}
                  </label>
                )}

                {phoneError && <p className="mt-2 text-sm text-red-400">{phoneError}</p>}
                {preferences.error && <p className="mt-2 text-sm text-red-400">{t.q10.saveFailedError}</p>}

                <button type="submit" disabled={!canSubmitQ10 || finishing} className={`${primaryButtonClass} mt-6`}>
                  {t.q10.continueButton}
                </button>
                <button
                  type="button"
                  onClick={handleQ10Decline}
                  disabled={finishing}
                  className="mt-3 w-full text-center text-sm text-white/50 transition-colors hover:text-white disabled:opacity-50"
                >
                  {t.q10.declineButton}
                </button>
              </form>
            )}
          </div>

          {qIndex > 0 && qIndex < TOTAL_QUESTIONS - 1 && (
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

      {phase === 'result' && scoreResult && (
        <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-14 sm:max-w-2xl sm:px-10 lg:max-w-3xl">
          {(() => {
            const goalOption = t.q7.options.find((o) => o.id === savingsGoalType)
            const goalName = savingsGoalType === 'autre' ? customGoalName.trim() : (goalOption?.name ?? '')
            const targetAmount = Math.max(0, Number(goalAmount) || 0)
            const perPay = computeAmountPerPay(targetAmount, goalDate || null, payFrequency)
            const locale = lang === 'fr' ? 'fr-CA' : 'en-CA'
            const dateLabel = goalDate
              ? new Date(`${goalDate}T00:00:00`).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })
              : null
            const goodPoints = buildGoodPoints(t.result, scoreResult)
            const watchPoints = buildWatchPoints(t.result, scoreResult)
            const helpPoints = buildHelpPoints(t.result, goalName, scoreResult)

            return (
              <>
                <h1 className="text-balance text-center text-2xl font-bold text-white sm:text-4xl">
                  {t.result.scoreHeading(firstName.trim())}
                </h1>
                <div className="mt-6">
                  <OnboardingScoreRing score={scoreResult.score} caption={t.result.scoreCaption} />
                </div>

                {goalName && targetAmount > 0 && (
                  <p className="mx-auto mt-6 max-w-md text-balance text-center text-sm font-medium text-white/80 sm:text-base">
                    {dateLabel && perPay !== null
                      ? t.result.goalSummary(goalName, formatMoney(targetAmount), dateLabel, formatMoney(perPay))
                      : t.result.goalSummaryNoDate(goalName, formatMoney(targetAmount))}
                  </p>
                )}

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h2 className="text-sm font-semibold text-white">{t.result.goodHeading}</h2>
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {goodPoints.map((point) => (
                        <li key={point} className="text-sm text-white/70">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {watchPoints.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <h2 className="text-sm font-semibold text-white">{t.result.watchHeading}</h2>
                      <ul className="mt-3 flex flex-col gap-2.5">
                        {watchPoints.map((point) => (
                          <li key={point} className="text-sm text-white/70">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
                    <h2 className="text-sm font-semibold text-white">{t.result.helpHeading}</h2>
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {helpPoints.map((point) => (
                        <li key={point} className="text-sm text-white/80">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPhase('plans')}
                  className={`${primaryButtonClass} mt-10`}
                >
                  {t.result.continueButton}
                </button>
              </>
            )
          })()}
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
              <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                {tarifs.trialBadge(TRIAL_DAYS)}
              </span>
              <p className="mt-3 text-3xl font-bold text-white">
                {fmt(PLAN_LIMITS.standard.monthlyPrice)}
                <span className="text-base font-normal text-white/50">{tarifs.perMonth}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2">
                {tarifs.plans.standard.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="mt-0.5 text-primary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleChoosePlan('standard')}
                disabled={pendingPlan === 'standard'}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
              >
                {pendingPlan === 'standard' && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {pendingPlan === 'standard' ? t.plans.redirecting : t.plans.standardCta}
              </button>
            </div>

            {/* Premium — visually emphasized with the launch-offer promo. */}
            <div className="relative flex flex-col rounded-3xl border-2 border-primary bg-white/5 p-6 shadow-[0_0_40px_-10px_rgba(74,108,247,0.5)] sm:-translate-y-2">
              <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
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
                    <span className="mt-0.5 text-primary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-white/40">{t.plans.promoDisclaimer}</p>
              <button
                type="button"
                onClick={() => handleChoosePlan('premium')}
                disabled={pendingPlan === 'premium'}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:brightness-110 disabled:opacity-60"
              >
                {pendingPlan === 'premium' && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
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
