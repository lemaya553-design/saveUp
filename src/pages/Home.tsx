import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LandingHeader } from '../components/LandingHeader'
import { Footer } from '../components/Footer'
import { Reveal } from '../components/Reveal'
import { MetaTags } from '../components/MetaTags'
import { PricingCards } from '../components/PricingCards'
import { useLanguage } from '../hooks/useLanguage'
import { HOME } from '../lib/i18n/home'
import { TARIFS } from '../lib/i18n/tarifs'

// Full landing page rewrite — white/black/orange (.landing-classic, see
// index.css), new content throughout. Deliberately drops the previous
// page's stats row, bento feature grid, screenshot carousel, comparison
// table and simulator preview — none of those are part of the requested
// 10-section structure, so those components stay in the tree (used
// elsewhere or simply unused) rather than being deleted outright.

function CheckIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function CrossIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function ImportIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

function TagIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3h6a2 2 0 0 1 2 2v6l-9 9-8-8 9-9z" />
      <circle cx="15.5" cy="8.5" r="1.25" fill="currentColor" stroke="none" />
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

function PlayIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7-11-7z" />
    </svg>
  )
}

function ChatIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function PersonIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

const STEP_ICONS = [ImportIcon, TagIcon, GoalIcon] as const

// No real Discord invite exists yet (see Footer.tsx) — null keeps the CTA
// visibly disabled instead of pointing at a fabricated server.
const DISCORD_URL: string | null = null

export function Home() {
  const location = useLocation()
  const { lang } = useLanguage()
  const t = HOME[lang]
  const tarifs = TARIFS[lang]

  useEffect(() => {
    if (!location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    target?.scrollIntoView({ behavior: 'smooth' })
  }, [location.hash])

  return (
    <div className="landing-classic">
      <MetaTags />
      <LandingHeader />

      {/* 1. Hero */}
      <section className="px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-24">
        <Reveal>
          <h1 className="mx-auto max-w-3xl text-balance text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[1.08] tracking-tight text-ink">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t.hero.subtitle}</p>

          <ul className="mx-auto mt-8 flex max-w-xl flex-col items-start gap-2.5 sm:items-center">
            {t.hero.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2.5 text-sm font-medium text-ink sm:text-base">
                <CheckIcon className="h-5 w-5 shrink-0 text-primary" />
                {benefit}
              </li>
            ))}
          </ul>

          <Link
            to="/dashboard"
            className="mt-9 inline-block rounded-lg bg-primary-strong px-8 py-3.5 font-semibold text-white transition-all hover:brightness-110"
          >
            {t.hero.cta}
          </Link>
          <p className="mt-4 text-sm text-muted">{t.hero.trustLine}</p>
        </Reveal>
      </section>

      {/* 2. Problème / Solution */}
      <section id="probleme" className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">{t.problemSolution.heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-center text-muted">{t.problemSolution.subheading}</p>
          </Reveal>

          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <Reveal delayMs={60}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {lang === 'fr' ? 'Avant' : 'Before'}
              </h3>
              <ul className="mt-4 space-y-4">
                {t.problemSolution.pairs.map((pair) => (
                  <li key={pair.problem} className="flex items-start gap-3 text-sm text-muted sm:text-base">
                    <CrossIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    {pair.problem}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delayMs={120}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                {lang === 'fr' ? 'Avec SaveUp' : 'With SaveUp'}
              </h3>
              <ul className="mt-4 space-y-4">
                {t.problemSolution.pairs.map((pair) => (
                  <li key={pair.solution} className="flex items-start gap-3 text-sm font-medium text-ink sm:text-base">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {pair.solution}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. Storytelling */}
      <section id="histoire" className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-10 sm:flex-row sm:items-start">
          {/* Placeholder avatar — real founder photo not yet wired in, see
              Home.tsx task notes. Swap the icon block below for an <img>
              once the file exists in the project (e.g. public/founder.jpg). */}
          <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PersonIcon className="h-16 w-16" />
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">{t.story.heading}</h2>
            <div className="mt-4 space-y-3 text-muted">
              {t.story.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-4 font-semibold text-ink">
              {t.story.founderName}
              <span className="font-normal text-muted"> — {t.story.founderRole}</span>
            </p>
          </div>
        </Reveal>
      </section>

      {/* 4. Vidéo démo */}
      <section id="demo" className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">{t.demo.heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-muted">{t.demo.subheading}</p>
          </Reveal>

          <Reveal delayMs={80} className="mt-10">
            <div className="relative mx-auto flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-ink">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                  <PlayIcon className="h-7 w-7 translate-x-0.5" />
                </div>
                <p className="font-medium text-white">{t.demo.placeholderLabel}</p>
              </div>
              <span className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                {t.demo.placeholderDuration}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. Solution en 3 étapes */}
      <section id="comment-ca-marche" className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">{t.solutionSteps.heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-center text-muted">{t.solutionSteps.subheading}</p>
          </Reveal>

          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {t.solutionSteps.items.map((step, i) => {
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

      {/* 6. Tarifs — real plans/prices/features, same component and data as
          the standalone /tarifs page (PricingCards.tsx), so there's never a
          second copy of this that can drift. */}
      <section id="tarifs" className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">{tarifs.hero.title}</h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted">{tarifs.hero.subtitle}</p>
        </Reveal>
        <Reveal delayMs={80} className="mt-12">
          <PricingCards />
        </Reveal>
      </section>

      {/* 7. Preuve sociale honnête — communauté Discord, pas de témoignage
          inventé. */}
      <section id="communaute" className="border-t border-overlay/10 px-4 py-20 text-center sm:px-6 sm:py-28">
        <Reveal>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ChatIcon className="h-7 w-7" />
          </div>
          <h2 className="mx-auto mt-5 max-w-lg text-balance text-2xl font-bold text-ink sm:text-3xl">
            {t.community.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">{t.community.body}</p>

          {DISCORD_URL ? (
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-block rounded-lg bg-primary-strong px-7 py-3 font-semibold text-white transition-all hover:brightness-110"
            >
              {t.community.discordCta}
            </a>
          ) : (
            <p className="mt-7 inline-block rounded-lg border border-dashed border-overlay/20 px-5 py-2.5 text-sm text-muted">
              {t.community.discordComingSoon}
            </p>
          )}
        </Reveal>
      </section>

      {/* 8. FAQ en accordéon — natif <details>/<summary>, pas de JS requis. */}
      <section id="faq" className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">{t.faq.heading}</h2>
          </Reveal>

          <div className="mt-10 space-y-3">
            {t.faq.items.map((item, i) => (
              <Reveal key={item.question} delayMs={i * 40}>
                <details className="group rounded-xl border border-overlay/10 px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                    {item.question}
                    <span aria-hidden="true" className="shrink-0 text-muted transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted">{item.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
