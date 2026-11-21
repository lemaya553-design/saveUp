import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HelpButton } from '../components/HelpButton'
import { AlertBanner } from '../components/AlertBanner'
import { DashboardCard, CARD_BORDER } from '../components/DashboardCard'
import { DashboardGoalCard } from '../components/DashboardGoalCard'
import { NeedsLimitCard } from '../components/NeedsLimitCard'
import { SubscriptionsFoundCard } from '../components/SubscriptionsFoundCard'
import { DashboardFeedbackPrompt } from '../components/DashboardFeedbackPrompt'
import { GettingStartedGuide } from '../components/GettingStartedGuide'
import { WelcomeTutorial } from '../components/WelcomeTutorial'
import { DashboardStatCards } from '../components/DashboardStatCards'
import { DashboardScoreFactors } from '../components/DashboardScoreFactors'
import { PersonalizedTips } from '../components/PersonalizedTips'
import { PageSkeleton } from '../components/PageSkeleton'
import { useFinancialHealth } from '../hooks/useFinancialHealth'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSavingsContributions } from '../hooks/useSavingsContributions'
import { useInvestmentBalance } from '../hooks/useInvestmentBalance'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { useSubscription } from '../hooks/useSubscription'
import { usePreferences } from '../hooks/usePreferences'
import { useAuth } from '../hooks/useAuth'
import { useGuestMode } from '../hooks/useGuestMode'
import { useLoginStreak } from '../hooks/useLoginStreak'
import { useClaimedBadges } from '../hooks/useClaimedBadges'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { useWorkHours } from '../hooks/useWorkHours'
import { getSpendableBudgetCaption, sumThisMonth } from '../lib/budgetInsights'
import { getBudgetPaceAlert, getSavingsGoalLateAlert } from '../lib/alerts'
import { generatePersonalizedTips } from '../lib/tips'
import { BADGES } from '../lib/badges'
import { hasViewedStats, markStatsViewed } from '../lib/gettingStarted'
import { hasSeenWelcomeTutorial } from '../lib/welcomeTutorial'
import { consumePendingGuestGoal } from '../lib/guestStore'
import { DASHBOARD } from '../lib/i18n/dashboard'

// Recharts is sizeable — Dashboard itself stays eager (it's the first page
// most sessions land on) but the one chart on it that needs the library is
// loaded on demand, same reasoning as Budget/Statistiques being lazy pages.
const DashboardScoreChart = lazy(() =>
  import('../components/DashboardScoreChart').then((m) => ({ default: m.DashboardScoreChart })),
)

// Same reasoning: xlsx parsing + the full import flow (ImportParsing.ts,
// category-matching, dedup) is real weight that every Dashboard visit
// would otherwise pay for, even the vast majority who never click "Importer
// un fichier" from the getting-started guide. Already lazy on Budget.tsx —
// matched here rather than left eager just because this is a new usage.
const ImportTransactionsModal = lazy(() =>
  import('../components/ImportTransactionsModal').then((m) => ({ default: m.ImportTransactionsModal })),
)

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

export function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const guest = useGuestMode()
  const { lang } = useLanguage()
  const t = DASHBOARD[lang]
  const formatMoney = useMoneyFormat()
  const workHours = useWorkHours()
  const health = useFinancialHealth()
  const goals = useSavingsGoals()
  const contributions = useSavingsContributions()
  const investmentBalance = useInvestmentBalance()
  const expenseHistory = useExpenseHistory()
  const fixed = useFixedExpenses()
  const subscription = useSubscription()
  const preferences = usePreferences()
  const streak = useLoginStreak()
  const claimedBadges = useClaimedBadges()
  const [importOpen, setImportOpen] = useState(false)
  // Lazy initializer so this only ever reads localStorage once, not on
  // every render — same convention as useLanguage's initial-state read.
  const [viewedStats, setViewedStats] = useState(() => (user ? hasViewedStats(user.id) : false))

  const loading =
    health.loading ||
    goals.loading ||
    contributions.loading ||
    investmentBalance.loading ||
    expenseHistory.loading ||
    preferences.loading ||
    fixed.loading
  const error =
    health.error ||
    goals.error ||
    contributions.error ||
    investmentBalance.error ||
    expenseHistory.error ||
    fixed.error ||
    preferences.error

  const starterDef = BADGES.find((def) => def.id === 'starter')
  const starterClaimed = claimedBadges.claimedIds.has('starter')

  function handleViewStatsClick() {
    if (!user) return
    markStatsViewed(user.id)
    setViewedStats(true)
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
  // onboardingCompletedAt is set once, at the end of Onboarding.tsx's 10
  // questions (before the plan-selection step, which is never required to
  // reach the app) — so an account that abandons on the plan screen still
  // counts as onboarded next time it lands here. Existing accounts that
  // finished the OLD onboarding (pre-dating this column) were backfilled by
  // this feature's migration, so they're never sent through it again; only
  // accounts that truly never onboarded see it.
  // `!preferences.error`/`!health.error` matter here: if the read itself
  // failed (a real backend problem), treating that the same as "genuinely
  // not done" would redirect to /onboarding, which can't succeed any better
  // there and would just bounce back here again — an invisible loop.
  // Falling through to the normal Dashboard with the error banner below is
  // more honest about what's actually wrong.
  // A guest never goes through onboarding (there's no account to attach the
  // result to) — the sample data already has an income and a goal, so
  // there's nothing "unfinished" to send them off to set up.
  const needsOnboarding =
    !guest.active && !loading && !preferences.error && !health.error && !preferences.onboardingCompletedAt

  useEffect(() => {
    if (loading) return
    if (needsOnboarding) {
      navigate('/onboarding', { replace: true })
    }
  }, [loading, needsOnboarding, navigate])

  // Connexion.tsx queues this when a guest who tried the sample goal signs
  // up for real (see lib/guestStore.ts) — picked up here, once, on the
  // first real Dashboard load after that. Only adopts it into a genuinely
  // empty account (never overwrites/duplicates goals the person already
  // created some other way, e.g. finishing onboarding before this effect
  // got a chance to run). A missing/failed migration just leaves the new
  // account with no goal — same as any other fresh signup, never an error.
  // `guestGoalMigrationChecked` only flips true once this has fully
  // settled (including the async addGoal, if any) — the welcome tutorial
  // effect below waits on it so it never flashes open for someone whose
  // migrated goal just hasn't landed yet.
  const migratedGuestGoal = useRef(false)
  const [guestGoalMigrationChecked, setGuestGoalMigrationChecked] = useState(false)
  useEffect(() => {
    if (!user || guest.active || loading || goals.loading || migratedGuestGoal.current) return
    migratedGuestGoal.current = true
    if (goals.goals.length > 0) {
      setGuestGoalMigrationChecked(true)
      return
    }
    const pending = consumePendingGuestGoal()
    if (!pending) {
      setGuestGoalMigrationChecked(true)
      return
    }
    goals.addGoal(pending.name, pending.targetAmount, pending.targetDate).finally(() => setGuestGoalMigrationChecked(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, guest.active, loading, goals.loading, goals.goals.length])

  // Brand-new-user-in-3-steps explainer (choose a goal -> set an amount ->
  // watch the bar fill) — shown once per account, only when there's truly
  // no goal yet (covers both a fresh signup where onboarding's optional
  // goal field was left empty, and any older account that never had one).
  // Guests always start with a seeded sample goal, so this never fires for
  // them. Gated on guestGoalMigrationChecked so it can't flash open while
  // a migrated guest goal is still in flight.
  const [welcomeTutorialOpen, setWelcomeTutorialOpen] = useState(false)
  useEffect(() => {
    if (!user || guest.active || loading || !guestGoalMigrationChecked) return
    if (goals.goals.length > 0) return
    if (hasSeenWelcomeTutorial(user.id)) return
    setWelcomeTutorialOpen(true)
  }, [user, guest.active, loading, guestGoalMigrationChecked, goals.goals.length])

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
    <div className="page-halo mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-6 pt-6">
        <div className="flex items-center gap-2">
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">{t.pageHeader.title}</h1>
          <HelpButton title={t.pageHeader.title} purpose={t.help.purpose} actions={t.help.actions} />
          <DashboardFeedbackPrompt />
        </div>
        {/* Onboarding Q9 ("how are you feeling about money?") tilts this one
            line more reassuring when the answer was "stressed" — every other
            answer gets no extra line here, just the cards below. */}
        {preferences.financialMood === 'stresse' && (
          <p className="mt-1 text-sm text-muted">{t.pageHeader.reassuranceStressed}</p>
        )}
      </div>

      <DashboardGoalCard goals={goals.goals} onAddContribution={goals.addContribution} />

      {/* Streak + starter badge — surfaced here (not just on Récompenses,
          which nothing else points a new user toward) so day one shows a
          visible win even for an account with zero real data. Claiming
          itself now happens automatically the instant it's earned (see
          BadgeUnlockWatcher, mounted in Layout, which also plays the
          full-screen celebration) — this is just a quiet "you have this"
          confirmation, no button. */}
      <div
        className="budget-card-in hover-lift mb-6 flex flex-wrap items-center gap-4 rounded-2xl border bg-surface p-5 shadow-sm"
        style={{ borderColor: CARD_BORDER }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
          style={{ backgroundColor: 'rgba(74, 108, 247, 0.14)' }}
        >
          🔥
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{t.streak.days(streak.streak)}</p>
          <p className="text-sm text-muted">
            {streak.streak > 0 ? t.streak.comeBackActive : t.streak.comeBackStart}
          </p>
        </div>

        {starterClaimed && starterDef && (
          <div className="flex items-center gap-3 border-t border-overlay/10 pt-4 sm:ml-auto sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <starterDef.icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-ink">{starterDef.name[lang]}</p>
          </div>
        )}
      </div>

      <GettingStartedGuide
        hasGoal={goals.goals.length > 0}
        hasData={expenseHistory.records.length > 0}
        viewedStats={viewedStats}
        onImportClick={() => setImportOpen(true)}
        onViewStatsClick={handleViewStatsClick}
      />

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

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <NeedsLimitCard
          userId={user?.id ?? 'guest'}
          monthlyIncome={health.monthlyIncome}
          hasIncomeRecord={health.hasIncomeRecord}
          onSetIncome={health.setMonthlyIncome}
          fixedExpenses={fixed.fixedExpenses}
          expenseRecords={expenseHistory.records}
        />
        <SubscriptionsFoundCard records={expenseHistory.records} />
      </div>

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
                      style={{ color: '#4A6CF7', backgroundColor: 'rgba(74, 108, 247, 0.14)' }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{title}</p>
                      <p className="truncate text-xs text-muted">{description}</p>
                    </div>
                    <span className="shrink-0" style={{ color: '#4A6CF7' }}>→</span>
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

      <Suspense fallback={null}>
        <ImportTransactionsModal open={importOpen} onClose={() => setImportOpen(false)} />
      </Suspense>

      {user && (
        <WelcomeTutorial
          open={welcomeTutorialOpen}
          userId={user.id}
          onClose={() => setWelcomeTutorialOpen(false)}
          onCreateGoal={async (name, targetAmount) => {
            await goals.addGoal(name, targetAmount, null)
          }}
        />
      )}
    </div>
  )
}
