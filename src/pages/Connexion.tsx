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

// Flat-orange ascending-bars mark — same silhouette as the shared LogoMark
// (components/Logo.tsx), but that one is a hardcoded blue-to-mauve
// gradient (not CSS-var driven), which would put indigo on an otherwise
// strictly black/orange/white page. A local, solid-orange variant instead
// of touching the shared component's branding used everywhere else.
function OrangeLogoMark({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 465 465" className={className} aria-hidden="true">
      <rect x="70" y="260" width="85" height="180" rx="32" fill="#ff6b00" />
      <rect x="195" y="165" width="85" height="275" rx="32" fill="#ff6b00" />
      <rect x="320" y="70" width="85" height="370" rx="32" fill="#ff6b00" />
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

// Realistic phone mockup for the right-hand visual column — same
// bezel/island/reflection construction as the landing page's showcase and
// "comment ça marche" phones (Home.tsx), reused here enlarged to fill a
// full-height panel. Screen content is the real statistiques screenshot
// already used on the landing page, not a fabricated one.
function PhoneVisual({ alt }: { alt: string }) {
  return (
    <div
      className="relative w-[320px] sm:w-[380px] xl:w-[430px] [transform:perspective(1400px)_rotateY(-8deg)_rotateX(2deg)]"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute -left-[3px] top-[14%] h-9 w-[3px] rounded-l-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />
      <div className="absolute -left-[3px] top-[22%] h-14 w-[3px] rounded-l-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />
      <div className="absolute -left-[3px] top-[32%] h-14 w-[3px] rounded-l-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />
      <div className="absolute -right-[3px] top-[20%] h-20 w-[3px] rounded-r-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />

      <div className="rounded-[2.75rem] bg-gradient-to-br from-[#46464c] via-[#1d1d20] to-[#08080a] p-[3px] shadow-[0_25px_60px_-20px_rgba(0,0,0,0.5),0_50px_100px_-30px_rgba(0,0,0,0.6)]">
        <div className="rounded-[2.6rem] bg-black p-[7px]">
          <div className="relative aspect-[790/1628] overflow-hidden rounded-[2.2rem] bg-[#0b0b12]">
            <img src="/screenshots/phone-mockup.jpg" alt={alt} className="h-full w-full object-cover object-top" />
            <div className="absolute left-1/2 top-[2.2%] z-20 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.02] to-transparent" />
          </div>
        </div>
      </div>
    </div>
  )
}

const inputClasses =
  'rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-white/35 focus:border-[#ff6b00] focus:outline-none'

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

  // The pill toggle only makes sense for the main signin/signup choice —
  // forgot-password, password-recovery and confirmation-sent are all
  // single-purpose sub-screens reached FROM that choice, not alternatives
  // to it.
  const showModeToggle = !passwordRecovery && !confirmationSent && mode !== 'forgot'

  return (
    <div className="flex min-h-screen bg-black">
      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-[43%] lg:px-14 lg:py-12 xl:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-2">
            <OrangeLogoMark className="h-7 w-7" />
            <span className="text-xl font-bold">
              <span className="text-white">save</span>
              <span className="text-[#ff6b00]">Up</span>
            </span>
          </Link>

          {showModeToggle && (
            <div className="mt-9 flex gap-3">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                  mode === 'signin'
                    ? 'bg-[#ff6b00] text-white shadow-lg shadow-[#ff6b00]/20'
                    : 'border border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                }`}
              >
                {t.signInUp.toggleSignIn}
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                  mode === 'signup'
                    ? 'bg-[#ff6b00] text-white shadow-lg shadow-[#ff6b00]/20'
                    : 'border border-white/20 text-white/60 hover:border-white/40 hover:text-white'
                }`}
              >
                {t.signInUp.toggleSignUp}
              </button>
            </div>
          )}

          {passwordRecovery ? (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">{t.recovery.title}</h1>
              <p className="mt-2 text-sm text-white/60">{t.recovery.subtitle}</p>

              <form onSubmit={handleSetNewPassword} className="mt-6 flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm text-white/60">
                  {t.common.newPasswordLabel}
                  <input
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClasses}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-white/60">
                  {t.common.confirmPasswordLabel}
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClasses}
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
                  className="mt-2 w-full rounded-lg bg-[#ff6b00] px-5 py-3 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {submitting ? t.common.submitting : t.recovery.submit}
                </button>
              </form>
            </>
          ) : confirmationSent ? (
            <div className="mt-8">
              <h1 className="text-2xl font-bold text-white">{t.common.checkYourEmail}</h1>
              <p className="mt-2 text-sm text-white/60">
                {t.confirmationSent.bodyPrefix}
                <span className="text-white">{email}</span>
                {t.confirmationSent.bodySuffix}
              </p>
              <p className="mt-3 rounded-lg border border-[#ff6b00]/30 bg-[#ff6b00]/10 px-3 py-2.5 text-xs text-white/90">
                {t.confirmationSent.spamPrefix}
                <span className="font-medium">{t.confirmationSent.spamBold}</span>
                {t.confirmationSent.spamSuffix}
              </p>

              {resendMessage && <p className="mt-3 text-sm text-white/60">{resendMessage}</p>}

              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resending}
                className="mt-4 w-full rounded-lg border border-white/15 px-5 py-3 font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-60"
              >
                {resending ? t.confirmationSent.resendBusy : t.confirmationSent.resendIdle}
              </button>
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="mt-2 w-full rounded-lg bg-[#ff6b00] px-5 py-3 font-medium text-white transition-all hover:brightness-110"
              >
                {t.common.backToSignIn}
              </button>
            </div>
          ) : mode === 'forgot' ? (
            resetLinkSent ? (
              <div className="mt-8">
                <h1 className="text-2xl font-bold text-white">{t.common.checkYourEmail}</h1>
                <p className="mt-2 text-sm text-white/60">
                  {t.forgot.linkSentPrefix}
                  <span className="text-white">{email}</span>
                  {t.forgot.linkSentSuffix}
                </p>
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="mt-6 w-full rounded-lg bg-[#ff6b00] px-5 py-3 font-medium text-white transition-all hover:brightness-110"
                >
                  {t.common.backToSignIn}
                </button>
              </div>
            ) : (
              <>
                <h1 className="mt-8 text-2xl font-bold text-white">{t.forgot.title}</h1>
                <p className="mt-2 text-sm text-white/60">{t.forgot.subtitle}</p>

                <form onSubmit={handleForgotPassword} className="mt-6 flex flex-col gap-3">
                  <label className="flex flex-col gap-1 text-sm text-white/60">
                    {t.common.emailLabel}
                    <input
                      type="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.common.emailPlaceholder}
                      className={inputClasses}
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
                    className="mt-2 w-full rounded-lg bg-[#ff6b00] px-5 py-3 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    {submitting ? t.common.submitting : t.forgot.submit}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-white/60">
                  <button type="button" onClick={() => switchMode('signin')} className="text-[#ff6b00] hover:text-[#ff6b00]/80">
                    {t.common.backToSignIn}
                  </button>
                </p>
              </>
            )
          ) : (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">
                {mode === 'signin' ? t.signInUp.signInTitle : t.signInUp.signUpTitle}
              </h1>
              <p className="mt-2 text-sm text-white/60">
                {mode === 'signin' ? t.signInUp.signInSubtitle : t.signInUp.signUpSubtitle}
              </p>

              {/* Google is the recommended, prominent path — full-size, high
                  contrast against the black panel, right after the heading.
                  Email/password is a real fallback, not hidden, but
                  deliberately secondary (see the discreet link below). */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 text-base font-semibold text-gray-900 shadow-lg shadow-black/40 transition-all hover:brightness-95 disabled:opacity-60"
              >
                <GoogleIcon className="h-6 w-6" />
                {googleSubmitting
                  ? t.signInUp.googleRedirecting
                  : mode === 'signin'
                    ? t.signInUp.googleContinue
                    : t.signInUp.googleSignUp}
              </button>

              {/* Only in signup mode — this is the exact moment a stranger to
                  the product decides whether to trust it with a Google
                  account link at all. A returning user in signin mode
                  already made that call once, so it'd just be noise there. */}
              {mode === 'signup' && (
                <p className="mt-2 text-center text-xs text-white/40">{t.signInUp.googleReassurance}</p>
              )}

              {error && (
                <p className="mt-4 rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
                  {error}
                </p>
              )}

              {noAccountHint && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#ff6b00]/30 bg-[#ff6b00]/10 px-3 py-2.5 text-sm text-white">
                  <span>{t.signInUp.noAccountHint}</span>
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="whitespace-nowrap rounded-lg bg-[#ff6b00] px-3 py-1.5 text-xs font-medium text-white transition-all hover:brightness-110"
                  >
                    {t.signInUp.createAccount}
                  </button>
                </div>
              )}

              {!showEmailForm ? (
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="mx-auto mt-5 block text-center text-sm text-white/50 hover:text-white"
                >
                  {t.signInUp.useEmailInstead}
                </button>
              ) : (
                <>
                  <div className="my-6 flex items-center gap-3 text-xs text-white/40">
                    <div className="h-px flex-1 bg-white/15" />
                    {t.signInUp.orWithEmail}
                    <div className="h-px flex-1 bg-white/15" />
                  </div>

                  <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="flex flex-col gap-3">
                    <label className="flex flex-col gap-1 text-sm text-white/60">
                      {t.common.emailLabel}
                      <input
                        type="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.common.emailPlaceholder}
                        className={inputClasses}
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm text-white/60">
                      <span className="flex items-center justify-between">
                        {t.common.passwordLabel}
                        {mode === 'signin' && (
                          <button
                            type="button"
                            onClick={() => switchMode('forgot')}
                            className="text-xs font-normal text-[#ff6b00] hover:text-[#ff6b00]/80"
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
                        className={inputClasses}
                      />
                    </label>

                    {mode === 'signup' && (
                      <label className="flex flex-col gap-1 text-sm text-white/60">
                        {t.common.confirmPasswordLabel}
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={inputClasses}
                        />
                      </label>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-2 w-full rounded-lg bg-[#ff6b00] px-5 py-3 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
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

              <p className="mt-6 text-center text-sm text-white/60">
                {mode === 'signin' ? (
                  <>
                    {t.signInUp.noAccountYet}{' '}
                    <button type="button" onClick={() => switchMode('signup')} className="text-[#ff6b00] hover:text-[#ff6b00]/80">
                      {t.signInUp.signUpLink}
                    </button>
                  </>
                ) : (
                  <>
                    {t.signInUp.alreadyAccount}{' '}
                    <button type="button" onClick={() => switchMode('signin')} className="text-[#ff6b00] hover:text-[#ff6b00]/80">
                      {t.signInUp.signInLink}
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right visual column — full height, real app screenshot inside the
          same realistic phone mockup used on the landing page. Hidden below
          lg: a split-screen auth layout on a narrow viewport just pushes the
          form below a huge image, so the visual drops out entirely on
          mobile rather than stacking. */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0a0c] via-black to-[#0a0a0c] lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-0 h-[32rem] w-[32rem] rounded-full bg-[#ff6b00]/15 blur-[140px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[#ff6b00]/10 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent"
        />
        <PhoneVisual alt={t.visual.phoneAlt} />
      </div>
    </div>
  )
}
