import { useMemo, useState } from 'react'
import { Card } from './Card'
import { CategoryDonutChart, type DonutSegment } from './CategoryDonutChart'
import { computeCategorySpending, type ExpenseRecordForSpending } from '../lib/categorySpending'
import { computeIncomeAllocation } from '../lib/incomeAllocation'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { FixedExpense } from '../hooks/useFixedExpenses'

type Tab = 'depenses' | 'revenus'

export function SpendingBreakdownCard({
  historyRecords,
  fixedExpenses,
  monthlyIncome,
  maxMonthsBack,
}: {
  historyRecords: ExpenseRecordForSpending[]
  fixedExpenses: FixedExpense[]
  monthlyIncome: number
  maxMonthsBack: number
}) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].spendingBreakdownCard
  const formatMoney = useMoneyFormat()
  const [tab, setTab] = useState<Tab>('depenses')
  // Independent from the "Dépenses par catégorie" card further down the
  // page — this card is new and shouldn't reach into that one's state.
  const [monthOffset, setMonthOffset] = useState(0)
  const selectedMonth = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  }, [monthOffset])

  const expenseSegments = useMemo<DonutSegment[]>(() => {
    const entries = computeCategorySpending(historyRecords, monthlyIncome, selectedMonth)
    const total = entries.reduce((sum, e) => sum + e.total, 0)
    if (total <= 0) return []
    return entries.map((e) => ({
      category: e.category,
      amount: e.total,
      pct: (e.total / total) * 100,
      count: e.transactions.length,
    }))
  }, [historyRecords, monthlyIncome, selectedMonth])

  // Fixed expenses have no date of their own (an ongoing recurring list,
  // not monthly records) — this doesn't change with monthOffset, on
  // purpose, same as the Card's disabled arrows below explain.
  const incomeSegments = useMemo<DonutSegment[]>(
    () => computeIncomeAllocation(fixedExpenses, monthlyIncome),
    [fixedExpenses, monthlyIncome],
  )

  const expenseTotal = expenseSegments.reduce((sum, s) => sum + s.amount, 0)

  return (
    <Card title={t.title}>
      <div className="mb-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.max(-maxMonthsBack, o - 1))}
          disabled={monthOffset <= -maxMonthsBack || tab === 'revenus'}
          aria-label={STATISTIQUES[lang].monthNav.prev}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-overlay/5 disabled:opacity-30"
        >
          ‹
        </button>
        <span className="min-w-[9rem] text-center text-sm font-medium capitalize text-ink">
          {selectedMonth.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
          disabled={monthOffset >= 0 || tab === 'revenus'}
          aria-label={STATISTIQUES[lang].monthNav.next}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-overlay/5 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="mb-5 flex justify-center">
        <div className="glass inline-flex gap-1 rounded-full p-1">
          <button
            type="button"
            onClick={() => setTab('depenses')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === 'depenses' ? 'bg-primary-strong text-white shadow-md shadow-primary/30' : 'text-muted hover:text-ink'
            }`}
          >
            {t.expensesTab}
          </button>
          <button
            type="button"
            onClick={() => setTab('revenus')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === 'revenus' ? 'bg-primary-strong text-white shadow-md shadow-primary/30' : 'text-muted hover:text-ink'
            }`}
          >
            {t.incomeTab}
          </button>
        </div>
      </div>

      {tab === 'depenses' ? (
        <CategoryDonutChart
          segments={expenseSegments}
          centerTotal={expenseTotal}
          centerLabel={t.spentThisMonth}
          emptyMessage={t.emptyExpenses}
        />
      ) : monthlyIncome <= 0 ? (
        <p className="text-sm text-muted">{t.noIncome}</p>
      ) : (
        <>
          <p className="mb-3 text-center text-xs text-muted">{t.fixedNote}</p>
          <CategoryDonutChart
            segments={incomeSegments}
            centerTotal={monthlyIncome}
            centerLabel={t.monthlyIncome}
            emptyMessage={t.emptyIncome}
            formatCount={t.fixedExpenseCount}
          />
        </>
      )}

      {tab === 'depenses' && expenseSegments.length > 0 && (
        <p className="mt-4 text-center text-xs text-muted">
          {t.total(formatMoney(expenseTotal), expenseSegments.length)}
        </p>
      )}
    </Card>
  )
}
