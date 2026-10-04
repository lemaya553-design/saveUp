import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { applyAccentColor, applyTheme, type AccentColor, type Theme } from '../lib/theme'
import type { Currency } from '../lib/format'
import type { MainGoal, TrackingFrequency } from '../lib/onboardingProfile'

interface PreferencesContextValue {
  loading: boolean
  error: string | null
  accentColor: AccentColor
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
  setAccentColor: (value: AccentColor) => void
  setTheme: (value: Theme) => void
  setAvatarEmoji: (value: string | null) => void
  setCurrency: (value: Currency) => void
  setOnboardingProfile: (mainGoal: MainGoal, triedOtherApp: boolean, frequency: TrackingFrequency) => void
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
  const userId = user?.id
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accentColor, setAccentColorState] = useState<AccentColor>('bleu')
  const [theme, setThemeState] = useState<Theme>('dark')
  const [avatarEmoji, setAvatarEmojiState] = useState<string | null>(null)
  const [currency, setCurrencyState] = useState<Currency>('CAD')
  const [onboardingMainGoal, setOnboardingMainGoalState] = useState<MainGoal | null>(null)
  const [onboardingTriedOtherApp, setOnboardingTriedOtherAppState] = useState<boolean | null>(null)
  const [onboardingFrequency, setOnboardingFrequencyState] = useState<TrackingFrequency | null>(null)
  const [csvImportCount, setCsvImportCountState] = useState(0)
  const [hourlyRate, setHourlyRateState] = useState<number | null>(null)
  const [workHoursEnabled, setWorkHoursEnabledState] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('user_preferences')
      .select(
        'accent_color, theme, avatar_emoji, currency, onboarding_main_goal, onboarding_tried_other_app, onboarding_frequency, csv_import_count, hourly_rate, work_hours_enabled',
      )
      .eq('user_id', userId)
      .maybeSingle()
    if (fetchError) {
      setError(fetchError.message)
    } else {
      const nextAccent = (data?.accent_color as AccentColor | undefined) ?? 'bleu'
      const nextTheme = (data?.theme as Theme | undefined) ?? 'dark'
      setAccentColorState(nextAccent)
      setThemeState(nextTheme)
      setAvatarEmojiState(data?.avatar_emoji ?? null)
      setCurrencyState((data?.currency as Currency | undefined) ?? 'CAD')
      setOnboardingMainGoalState((data?.onboarding_main_goal as MainGoal | null) ?? null)
      setOnboardingTriedOtherAppState(data?.onboarding_tried_other_app ?? null)
      setOnboardingFrequencyState((data?.onboarding_frequency as TrackingFrequency | null) ?? null)
      setCsvImportCountState(data?.csv_import_count ?? 0)
      setHourlyRateState(data?.hourly_rate ?? null)
      setWorkHoursEnabledState(data?.work_hours_enabled ?? false)
      // Reconciles with whatever index.html's bootstrap script guessed from
      // localStorage before this fetch resolved — a no-op on the common
      // path where they already matched.
      applyAccentColor(nextAccent)
      applyTheme(nextTheme)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const upsert = useCallback(
    async (fields: {
      accent_color?: AccentColor
      theme?: Theme
      avatar_emoji?: string | null
      currency?: Currency
      onboarding_main_goal?: MainGoal
      onboarding_tried_other_app?: boolean
      onboarding_frequency?: TrackingFrequency
      csv_import_count?: number
      hourly_rate?: number | null
      work_hours_enabled?: boolean
    }) => {
      if (!userId) return
      const { error: upsertError } = await supabase
        .from('user_preferences')
        .upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() })
      if (upsertError) setError(upsertError.message)
    },
    [userId],
  )

  const setAccentColor = useCallback(
    (value: AccentColor) => {
      setAccentColorState(value)
      applyAccentColor(value)
      upsert({ accent_color: value })
    },
    [upsert],
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
    accentColor,
    theme,
    avatarEmoji,
    currency,
    onboardingMainGoal,
    onboardingTriedOtherApp,
    onboardingFrequency,
    csvImportCount,
    hourlyRate,
    workHoursEnabled,
    setAccentColor,
    setTheme,
    setAvatarEmoji,
    setCurrency,
    setOnboardingProfile,
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
