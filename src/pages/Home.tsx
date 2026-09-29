import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LandingHeader } from '../components/LandingHeader'
import { Reveal } from '../components/Reveal'
import { LogoMark } from '../components/Logo'
import { MetaTags } from '../components/MetaTags'
import { useLanguage } from '../hooks/useLanguage'
import { HOME } from '../lib/i18n/home'
import { COMMON } from '../lib/i18n/common'

// Experimental white/minimal redesign — see .landing-minimal in index.css
// for the scoped light-theme override and why it's a class rather than
// the app's real [data-theme] toggle. Deliberately not wired up to the
// shared Footer/StickyCta/full section set the current shipped Home.tsx
// uses (WHY_SAVEUP, comparison table, FAQ, etc.) — this is a from-scratch
// page matching a specific, much shorter brief, not a restyle of the
// existing one. Left uncommitted, same as every other visual redesign
// pass this session.

function IncomeIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v10M9.5 9.5c0-1.4 1.1-2 2.5-2s2.5.7 2.5 2c0 2.5-5 1.5-5 4 0 1.3 1.1 2 2.5 2s2.5-.6 2.5-2" />
    </svg>
  )
}

function BillsIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h9l3 3v15H6V3z" />
      <path strokeLinecap="round" d="M9 9h6M9 13h6M9 17h3" />
    </svg>
  )
}

function GoalIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

const STEP_ICONS = [IncomeIcon, BillsIcon, GoalIcon] as const

export function Home() {
  const location = useLocation()
  const { lang } = useLanguage()
  const t = HOME[lang].minimal
  const footerLabels = COMMON[lang].footer

  useEffect(() => {
    if (!location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    target?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  return (
    <div className="landing-minimal">
      <MetaTags />
      <LandingHeader />

      {/* Hero — one sentence, one line of value, one button. No badges, no
          gradient, no watermark logo — the brief calls for a lot of white
          space and bold type doing the work instead. */}
      <section className="px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28">
        <Reveal>
          <h1 className="mx-auto max-w-3xl text-balance text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[1.08] tracking-tight text-ink">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t.hero.subtitle}</p>
          <Link
            to="/dashboard"
            className="mt-9 inline-block rounded-lg bg-primary-strong px-8 py-3.5 font-semibold text-white transition-all hover:brightness-110"
          >
            {t.hero.cta}
          </Link>
        </Reveal>
      </section>

      {/* Démonstration + preuve — a real screenshot (see AskUserQuestion log:
          dashboard.png, chosen over the other 4 existing screenshots as the
          closest real match to "a savings goal in progress" available
          today) and a clearly-marked placeholder for the client testimonial,
          which is real but not yet in this codebase — never a fabricated
          quote standing in for it. */}
      <section className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">{t.demo.heading}</h2>
          </Reveal>

          <Reveal delayMs={80} className="mt-10">
            <img
              src="/screenshots/dashboard.png"
              alt={t.demo.screenshotAlt}
              className="mx-auto w-full max-w-3xl rounded-xl border border-overlay/10 shadow-sm"
            />
          </Reveal>

          <Reveal delayMs={140} className="mt-12">
            <div className="mx-auto max-w-lg rounded-xl border border-dashed border-overlay/20 p-6 text-center text-sm text-muted">
              {t.demo.testimonialPlaceholder}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Comment ça marche — 3 steps, icon + short text each, no interactive
          widget (LandingStepsPreview, used by the current shipped page, is
          a live calculator — heavier than "texte court par étape" calls
          for here). Copy reused verbatim from COMMON[lang].steps' existing
          step1-3 title/body, already accurate to the real onboarding flow. */}
      <section className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">{t.howItWorks.heading}</h2>
          </Reveal>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {t.howItWorks.steps.map((step, i) => {
              const Icon = STEP_ICONS[i]
              return (
                <Reveal key={step.title} delayMs={i * 80}>
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted">{step.body}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA répété — same button as the hero, same destination. Sitting
          right before the footer on this short a page reads as both
          "middle" and "bottom" at once; a second copy stacked right under
          it would just feel like pressure, working against the requested
          "pas de survente" tone. */}
      <section className="border-t border-overlay/10 px-4 py-20 text-center sm:px-6 sm:py-28">
        <Reveal>
          <LogoMark className="mx-auto h-10 w-10" />
          <h2 className="mx-auto mt-5 max-w-xl text-balance text-2xl font-bold text-ink sm:text-3xl">
            {t.repeatedCta.heading}
          </h2>
          <Link
            to="/dashboard"
            className="mt-8 inline-block rounded-lg bg-primary-strong px-8 py-3.5 font-semibold text-white transition-all hover:brightness-110"
          >
            {t.repeatedCta.cta}
          </Link>
        </Reveal>
      </section>

      {/* Footer — self-contained here rather than the shared Footer.tsx
          component: stacking that one (Tarifs/Confidentialité/Conditions)
          underneath a second contact block would be two footers, not the
          "simple" one the brief asks for. Reuses COMMON's existing
          privacy/terms labels for consistency with the rest of the app. */}
      <footer className="border-t border-overlay/10 px-4 py-10 text-center text-sm text-muted sm:px-6">
        <a href={`mailto:${t.footer.contactLabel}`} className="font-medium text-primary hover:underline">
          {t.footer.contactLabel}
        </a>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <Link to="/confidentialite" className="transition-colors hover:text-ink">
            {footerLabels.privacy}
          </Link>
          <Link to="/conditions" className="transition-colors hover:text-ink">
            {footerLabels.terms}
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted/80">
          © {new Date().getFullYear()} {t.footer.legal}
        </p>
      </footer>
    </div>
  )
}
