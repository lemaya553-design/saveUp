import { useState } from 'react'
import { formatCurrency, formatCurrencyEN, WEEKS_PER_MONTH } from '../lib/format'
import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'

export function LandingStepsPreview() {
  const [incomeDraft, setIncomeDraft] = useState('3500')
  const income = Math.max(0, Number(incomeDraft) || 0)
  const roughWeeklyBudget = income / WEEKS_PER_MONTH
  const { lang } = useLanguage()
  const t = COMMON[lang].steps

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="glass rounded-2xl p-6 shadow-lg shadow-black/30 ring-1 ring-primary/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{t.step1Badge}</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">{t.step1Title}</h3>
        <p className="mt-1 text-sm text-muted">{t.step1Body}</p>
        <label className="mt-4 flex items-center gap-2">
          <span className="text-muted">$</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={incomeDraft}
            onChange={(e) => setIncomeDraft(e.target.value)}
            className="w-full rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
          />
        </label>
        <p className="mt-3 text-sm text-ink">
          ≈{' '}
          <span className="font-semibold text-success">
            {lang === 'fr' ? formatCurrency(roughWeeklyBudget) : formatCurrencyEN(roughWeeklyBudget)}
          </span>{' '}
          <span className="text-muted">{t.perWeek}</span>
        </p>
      </div>

      <div className="glass flex flex-col rounded-2xl p-6 opacity-60 shadow-lg shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t.step2Badge}</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">{t.step2Title}</h3>
        <p className="mt-1 text-sm text-muted">{t.step2Body}</p>
      </div>

      <div className="glass flex flex-col rounded-2xl p-6 opacity-60 shadow-lg shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t.step3Badge}</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">{t.step3Title}</h3>
        <p className="mt-1 text-sm text-muted">{t.step3Body}</p>
      </div>
    </div>
  )
}
