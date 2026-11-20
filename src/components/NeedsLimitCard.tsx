import { useMemo, useState } from 'react'
import { DashboardCard, CARD_BORDER } from './DashboardCard'
import { IncomeInput } from './IncomeInput'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { getMonthRange } from '../lib/format'
import { clampPct, computeNeedsLimit, computeNeedsSpending, type CategorizedAmount } from '../lib/needsLimit'
import { getNeedsLimitPcts, setNeedsLimitPcts } from '../lib/needsLimitPrefs'
import { DASHBOARD } from '../lib/i18n/dashboard'

function fillColorClass(pctOfLimit: number, overLimit: boolean): string {
  if (overLimit) return 'bg-red-400'
  if (pctOfLimit >= 80) return 'bg-amber-400'
  return 'bg-[#FF7A00]'
}

export function NeedsLimitCard({
  userId,
  monthlyIncome,
  hasIncomeRecord,
  onSetIncome,
  fixedExpenses,
  expenseRecords,
}: {
  userId: string
  monthlyIncome: number
  hasIncomeRecord: boolean
  onSetIncome: (value: number) => void
  fixedExpenses: CategorizedAmount[]
  // Full history (not pre-filtered to this month) — same convention as
  // Dashboard.tsx's other cards, which all pass useExpenseHistory's raw
  // records and let the consumer scope the window it actually needs.
  expenseRecords: (CategorizedAmount & { spent_at: string })[]
}) {
  const { lang } = useLanguage()
  const t = DASHBOARD[lang].needsLimit
  const formatMoney = useMoneyFormat()
  const [pcts, setPcts] = useState(() => getNeedsLimitPcts(userId))

  const monthExpenses = useMemo(() => {
    const { start, end } = getMonthRange(new Date())
    return expenseRecords.filter((r) => {
      const d = new Date(r.spent_at)
      return d >= start && d < end
    })
  }, [expenseRecords])

  const needsSpent = useMemo(
    () => computeNeedsSpending(fixedExpenses, monthExpenses),
    [fixedExpenses, monthExpenses],
  )

  const result = useMemo(
    () => computeNeedsLimit(monthlyIncome, needsSpent, pcts.needsPct, pcts.savingsPct),
    [monthlyIncome, needsSpent, pcts],
  )

  function updatePct(key: 'needsPct' | 'savingsPct', raw: string) {
    const fallback = key === 'needsPct' ? pcts.needsPct : pcts.savingsPct
    const next = { ...pcts, [key]: clampPct(Number(raw), fallback) }
    setPcts(next)
    setNeedsLimitPcts(userId, next)
  }

  if (!hasIncomeRecord) {
    return <IncomeInput monthlyIncome={monthlyIncome} onChange={onSetIncome} />
  }

  const barPct = result.pctOfLimit === null ? 0 : Math.min(100, result.pctOfLimit)

  return (
    <DashboardCard title={t.title} hint={t.hint}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <label className="flex items-center gap-1.5 text-muted">
          {t.needsLabel}
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={pcts.needsPct}
            onChange={(e) => updatePct('needsPct', e.target.value)}
            aria-label={t.needsAriaLabel}
            className="w-14 rounded-md border bg-transparent px-1.5 py-1 text-right text-ink"
            style={{ borderColor: CARD_BORDER }}
          />
          <span className="text-muted">%</span>
        </label>
        <label className="flex items-center gap-1.5 text-muted">
          {t.savingsLabel}
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={pcts.savingsPct}
            onChange={(e) => updatePct('savingsPct', e.target.value)}
            aria-label={t.savingsAriaLabel}
            className="w-14 rounded-md border bg-transparent px-1.5 py-1 text-right text-ink"
            style={{ borderColor: CARD_BORDER }}
          />
          <span className="text-muted">%</span>
        </label>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold text-ink">{formatMoney(needsSpent)}</p>
        <p className="text-sm text-muted">{t.ofLimit(formatMoney(result.needsLimit ?? 0))}</p>
      </div>

      <div
        className="relative mt-2 h-4 w-full overflow-hidden rounded-full bg-overlay/10"
        role="progressbar"
        aria-valuenow={Math.round(barPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.barAriaLabel}
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all motion-reduce:transition-none ${fillColorClass(result.pctOfLimit ?? 0, result.overLimit)}`}
          style={{ width: `${barPct}%` }}
        />
      </div>

      <p className={`mt-1.5 text-xs ${result.overLimit ? 'text-red-400' : 'text-muted'}`}>
        {t.pctUsed(Math.round(result.pctOfLimit ?? 0))}
      </p>

      {result.savingsTarget !== null && (
        <p className="mt-3 text-xs text-muted">{t.savingsTargetLine(formatMoney(result.savingsTarget))}</p>
      )}

      <p className="mt-3 text-xs italic text-muted">{t.disclaimer}</p>
    </DashboardCard>
  )
}
