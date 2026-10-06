import { LandingHeader } from '../components/LandingHeader'
import { HelpButton } from '../components/HelpButton'
import { TrialBadge } from '../components/TrialBadge'
import { PricingCards } from '../components/PricingCards'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { TRIAL_DAYS } from '../lib/plans'
import { TARIFS } from '../lib/i18n/tarifs'

export function Tarifs() {
  const { user } = useAuth()
  // Now shared with the rest of the signed-in app — Nav.tsx's own
  // LanguageSwitcher keeps this in sync everywhere, not just the logged-out
  // marketing header.
  const { lang } = useLanguage()
  const t = TARIFS[lang]

  return (
    <div>
      {/* Logged-in visitors get here via the app's own Nav (Layout renders
          it for /tarifs once a user session exists) — showing this too
          would stack two header bars. */}
      {!user && <LandingHeader />}

      <section
        className="relative px-4 pb-24 pt-10 text-center sm:px-6"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255, 122, 0, 0.16), transparent 70%)',
        }}
      >
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <HelpButton title={t.help.title} purpose={t.help.purpose} actions={t.help.actions(TRIAL_DAYS)} />
        </div>

        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
          {t.hero.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t.hero.subtitle}</p>

        <TrialBadge
          className="mx-auto mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#FF7A00]/15 px-4 py-2 text-sm font-semibold text-[#FF7A00]"
        />

        <div className="mt-14">
          <PricingCards accentOverride />
        </div>
      </section>
    </div>
  )
}
