import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LandingHeader } from '../components/LandingHeader'
import { Footer } from '../components/Footer'
import { Reveal } from '../components/Reveal'
import { MetaTags } from '../components/MetaTags'
import { PricingCards } from '../components/PricingCards'
import { TestimonialCarousel } from '../components/TestimonialCarousel'
import { useLanguage } from '../hooks/useLanguage'
import { HOME } from '../lib/i18n/home'
import { TARIFS } from '../lib/i18n/tarifs'
import { COMMON } from '../lib/i18n/common'

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

function BadgeCheckIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.2 1.3 2.5-.3 1 2.3 2.3 1-.3 2.5L21 12l-1.3 2.2.3 2.5-2.3 1-1 2.3-2.5-.3L12 21l-2.2-1.3-2.5.3-1-2.3-2.3-1 .3-2.5L3 12l1.3-2.2-.3-2.5 2.3-1 1-2.3 2.5.3L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.5l2 2 4-4.5" />
    </svg>
  )
}

// Keyed to HomeContent['hero']['floatingCards'][number]['icon'].
const FLOATING_CARD_ICONS = {
  goal: GoalIcon,
  trend: TrendIcon,
  import: ImportIcon,
  budget: BudgetIcon,
}

// Positions for the 4 floating cards around the hero content, large screens
// only (lg:). Below lg they render inline as a static 2x2 grid instead (see
// JSX). Varied rotation/offset/size per card on purpose — four identical
// boxes at uniform angles read as a grid, not a scatter of real
// notifications.
const FLOATING_CARD_STYLES = [
  { position: 'left-0 top-2 -rotate-6', size: 'text-base px-5 py-3.5' },
  { position: 'right-2 top-20 rotate-3', size: 'text-xs px-3.5 py-2.5' },
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

// Counts 1 -> target on mount, then repeats every `cycleMs` in sync with
// the `.label-loop` CSS animation (same 10s cadence) so the number re-ticks
// right as its label fades back in. Skips the animation under
// prefers-reduced-motion — jumps straight to the final value instead.
function useLoopingCountUp(target: number, cycleMs = 10000, durationMs = 1300) {
  const [value, setValue] = useState(1)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }

    let rafId = 0

    function animateUp() {
      const start = performance.now()
      const step = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1)
        const eased = 1 - (1 - progress) ** 3
        setValue(Math.max(1, Math.round(eased * target)))
        if (progress < 1) rafId = requestAnimationFrame(step)
      }
      rafId = requestAnimationFrame(step)
    }

    animateUp()
    const interval = setInterval(animateUp, cycleMs)
    return () => {
      cancelAnimationFrame(rafId)
      clearInterval(interval)
    }
  }, [target, cycleMs, durationMs])

  return value
}

const FLOATING_LABEL_ICONS = {
  goal: GoalIcon,
  trend: TrendIcon,
  badge: BadgeCheckIcon,
  budget: BudgetIcon,
}

// Positioned relative to the phone's own wrapper (not the section) so
// "close to the phone" stays true regardless of the cards beside it.
// Offsets are large enough (~220-230px) to clear the phone's own screen
// content entirely — a first pass at ~65-80px overlapped straight onto the
// screenshot itself, covering real content, which measuring/screenshotting
// caught. Top/bottom values dodge the notification pill above and the CTA
// button below.
const FLOATING_LABEL_STYLES = [
  'pointer-events-auto absolute -left-[230px] top-20 -rotate-4',
  'pointer-events-auto absolute -right-[220px] top-44 rotate-3',
  'pointer-events-auto absolute -left-[220px] bottom-32 rotate-4',
  'pointer-events-auto absolute -right-[230px] bottom-16 -rotate-3',
]

function FloatingLabel({
  icon,
  children,
  className = '',
  delayS = 0,
}: {
  icon: keyof typeof FLOATING_LABEL_ICONS
  children: ReactNode
  className?: string
  delayS?: number
}) {
  const Icon = FLOATING_LABEL_ICONS[icon]
  return (
    <div
      className={`label-loop flex items-center gap-2.5 rounded-full bg-white px-5 py-3 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] ${className}`}
      style={{ animationDelay: `${delayS}s` }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="whitespace-nowrap text-sm font-semibold text-ink">{children}</span>
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
  const header = COMMON[lang].header
  const goalCount = useLoopingCountUp(t.showcase.floatingLabels.goal.amount)

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
        </Reveal>

        {/* Floating cards — large screens only, absolutely positioned
            around the hero content. Only the top 2 (of the original 4) —
            the bottom 2 plus the search-bar CTA were removed (see the task
            that trimmed this): they sat low enough in this section to
            visually crowd the showcase section's phone mockup right below,
            reading as clutter rather than two distinct sections. */}
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

        {/* Same cards, static row below lg. */}
        <Reveal delayMs={160} className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3 lg:hidden">
          {t.hero.floatingCards.map((card) => (
            <FloatingCard key={card.text} icon={card.icon} text={card.text} className="text-left" />
          ))}
        </Reveal>
      </section>

      {/* 2. Témoignages — real customer reviews (lib/testimonials.ts), used
          with permission. Auto-scrolling marquee, no nav controls. Shown
          again near the bottom (section 10) — same 5 reviews both times,
          repeating is expected per the task that added this. */}
      <section className="border-t border-overlay/10 py-16 sm:py-20">
        <Reveal>
          <h2 className="px-4 text-center text-2xl font-bold text-ink sm:px-6 sm:text-3xl">
            ⭐ {t.testimonials.heading}
          </h2>
        </Reveal>
        <Reveal delayMs={80} className="mt-10">
          <TestimonialCarousel />
        </Reveal>
      </section>

      {/* 3. Problème / Solution */}
      <section id="probleme" className="border-t border-overlay/10 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">🤔 {t.problemSolution.heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-center text-muted">{t.problemSolution.subheading}</p>
          </Reveal>
        </div>

        {/* Each column as its own card — thin dark outline + pale-gray
            background with a soft blurred blob inside (contained by
            overflow-hidden) so the content reads as sitting on a distinct
            surface rather than floating on the page's plain white. */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
          <Reveal
            delayMs={60}
            className="relative overflow-hidden rounded-2xl border border-ink/20 bg-[#FAFAFA] p-8 sm:p-10"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-ink/[0.04] blur-3xl"
            />
            <h3 className="relative text-sm font-semibold uppercase tracking-wide text-muted">
              {lang === 'fr' ? 'Avant' : 'Before'}
            </h3>
            <ul className="relative mt-5 space-y-4">
              {t.problemSolution.pairs.map((pair) => (
                <li key={pair.problem} className="flex items-start gap-3 text-sm text-muted sm:text-base">
                  <CrossIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  {pair.problem}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delayMs={120}
            className="relative overflow-hidden rounded-2xl border border-ink/20 bg-[#FAFAFA] p-8 sm:p-10"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/[0.07] blur-3xl"
            />
            <h3 className="relative text-sm font-semibold uppercase tracking-wide text-primary">
              {lang === 'fr' ? 'Avec SaveUp' : 'With SaveUp'}
            </h3>
            <ul className="relative mt-5 space-y-4">
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
      </section>

      {/* 4. Showcase — realistic iPhone-style mockup (gradient metal edge,
          inner bezel ring, dynamic island, side buttons, diagonal glass
          reflection) showing a real Statistiques screenshot whose own
          aspect ratio (790x1628) is already near-identical to a real
          phone's, so object-cover shows virtually the whole thing with no
          meaningful crop — none of the previous dashboard.png's
          letterbox/crop trade-off applies here. Tilted in CSS 3D
          (perspective + rotateY/rotateX). A floating iOS-style
          notification peeks above it; 4 bigger floating labels hug its
          left/right edges (positioned relative to the phone itself, clear
          of the cards vertically); the 2 narrative cards sit at
          deliberately uneven heights for a less grid-like, more organic
          composition. Pure white, no background shapes, nothing else
          around the phone — deliberately the one section on this page
          without a blob, per this section's own brief. */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAFAFA] to-white px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
        {/* Very faint orange glow for depth — static (no drift animation
            like other sections' blobs), kept at 2-3% opacity specifically
            so it reads as "a little depth," not a distraction. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_30%,rgba(255,107,0,0.03),transparent_70%)]"
        />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-14">
          <Reveal
            delayMs={60}
            className="order-2 w-full max-w-[320px] rounded-2xl bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_24px_rgba(0,0,0,0.08)] sm:p-10 lg:order-1 lg:-translate-y-7"
          >
            <h3 className="text-[26px] font-extrabold leading-snug text-ink">
              {t.showcase.cardLeft.before}
              <span className="text-primary">{t.showcase.cardLeft.highlight}</span>
              {t.showcase.cardLeft.after}
            </h3>
            <p className="mt-3 font-normal text-[#666]">{t.showcase.cardLeft.body}</p>
          </Reveal>

          <Reveal className="relative z-10 order-1 w-[280px] shrink-0 sm:w-[320px] lg:order-2">
            {/* iOS-style floating notification — true pill shape, crisp-but-
                soft layered shadow, text centered both axes. */}
            <div className="absolute -top-5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center justify-center whitespace-nowrap rounded-full bg-white px-5 py-3 shadow-[0_2px_6px_rgba(0,0,0,0.08),0_10px_20px_-4px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04]">
              <span className="text-sm font-semibold leading-none text-ink">{t.showcase.notification}</span>
            </div>

            {/* Scattered floating labels — hug the phone's own edges
                (large screens only — the cards sit right beside the phone
                below lg, leaving no room). The "goal" one counts 1 ->
                amount on a continuous 10s loop. */}
            <div className="pointer-events-none absolute inset-0 z-30 hidden lg:block">
              <FloatingLabel icon="goal" className={FLOATING_LABEL_STYLES[0]} delayS={0}>
                {t.showcase.floatingLabels.goal.before}
                {goalCount}
                {t.showcase.floatingLabels.goal.after}
              </FloatingLabel>
              {t.showcase.floatingLabels.items.map((label, i) => (
                <FloatingLabel
                  key={label.text}
                  icon={label.icon}
                  className={FLOATING_LABEL_STYLES[i + 1]}
                  delayS={(i + 1) * 0.6}
                >
                  {label.text}
                </FloatingLabel>
              ))}
            </div>

            <div
              className="relative [transform:perspective(1200px)_rotateY(-10deg)_rotateX(3deg)]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Side buttons — mute switch + volume rocker (left), power
                  button (right), matching real iPhone placement. */}
              <div className="absolute -left-[3px] top-[14%] h-9 w-[3px] rounded-l-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />
              <div className="absolute -left-[3px] top-[22%] h-14 w-[3px] rounded-l-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />
              <div className="absolute -left-[3px] top-[32%] h-14 w-[3px] rounded-l-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />
              <div className="absolute -right-[3px] top-[20%] h-20 w-[3px] rounded-r-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />

              {/* Outer "metal" edge. */}
              <div className="rounded-[2.75rem] bg-gradient-to-br from-[#46464c] via-[#1d1d20] to-[#08080a] p-[3px] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.25),0_40px_80px_-20px_rgba(0,0,0,0.35)]">
                {/* Inner bezel ring. */}
                <div className="rounded-[2.6rem] bg-black p-[7px]">
                  <div className="relative aspect-[790/1628] overflow-hidden rounded-[2.2rem] bg-[#0b0b12]">
                    <img
                      src="/screenshots/phone-mockup.jpg"
                      alt={t.showcase.phoneAlt}
                      className="h-full w-full object-cover object-top"
                    />
                    {/* Dynamic island. */}
                    <div className="absolute left-1/2 top-[2.2%] z-20 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
                    {/* Diagonal glass reflection. */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.12] via-white/[0.02] to-transparent" />
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="mt-7 block rounded-xl bg-primary-strong px-6 py-3 text-center font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
            >
              {header.ctaStart}
            </Link>
          </Reveal>

          <Reveal
            delayMs={120}
            className="order-3 w-full max-w-[320px] rounded-2xl bg-white p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_24px_rgba(0,0,0,0.08)] sm:p-10 lg:translate-y-7"
          >
            <h3 className="text-[26px] font-extrabold leading-snug text-ink">
              {t.showcase.cardRight.before}
              <span className="text-primary">{t.showcase.cardRight.highlight}</span>
              {t.showcase.cardRight.after}
            </h3>
            <p className="mt-3 font-normal text-[#666]">{t.showcase.cardRight.body}</p>
          </Reveal>
        </div>
      </section>

      {/* 5. Storytelling — black section (the rest of the page is white),
          with the same "blurred glow + diagonal glass sheen" texture
          technique used on the phone mockup's dark screen. Text switches to
          explicit white/opacity shades here since the shared ink/muted
          tokens are tuned for light backgrounds everywhere else on this
          page. */}
      <section id="histoire" className="relative overflow-hidden bg-[#0a0a0c] px-4 py-28 sm:px-6 sm:py-40">
        <div
          aria-hidden="true"
          className="mesh-blob-c pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-primary/15 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="mesh-blob-b pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent"
        />
        <Reveal className="relative mx-auto flex max-w-4xl flex-col items-center gap-10 sm:flex-row sm:items-start">
          <img
            src="/founder.jpg"
            alt={t.story.photoAlt}
            className="h-36 w-36 shrink-0 rounded-full object-cover shadow-lg shadow-black/40 ring-4 ring-white/10 transition-transform duration-300 hover:-translate-y-1 hover:rotate-3"
          />

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">💡 {t.story.heading}</h2>
            <div className="mt-5 space-y-4 text-white/70">
              {t.story.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-5 font-semibold text-white">
              {t.story.founderName}
              <span className="font-normal text-white/60"> — {t.story.founderRole}</span>
            </p>
          </div>
        </Reveal>
      </section>

      {/* 6. Solution en 3 étapes — black-background + blurred-texture
          treatment matching the Storytelling section ("Pourquoi SaveUp"),
          two-column title/numbered-list + phone-mockup layout, big orange
          numerals instead of icon badges. Reuses t.actionSteps.mockup for
          the illustrative phone content (import CSV / recategorize) —
          there used to be a second, near-duplicate white-background
          section built from the same content right above this one; it was
          removed as redundant, this is now the only "how it works" phone
          mockup section on the page. */}
      <section id="comment-ca-marche" className="relative overflow-hidden bg-[#0a0a0c] px-4 py-20 sm:px-6 sm:py-28">
        <div
          aria-hidden="true"
          className="mesh-blob-a pointer-events-none absolute right-[-10%] top-10 -z-10 h-96 w-96 rounded-full bg-primary/15 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="mesh-blob-c pointer-events-none absolute -left-20 bottom-0 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent"
        />

        <div className="relative mx-auto grid max-w-5xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">⚡ {t.solutionSteps.heading}</h2>
            <p className="mt-3 max-w-md text-white/70">{t.solutionSteps.subheading}</p>

            <ol className="mt-9 space-y-7">
              {t.solutionSteps.items.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span className="shrink-0 text-4xl font-extrabold leading-none text-primary">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm text-white/60">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delayMs={100} className="mx-auto w-[260px] sm:w-[300px]">
            <div
              className="relative [transform:perspective(1200px)_rotateY(9deg)_rotateX(3deg)]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute -left-[3px] top-[14%] h-9 w-[3px] rounded-l-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />
              <div className="absolute -left-[3px] top-[22%] h-14 w-[3px] rounded-l-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />
              <div className="absolute -left-[3px] top-[32%] h-14 w-[3px] rounded-l-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />
              <div className="absolute -right-[3px] top-[20%] h-20 w-[3px] rounded-r-sm bg-gradient-to-b from-[#45454a] to-[#19191c]" />

              <div className="rounded-[2.75rem] bg-gradient-to-br from-[#46464c] via-[#1d1d20] to-[#08080a] p-[3px] shadow-[0_15px_35px_-15px_rgba(0,0,0,0.25),0_40px_80px_-20px_rgba(0,0,0,0.35)]">
                <div className="rounded-[2.6rem] bg-black p-[7px]">
                  <div className="relative aspect-[9/19] overflow-hidden rounded-[2.2rem] bg-[#0b0b12] px-5 pb-6 pt-11">
                    <div className="absolute left-1/2 top-[10px] z-20 h-[20px] w-[78px] -translate-x-1/2 rounded-full bg-black" />

                    <p className="flex items-center gap-2 text-sm font-semibold text-white">
                      <ImportIcon className="h-4 w-4 shrink-0 text-primary" />
                      {t.actionSteps.mockup.importLabel}
                    </p>

                    <div className="mt-6 space-y-2.5">
                      {t.actionSteps.mockup.transactions.map((tx) => (
                        <div
                          key={tx.label}
                          className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-3"
                        >
                          <span className="text-xs text-white/70">{tx.label}</span>
                          <span className="text-xs font-semibold text-white">{tx.amount}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-xl bg-primary py-3 text-center text-xs font-semibold text-white">
                      {t.actionSteps.mockup.recategorizeLabel}
                    </div>

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.1] via-white/[0.02] to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. Tarifs — real plans/prices/features, same component and data as
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

      {/* 8. Preuve sociale honnête — communauté Discord, pas de témoignage
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

      {/* 9. Témoignages — same carousel and same 5 real reviews as
          section 2, repeated near the bottom of the page on purpose. */}
      <section className="border-t border-overlay/10 py-16 sm:py-20">
        <Reveal>
          <h2 className="px-4 text-center text-2xl font-bold text-ink sm:px-6 sm:text-3xl">
            ⭐ {t.testimonials.heading}
          </h2>
        </Reveal>
        <Reveal delayMs={80} className="mt-10">
          <TestimonialCarousel />
        </Reveal>
      </section>

      {/* 10. FAQ en accordéon — natif <details>/<summary>, pas de JS requis. */}
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
