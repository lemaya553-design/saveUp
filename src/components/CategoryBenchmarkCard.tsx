import { useMemo, useState } from 'react'
import { Card } from './Card'
import { UpgradePrompt } from './UpgradePrompt'
import { useSubscription } from '../hooks/useSubscription'
import { usePreferences } from '../hooks/usePreferences'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { canImportCsv, FREE_CSV_IMPORT_LIMIT } from '../lib/plans'
import {
  BENCHMARK_CATEGORY_ORDER,
  computeCategoryBenchmarks,
  computeReductionSavings,
  type BenchmarkCategory,
  type CategoryBenchmarkEntry,
} from '../lib/categoryBenchmark'
import { PREMIUM } from '../lib/i18n/premium'
import type { ExpenseRecord } from '../hooks/useExpenseHistory'

// Default reduction the slider starts at for every category — matches the
// "si tu réduis de 20 %" example used when this feature was specified.
const DEFAULT_REDUCTION_PCT = 20
const MAX_REDUCTION_PCT = 50

function CategoryRow({ entry }: { entry: CategoryBenchmarkEntry }) {
  const { lang } = useLanguage()
  const t = PREMIUM[lang].categoryBenchmark
  const formatMoney = useMoneyFormat()
  const [reductionPct, setReductionPct] = useState(DEFAULT_REDUCTION_PCT)
  const categoryLabel = t.categoryLabels[entry.category]
  const barPct = entry.pctOfIncome === null ? 0 : Math.min(100, entry.pctOfIncome)
  const benchmarkPosition = Math.min(100, entry.benchmarkPct)
  const savings = computeReductionSavings(entry.total, reductionPct)

  return (
    <div className="rounded-xl border border-overlay/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink">{categoryLabel}</span>
          {entry.overBenchmark && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {t.overBenchmarkBadge}
            </span>
          )}
        </div>
        <span className={`text-sm font-semibold ${entry.overBenchmark ? 'text-primary' : 'text-ink'}`}>
          {entry.pctOfIncome === null
            ? formatMoney(entry.total)
            : t.amountAndPct(formatMoney(entry.total), entry.pctOfIncome)}
        </span>
      </div>

      {/* The track itself is neutral; the fill uses a gradient of the app's
          accent color once over benchmark, a flat neutral tone otherwise —
          both built from CSS variables, never a literal hex. */}
      <div className="relative mt-3 h-4 w-full overflow-hidden rounded-full bg-overlay/10">
        <div
          role="progressbar"
          aria-valuenow={Math.round(barPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={categoryLabel}
          className="absolute inset-y-0 left-0 rounded-full transition-all motion-reduce:transition-none"
          style={{
            width: `${barPct}%`,
            background: entry.overBenchmark
              ? 'linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 45%, transparent), var(--color-primary))'
              : 'color-mix(in srgb, var(--color-overlay) 30%, transparent)',
          }}
        />
        {/* The reference point itself — a thin marker on top of the track,
            independent of the fill, so "here's the line" reads on its own. */}
        <div
          className="absolute inset-y-0 w-[2px] bg-ink/50"
          style={{ left: `${benchmarkPosition}%` }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">{t.benchmarkLabel(entry.benchmarkPct)}</p>

      {entry.overBenchmark && (
        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-sm text-ink">
            {t.reductionSentence(
              t.possessiveLabels[entry.category],
              reductionPct,
              formatMoney(savings.monthly),
              formatMoney(savings.annual),
            )}
          </p>
          <div className="mt-2.5 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={MAX_REDUCTION_PCT}
              step={1}
              value={reductionPct}
              onChange={(e) => setReductionPct(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label={t.reductionSliderAria(categoryLabel)}
            />
            <span className="shrink-0 whitespace-nowrap text-xs font-medium text-muted">
              {t.reductionLabel(reductionPct)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export function CategoryBenchmarkCard({
  historyRecords,
  monthlyIncome,
  selectedMonth,
  onOpenImport,
}: {
  historyRecords: ExpenseRecord[]
  monthlyIncome: number
  selectedMonth?: Date
  // Premium.tsx owns the single ImportTransactionsModal instance on the
  // page (its subscription list already has its own entry point into it)
  // — this card only ever asks the parent to open it, never mounts a
  // second modal of its own.
  onOpenImport: () => void
}) {
  const { lang } = useLanguage()
  const t = PREMIUM[lang].categoryBenchmark
  // Reuses the exact same import-gating copy as the page's own empty state
  // below (PREMIUM[lang].empty) — same feature, same limits, same wording.
  const emptyT = PREMIUM[lang].empty
  const subscription = useSubscription()
  const preferences = usePreferences()

  const result = useMemo(
    () => computeCategoryBenchmarks(historyRecords, monthlyIncome, selectedMonth),
    [historyRecords, monthlyIncome, selectedMonth],
  )

  const entryByCategory = useMemo(
    () => new Map(result.entries.map((e) => [e.category, e] as [BenchmarkCategory, CategoryBenchmarkEntry])),
    [result.entries],
  )

  const canImport = canImportCsv(subscription.plan, preferences.csvImportCount)

  return (
    <Card title={t.title} hint={t.hint}>
      {/* budget-card-in: short fade/slide-up on mount, already a no-op under
          prefers-reduced-motion (see its @media block in index.css) — same
          entrance BudgetStatCards/StatistiquesStatCards use. */}
      <div className="budget-card-in">
        <p className="mb-4 text-xs italic text-muted">{t.disclaimer}</p>

        {canImport ? (
          <button
            type="button"
            onClick={onOpenImport}
            className="mb-1 min-h-[44px] rounded-lg budget-btn-primary px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/30"
          >
            {emptyT.importButton}
          </button>
        ) : (
          <UpgradePrompt
            title={emptyT.upgradeTitle}
            description={subscription.plan === 'free' ? emptyT.upgradeUsedLimit(FREE_CSV_IMPORT_LIMIT) : emptyT.upgradeGeneric}
            minPlan="standard"
          />
        )}
        {canImport && subscription.plan === 'free' && (
          <p className="mb-4 text-xs text-muted">{emptyT.freeRemaining(FREE_CSV_IMPORT_LIMIT - preferences.csvImportCount)}</p>
        )}

        {historyRecords.length === 0 ? (
          <div className="mt-3">
            <p className="text-sm font-medium text-ink">{t.empty.title}</p>
            <p className="mt-1 text-sm text-muted">{t.empty.description}</p>
          </div>
        ) : monthlyIncome <= 0 ? (
          <p className="mt-3 text-sm text-muted">{t.noIncome}</p>
        ) : (
          <div className="mt-5 flex flex-col gap-6">
            <div>
              <p className="text-sm text-muted">{t.totalPre}</p>
              <p className="text-5xl font-extrabold tracking-tight text-ink sm:text-6xl">
                {(result.totalPctOfIncome ?? 0).toFixed(0)} %
              </p>
              <p className="text-sm text-muted">{t.totalPost}</p>
            </div>

            <div className="flex flex-col gap-3">
              {BENCHMARK_CATEGORY_ORDER.map((category) => {
                const entry = entryByCategory.get(category)
                if (!entry) return null
                return <CategoryRow key={category} entry={entry} />
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
