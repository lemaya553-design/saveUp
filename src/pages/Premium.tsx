import { useMemo, useState } from 'react'
import { HelpButton } from '../components/HelpButton'
import { Card } from '../components/Card'
import { PageSkeleton } from '../components/PageSkeleton'
import { UpgradePrompt } from '../components/UpgradePrompt'
import { ImportTransactionsModal } from '../components/ImportTransactionsModal'
import { SubscriptionReviewModal } from '../components/SubscriptionReviewModal'
import { CategoryBenchmarkCard } from '../components/CategoryBenchmarkCard'
import { useExpenseHistory } from '../hooks/useExpenseHistory'
import { useIncome } from '../hooks/useIncome'
import { useSubscription } from '../hooks/useSubscription'
import { usePreferences } from '../hooks/usePreferences'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { canImportCsv, FREE_CSV_IMPORT_LIMIT } from '../lib/plans'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { detectRecurringCharges, type DetectedSubscription } from '../lib/subscriptionDetection'
import {
  clearSubscriptionMark,
  getSubscriptionMark,
  markSubscriptionForReview,
  markSubscriptionKept,
  type ReviewDetails,
  type SubscriptionMark,
} from '../lib/subscriptionReview'
import { PREMIUM } from '../lib/i18n/premium'

// 6 months (current + 5 back) — same window Statistiques.tsx uses, and
// enough slack for the detector to see at least 2-3 monthly occurrences of
// a charge. Reusing useExpenseHistory directly (not a new fetch/import
// path) means this reads the exact same `expenses` rows CSV import and
// manual entry already write — see ImportTransactionsModal.tsx, reused
// below unmodified rather than duplicated.
const MONTHS_BACK = 5

// Theme-only border, same color-mix recipe used across the rest of the app
// (DashboardCard.tsx's CARD_BORDER, etc.) — a token, not a literal color.
const CARD_BORDER = 'color-mix(in srgb, var(--color-overlay) 10%, transparent)'

function RepeatIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 2.1l4 4-4 4M3 12.9v-1a4 4 0 0 1 4-4h14M7 21.9l-4-4 4-4M21 11.1v1a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

function ChevronIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  )
}

function SubscriptionIcon({ className }: { className: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ color: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.14)' }}
    >
      <RepeatIcon className="h-4 w-4" />
    </span>
  )
}

function SubscriptionRow({
  item,
  mark,
  onKeep,
  onOpenReview,
}: {
  item: DetectedSubscription
  mark: SubscriptionMark | null
  onKeep: () => void
  onOpenReview: () => void
}) {
  const { lang } = useLanguage()
  const t = PREMIUM[lang].item
  const reasonLabels = PREMIUM[lang].reasonLabels
  const formatMoney = useMoneyFormat()
  const lastChargedLabel = new Date(item.lastSpentAt).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const inReview = mark?.status === 'review'

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: CARD_BORDER }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <SubscriptionIcon className="h-9 w-9" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{item.displayName}</p>
            <p className="text-xs text-muted">{translateCategoryLabel(item.category, lang)}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          {t.lastCharged(lastChargedLabel)} · {t.occurrences(item.occurrences)}
        </p>
        {inReview && (
          <span
            className="mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ color: '#CC5F00', backgroundColor: 'rgba(204, 95, 0, 0.14)' }}
          >
            {t.reviewBadge(reasonLabels[mark.review.reason])}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
        <p className="text-lg font-bold text-ink">{formatMoney(item.monthlyAmount)}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenReview}
            className="min-h-[36px] rounded-full border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
            style={{ borderColor: CARD_BORDER }}
          >
            {inReview ? t.editReview : t.reviewButton}
          </button>
          <button
            type="button"
            onClick={onKeep}
            className="min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all hover:brightness-110"
            style={{ backgroundColor: '#FF7A00' }}
          >
            {t.keepButton}
          </button>
        </div>
      </div>
    </div>
  )
}

function KeptRow({
  item,
  onRestore,
}: {
  item: DetectedSubscription
  onRestore: () => void
}) {
  const { lang } = useLanguage()
  const t = PREMIUM[lang].keptSection
  const formatMoney = useMoneyFormat()

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5" style={{ borderColor: CARD_BORDER }}>
      <div className="flex min-w-0 items-center gap-2.5">
        <SubscriptionIcon className="h-7 w-7" />
        <p className="truncate text-sm font-medium text-ink">{item.displayName}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <p className="text-sm text-muted">{formatMoney(item.monthlyAmount)}</p>
        <button
          type="button"
          onClick={onRestore}
          className="min-h-[36px] rounded-md px-2 py-1.5 text-xs font-medium hover:underline"
          style={{ color: '#FF7A00' }}
        >
          {t.restoreButton}
        </button>
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
  // Same hook Budget.tsx reads its "revenu mensuel" from — the category
  // benchmark section below must always agree with Budget's own number.
  const income = useIncome()
  const [importOpen, setImportOpen] = useState(false)
  const [keptOpen, setKeptOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<DetectedSubscription | null>(null)
  // Bumped after any mark change so the lookup below re-reads localStorage
  // — the detected list itself never changes from marking (nothing here
  // ever deletes a transaction), only which bucket/badge an item shows in.
  const [markVersion, setMarkVersion] = useState(0)

  const detected = useMemo(() => detectRecurringCharges(history.records), [history.records])

  const marks = useMemo(() => {
    const map = new Map<string, SubscriptionMark | null>()
    if (!user) return map
    for (const item of detected) {
      map.set(item.key, getSubscriptionMark(user.id, item.key))
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detected, user, markVersion])

  const activeItems = detected.filter((d) => marks.get(d.key)?.status !== 'kept')
  const keptItems = detected.filter((d) => marks.get(d.key)?.status === 'kept')

  function handleKeep(key: string) {
    if (!user) return
    markSubscriptionKept(user.id, key)
    setMarkVersion((v) => v + 1)
  }

  function handleRestore(key: string) {
    if (!user) return
    clearSubscriptionMark(user.id, key)
    setMarkVersion((v) => v + 1)
  }

  function handleSaveReview(review: ReviewDetails) {
    if (!user || !reviewTarget) return
    markSubscriptionForReview(user.id, reviewTarget.key, review)
    setMarkVersion((v) => v + 1)
    setReviewTarget(null)
  }

  // Deliberately the sum of every detected charge, kept or not — marking
  // something "Je garde" means "I know about this, stop asking," not "this
  // stopped billing." Still a real recurring cost either way.
  const monthlyTotal = useMemo(() => detected.reduce((sum, d) => sum + d.monthlyAmount, 0), [detected])
  const annualTotal = monthlyTotal * 12

  if (history.loading || income.loading) {
    return <PageSkeleton cards={4} />
  }

  const reviewTargetMark = reviewTarget ? marks.get(reviewTarget.key) : null
  const reviewInitial = reviewTargetMark?.status === 'review' ? reviewTargetMark.review : null

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-1 flex items-center gap-2 pt-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">{t.pageHeader.title}</h1>
        <HelpButton title={t.help.title} purpose={t.help.purpose} actions={t.help.actions} />
      </div>
      <p className="mb-6 max-w-xl text-sm text-muted">{t.pageHeader.subtitle}</p>

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
                className="min-h-[44px] rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
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
          {/* Hero total — monthly first and biggest (what someone actually
              feels every month), the yearly figure as a smaller supporting
              line underneath rather than an equally-weighted second tile. */}
          <div className="glass min-w-0 rounded-2xl p-6 shadow-lg shadow-black/30">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">{t.stats.monthlyTotal}</p>
            <p className="mt-1.5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {formatMoney(monthlyTotal)}
            </p>
            <p className="mt-1.5 text-sm text-muted">{t.stats.annualTotalInline(formatMoney(annualTotal))}</p>
          </div>

          {activeItems.length === 0 ? (
            <Card title={t.allKept.title} hint={t.allKept.description}>
              {null}
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {activeItems.map((item) => (
                <SubscriptionRow
                  key={item.key}
                  item={item}
                  mark={marks.get(item.key) ?? null}
                  onKeep={() => handleKeep(item.key)}
                  onOpenReview={() => setReviewTarget(item)}
                />
              ))}
            </div>
          )}

          {keptItems.length > 0 && (
            <div className="border-t pt-4" style={{ borderColor: CARD_BORDER }}>
              <button
                type="button"
                onClick={() => setKeptOpen((o) => !o)}
                aria-expanded={keptOpen}
                className="flex min-h-[36px] items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
              >
                <ChevronIcon className={`h-4 w-4 transition-transform motion-reduce:transition-none ${keptOpen ? 'rotate-90' : ''}`} />
                {t.keptSection.linkLabel(keptItems.length)}
              </button>

              {keptOpen && (
                <div className="mt-3 flex flex-col gap-2">
                  {keptItems.map((item) => (
                    <KeptRow key={item.key} item={item} onRestore={() => handleRestore(item.key)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Shows regardless of whether any subscription was detected above —
          it's a broader "all spending this month" analysis, not scoped to
          subscriptions, so an empty subscription list above shouldn't hide
          it. */}
      <div className="mt-6">
        <CategoryBenchmarkCard
          historyRecords={history.records}
          monthlyIncome={income.monthlyIncome}
          onOpenImport={() => setImportOpen(true)}
        />
      </div>

      <ImportTransactionsModal open={importOpen} onClose={() => setImportOpen(false)} />

      <SubscriptionReviewModal
        open={reviewTarget !== null}
        onClose={() => setReviewTarget(null)}
        subscriptionName={reviewTarget?.displayName ?? ''}
        initial={reviewInitial}
        onSave={handleSaveReview}
      />
    </div>
  )
}
