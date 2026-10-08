import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { computeCurrentPayPeriod, computeRequiredPerPayPeriod } from '../lib/payPeriod'
import { WEEKS_PER_MONTH } from '../lib/format'
import { BUDGET } from '../lib/i18n/budget'
import type { PayFrequency } from '../lib/onboardingQuiz'
import type { SavingsGoal } from '../hooks/useSavingsGoals'

const CARD_BORDER = 'color-mix(in srgb, var(--color-overlay) 10%, transparent)'
const DAY_MS = 24 * 60 * 60 * 1000

function CalendarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path strokeLinecap="round" d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  )
}

function CardShell({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
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

export function BudgetPayPeriodCard({
  payFrequency,
  nextPayday,
  records,
  spendableBudget,
  goals,
}: {
  payFrequency: PayFrequency | null
  nextPayday: string | null
  records: { amount: number; spent_at: string }[]
  // Monthly spendable budget (income − fixed − upcoming recurring − this
  // month's savings, floored at 0) — same figure Budget.tsx's weekly card
  // divides by WEEKS_PER_MONTH; this card prorates it the same way, just
  // scaled to the pay period's actual length instead of a fixed week.
  spendableBudget: number
  goals: SavingsGoal[]
}) {
  const { lang } = useLanguage()
  const t = BUDGET[lang].payPeriodCard
  const formatMoney = useMoneyFormat()

  if (!payFrequency || !nextPayday) {
    return (
      <CardShell title={t.title} hint={t.hint}>
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ color: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.15)' }}
          >
            <CalendarIcon className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-ink">{t.emptyTitle}</p>
          <p className="max-w-[22rem] text-xs text-muted">{t.emptyDescription}</p>
          <Link
            to="/parametres/preferences"
            className="mt-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
            style={{ backgroundColor: '#FF7A00' }}
          >
            {t.emptyCta}
          </Link>
        </div>
      </CardShell>
    )
  }

  const now = new Date()
  const period = computeCurrentPayPeriod(payFrequency, nextPayday, now)

  const periodLengthDays = Math.round((period.periodEnd.getTime() - period.periodStart.getTime()) / DAY_MS)
  const periodBudget = (spendableBudget / WEEKS_PER_MONTH) * (periodLengthDays / 7)

  // Compared against `now` (the real current instant), not a midnight
  // cutoff — periodStart is always midnight-aligned, but today's own
  // expenses carry today's real time-of-day, which a `<= startOfToday`
  // check would wrongly exclude every single time.
  const spentInPeriod = records
    .filter((r) => {
      const d = new Date(r.spent_at)
      return d >= period.periodStart && d <= now
    })
    .reduce((sum, r) => sum + r.amount, 0)
  const remainingInPeriod = periodBudget - spentInPeriod
  const isOverBudget = remainingInPeriod < 0
  const spentPct = periodBudget > 0 ? (spentInPeriod / periodBudget) * 100 : spentInPeriod > 0 ? 100 : 0

  const dateLocale = lang === 'fr' ? 'fr-CA' : 'en-CA'
  const formatShortDate = (date: Date) => date.toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })

  const setAsideEntries = goals
    .map((goal) => {
      if (!goal.targetDate) return null
      const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount)
      if (remainingAmount <= 0) return null
      const required = computeRequiredPerPayPeriod(remainingAmount, goal.targetDate, payFrequency, nextPayday, now)
      if (!required) return null
      return {
        id: goal.id,
        name: goal.name,
        perPeriod: required.perPeriod,
        targetDateLabel: new Date(`${goal.targetDate}T00:00:00`).toLocaleDateString(dateLocale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  return (
    <CardShell title={t.title} hint={t.hint}>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-medium text-ink">
          {formatShortDate(period.periodStart)} – {formatShortDate(period.periodEnd)}
        </span>
        <span className="whitespace-nowrap text-xs text-muted">{t.daysRemaining(period.daysRemaining)}</span>
      </div>

      <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-overlay/10">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(100, spentPct)}%`,
            backgroundImage: isOverBudget
              ? 'linear-gradient(to right, #E5484D, #CC5F00)'
              : 'linear-gradient(to right, #CC5F00, #FF7A00)',
          }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted">{t.spentLabel}</p>
          <p className="text-lg font-semibold text-ink">{formatMoney(spentInPeriod)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">{t.remainingLabel}</p>
          <p className={`text-lg font-semibold ${isOverBudget ? 'text-red-400' : 'text-ink'}`}>
            {formatMoney(remainingInPeriod)}
          </p>
        </div>
      </div>

      {setAsideEntries.length > 0 && (
        <div className="mt-4 border-t pt-3" style={{ borderColor: CARD_BORDER }}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{t.setAsideTitle}</p>
          <ul className="flex flex-col gap-2.5">
            {setAsideEntries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-ink">{entry.name}</p>
                  <p className="truncate text-xs text-muted">{t.setAsideCaption(entry.targetDateLabel)}</p>
                </div>
                <span className="shrink-0 whitespace-nowrap font-medium text-ink">
                  {formatMoney(entry.perPeriod)} <span className="text-xs text-muted">{t.perPeriodSuffix}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardShell>
  )
}
