import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { applyAccentColor, applyTheme, type AccentColor, type Theme } from '../lib/theme'

interface PreferencesContextValue {
  loading: boolean
  error: string | null
  accentColor: AccentColor
  theme: Theme
  avatarEmoji: string | null
  setAccentColor: (value: AccentColor) => void
  setTheme: (value: Theme) => void
  setAvatarEmoji: (value: string | null) => void
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

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('user_preferences')
      .select('accent_color, theme, avatar_emoji')
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
    async (fields: { accent_color?: AccentColor; theme?: Theme; avatar_emoji?: string | null }) => {
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

  const value: PreferencesContextValue = {
    loading,
    error,
    accentColor,
    theme,
    avatarEmoji,
    setAccentColor,
    setTheme,
    setAvatarEmoji,
  }

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
