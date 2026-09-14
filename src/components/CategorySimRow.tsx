import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { EPARGNE } from '../lib/i18n/epargne'

// Same slider row as FixedExpenseSimRow, adapted for a plain
// category/amount pair instead of a FixedExpense record — used for both
// this month's ad-hoc spending categories and the "Épargne" row in the
// Simulateur tab, so every adjustable line in that tab looks and behaves
// identically regardless of what it represents underneath.
export function CategorySimRow({
  label,
  actualAmount,
  simulatedAmount,
  onChange,
}: {
  label: string
  actualAmount: number
  simulatedAmount: number
  onChange: (amount: number) => void
}) {
  const { lang } = useLanguage()
  const t = EPARGNE[lang].simRow
  const formatMoney = useMoneyFormat()
  const sliderMax = Math.max(actualAmount * 2, 50)
  const delta = simulatedAmount - actualAmount

  return (
    <div className="py-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-ink">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink">{formatMoney(simulatedAmount)}</span>
          {delta !== 0 && (
            <span className={`text-xs font-semibold ${delta < 0 ? 'text-success' : 'text-red-400'}`}>
              ({delta > 0 ? '+' : ''}
              {formatMoney(delta)})
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
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
        aria-label={t.simulatedAmountAria(label)}
      />
      <p className="text-xs text-muted">{t.actual(formatMoney(actualAmount))}</p>
    </div>
  )
}
