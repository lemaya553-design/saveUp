import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { BUDGET } from '../lib/i18n/budget'
import type { MonthlyTotal } from '../lib/budgetInsights'

export function ExpenseTrendChart({ months }: { months: MonthlyTotal[] }) {
  const { lang } = useLanguage()
  const formatMoney = useMoneyFormat()
  const hasData = months.some((m) => m.amount > 0)

  if (!hasData) {
    return <p className="text-sm text-muted">{BUDGET[lang].expenseTrendChart.empty}</p>
  }

  const max = Math.max(...months.map((m) => m.amount), 1)

  return (
    <div className="flex items-end justify-between gap-4">
      {months.map((month) => (
        <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-medium text-ink">{formatMoney(month.amount)}</span>
          <div className="flex h-24 w-full items-end">
            <div
              className="w-full rounded-t-lg bg-primary transition-all"
              style={{ height: `${Math.max(4, (month.amount / max) * 100)}%` }}
            />
          </div>
          <span className="text-xs capitalize text-muted">{month.label}</span>
        </div>
      ))}
    </div>
  )
}
