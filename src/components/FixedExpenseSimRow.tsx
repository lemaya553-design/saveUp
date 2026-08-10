import { formatCurrency } from '../lib/format'
import type { FixedExpense } from '../hooks/useFixedExpenses'

export function FixedExpenseSimRow({
  expense,
  simulatedAmount,
  onChange,
}: {
  expense: FixedExpense
  simulatedAmount: number
  onChange: (id: string, amount: number) => void
}) {
  const sliderMax = Math.max(expense.amount * 2, 50)
  const delta = simulatedAmount - expense.amount

  return (
    <div className="py-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <div>
          <span className="text-ink">{expense.name}</span>
          <span className="ml-2 text-xs text-muted">{expense.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink">{formatCurrency(simulatedAmount)}</span>
          {delta !== 0 && (
            <span className={`text-xs font-semibold ${delta < 0 ? 'text-success' : 'text-red-400'}`}>
              ({delta > 0 ? '+' : ''}
              {formatCurrency(delta)})
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={sliderMax}
        step={1}
        value={Math.min(simulatedAmount, sliderMax)}
        onChange={(e) => onChange(expense.id, Number(e.target.value))}
        className="w-full accent-primary"
        aria-label={`Montant simulé pour ${expense.name}`}
      />
      <p className="text-xs text-muted">Actuel : {formatCurrency(expense.amount)}</p>
    </div>
  )
}
