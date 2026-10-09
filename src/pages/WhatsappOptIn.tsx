import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { usePreferences } from '../hooks/usePreferences'
import { DIAL_COUNTRIES, DEFAULT_DIAL_COUNTRY, toE164 } from '../lib/phone'
import { WHATSAPP_OPT_IN } from '../lib/i18n/whatsappOptIn'
import type { CountryCode } from 'libphonenumber-js'

const ORANGE = '#FF7A00'

const fieldClass =
  'rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white placeholder-white/35 focus:outline-none'

function PhoneIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 4h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 13l4 1.5v3a2 2 0 0 1-2 2C10.5 19.5 4.5 13.5 4.5 6a2 2 0 0 1 2-2Z"
      />
    </svg>
  )
}

// Between signup and the onboarding quiz — gated by Dashboard.tsx's
// needsWhatsapp check (whatsappNumber null) and only ever left behind once
// a number is actually saved, so a returning user never sees this again.
// Styled like Connexion.tsx/Onboarding.tsx's literal black/orange/white
// identity (not the app's theme-aware chrome) since it sits in that same
// pre-dashboard flow.
export function WhatsappOptIn() {
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const preferences = usePreferences()
  const t = WHATSAPP_OPT_IN[lang]

  const [country, setCountry] = useState<CountryCode>(DEFAULT_DIAL_COUNTRY)
  const [phoneDraft, setPhoneDraft] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent || submitting) return

    const e164 = toE164(phoneDraft, country)
    if (!e164) {
      setError(t.errors.invalidNumber)
      return
    }

    setError(null)
    setSubmitting(true)
    preferences.setWhatsappOptIn(e164)
    navigate('/onboarding', { replace: true })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0c]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="mesh-blob-c pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full blur-[120px]"
        style={{ backgroundColor: `${ORANGE}26` }}
      />
      <div
        aria-hidden="true"
        className="mesh-blob-b pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full blur-[120px]"
        style={{ backgroundColor: `${ORANGE}1A` }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-14">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ color: ORANGE, backgroundColor: `${ORANGE}26` }}
        >
          <PhoneIcon className="h-5 w-5" />
        </span>

        <h1 className="mt-5 text-balance text-2xl font-bold text-white sm:text-3xl">{t.heading}</h1>
        <p className="mt-2 text-white/60">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex gap-2">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value as CountryCode)}
              aria-label={t.countryLabel}
              className={`${fieldClass} w-[7.5rem] shrink-0`}
            >
              {DIAL_COUNTRIES.map((c) => (
                <option key={c.iso} value={c.iso} className="bg-[#1a1a1a]">
                  {c.dial} {c.label[lang]}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="whatsapp-number">
              {t.phoneLabel}
            </label>
            <input
              id="whatsapp-number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              autoFocus
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              placeholder={t.phonePlaceholder}
              // Keeps the number out of Clarity's session-replay recordings
              // — see https://learn.microsoft.com/clarity/setup-and-installation/masking.
              data-clarity-mask="true"
              className={`${fieldClass} min-w-0 flex-1`}
            />
          </div>

          <p className="text-xs text-white/50">{t.privacyNote}</p>

          <label className="flex items-start gap-2.5 text-sm text-white/80">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ accentColor: ORANGE }}
            />
            {t.consentLabel}
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {preferences.error && <p className="text-sm text-red-400">{t.errors.saveFailed}</p>}

          <button
            type="submit"
            disabled={!consent || submitting}
            className="mt-2 rounded-xl px-4 py-3 text-center font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: ORANGE }}
          >
            {submitting ? t.submitting : t.continueButton}
          </button>
        </form>
      </div>
    </div>
  )
}
