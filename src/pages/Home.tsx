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

function TrendIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h6v6" />
    </svg>
  )
}

function BudgetIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <rect x="3" y="4" width="18" height="3.5" rx="1" />
      <rect x="3" y="10.25" width="12" height="3.5" rx="1" />
      <rect x="3" y="16.5" width="15" height="3.5" rx="1" />
    </svg>
  )
}

function SearchIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
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

// Keyed to HomeContent['hero']['floatingCards'][number]['icon'] — real app
// behavior only, see the task that introduced the new hero.
const FLOATING_CARD_ICONS = {
  goal: GoalIcon,
  trend: TrendIcon,
  import: ImportIcon,
  budget: BudgetIcon,
}

// Positions for the 4 floating cards around the hero content, large screens
// only (lg:) — on a ~700px-wide centered hero inside a 1024px+ viewport
// there's enough side margin for these not to overlap the title/subtitle.
// Below lg they render inline as a static 2x2 grid instead (see JSX).
// Varied rotation/offset/size per card on purpose — four identical boxes at
// uniform angles read as a grid, not a scatter of real notifications.
const FLOATING_CARD_STYLES = [
  { position: 'left-0 top-2 -rotate-6', size: 'text-base px-5 py-3.5' },
  { position: 'right-2 top-20 rotate-3', size: 'text-xs px-3.5 py-2.5' },
  { position: 'left-10 bottom-4 rotate-2', size: 'text-sm px-4 py-3' },
  { position: 'right-0 bottom-16 -rotate-[8deg]', size: 'text-xs px-3.5 py-2.5' },
]

function FloatingCard({
  icon,
  text,
  size = 'text-sm px-4 py-3',
  className = '',
}: {
  icon: keyof typeof FLOATING_CARD_ICONS
  text: string
  size?: string
  className?: string
}) {
  const Icon = FLOATING_CARD_ICONS[icon]
  return (
    <div
      className={`flex items-center gap-2.5 rounded-3xl border border-overlay/10 bg-surface shadow-lg shadow-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl ${size} ${className}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="font-medium text-ink">{text}</span>
    </div>
  )
}

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

      {/* 1. Hero — badge, two-tone title, search-bar-style CTA, and 4
          floating "real feature" cards (no invented metrics) scattered
          around the content on large screens, collapsing to a static grid
          below lg. */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-28 sm:pt-24">
        {/* Subtle orange glow behind the title — two soft blobs drifting
            gently (mesh-blob-a/b, defined in index.css) rather than one
            static circle, for a touch of ambient life. */}
        <div
          aria-hidden="true"
          className="mesh-blob-a pointer-events-none absolute left-1/2 top-0 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="mesh-blob-b pointer-events-none absolute right-[10%] top-1/3 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px]"
        />

        <Reveal className="relative mx-auto max-w-2xl">
          <div className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-overlay/10 bg-surface px-4 py-1.5 shadow-sm">
            <div className="flex -space-x-2" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-primary/15 text-primary"
                >
                  <PersonIcon className="h-3 w-3" />
                </span>
              ))}
            </div>
            <span className="text-xs font-medium text-muted">{t.hero.trustBadge}</span>
          </div>

          <h1 className="mx-auto mt-6 text-balance text-[clamp(2.25rem,6vw,3.75rem)] font-extrabold leading-[1.08] tracking-tight text-ink">
            {t.hero.titleStart}
            <br />
            <span className="text-primary">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t.hero.subtitle}</p>

          <Link
            to="/dashboard"
            className="group mx-auto mt-9 flex max-w-xl items-center gap-3 rounded-full border border-overlay/10 bg-surface py-2 pl-5 pr-2 shadow-lg shadow-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
            <span className="flex-1 truncate text-left text-sm text-muted sm:text-base">{t.hero.ctaInputLabel}</span>
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-primary-strong px-5 py-2.5 text-sm font-semibold text-white transition-all group-hover:brightness-110">
              {t.hero.ctaButton}
            </span>
          </Link>
        </Reveal>

        {/* Floating cards — large screens only, absolutely positioned
            around the hero content. */}
        <div className="pointer-events-none absolute inset-0 z-0 mx-auto hidden max-w-5xl lg:block">
          {t.hero.floatingCards.map((card, i) => (
            <Reveal
              key={card.text}
              delayMs={200 + i * 100}
              className={`pointer-events-auto absolute ${FLOATING_CARD_STYLES[i].position}`}
            >
              <FloatingCard icon={card.icon} text={card.text} size={FLOATING_CARD_STYLES[i].size} />
            </Reveal>
          ))}
        </div>

        {/* Same cards, static 2x2 grid below lg. */}
        <Reveal delayMs={160} className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3 lg:hidden">
          {t.hero.floatingCards.map((card) => (
            <FloatingCard key={card.text} icon={card.icon} text={card.text} className="text-left" />
          ))}
        </Reveal>
      </section>

      {/* 2. Problème / Solution */}
      <section id="probleme" className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">🤔 {t.problemSolution.heading}</h2>
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
                  <li
                    key={pair.solution}
                    className="flex items-start gap-3 text-sm font-medium text-ink transition-colors duration-200 hover:text-primary sm:text-base"
                  >
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
      <section id="histoire" className="relative overflow-hidden border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div
          aria-hidden="true"
          className="mesh-blob-c pointer-events-none absolute -left-20 top-1/2 -z-10 h-80 w-80 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px]"
        />
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center gap-10 sm:flex-row sm:items-start">
          {/* Placeholder avatar — real founder photo not yet wired in, see
              Home.tsx task notes. Swap the icon block below for an <img>
              once the file exists in the project (e.g. public/founder.jpg). */}
          <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 hover:-translate-y-1 hover:rotate-3">
            <PersonIcon className="h-16 w-16" />
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">💡 {t.story.heading}</h2>
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
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">🎬 {t.demo.heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-muted">{t.demo.subheading}</p>
          </Reveal>

          <Reveal delayMs={80} className="mt-10">
            <div className="group relative mx-auto flex aspect-video items-center justify-center overflow-hidden rounded-3xl bg-ink transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:scale-110">
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
      <section
        id="comment-ca-marche"
        className="relative overflow-hidden border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28"
      >
        <div
          aria-hidden="true"
          className="mesh-blob-a pointer-events-none absolute right-[-10%] top-10 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[120px]"
        />
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">⚡ {t.solutionSteps.heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-center text-muted">{t.solutionSteps.subheading}</p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {t.solutionSteps.items.map((step, i) => {
              const Icon = STEP_ICONS[i]
              return (
                <Reveal key={step.title} delayMs={i * 80}>
                  <div className="h-full rounded-3xl border border-overlay/10 bg-surface p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl">
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
      <section id="tarifs" className="relative overflow-hidden border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div
          aria-hidden="true"
          className="mesh-blob-b pointer-events-none absolute left-1/2 top-0 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/8 blur-[130px]"
        />
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">💰 {tarifs.hero.title}</h2>
          <p className="mx-auto mt-3 max-w-md text-center text-muted">{tarifs.hero.subtitle}</p>
        </Reveal>
        <Reveal delayMs={80} className="mt-12">
          <PricingCards />
        </Reveal>
      </section>

      {/* 7. Preuve sociale honnête — communauté Discord, pas de témoignage
          inventé. */}
      <section
        id="communaute"
        className="relative overflow-hidden border-t border-overlay/10 px-4 py-20 text-center sm:px-6 sm:py-28"
      >
        <div
          aria-hidden="true"
          className="mesh-blob-c pointer-events-none absolute right-[-8%] bottom-[-10%] -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[110px]"
        />
        <Reveal>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 hover:-translate-y-1">
            <ChatIcon className="h-7 w-7" />
          </div>
          <h2 className="mx-auto mt-5 max-w-lg text-balance text-2xl font-bold text-ink sm:text-3xl">
            💬 {t.community.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">{t.community.body}</p>

          {DISCORD_URL ? (
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-block rounded-xl bg-primary-strong px-7 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
            >
              {t.community.discordCta}
            </a>
          ) : (
            <p className="mt-7 inline-block rounded-xl border border-dashed border-overlay/20 px-5 py-2.5 text-sm text-muted">
              {t.community.discordComingSoon}
            </p>
          )}
        </Reveal>
      </section>

      {/* 8. FAQ en accordéon — natif <details>/<summary>, pas de JS requis. */}
      <section id="faq" className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">❓ {t.faq.heading}</h2>
          </Reveal>

          <div className="mt-10 space-y-3">
            {t.faq.items.map((item, i) => (
              <Reveal key={item.question} delayMs={i * 40}>
                <details className="group rounded-2xl border border-overlay/10 px-5 py-4 transition-all duration-300 hover:border-primary/25 hover:shadow-md">
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
