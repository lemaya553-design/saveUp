import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthResult {
  error: string | null
  needsEmailConfirmation?: boolean
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  // True once Supabase confirms the current session came from clicking a
  // password-reset email link — Connexion uses this to show the "choose a
  // new password" form instead of the normal sign-in/sign-up form, even
  // though `user` is also truthy at that point (the recovery link signs
  // them in).
  passwordRecovery: boolean
  signUp: (email: string, password: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPasswordForEmail: (email: string) => Promise<AuthResult>
  updatePassword: (newPassword: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Supabase's auth errors come back in English regardless of project locale —
// map the handful users actually hit to clear French messages.
function mapAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('already registered') || lower.includes('already exists')) {
    return 'Un compte existe déjà avec ce courriel.'
  }
  if (lower.includes('password should be at least') || lower.includes('password is too short')) {
    return 'Le mot de passe doit contenir au moins 6 caractères.'
  }
  if (lower.includes('invalid login credentials')) {
    return 'Courriel ou mot de passe incorrect.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirme ton courriel avant de te connecter — vérifie ta boîte de réception.'
  }
  if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
    return "Ce courriel n'est pas valide."
  }
  if (lower.includes('rate limit')) {
    return 'Trop de tentatives — attends une minute avant de réessayer.'
  }
  if (lower.includes('auth session missing') || lower.includes('session not found')) {
    return 'Ce lien de réinitialisation a expiré ou a déjà été utilisé. Demande un nouveau lien.'
  }
  if (lower.includes('same as the old password') || lower.includes('should be different')) {
    return "Choisis un mot de passe différent de l'ancien."
  }
  return 'Une erreur est survenue. Réessaie.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      setLoading(false)
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
      if (event === 'SIGNED_OUT') setPasswordRecovery(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  // useCallback (stable function identities) + useMemo on the context value
  // below — otherwise AuthProvider hands out a brand-new value object on
  // every render, and since useAuth() is called inside nearly every data
  // hook in the app, that would re-render most of the tree on every auth
  // event (including silent background token refreshes, which fire
  // periodically even when nothing the user cares about changed).
  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: mapAuthError(error.message) }
    // With email confirmation enabled (Supabase's default), signUp succeeds
    // but returns no session until the user clicks the confirmation link.
    const needsEmailConfirmation = !data.session
    return { error: null, needsEmailConfirmation }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: mapAuthError(error.message) }
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const resetPasswordForEmail = useCallback(async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/connexion`,
    })
    if (error) return { error: mapAuthError(error.message) }
    return { error: null }
  }, [])

  const updatePassword = useCallback(async (newPassword: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { error: mapAuthError(error.message) }
    setPasswordRecovery(false)
    return { error: null }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      passwordRecovery,
      signUp,
      signIn,
      signOut,
      resetPasswordForEmail,
      updatePassword,
    }),
    [session, loading, passwordRecovery, signUp, signIn, signOut, resetPasswordForEmail, updatePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
