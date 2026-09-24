import { useState } from 'react'
import { Card } from './Card'
import { usePreferences } from '../hooks/usePreferences'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { computeHourlyRateFromAnnual } from '../lib/workHours'
import { PARAMETRES } from '../lib/i18n/parametres'

type Mode = 'hourly' | 'annual'

// Only the final hourly_rate is ever persisted (see usePreferences) — mode
// and the raw annual/weekly-hours inputs are session-only UI state. Coming
// back to this page later, the form always starts in "hourly rate" mode
// showing the stored rate, even if it was originally entered as an annual
// salary — an accepted trade-off for keeping the schema to one column.
export function WorkHoursSettings() {
  const { hourlyRate, workHoursEnabled, setHourlyRate, setWorkHoursEnabled } = usePreferences()
  const { lang } = useLanguage()
  const t = PARAMETRES[lang].workHours
  const formatMoney = useMoneyFormat()

  const [mode, setMode] = useState<Mode>('hourly')
  const [hourlyInput, setHourlyInput] = useState(hourlyRate ? String(hourlyRate) : '')
  const [annualInput, setAnnualInput] = useState('')
  const [weeklyHoursInput, setWeeklyHoursInput] = useState('')

  const computedFromAnnual = computeHourlyRateFromAnnual(Number(annualInput) || 0, Number(weeklyHoursInput) || 0)

  function commitHourly() {
    const parsed = Number(hourlyInput)
    const value = parsed > 0 ? parsed : null
    setHourlyInput(value ? String(value) : '')
    setHourlyRate(value)
  }

  function commitAnnual() {
    const value = computedFromAnnual
    setHourlyRate(value)
  }

  return (
    <Card title={t.cardTitle} hint={t.cardHint}>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={workHoursEnabled}
          onChange={(e) => setWorkHoursEnabled(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        {t.enableLabel}
      </label>
      {workHoursEnabled && !hourlyRate && <p className="mt-1.5 text-xs text-muted">{t.enableHintNoRate}</p>}

      <div className="mt-5">
        <div className="glass inline-flex gap-1 rounded-full p-1">
          {(['hourly', 'annual'] as Mode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              aria-pressed={mode === option}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                mode === option ? 'bg-primary-strong text-white shadow-md shadow-primary/30' : 'text-muted hover:text-ink'
              }`}
            >
              {option === 'hourly' ? t.modeHourly : t.modeAnnual}
            </button>
          ))}
        </div>

        {mode === 'hourly' ? (
          <label className="mt-4 flex flex-col gap-1 text-sm text-muted">
            {t.hourlyRateLabel}
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={hourlyInput}
              onChange={(e) => setHourlyInput(e.target.value)}
              onBlur={commitHourly}
              onKeyDown={(e) => e.key === 'Enter' && commitHourly()}
              placeholder={t.hourlyRatePlaceholder}
              className="w-40 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
            />
          </label>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-sm text-muted">
              {t.annualSalaryLabel}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="1"
                value={annualInput}
                onChange={(e) => setAnnualInput(e.target.value)}
                onBlur={commitAnnual}
                onKeyDown={(e) => e.key === 'Enter' && commitAnnual()}
                placeholder={t.annualSalaryPlaceholder}
                className="w-40 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted">
              {t.hoursPerWeekLabel}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.5"
                value={weeklyHoursInput}
                onChange={(e) => setWeeklyHoursInput(e.target.value)}
                onBlur={commitAnnual}
                onKeyDown={(e) => e.key === 'Enter' && commitAnnual()}
                placeholder={t.hoursPerWeekPlaceholder}
                className="w-32 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
            </label>
            {computedFromAnnual !== null && (
              <p className="w-full text-xs text-muted">{t.computedRateSentence(`${formatMoney(computedFromAnnual)}`)}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
