import { useState } from 'react'
import { usePreferences } from '../hooks/usePreferences'
import { useLanguage } from '../hooks/useLanguage'
import { PAY_FREQUENCIES, type PayFrequency } from '../lib/onboardingQuiz'
import { ONBOARDING_QUIZ } from '../lib/i18n/onboardingQuiz'
import { PARAMETRES } from '../lib/i18n/parametres'

const CARD_BORDER = 'color-mix(in srgb, var(--color-overlay) 10%, transparent)'

function RepeatIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h13l-3-3m3 3-3 3M20 17H7l3 3m-3-3 3-3" />
    </svg>
  )
}

function CalendarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path strokeLinecap="round" d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  )
}

// Edits the same 3 columns Onboarding.tsx's "Configure ton compte" step
// writes once via setAccountSetupExtras(payFrequency, nextPayday,
// savingsWhy) — savings_why isn't shown here (it has no other home yet),
// but every write below still passes the CURRENT savingsWhy through
// unchanged, since setAccountSetupExtras replaces all 3 columns together
// and would otherwise silently wipe it out.
export function PayScheduleSettings() {
  const { payFrequency, nextPayday, savingsWhy, setAccountSetupExtras } = usePreferences()
  const { lang } = useLanguage()
  const t = PARAMETRES[lang].paySchedule
  const freqLabels = ONBOARDING_QUIZ[lang].setup.payFrequencies

  const [nextPaydayDraft, setNextPaydayDraft] = useState(nextPayday ?? '')

  function commitFrequency(freq: PayFrequency) {
    setAccountSetupExtras(freq, nextPayday, savingsWhy)
  }

  function commitNextPayday(value: string) {
    setNextPaydayDraft(value)
    setAccountSetupExtras(payFrequency, value || null, savingsWhy)
  }

  const incomplete = !payFrequency || !nextPayday

  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: CARD_BORDER }}
    >
      <h2 className="text-base font-semibold text-ink">{t.cardTitle}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{t.cardHint}</p>

      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-sm text-ink">
            <RepeatIcon className="h-4 w-4 text-muted" />
            {t.frequencyLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {PAY_FREQUENCIES.map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => commitFrequency(freq)}
                aria-pressed={payFrequency === freq}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  payFrequency === freq ? 'budget-btn-primary' : 'glass text-muted hover:text-ink'
                }`}
              >
                {freqLabels[freq]}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-ink">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4 text-muted" />
            {t.nextPaydayLabel}
          </span>
          <input
            type="date"
            value={nextPaydayDraft}
            onChange={(e) => commitNextPayday(e.target.value)}
            className="w-48 rounded-lg budget-field px-3 py-2 text-ink"
          />
        </label>

        {incomplete && <p className="text-xs text-muted">{t.incompleteHint}</p>}
      </div>
    </section>
  )
}
