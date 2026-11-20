import { useMemo } from 'react'
import { DashboardCard } from './DashboardCard'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { detectRecurringCharges, type DetectedSubscription } from '../lib/subscriptionDetection'
import { DASHBOARD } from '../lib/i18n/dashboard'
import type { ExpenseRecord } from '../hooks/useExpenseHistory'

const ORANGE = '#4A6CF7'
// Only the top few on a Dashboard summary card — this used to be a teaser
// pointing at the full "Je garde"/"À vérifier" review UI on the Premium
// page; that page is gone now (menu item removed), so this is just a
// short, capped preview on its own rather than a teaser for something
// else — "+N autres" (below) says there's more without a dead link to get
// there.
const MAX_SHOWN = 4

function RepeatIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 2.1l4 4-4 4M3 12.9v-1a4 4 0 0 1 4-4h14M7 21.9l-4-4 4-4M21 11.1v1a4 4 0 0 1-4 4H3"
      />
    </svg>
  )
}

function SubscriptionRow({ item }: { item: DetectedSubscription }) {
  const { lang } = useLanguage()
  const formatMoney = useMoneyFormat()
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ color: ORANGE, backgroundColor: 'rgba(74, 108, 247, 0.14)' }}
        >
          <RepeatIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{item.displayName}</p>
          <p className="text-xs text-muted">{translateCategoryLabel(item.category, lang)}</p>
        </div>
      </div>
      <p className="shrink-0 text-sm font-semibold text-ink">{formatMoney(item.monthlyAmount)}</p>
    </div>
  )
}

// Reuses lib/subscriptionDetection.ts as-is (the same pure, tested function
// that used to power the full Premium page) — this card does no detection
// of its own, it just surfaces a short preview from the same expense
// history Dashboard already loads. Returns null (renders nothing) when
// nothing is detected, rather than an empty state — a Dashboard summary
// card isn't the place to explain/invite for this.
export function SubscriptionsFoundCard({ records }: { records: ExpenseRecord[] }) {
  const { lang } = useLanguage()
  const t = DASHBOARD[lang].subscriptionsFound
  const formatMoney = useMoneyFormat()

  const detected = useMemo(() => detectRecurringCharges(records), [records])
  if (detected.length === 0) return null

  const monthlyTotal = detected.reduce((sum, d) => sum + d.monthlyAmount, 0)
  const shown = detected.slice(0, MAX_SHOWN)
  const remaining = detected.length - shown.length

  return (
    <DashboardCard title={t.title} hint={t.hint(formatMoney(monthlyTotal))}>
      <div className="flex flex-col gap-3">
        {shown.map((item) => (
          <SubscriptionRow key={item.key} item={item} />
        ))}
      </div>
      {remaining > 0 && <p className="mt-3 text-xs text-muted">{t.moreCount(remaining)}</p>}
    </DashboardCard>
  )
}
