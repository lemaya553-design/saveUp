import { useMemo, useState } from 'react'
import { HelpButton } from '../components/HelpButton'
import { Card } from '../components/Card'
import { PageSkeleton } from '../components/PageSkeleton'
import { UpgradePrompt } from '../components/UpgradePrompt'
import { ImportTransactionsModal } from '../components/ImportTransactionsModal'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { useSubscription } from '../hooks/useSubscription'
import { usePreferences } from '../hooks/usePreferences'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { canImportCsv, FREE_CSV_IMPORT_LIMIT } from '../lib/plans'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { detectRecurringCharges, type DetectedSubscription } from '../lib/subscriptionDetection'
import {
  getSubscriptionReviewStatus,
  setSubscriptionReviewStatus,
  type SubscriptionReviewStatus,
} from '../lib/subscriptionReview'
import { PREMIUM } from '../lib/i18n/premium'

// 6 months (current + 5 back) — same window Statistiques.tsx uses, and
// enough slack for the detector to see at least 2-3 monthly occurrences of
// a charge. Reusing useExpenseHistory directly (not a new fetch/import
// path) means this reads the exact same `expenses` rows CSV import and
// manual entry already write — see ImportTransactionsModal.tsx, reused
// below unmodified rather than duplicated.
const MONTHS_BACK = 5

function RepeatIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 2.1l4 4-4 4M3 12.9v-1a4 4 0 0 1 4-4h14M7 21.9l-4-4 4-4M21 11.1v1a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

function StatTile({ label, amount }: { label: string; amount: string }) {
  return (
    <div className="glass min-w-0 rounded-2xl p-5 shadow-lg shadow-black/30">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-ink sm:text-3xl">{amount}</p>
    </div>
  )
}

function SubscriptionRow({
  item,
  status,
  onSetStatus,
}: {
  item: DetectedSubscription
  status: SubscriptionReviewStatus | null
  onSetStatus: (status: SubscriptionReviewStatus) => void
}) {
  const { lang } = useLanguage()
  const t = PREMIUM[lang].item
  const formatMoney = useMoneyFormat()
  const lastChargedLabel = new Date(item.lastSpentAt).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: 'color-mix(in srgb, var(--color-overlay) 10%, transparent)' }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ color: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.14)' }}
          >
            <RepeatIcon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{item.displayName}</p>
            <p className="text-xs text-muted">{translateCategoryLabel(item.category, lang)}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          {t.lastCharged(lastChargedLabel)} · {t.occurrences(item.occurrences)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
        <p className="text-lg font-bold text-ink">{formatMoney(item.monthlyAmount)}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onSetStatus('kept')}
            aria-pressed={status === 'kept'}
            className={`min-h-[36px] rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              status === 'kept' ? 'border-transparent text-white' : 'border-overlay/15 text-muted hover:text-ink'
            }`}
            style={status === 'kept' ? { backgroundColor: '#FF7A00' } : undefined}
          >
            {t.keepButton}
          </button>
          <button
            type="button"
            onClick={() => onSetStatus('review')}
            aria-pressed={status === 'review'}
            className={`min-h-[36px] rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              status === 'review' ? 'border-transparent text-white' : 'border-overlay/15 text-muted hover:text-ink'
            }`}
            style={status === 'review' ? { backgroundColor: '#CC5F00' } : undefined}
          >
            {t.reviewButton}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Premium() {
  const { user } = useAuth()
  const { lang } = useLanguage()
  const t = PREMIUM[lang]
  const formatMoney = useMoneyFormat()
  const subscription = useSubscription()
  const preferences = usePreferences()
  // Same 6-month window + same `expenses` rows Statistiques/Budget already
  // read — no second import, no second data source. Detection runs fresh
  // from this on every render; nothing beyond this component's own
  // lifetime is cached or written anywhere new, so no copy of the
  // statement outlives the page visit.
  const history = useExpenseHistory(MONTHS_BACK)
  const [importOpen, setImportOpen] = useState(false)
  // Bumped after a status change so the review-status lookup below
  // re-reads localStorage — the detected list itself doesn't change
  // (marking is display-only), only which pill reads as active.
  const [reviewVersion, setReviewVersion] = useState(0)

  const detected = useMemo(() => detectRecurringCharges(history.records), [history.records])

  const statuses = useMemo(() => {
    if (!user) return new Map<string, SubscriptionReviewStatus | null>()
    const map = new Map<string, SubscriptionReviewStatus | null>()
    for (const item of detected) {
      map.set(item.key, getSubscriptionReviewStatus(user.id, item.key))
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detected, user, reviewVersion])

  function handleSetStatus(key: string, status: SubscriptionReviewStatus) {
    if (!user) return
    setSubscriptionReviewStatus(user.id, key, status)
    setReviewVersion((v) => v + 1)
  }

  // Deliberately the sum of every detected charge, not just the ones
  // marked "Je garde" — marking something "à vérifier" flags it for a
  // closer look, it doesn't mean it stopped billing. See this page's own
  // report to the user for the same reasoning spelled out.
  const monthlyTotal = useMemo(() => detected.reduce((sum, d) => sum + d.monthlyAmount, 0), [detected])
  const annualTotal = monthlyTotal * 12

  if (history.loading) {
    return <PageSkeleton cards={4} />
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 pt-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">{t.pageHeader.title}</h1>
        <HelpButton title={t.help.title} purpose={t.help.purpose} actions={t.help.actions} />
      </div>
      <p className="-mt-4 mb-6 max-w-xl text-sm text-muted">{t.pageHeader.subtitle}</p>

      {history.error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {history.error}
        </div>
      )}

      {detected.length === 0 ? (
        <Card title={t.empty.title} hint={t.empty.description}>
          {canImportCsv(subscription.plan, preferences.csvImportCount) ? (
            <div>
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
                style={{ backgroundColor: '#FF7A00' }}
              >
                {t.empty.importButton}
              </button>
              {subscription.plan === 'free' && (
                <p className="mt-2 text-xs text-muted">
                  {t.empty.freeRemaining(FREE_CSV_IMPORT_LIMIT - preferences.csvImportCount)}
                </p>
              )}
            </div>
          ) : (
            <UpgradePrompt
              title={t.empty.upgradeTitle}
              description={
                subscription.plan === 'free' ? t.empty.upgradeUsedLimit(FREE_CSV_IMPORT_LIMIT) : t.empty.upgradeGeneric
              }
              variantClassName="border-[#FF7A00]/30 bg-[#FF7A00]/10"
              linkClassName="text-[#FF7A00] hover:opacity-80"
              minPlan="standard"
            />
          )}
        </Card>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatTile label={t.stats.monthlyTotal} amount={formatMoney(monthlyTotal)} />
            <StatTile label={t.stats.annualTotal} amount={formatMoney(annualTotal)} />
          </div>

          <div className="flex flex-col gap-3">
            {detected.map((item) => (
              <SubscriptionRow
                key={item.key}
                item={item}
                status={statuses.get(item.key) ?? null}
                onSetStatus={(status) => handleSetStatus(item.key, status)}
              />
            ))}
          </div>
        </div>
      )}

      <ImportTransactionsModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}
