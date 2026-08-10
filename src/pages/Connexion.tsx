import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type Mode = 'signin' | 'signup' | 'forgot'

// Supabase puts recovery-link problems (expired, already used) directly in
// the redirect URL rather than as a catchable JS error, since there's no
// session yet to attach an error to — read it straight from the URL.
function readLinkError(): string | null {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const search = new URLSearchParams(window.location.search)
  const code = hash.get('error_code') ?? search.get('error_code')
  const description = hash.get('error_description') ?? search.get('error_description')
  if (!code && !description) return null
  return code === 'otp_expired'
    ? 'Ce lien de réinitialisation a expiré. Demande-en un nouveau ci-dessous.'
    : "Ce lien n'est plus valide. Demande-en un nouveau ci-dessous."
}

export function Connexion() {
  const { user, loading, passwordRecovery, signIn, signUp, resetPasswordForEmail, updatePassword } =
    useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(() => readLinkError())
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [resetLinkSent, setResetLinkSent] = useState(false)

  // A link error lands with mode still 'signin' by default — bump the user
  // straight to the "request a new link" form instead of a dead-end sign-in
  // screen with just an error banner above it.
  useEffect(() => {
    if (readLinkError()) setMode('forgot')
    // Clean the error params out of the URL so a refresh doesn't reprocess them.
    if (window.location.hash || window.location.search) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Already signed in with a normal session — no reason to show the form,
  // just send them where they were headed. A recovery-link session is NOT
  // "normal": passwordRecovery must be resolved (new password chosen) first.
  if (!loading && user && !passwordRecovery && !confirmationSent) {
    return <Navigate to={from} replace />
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setConfirmationSent(false)
    setResetLinkSent(false)
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Entre ton courriel et ton mot de passe.')
      return
    }
    setSubmitting(true)
    const result = await signIn(email.trim(), password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate(from, { replace: true })
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Entre un courriel et un mot de passe.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setSubmitting(true)
    const result = await signUp(email.trim(), password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsEmailConfirmation) {
      setConfirmationSent(true)
      return
    }
    navigate(from, { replace: true })
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Entre ton courriel.')
      return
    }
    setSubmitting(true)
    const result = await resetPasswordForEmail(email.trim())
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    // Deliberately the same message whether or not an account exists for
    // this email — confirming/denying that would let anyone check which
    // emails have an account here.
    setResetLinkSent(true)
  }

  async function handleSetNewPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setSubmitting(true)
    const result = await updatePassword(password)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass w-full max-w-md rounded-2xl p-8 shadow-2xl shadow-black/40">
        <Link
          className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-bold text-transparent"
          to="/"
        >
          SaveUp
        </Link>

        {passwordRecovery ? (
          <>
            <h1 className="mt-6 text-2xl font-bold text-ink">Choisis un nouveau mot de passe</h1>
            <p className="mt-2 text-sm text-muted">Ton nouveau mot de passe remplace l'ancien immédiatement.</p>

            <form onSubmit={handleSetNewPassword} className="mt-6 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm text-muted">
                Nouveau mot de passe
                <input
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-muted">
                Confirme le mot de passe
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
                />
              </label>

              {error && (
                <p className="rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? 'Un instant...' : 'Enregistrer le nouveau mot de passe'}
              </button>
            </form>
          </>
        ) : confirmationSent ? (
          <div className="mt-6">
            <h1 className="text-2xl font-bold text-ink">Vérifie ta boîte courriel</h1>
            <p className="mt-2 text-sm text-muted">
              On a envoyé un lien de confirmation à <span className="text-ink">{email}</span>.
              Clique-le pour activer ton compte, puis reviens te connecter ici.
            </p>
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="mt-6 w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110"
            >
              Retour à la connexion
            </button>
          </div>
        ) : mode === 'forgot' ? (
          resetLinkSent ? (
            <div className="mt-6">
              <h1 className="text-2xl font-bold text-ink">Vérifie ta boîte courriel</h1>
              <p className="mt-2 text-sm text-muted">
                Si un compte existe avec <span className="text-ink">{email}</span>, un lien pour
                réinitialiser le mot de passe vient d'être envoyé.
              </p>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="mt-6 w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold text-ink">Mot de passe oublié</h1>
              <p className="mt-2 text-sm text-muted">
                Entre ton courriel — on t'envoie un lien pour en choisir un nouveau.
              </p>

              <form onSubmit={handleForgotPassword} className="mt-6 flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm text-muted">
                  Courriel
                  <input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="toi@exemple.com"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
                  />
                </label>

                {error && (
                  <p className="rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {submitting ? 'Un instant...' : 'Envoyer le lien'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-accent hover:text-accent/80"
                >
                  Retour à la connexion
                </button>
              </p>
            </>
          )
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-bold text-ink">
              {mode === 'signin' ? 'Content de te revoir' : 'Crée ton compte'}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {mode === 'signin'
                ? 'Connecte-toi pour retrouver ton budget.'
                : 'Un courriel, un mot de passe — tes données restent les tiennes.'}
            </p>

            <form
              onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}
              className="mt-6 flex flex-col gap-3"
            >
              <label className="flex flex-col gap-1 text-sm text-muted">
                Courriel
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="toi@exemple.com"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-muted">
                <span className="flex items-center justify-between">
                  Mot de passe
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-normal text-accent hover:text-accent/80"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </span>
                <input
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
                />
              </label>

              {mode === 'signup' && (
                <label className="flex flex-col gap-1 text-sm text-muted">
                  Confirme le mot de passe
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
                  />
                </label>
              )}

              {error && (
                <p className="rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
              >
                {submitting
                  ? 'Un instant...'
                  : mode === 'signin'
                    ? 'Se connecter'
                    : 'Créer mon compte'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              {mode === 'signin' ? (
                <>
                  Pas encore de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-accent hover:text-accent/80"
                  >
                    Inscris-toi
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-accent hover:text-accent/80"
                  >
                    Connecte-toi
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
