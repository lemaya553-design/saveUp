import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { CONNEXION } from '../lib/i18n/connexion'
import type { Lang } from '../lib/i18n/language'

type Mode = 'signin' | 'signup' | 'forgot'

function GoogleIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 34.9 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.6 5.6C41.6 35.9 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  )
}

// Supabase puts recovery-link problems (expired, already used) directly in
// the redirect URL rather than as a catchable JS error, since there's no
// session yet to attach an error to — read it straight from the URL. This
// reads from window.location, not React state, so it can't call
// useLanguage() itself — callers pass the current lang in explicitly.
function readLinkError(lang: Lang): string | null {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const search = new URLSearchParams(window.location.search)
  const code = hash.get('error_code') ?? search.get('error_code')
  const description = hash.get('error_description') ?? search.get('error_description')
  if (!code && !description) return null
  const t = CONNEXION[lang]
  return code === 'otp_expired' ? t.errors.linkExpired : t.errors.linkInvalid
}

export function Connexion() {
  const {
    user,
    loading,
    passwordRecovery,
    signIn,
    signUp,
    signInWithGoogle,
    resetPasswordForEmail,
    updatePassword,
    resendConfirmationEmail,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'
  const { lang } = useLanguage()
  const t = CONNEXION[lang]

  // Signup is the default parcours — this is where a new visitor coming
  // from the landing page's "Commencer gratuitement" lands, and most
  // visitors here don't have an account yet. Existing users get here too
  // (session expired, direct link) but "Connecte-toi" is one click away at
  // the bottom, never hidden — just not the loudest thing on the page.
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(() => readLinkError(lang))
  // Supabase returns the exact same error for "wrong password" and "no
  // account with this email" (deliberate anti-enumeration behavior,
  // verified against the real project) — so this never claims certainty,
  // it offers signup as a likely next step alongside the normal error.
  const [noAccountHint, setNoAccountHint] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [resetLinkSent, setResetLinkSent] = useState(false)
  // Google is the recommended path (fewer stuck signups — see the "ou
  // utiliser un courriel" link below) — the email/password form stays
  // collapsed until the visitor deliberately asks for it.
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  // A link error lands with mode still 'signin' by default — bump the user
  // straight to the "request a new link" form instead of a dead-end sign-in
  // screen with just an error banner above it.
  useEffect(() => {
    if (readLinkError(lang)) setMode('forgot')
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
    setNoAccountHint(false)
    setConfirmationSent(false)
    setResetLinkSent(false)
    setResendMessage(null)
    setPassword('')
    setConfirmPassword('')
  }

  async function handleResendConfirmation() {
    setResending(true)
    setResendMessage(null)
    const result = await resendConfirmationEmail(email, lang)
    setResending(false)
    setResendMessage(result.error ?? t.resend.sent)
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNoAccountHint(false)
    if (!email.trim() || !password) {
      setError(t.errors.signInMissingFields)
      return
    }
    setSubmitting(true)
    const result = await signIn(email.trim(), password, lang)
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
      setNoAccountHint(result.code === 'invalid_credentials')
      return
    }
    navigate(from, { replace: true })
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError(t.errors.signUpMissingFields)
      return
    }
    if (password.length < 6) {
      setError(t.errors.passwordTooShort)
      return
    }
    if (password !== confirmPassword) {
      setError(t.errors.passwordMismatch)
      return
    }
    setSubmitting(true)
    const result = await signUp(email.trim(), password, lang)
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

  // On success this navigates the whole page away (to Google, then back to
  // /dashboard) — it never "finishes" from here, so googleSubmitting is
  // only ever reset by the error path (a fresh page load resets it on
  // success automatically).
  async function handleGoogleSignIn() {
    setError(null)
    setGoogleSubmitting(true)
    const result = await signInWithGoogle(from, lang)
    if (result.error) {
      setError(result.error)
      setGoogleSubmitting(false)
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError(t.errors.forgotMissingEmail)
      return
    }
    setSubmitting(true)
    const result = await resetPasswordForEmail(email.trim(), lang)
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
      setError(t.errors.passwordTooShort)
      return
    }
    if (password !== confirmPassword) {
      setError(t.errors.passwordMismatch)
      return
    }
    setSubmitting(true)
    const result = await updatePassword(password, lang)
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
            <h1 className="mt-6 text-2xl font-bold text-ink">{t.recovery.title}</h1>
            <p className="mt-2 text-sm text-muted">{t.recovery.subtitle}</p>

            <form onSubmit={handleSetNewPassword} className="mt-6 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm text-muted">
                {t.common.newPasswordLabel}
                <input
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-muted">
                {t.common.confirmPasswordLabel}
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
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
                {submitting ? t.common.submitting : t.recovery.submit}
              </button>
            </form>
          </>
        ) : confirmationSent ? (
          <div className="mt-6">
            <h1 className="text-2xl font-bold text-ink">{t.common.checkYourEmail}</h1>
            <p className="mt-2 text-sm text-muted">
              {t.confirmationSent.bodyPrefix}
              <span className="text-ink">{email}</span>
              {t.confirmationSent.bodySuffix}
            </p>
            <p className="mt-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2.5 text-xs text-ink">
              {t.confirmationSent.spamPrefix}
              <span className="font-medium">{t.confirmationSent.spamBold}</span>
              {t.confirmationSent.spamSuffix}
            </p>

            {resendMessage && (
              <p className="mt-3 text-sm text-muted">{resendMessage}</p>
            )}

            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending}
              className="mt-4 w-full rounded-lg border border-overlay/10 px-5 py-3 font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
            >
              {resending ? t.confirmationSent.resendBusy : t.confirmationSent.resendIdle}
            </button>
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="mt-2 w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110"
            >
              {t.common.backToSignIn}
            </button>
          </div>
        ) : mode === 'forgot' ? (
          resetLinkSent ? (
            <div className="mt-6">
              <h1 className="text-2xl font-bold text-ink">{t.common.checkYourEmail}</h1>
              <p className="mt-2 text-sm text-muted">
                {t.forgot.linkSentPrefix}
                <span className="text-ink">{email}</span>
                {t.forgot.linkSentSuffix}
              </p>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="mt-6 w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110"
              >
                {t.common.backToSignIn}
              </button>
            </div>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold text-ink">{t.forgot.title}</h1>
              <p className="mt-2 text-sm text-muted">{t.forgot.subtitle}</p>

              <form onSubmit={handleForgotPassword} className="mt-6 flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm text-muted">
                  {t.common.emailLabel}
                  <input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.common.emailPlaceholder}
                    className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
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
                  {submitting ? t.common.submitting : t.forgot.submit}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-accent hover:text-accent/80"
                >
                  {t.common.backToSignIn}
                </button>
              </p>
            </>
          )
        ) : (
          <>
            <h1 className="mt-6 text-2xl font-bold text-ink">
              {mode === 'signin' ? t.signInUp.signInTitle : t.signInUp.signUpTitle}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {mode === 'signin' ? t.signInUp.signInSubtitle : t.signInUp.signUpSubtitle}
            </p>

            {/* Google is the recommended, prominent path — full-size, high
                contrast against the dark card, first thing after the
                heading. Email/password is a real fallback, not hidden, but
                deliberately secondary (see the discreet link below). */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 text-base font-semibold text-gray-900 shadow-lg shadow-black/20 transition-all hover:brightness-95 disabled:opacity-60"
            >
              <GoogleIcon className="h-6 w-6" />
              {googleSubmitting
                ? t.signInUp.googleRedirecting
                : mode === 'signin'
                  ? t.signInUp.googleContinue
                  : t.signInUp.googleSignUp}
            </button>

            {error && (
              <p className="mt-4 rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            {noAccountHint && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2.5 text-sm text-ink">
                <span>{t.signInUp.noAccountHint}</span>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="whitespace-nowrap rounded-lg bg-primary-strong px-3 py-1.5 text-xs font-medium text-white transition-all hover:brightness-110"
                >
                  {t.signInUp.createAccount}
                </button>
              </div>
            )}

            {!showEmailForm ? (
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="mx-auto mt-5 block text-center text-sm text-muted hover:text-ink"
              >
                {t.signInUp.useEmailInstead}
              </button>
            ) : (
              <>
                <div className="my-6 flex items-center gap-3 text-xs text-muted">
                  <div className="h-px flex-1 bg-overlay/10" />
                  {t.signInUp.orWithEmail}
                  <div className="h-px flex-1 bg-overlay/10" />
                </div>

                <form
                  onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}
                  className="flex flex-col gap-3"
                >
                  <label className="flex flex-col gap-1 text-sm text-muted">
                    {t.common.emailLabel}
                    <input
                      type="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.common.emailPlaceholder}
                      className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-muted">
                    <span className="flex items-center justify-between">
                      {t.common.passwordLabel}
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs font-normal text-accent hover:text-accent/80"
                        >
                          {t.signInUp.forgotPasswordLink}
                        </button>
                      )}
                    </span>
                    <input
                      type="password"
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
                    />
                  </label>

                  {mode === 'signup' && (
                    <label className="flex flex-col gap-1 text-sm text-muted">
                      {t.common.confirmPasswordLabel}
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
                      />
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-2 w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    {submitting
                      ? t.common.submitting
                      : mode === 'signin'
                        ? t.signInUp.signInSubmit
                        : t.signInUp.signUpSubmit}
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-sm text-muted">
              {mode === 'signin' ? (
                <>
                  {t.signInUp.noAccountYet}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-accent hover:text-accent/80"
                  >
                    {t.signInUp.signUpLink}
                  </button>
                </>
              ) : (
                <>
                  {t.signInUp.alreadyAccount}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="text-accent hover:text-accent/80"
                  >
                    {t.signInUp.signInLink}
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
