import { lazy, Suspense, useEffect, useMemo, useState, type ReactElement, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HelpButton } from '../components/HelpButton'
import { AlertBanner } from '../components/AlertBanner'
import { DashboardStatCards } from '../components/DashboardStatCards'
import { DashboardScoreFactors } from '../components/DashboardScoreFactors'
import { PersonalizedTips } from '../components/PersonalizedTips'
import { PageSkeleton } from '../components/PageSkeleton'
import { TIER_ICONS, TIER_UNLOCKED_CLASS } from '../components/rewardIcons'
import { useFinancialHealth } from '../hooks/useFinancialHealth'
import { useOnboardingQuiz } from '../hooks/useOnboardingQuiz'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useInvestmentBalance } from '../hooks/useInvestmentBalance'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { useSubscription } from '../hooks/useSubscription'
import { usePreferences } from '../hooks/usePreferences'
import { useLoginStreak } from '../hooks/useLoginStreak'
import { useClaimedBadges } from '../hooks/useClaimedBadges'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { useWorkHours } from '../hooks/useWorkHours'
import { getSpendableBudgetCaption, sumThisMonth } from '../lib/budgetInsights'
import { getBudgetPaceAlert, getSavingsGoalLateAlert } from '../lib/alerts'
import { generatePersonalizedTips } from '../lib/tips'
import { STARTER_BADGE, isStarterBadgeUnlocked } from '../lib/rewards'
import { DASHBOARD } from '../lib/i18n/dashboard'

const CARD_BORDER = 'color-mix(in srgb, var(--color-overlay) 10%, transparent)'

// Recharts is sizeable — Dashboard itself stays eager (it's the first page
// most sessions land on) but the one chart on it that needs the library is
// loaded on demand, same reasoning as Budget/Statistiques being lazy pages.
const DashboardScoreChart = lazy(() =>
  import('../components/DashboardScoreChart').then((m) => ({ default: m.DashboardScoreChart })),
)

// A touch longer than the shared .badge-unlock keyframe (0.7s) so the
// animation always finishes before the class is removed — same value as
// RecompensesTab's own claim animation, kept local since it's the only
// other place this exact interaction happens.
const CLAIM_ANIMATION_MS = 900

function WalletIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A1.5 1.5 0 0 1 4.5 6h13A1.5 1.5 0 0 1 19 7.5V9h2.5A1.5 1.5 0 0 1 23 10.5v7a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 3 17.5Z" />
      <circle cx="18" cy="14" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TargetIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ChartIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h16M7 19.5v-6M12 19.5v-10M17 19.5v-4" />
    </svg>
  )
}

function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6Z" />
    </svg>
  )
}

const FEATURE_ICONS: Record<string, (props: { className: string }) => ReactElement> = {
  '/budget': WalletIcon,
  '/epargne': TargetIcon,
  '/statistiques': ChartIcon,
  '/statistiques/recompenses': StarIcon,
}

function DashboardCard({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: CARD_BORDER }}
    >
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{hint}</p>
      {children}
    </section>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const t = DASHBOARD[lang]
  const formatMoney = useMoneyFormat()
  const workHours = useWorkHours()
  const health = useFinancialHealth()
  const quiz = useOnboardingQuiz()
  const goals = useSavingsGoals()
  const contributions = useSavingsContributions()
  const investmentBalance = useInvestmentBalance()
  const expenseHistory = useExpenseHistory()
  const subscription = useSubscription()
  const preferences = usePreferences()
  const streak = useLoginStreak()
  const claimedBadges = useClaimedBadges()
  const [justClaimedStarter, setJustClaimedStarter] = useState(false)

  const loading =
    health.loading ||
    quiz.loading ||
    goals.loading ||
    contributions.loading ||
    investmentBalance.loading ||
    expenseHistory.loading
  const error =
    health.error || quiz.error || goals.error || contributions.error || investmentBalance.error || expenseHistory.error

  const starterEarned = isStarterBadgeUnlocked(health.hasIncomeRecord)
  const starterClaimed = claimedBadges.claimedIds.has(STARTER_BADGE.id)

  async function handleClaimStarter() {
    const ok = await claimedBadges.claim(STARTER_BADGE.id)
    if (!ok) return
    setJustClaimedStarter(true)
    setTimeout(() => setJustClaimedStarter(false), CLAIM_ANIMATION_MS)
  }

  const savingsThisMonth = useMemo(
    () => sumThisMonth(contributions.contributions),
    [contributions.contributions],
  )

  // What's left to spend this month, after fixed costs AND savings
  // contributions already made — matches the Budget page's calculation.
  // Kept unclamped for the caption (so an over-committed month is visible
  // and explained) and clamped for anything doing math with it (a
  // percentage or a progress bar can't sensibly work off a negative total).
  const rawSpendableBudget = health.discretionaryBudget - savingsThisMonth
  const spendableBudget = Math.max(0, rawSpendableBudget)

  // Data-driven, not a localStorage flag: a flag would be scoped to this
  // browser, not this account, and would wrongly skip onboarding for a
  // brand-new account that happens to share a browser with an old one.
  // Two things send someone back to /onboarding, not just one:
  //  - the quiz was never completed (brand-new account), or
  //  - the quiz WAS completed but account setup (income/goal/categories)
  //    never happened — most commonly someone who picked Standard/Premium,
  //    cancelled on Stripe's page before finishing the "Configure ton
  //    compte" step, and landed here with an account that exists but was
  //    never actually set up. hasIncomeRecord is the signal for that (the
  //    one field the setup step requires; see Onboarding.tsx) — same
  //    convention the old wizard used for exactly this purpose.
  // Onboarding.tsx's own initial-load check resumes directly on the right
  // step in either case, so this never replays the quiz for someone who
  // already finished it.
  // `!quiz.error`/`!health.error` matter here: if the read itself failed
  // (a real backend problem), treating that the same as "genuinely not
  // done" would redirect to /onboarding, which can't succeed any better
  // there and would just bounce back here again — an invisible loop.
  // Falling through to the normal Dashboard with the error banner below is
  // more honest about what's actually wrong.
  const needsOnboarding =
    !loading && !quiz.error && !health.error && (!quiz.completed || !health.hasIncomeRecord)

  useEffect(() => {
    if (!loading && needsOnboarding) {
      navigate('/onboarding', { replace: true })
    }
  }, [loading, needsOnboarding, navigate])

  if (loading) {
    return <PageSkeleton cards={4} />
  }

  if (needsOnboarding) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
        <div className="mb-6 flex items-center gap-2 pt-6">
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">{t.pageHeader.title}</h1>
          <HelpButton title={t.pageHeader.title} purpose={t.help.purpose} actions={t.help.actions} />
        </div>
        <div className="rounded-2xl border p-8 text-center shadow-sm" style={{ borderColor: CARD_BORDER }}>
          <h2 className="text-xl font-semibold text-ink">{t.freshUser.title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{t.freshUser.description}</p>
          <Link to="/budget" className="budget-btn-primary mt-5 inline-block rounded-lg px-5 py-2.5 font-medium transition-all">
            {t.freshUser.actionLabel}
          </Link>
        </div>
      </div>
    )
  }

  // A $0 budget with $0 spent must NOT read as "100% spent" — that's what a
  // bare `spendableBudget > 0 ? ... : 100` fallback used to do, showing a
  // full red bar on an account that hasn't spent a single dollar (any
  // account before setting income, or with savings alone eating the whole
  // budget). Only fall back to 100 when something was actually spent
  // against a budget of $0 or less — a real overspend, not an empty one.
  const budgetPct =
    spendableBudget > 0 ? (health.spentThisMonth / spendableBudget) * 100 : health.spentThisMonth > 0 ? 100 : 0
  const isOverBudget = budgetPct > 100 || rawSpendableBudget < 0

  const totalCurrentAmount = goals.goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTargetAmount = goals.goals.reduce((sum, g) => sum + g.targetAmount, 0)

  const budgetPaceAlert = getBudgetPaceAlert(
    {
      spentThisMonth: health.spentThisMonth,
      discretionaryBudget: spendableBudget,
      monthProgress: health.monthProgress,
    },
    lang,
  )
  // Only the single most urgent late goal, to keep the banner list short.
  const savingsGoalLateAlert = goals.goals
    .map((g) => getSavingsGoalLateAlert(g, lang))
    .find((alert) => alert !== null)

  const tips = generatePersonalizedTips(
    {
      expenseRecords: expenseHistory.records,
      goals: goals.goals,
      contributions: contributions.contributions,
      mainGoal: preferences.onboardingMainGoal,
    },
    lang,
    preferences.currency,
  )

  const hoursLabel = workHours(health.spentThisMonth)
  const spentCaption = (
    <>
      {getSpendableBudgetCaption(rawSpendableBudget, lang, preferences.currency)}
      {hoursLabel && <span className="ml-1">· {hoursLabel}</span>}
    </>
  )

  const savedCaption = (
    <Link to="/epargne" className="budget-action-link">
      {goals.goals.length === 0
        ? t.saved.noGoal
        : goals.goals.length === 1
          ? t.saved.oneGoal(formatMoney(totalTargetAmount))
          : t.saved.manyGoals(goals.goals.length)}
    </Link>
  )

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 pt-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">{t.pageHeader.title}</h1>
        <HelpButton title={t.pageHeader.title} purpose={t.help.purpose} actions={t.help.actions} />
      </div>

      {/* Streak + starter badge — surfaced here (not just on Récompenses,
          which nothing else points a new user toward) so day one has a
          visible, claimable win even for an account with zero real data. */}
      <div
        className={`budget-card-in hover-lift mb-6 flex flex-wrap items-center gap-4 rounded-2xl border bg-surface p-5 shadow-sm ${
          justClaimedStarter ? 'badge-unlock' : ''
        }`}
        style={{ borderColor: CARD_BORDER }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
          style={{ backgroundColor: 'rgba(255, 122, 0, 0.14)' }}
        >
          🔥
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{t.streak.days(streak.streak)}</p>
          <p className="text-sm text-muted">
            {streak.streak > 0 ? t.streak.comeBackActive : t.streak.comeBackStart}
          </p>
        </div>

        {starterEarned && (
          <div className="flex items-center gap-3 border-t border-overlay/10 pt-4 sm:ml-auto sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${
                starterClaimed || justClaimedStarter ? TIER_UNLOCKED_CLASS.starter : 'bg-overlay/5 text-muted'
              }`}
            >
              {(() => {
                const StarterIcon = TIER_ICONS.starter
                return <StarterIcon className="h-5 w-5" />
              })()}
            </div>
            {starterClaimed || justClaimedStarter ? (
              <p className="text-sm text-ink">{STARTER_BADGE.name[lang]}</p>
            ) : (
              <>
                <p className="text-sm text-ink">{t.starterBadge.unlocked(STARTER_BADGE.name[lang])}</p>
                <button type="button" onClick={handleClaimStarter} className="budget-btn-primary whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all">
                  {t.starterBadge.claim}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {subscription.limits.alerts && (budgetPaceAlert || savingsGoalLateAlert) && (
        <div className="mb-6">
          {budgetPaceAlert && <AlertBanner>{budgetPaceAlert}</AlertBanner>}
          {savingsGoalLateAlert && <AlertBanner>{savingsGoalLateAlert}</AlertBanner>}
        </div>
      )}

      <DashboardStatCards
        score={health.breakdown.score}
        trend={health.trend}
        spentThisMonth={health.spentThisMonth}
        isOverBudget={isOverBudget}
        spentCaption={spentCaption}
        totalCurrentAmount={totalCurrentAmount}
        savedCaption={savedCaption}
        accumulatedTotal={totalCurrentAmount + investmentBalance.currentAmount}
        formatMoney={formatMoney}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          <DashboardCard title={t.scoreChart.title} hint={t.scoreChart.hint}>
            <Suspense fallback={<div className="h-48 w-full animate-pulse rounded-xl bg-overlay/5" />}>
              <DashboardScoreChart history={health.history} />
            </Suspense>
          </DashboardCard>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">{t.goFurther}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {t.featureLinks.map(({ to, title, description }) => {
                const Icon = FEATURE_ICONS[to]
                return (
                  <Link
                    key={to}
                    to={to}
                    className="hover-lift flex min-w-0 items-center gap-3 rounded-2xl border bg-surface p-4 shadow-sm"
                    style={{ borderColor: CARD_BORDER }}
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ color: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.14)' }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{title}</p>
                      <p className="truncate text-xs text-muted">{description}</p>
                    </div>
                    <span className="shrink-0" style={{ color: '#FF7A00' }}>→</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <DashboardCard title={t.factors.title} hint={t.factors.hint}>
            <DashboardScoreFactors breakdown={health.breakdown} />
          </DashboardCard>

          <PersonalizedTips tips={tips} />
        </div>
      </div>
    </div>
  )
}
