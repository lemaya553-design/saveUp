import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CARD_BORDER } from './DashboardCard'
import { useCountUp } from '../hooks/useCountUp'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormatRounded } from '../hooks/useMoneyFormat'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { getGoalEncouragementTier } from '../lib/goalEncouragement'
import { hasCelebratedGoal, markGoalCelebrated } from '../lib/goalCelebration'
import { DASHBOARD } from '../lib/i18n/dashboard'
import type { SavingsGoal } from '../hooks/useSavingsGoals'

const ANIMATION_DURATION_MS = 1000
const CONFETTI_PIECES = 14
const CONFETTI_COLORS = ['#FF7A00', '#FFB347', '#CC5F00']
// Soft two-stop tint — same 92/8 mix ratio DashboardStatCards already uses
// for its own cards, just as a gradient instead of a flat fill.
const CARD_BACKGROUND = `linear-gradient(135deg, var(--color-surface), color-mix(in srgb, var(--color-surface) 92%, #FF7A00 8%))`

function TargetIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: CONFETTI_PIECES }, (_, i) => ({
        left: 4 + ((i * 97) % 92),
        delayMs: (i * 37) % 260,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 5 + (i % 3) * 2,
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-x-0 top-6 z-10 h-24 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-0 rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delayMs}ms`,
          }}
        />
      ))}
    </div>
  )
}

// Hero amount + percentage pill + progress bar — keyed by goal id from the
// parent so switching the active goal (via the pills row) remounts this,
// cleanly resetting useCountUp's internal "already animated" state instead
// of freezing on the first goal's numbers forever (useCountUp only ever
// tweens once per mount, by design — see its own comment).
function AnimatedGoalStats({
  goalId,
  currentAmount,
  targetAmount,
  tier,
}: {
  goalId: string
  currentAmount: number
  targetAmount: number
  tier: ReturnType<typeof getGoalEncouragementTier>
}) {
  const { lang } = useLanguage()
  const t = DASHBOARD[lang].goalCard
  const formatMoneyRounded = useMoneyFormatRounded()
  const reduceMotion = usePrefersReducedMotion()
  const [animateIn, setAnimateIn] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const pct = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : currentAmount > 0 ? 100 : 0
  const remaining = Math.max(0, targetAmount - currentAmount)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimateIn(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  // The "already celebrated" check AND write both live inside this effect
  // (not computed during render with a ref guard) specifically so it's safe
  // under StrictMode's dev-only mount→unmount→remount cycle: the first
  // mount's effect marks it celebrated in localStorage; the remount's effect
  // reads that same flag back and correctly skips firing twice.
  useEffect(() => {
    if (tier !== 'done' || reduceMotion || hasCelebratedGoal(goalId)) return
    markGoalCelebrated(goalId)
    setShowConfetti(true)
    const timeout = setTimeout(() => setShowConfetti(false), 1000)
    return () => clearTimeout(timeout)
  }, [tier, goalId, reduceMotion])

  const animatedAmount = useCountUp(Math.round(currentAmount), animateIn, ANIMATION_DURATION_MS)
  const animatedPct = useCountUp(Math.round(pct), animateIn, ANIMATION_DURATION_MS)

  return (
    <div className="relative">
      {showConfetti && <ConfettiBurst />}

      <div className="flex flex-wrap items-baseline gap-3">
        <p className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {formatMoneyRounded(animatedAmount)}
        </p>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: '#FF7A00' }}
        >
          {animatedPct} %
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">{t.outOf(formatMoneyRounded(targetAmount))}</p>

      <div
        className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-overlay/10"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${Math.round(pct)}% — ${formatMoneyRounded(currentAmount)} ${t.outOf(formatMoneyRounded(targetAmount))}`}
      >
        {/* Width driven by the same eased useCountUp value as the percentage
            pill above (animatedPct), not a separate CSS transition — the
            number and the bar are visibly the same animation, not two
            independently-timed ones that could drift apart. */}
        <div
          className="h-full rounded-full"
          style={{
            width: `${animatedPct}%`,
            backgroundImage: 'linear-gradient(90deg, #FFB347, #FF7A00)',
          }}
        />
      </div>

      <p className="mt-2.5 text-sm font-medium text-ink">{DASHBOARD[lang].goalCard.encouragement[tier]}</p>
      <p className="mt-0.5 text-xs text-muted">{remaining > 0 ? t.remaining(formatMoneyRounded(remaining)) : t.goalReached}</p>
    </div>
  )
}

export function DashboardGoalCard({ goals }: { goals: SavingsGoal[] }) {
  const { lang } = useLanguage()
  const t = DASHBOARD[lang].goalCard
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)

  // Most-advanced-first — an exactly-100% goal naturally surfaces first
  // (a nice "you just hit this" moment), ties broken by creation order
  // (goals arrives already sorted oldest-first from useSavingsGoals).
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      const pctA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : a.currentAmount > 0 ? 1 : 0
      const pctB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : b.currentAmount > 0 ? 1 : 0
      return pctB - pctA
    })
  }, [goals])

  if (goals.length === 0) {
    return (
      <div
        className="hover-lift mb-6 min-w-0 rounded-2xl border p-5 text-center shadow-sm sm:p-6"
        style={{ borderColor: CARD_BORDER, background: CARD_BACKGROUND }}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{t.eyebrow}</p>
        <div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-full text-3xl" style={{ backgroundColor: 'rgba(255, 122, 0, 0.14)' }}>
          🎯
        </div>
        <h2 className="mt-3 text-xl font-bold text-ink">{t.empty.title}</h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">{t.empty.description}</p>
        <Link
          to="/epargne/objectifs"
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-lg px-6 py-2.5 font-medium text-white transition-all hover:brightness-110"
          style={{ backgroundColor: '#FF7A00' }}
        >
          {t.empty.actionLabel}
        </Link>
      </div>
    )
  }

  const mainGoal = sortedGoals[0]
  const activeGoal = goals.find((g) => g.id === selectedGoalId) ?? mainGoal

  const pct =
    activeGoal.targetAmount > 0
      ? Math.min(100, (activeGoal.currentAmount / activeGoal.targetAmount) * 100)
      : activeGoal.currentAmount > 0
        ? 100
        : 0
  const tier = getGoalEncouragementTier(pct)

  return (
    <div
      className="hover-lift mb-6 min-w-0 overflow-hidden rounded-2xl border shadow-sm"
      style={{ borderColor: CARD_BORDER, background: CARD_BACKGROUND }}
    >
      <Link
        to="/epargne/objectifs"
        className="block p-5 transition-transform active:scale-[0.98] sm:p-6"
        aria-label={`${t.eyebrow}: ${activeGoal.name} — ${t.viewDetail}`}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{t.eyebrow}</p>

        <div className="mt-1.5 flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ color: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.14)' }}
          >
            <TargetIcon className="h-5 w-5" />
          </span>
          <h2 className="truncate text-lg font-bold text-ink sm:text-xl">{activeGoal.name}</h2>
        </div>

        <div className="mt-4">
          <AnimatedGoalStats
            key={activeGoal.id}
            goalId={activeGoal.id}
            currentAmount={activeGoal.currentAmount}
            targetAmount={activeGoal.targetAmount}
            tier={tier}
          />
        </div>

        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: '#FF7A00' }}>
          {t.viewDetail}
          <span aria-hidden="true">→</span>
        </span>
      </Link>

      {sortedGoals.length > 1 && (
        <div className="flex flex-wrap gap-2 px-5 pb-5 sm:px-6 sm:pb-6">
          {sortedGoals.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGoalId(g.id)}
              aria-pressed={g.id === activeGoal.id}
              className={`flex min-h-[44px] max-w-[9rem] items-center truncate rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                g.id === activeGoal.id ? 'border-transparent text-white' : 'border-overlay/15 text-muted hover:text-ink'
              }`}
              style={g.id === activeGoal.id ? { backgroundColor: '#FF7A00' } : undefined}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
