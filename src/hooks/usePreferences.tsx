import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useGuestMode } from './useGuestMode'
import { applyTheme, type Theme } from '../lib/theme'
import type { Currency } from '../lib/format'
import type { MainGoal, TrackingFrequency } from '../lib/onboardingProfile'
import type {
  FinancialMood,
  FixedExpensesRange,
  IncomeRange,
  MoneyLeak,
  PayFrequency,
  SavingsGoalType,
  WhatsappStatus,
  WorkStatus,
} from '../lib/onboardingQuiz'

interface PreferencesContextValue {
  loading: boolean
  error: string | null
  theme: Theme
  avatarEmoji: string | null
  currency: Currency
  onboardingMainGoal: MainGoal | null
  onboardingTriedOtherApp: boolean | null
  onboardingFrequency: TrackingFrequency | null
  csvImportCount: number
  // "Price in hours worked" (Paramètres > Préférences). Only the final rate
  // is ever persisted — see WorkHoursSettings.tsx, which derives it from
  // either a direct hourly rate or an annual-salary + hours/week input, but
  // never stores the latter two. null/false = feature invisible everywhere
  // (useWorkHours returns null), matching today's behavior exactly.
  hourlyRate: number | null
  workHoursEnabled: boolean
  // Set together at the end of Onboarding's "Configure ton compte" step —
  // see setAccountSetupExtras. null = never set (pre-dates this step, or
  // skipped since none of these are required).
  payFrequency: PayFrequency | null
  nextPayday: string | null
  savingsWhy: string | null
  // Set together, once, by the WhatsApp opt-in step — Q10 of Onboarding.tsx.
  // whatsappStatus is the authoritative "did we ask" signal (null = never
  // asked, 'given'/'declined' = asked, answered either way) — unlike
  // whatsappNumber null, 'declined' means never ask again. whatsappNumber/
  // whatsappConsent/whatsappConsentAt stay null when declined.
  whatsappNumber: string | null
  whatsappConsent: boolean
  whatsappConsentAt: string | null
  whatsappStatus: WhatsappStatus | null
  // Everything below is set together, once, at the end of Onboarding.tsx's
  // 10-question flow (see completeOnboarding) — null = never completed
  // (brand-new account, or pre-dates this onboarding and was never
  // backfilled). Dashboard.tsx's needsOnboarding gate reads
  // onboardingCompletedAt only; the rest are informational/personalization
  // fields (e.g. financialMood tilts the Dashboard welcome message).
  firstName: string | null
  workStatus: WorkStatus | null
  incomeRange: IncomeRange | null
  fixedExpensesRange: FixedExpensesRange | null
  moneyLeaks: MoneyLeak[]
  savingsGoalType: SavingsGoalType | null
  savingsGoalName: string | null
  financialMood: FinancialMood | null
  onboardingCompletedAt: string | null
  // /100, computed once by lib/onboardingScore.ts at the end of the
  // 10-question flow and saved alongside everything else — null for
  // accounts onboarded before this existed (score screen is a one-time
  // reveal, not recomputed later, so there's nothing to backfill it with).
  onboardingScore: number | null
  setTheme: (value: Theme) => void
  setAvatarEmoji: (value: string | null) => void
  setCurrency: (value: Currency) => void
  setOnboardingProfile: (mainGoal: MainGoal, triedOtherApp: boolean, frequency: TrackingFrequency) => void
  setAccountSetupExtras: (payFrequency: PayFrequency | null, nextPayday: string | null, savingsWhy: string | null) => void
  setWhatsappOptIn: (e164Number: string) => void
  setWhatsappDeclined: () => void
  completeOnboarding: (fields: {
    firstName: string
    workStatus: WorkStatus
    incomeRange: IncomeRange
    payFrequency: PayFrequency
    fixedExpensesRange: FixedExpensesRange
    moneyLeaks: MoneyLeak[]
    savingsGoalType: SavingsGoalType
    savingsGoalName: string | null
    financialMood: FinancialMood
    onboardingScore: number
  }) => void
  incrementCsvImportCount: () => void
  setHourlyRate: (value: number | null) => void
  setWorkHoursEnabled: (value: boolean) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

// A single shared instance (mounted once in App.tsx, alongside
// AuthProvider) rather than one hook call per consumer — Nav's avatar and
// Paramètres' picker both need to see the SAME state so picking a new
// avatar/accent there is reflected in Nav immediately, without a reload.
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const guest = useGuestMode()
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [theme, setThemeState] = useState<Theme>('dark')
  const [avatarEmoji, setAvatarEmojiState] = useState<string | null>(null)
  const [currency, setCurrencyState] = useState<Currency>('CAD')
  const [onboardingMainGoal, setOnboardingMainGoalState] = useState<MainGoal | null>(null)
  const [onboardingTriedOtherApp, setOnboardingTriedOtherAppState] = useState<boolean | null>(null)
  const [onboardingFrequency, setOnboardingFrequencyState] = useState<TrackingFrequency | null>(null)
  const [csvImportCount, setCsvImportCountState] = useState(0)
  const [hourlyRate, setHourlyRateState] = useState<number | null>(null)
  const [workHoursEnabled, setWorkHoursEnabledState] = useState(false)
  const [payFrequency, setPayFrequencyState] = useState<PayFrequency | null>(null)
  const [nextPayday, setNextPaydayState] = useState<string | null>(null)
  const [savingsWhy, setSavingsWhyState] = useState<string | null>(null)
  const [whatsappNumber, setWhatsappNumberState] = useState<string | null>(null)
  const [whatsappConsent, setWhatsappConsentState] = useState(false)
  const [whatsappConsentAt, setWhatsappConsentAtState] = useState<string | null>(null)
  const [whatsappStatus, setWhatsappStatusState] = useState<WhatsappStatus | null>(null)
  const [firstName, setFirstNameState] = useState<string | null>(null)
  const [workStatus, setWorkStatusState] = useState<WorkStatus | null>(null)
  const [incomeRange, setIncomeRangeState] = useState<IncomeRange | null>(null)
  const [fixedExpensesRange, setFixedExpensesRangeState] = useState<FixedExpensesRange | null>(null)
  const [moneyLeaks, setMoneyLeaksState] = useState<MoneyLeak[]>([])
  const [savingsGoalType, setSavingsGoalTypeState] = useState<SavingsGoalType | null>(null)
  const [savingsGoalName, setSavingsGoalNameState] = useState<string | null>(null)
  const [financialMood, setFinancialMoodState] = useState<FinancialMood | null>(null)
  const [onboardingCompletedAt, setOnboardingCompletedAtState] = useState<string | null>(null)
  const [onboardingScore, setOnboardingScoreState] = useState<number | null>(null)

  const load = useCallback(async () => {
    // Guest mode never persists preferences anywhere — theme/accent/avatar
    // stay whatever index.html's bootstrap script already applied from
    // localStorage (or the defaults above), and every setter below still
    // updates the in-memory state immediately either way. This branch only
    // exists so `loading` actually resolves to false for a guest, instead
    // of staying stuck at its initial `true` forever (the real-user path
    // below never runs without a userId).
    if (guest.active) {
      setLoading(false)
      return
    }
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('user_preferences')
      .select(
        'theme, avatar_emoji, currency, onboarding_main_goal, onboarding_tried_other_app, onboarding_frequency, csv_import_count, hourly_rate, work_hours_enabled, pay_frequency, next_payday, savings_why, whatsapp_number, whatsapp_consent, whatsapp_consent_at, whatsapp_status, first_name, work_status, income_range, fixed_expenses_range, money_leaks, savings_goal_type, savings_goal_name, financial_mood, onboarding_completed_at, onboarding_score',
      )
      .eq('user_id', userId)
      .maybeSingle()
    if (fetchError) {
      setError(fetchError.message)
    } else {
      const nextTheme = (data?.theme as Theme | undefined) ?? 'dark'
      setThemeState(nextTheme)
      setAvatarEmojiState(data?.avatar_emoji ?? null)
      setCurrencyState((data?.currency as Currency | undefined) ?? 'CAD')
      setOnboardingMainGoalState((data?.onboarding_main_goal as MainGoal | null) ?? null)
      setOnboardingTriedOtherAppState(data?.onboarding_tried_other_app ?? null)
      setOnboardingFrequencyState((data?.onboarding_frequency as TrackingFrequency | null) ?? null)
      setCsvImportCountState(data?.csv_import_count ?? 0)
      setHourlyRateState(data?.hourly_rate ?? null)
      setWorkHoursEnabledState(data?.work_hours_enabled ?? false)
      setPayFrequencyState((data?.pay_frequency as PayFrequency | null) ?? null)
      setNextPaydayState(data?.next_payday ?? null)
      setSavingsWhyState(data?.savings_why ?? null)
      setWhatsappNumberState(data?.whatsapp_number ?? null)
      setWhatsappConsentState(data?.whatsapp_consent ?? false)
      setWhatsappConsentAtState(data?.whatsapp_consent_at ?? null)
      setWhatsappStatusState((data?.whatsapp_status as WhatsappStatus | null) ?? null)
      setFirstNameState(data?.first_name ?? null)
      setWorkStatusState((data?.work_status as WorkStatus | null) ?? null)
      setIncomeRangeState((data?.income_range as IncomeRange | null) ?? null)
      setFixedExpensesRangeState((data?.fixed_expenses_range as FixedExpensesRange | null) ?? null)
      setMoneyLeaksState((data?.money_leaks as MoneyLeak[] | null) ?? [])
      setSavingsGoalTypeState((data?.savings_goal_type as SavingsGoalType | null) ?? null)
      setSavingsGoalNameState(data?.savings_goal_name ?? null)
      setFinancialMoodState((data?.financial_mood as FinancialMood | null) ?? null)
      setOnboardingCompletedAtState(data?.onboarding_completed_at ?? null)
      setOnboardingScoreState(data?.onboarding_score ?? null)
      // Reconciles with whatever index.html's bootstrap script guessed from
      // localStorage before this fetch resolved — a no-op on the common
      // path where they already matched.
      applyTheme(nextTheme)
    }
    setLoading(false)
  }, [userId, guest.active])

  useEffect(() => {
    load()
  }, [load])

  const upsert = useCallback(
    async (fields: {
      theme?: Theme
      avatar_emoji?: string | null
      currency?: Currency
      onboarding_main_goal?: MainGoal
      onboarding_tried_other_app?: boolean
      onboarding_frequency?: TrackingFrequency
      csv_import_count?: number
      hourly_rate?: number | null
      work_hours_enabled?: boolean
      pay_frequency?: PayFrequency | null
      next_payday?: string | null
      savings_why?: string | null
      whatsapp_number?: string
      whatsapp_consent?: boolean
      whatsapp_consent_at?: string
      whatsapp_status?: WhatsappStatus
      first_name?: string
      work_status?: WorkStatus
      income_range?: IncomeRange
      fixed_expenses_range?: FixedExpensesRange
      money_leaks?: MoneyLeak[]
      savings_goal_type?: SavingsGoalType
      savings_goal_name?: string | null
      financial_mood?: FinancialMood
      onboarding_completed_at?: string
      onboarding_score?: number
    }) => {
      if (!userId) return
      const { error: upsertError } = await supabase
        .from('user_preferences')
        .upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() })
      if (upsertError) setError(upsertError.message)
    },
    [userId],
  )

  const setTheme = useCallback(
    (value: Theme) => {
      setThemeState(value)
      applyTheme(value)
      upsert({ theme: value })
    },
    [upsert],
  )

  const setAvatarEmoji = useCallback(
    (value: string | null) => {
      setAvatarEmojiState(value)
      upsert({ avatar_emoji: value })
    },
    [upsert],
  )

  const setCurrency = useCallback(
    (value: Currency) => {
      setCurrencyState(value)
      upsert({ currency: value })
    },
    [upsert],
  )

  // Set together by WorkHoursSettings.tsx (turning the feature on requires
  // a rate, so it always writes both), but kept as two independent setters
  // here since the toggle alone also needs to flip off without touching a
  // rate the user might want to keep around for next time.
  const setHourlyRate = useCallback(
    (value: number | null) => {
      setHourlyRateState(value)
      upsert({ hourly_rate: value })
    },
    [upsert],
  )

  const setWorkHoursEnabled = useCallback(
    (value: boolean) => {
      setWorkHoursEnabledState(value)
      upsert({ work_hours_enabled: value })
    },
    [upsert],
  )

  // Written once, at the end of Onboarding — read back by lib/tips.ts (via
  // Dashboard) to tilt the personalized tips' tone toward the goal the user
  // actually said they cared about.
  const setOnboardingProfile = useCallback(
    (mainGoal: MainGoal, triedOtherApp: boolean, frequency: TrackingFrequency) => {
      setOnboardingMainGoalState(mainGoal)
      setOnboardingTriedOtherAppState(triedOtherApp)
      setOnboardingFrequencyState(frequency)
      upsert({
        onboarding_main_goal: mainGoal,
        onboarding_tried_other_app: triedOtherApp,
        onboarding_frequency: frequency,
      })
    },
    [upsert],
  )

  // Written once, at the end of Onboarding's "Configure ton compte" step.
  // All 3 are optional there (only income is required to finish that step),
  // so any of them can legitimately be null.
  const setAccountSetupExtras = useCallback(
    (nextPayFrequency: PayFrequency | null, nextNextPayday: string | null, nextSavingsWhy: string | null) => {
      setPayFrequencyState(nextPayFrequency)
      setNextPaydayState(nextNextPayday)
      setSavingsWhyState(nextSavingsWhy)
      upsert({
        pay_frequency: nextPayFrequency,
        next_payday: nextNextPayday,
        savings_why: nextSavingsWhy,
      })
    },
    [upsert],
  )

  // Written once, by Onboarding.tsx's Q10 — the only path that can reach
  // this setter already requires its consent checkbox to be checked (the
  // Continue button stays disabled until it is), so consent is always true
  // here. There's no opt-out UI: a user who wants to stop would do so by
  // contacting support, same as any other consent withdrawal under Loi 25,
  // not a toggle in Paramètres. The number itself stays editable from
  // Paramètres (see setAccountSetupExtras-style direct edits there) even
  // after whatsapp_status is set — only the ONBOARDING prompt never repeats.
  const setWhatsappOptIn = useCallback(
    (e164Number: string) => {
      const consentedAt = new Date().toISOString()
      setWhatsappNumberState(e164Number)
      setWhatsappConsentState(true)
      setWhatsappConsentAtState(consentedAt)
      setWhatsappStatusState('given')
      upsert({
        whatsapp_number: e164Number,
        whatsapp_consent: true,
        whatsapp_consent_at: consentedAt,
        whatsapp_status: 'given',
      })
    },
    [upsert],
  )

  // Written once, when Onboarding.tsx's Q10 is answered "Non merci" (no
  // number entered). This is the field that actually prevents re-asking —
  // whatsappNumber alone staying null isn't enough, since that's also the
  // state of an account that simply hasn't been asked yet.
  const setWhatsappDeclined = useCallback(() => {
    setWhatsappStatusState('declined')
    upsert({ whatsapp_status: 'declined' })
  }, [upsert])

  // Written once, at the very end of Onboarding.tsx's 10-question flow (Q1
  // through Q9 — WhatsApp/Q10 goes through setWhatsappOptIn/
  // setWhatsappDeclined above instead, since it's consent-gated and
  // optional on its own). onboarding_completed_at is the single field
  // Dashboard.tsx's needsOnboarding gate reads. onboardingScore is the
  // /100 computed by lib/onboardingScore.ts from these same answers, shown
  // once on the result screen right after this call and saved alongside
  // everything else so it's on record even though nothing re-reads it today.
  const completeOnboarding = useCallback(
    (fields: {
      firstName: string
      workStatus: WorkStatus
      incomeRange: IncomeRange
      payFrequency: PayFrequency
      fixedExpensesRange: FixedExpensesRange
      moneyLeaks: MoneyLeak[]
      savingsGoalType: SavingsGoalType
      savingsGoalName: string | null
      financialMood: FinancialMood
      onboardingScore: number
    }) => {
      const completedAt = new Date().toISOString()
      setFirstNameState(fields.firstName)
      setWorkStatusState(fields.workStatus)
      setIncomeRangeState(fields.incomeRange)
      setPayFrequencyState(fields.payFrequency)
      setFixedExpensesRangeState(fields.fixedExpensesRange)
      setMoneyLeaksState(fields.moneyLeaks)
      setSavingsGoalTypeState(fields.savingsGoalType)
      setSavingsGoalNameState(fields.savingsGoalName)
      setFinancialMoodState(fields.financialMood)
      setOnboardingCompletedAtState(completedAt)
      setOnboardingScoreState(fields.onboardingScore)
      upsert({
        first_name: fields.firstName,
        work_status: fields.workStatus,
        income_range: fields.incomeRange,
        pay_frequency: fields.payFrequency,
        fixed_expenses_range: fields.fixedExpensesRange,
        money_leaks: fields.moneyLeaks,
        savings_goal_type: fields.savingsGoalType,
        savings_goal_name: fields.savingsGoalName ?? undefined,
        onboarding_score: fields.onboardingScore,
        financial_mood: fields.financialMood,
        onboarding_completed_at: completedAt,
      })
    },
    [upsert],
  )

  // Fires once a free-plan user completes a CSV import that used their
  // 2-import exception — read the current count off state rather than
  // taking it as a param, so callers don't need their own copy of it.
  const incrementCsvImportCount = useCallback(() => {
    setCsvImportCountState((prev) => {
      const next = prev + 1
      upsert({ csv_import_count: next })
      return next
    })
  }, [upsert])

  const value: PreferencesContextValue = {
    loading,
    error,
    theme,
    avatarEmoji,
    currency,
    onboardingMainGoal,
    onboardingTriedOtherApp,
    onboardingFrequency,
    csvImportCount,
    hourlyRate,
    workHoursEnabled,
    payFrequency,
    nextPayday,
    savingsWhy,
    whatsappNumber,
    whatsappConsent,
    whatsappConsentAt,
    whatsappStatus,
    firstName,
    workStatus,
    incomeRange,
    fixedExpensesRange,
    moneyLeaks,
    savingsGoalType,
    savingsGoalName,
    financialMood,
    onboardingCompletedAt,
    onboardingScore,
    setTheme,
    setAvatarEmoji,
    setCurrency,
    setOnboardingProfile,
    setAccountSetupExtras,
    setWhatsappOptIn,
    setWhatsappDeclined,
    completeOnboarding,
    incrementCsvImportCount,
    setHourlyRate,
    setWorkHoursEnabled,
  }

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
