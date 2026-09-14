import { useState } from 'react'
import { Card } from './Card'
import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'

export function IncomeInput({
  monthlyIncome,
  onChange,
  compact = false,
}: {
  monthlyIncome: number
  onChange: (value: number) => void
  compact?: boolean
}) {
  const [draft, setDraft] = useState(String(monthlyIncome || ''))
  const { lang } = useLanguage()
  const t = COMMON[lang].incomeInput

  function commit() {
    const value = Math.max(0, Number(draft) || 0)
    onChange(value)
    setDraft(String(value))
  }

  return (
    <Card title={t.title} hint={t.hint} compact={compact}>
      <label className="flex items-center gap-2">
        <span className="text-muted">$</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          placeholder="0.00"
          className="w-full rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-lg text-ink placeholder-muted focus:border-primary focus:outline-none"
        />
      </label>
    </Card>
  )
}
