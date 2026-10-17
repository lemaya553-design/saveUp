import { lazy, Suspense, useMemo, useState } from 'react'
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
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { ExpenseRecord } from '../hooks/useExpenseHistory'

// Reused verbatim from Budget/Premium/Dashboard — this card gets its own
// entry point to the SAME import flow rather than inventing a second one,
// so this section (which reads the exact transactions that flow produces)
// can be used without leaving the page.
const ImportTransactionsModal = lazy(() =>
  import('./ImportTransactionsModal').then((m) => ({ default: m.ImportTransactionsModal })),
)

// Default reduction the slider starts at for every category — matches the
// "si tu réduis de 20 %" example used when this feature was specified.
const DEFAULT_REDUCTION_PCT = 20
const MAX_REDUCTION_PCT = 50

function CategoryBar({ entry }: { entry: CategoryBenchmarkEntry }) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].categoryBenchmark
  const formatMoney = useMoneyFormat()
  const [reductionPct, setReductionPct] = useState(DEFAULT_REDUCTION_PCT)
  const categoryLabel = t.categoryLabels[entry.category]
  const barPct = entry.pctOfIncome === null ? 0 : Math.min(100, entry.pctOfIncome)
  const benchmarkPosition = Math.min(100, entry.benchmarkPct)
  const savings = computeReductionSavings(entry.total, reductionPct)

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-sm font-medium text-ink">{categoryLabel}</span>
        <span className={`text-xs font-semibold ${entry.overBenchmark ? 'text-primary' : 'text-muted'}`}>
          {entry.pctOfIncome === null ? formatMoney(entry.total) : t.amountAndPct(formatMoney(entry.total), entry.pctOfIncome)}
        </span>
      </div>

      <div className="relative h-4 w-full overflow-hidden rounded-full bg-overlay/10">
        <div
          role="progressbar"
          aria-valuenow={Math.round(barPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={categoryLabel}
          className={`absolute inset-y-0 left-0 rounded-full transition-all motion-reduce:transition-none ${
            entry.overBenchmark ? 'bg-primary' : 'bg-overlay/30'
          }`}
          style={{ width: `${barPct}%` }}
        />
        {/* The reference point itself — a thin marker on top of the track
            so it reads as "here's the line," independent of the fill. */}
        <div
          className="absolute inset-y-0 w-[2px] bg-ink/40"
          style={{ left: `${benchmarkPosition}%` }}
          aria-hidden="true"
        />
      </div>

      <p className="mt-1 text-xs text-muted">{t.benchmarkLabel(entry.benchmarkPct)}</p>

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
            <span className="shrink-0 whitespace-nowrap text-xs font-medium text-muted">{t.reductionLabel(reductionPct)}</span>
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
}: {
  historyRecords: ExpenseRecord[]
  monthlyIncome: number
  selectedMonth: Date
}) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].categoryBenchmark
  const subscription = useSubscription()
  const preferences = usePreferences()
  const [importOpen, setImportOpen] = useState(false)

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
      <p className="mb-4 text-xs italic text-muted">{t.disclaimer}</p>

      {canImport ? (
        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="mb-1 min-h-[44px] rounded-lg budget-btn-primary px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/30"
        >
          {t.importButton}
        </button>
      ) : (
        <UpgradePrompt
          title={t.upgradeTitle}
          description={subscription.plan === 'free' ? t.upgradeUsedLimit(FREE_CSV_IMPORT_LIMIT) : t.upgradeGeneric}
          minPlan="standard"
        />
      )}
      {canImport && subscription.plan === 'free' && (
        <p className="mb-4 text-xs text-muted">{t.freeRemaining(FREE_CSV_IMPORT_LIMIT - preferences.csvImportCount)}</p>
      )}

      {historyRecords.length === 0 ? (
        <div className="mt-3">
          <p className="text-sm font-medium text-ink">{t.empty.title}</p>
          <p className="mt-1 text-sm text-muted">{t.empty.description}</p>
        </div>
      ) : monthlyIncome <= 0 ? (
        <p className="mt-3 text-sm text-muted">{t.noIncome}</p>
      ) : (
        <div className="mt-3 flex flex-col gap-5">
          <p className="text-base font-semibold text-ink">
            {result.totalPctOfIncome !== null && t.totalLine(result.totalPctOfIncome)}
          </p>

          <div className="flex flex-col gap-5">
            {BENCHMARK_CATEGORY_ORDER.map((category) => {
              const entry = entryByCategory.get(category)
              if (!entry) return null
              return <CategoryBar key={category} entry={entry} />
            })}
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <ImportTransactionsModal open={importOpen} onClose={() => setImportOpen(false)} />
      </Suspense>
    </Card>
  )
}
