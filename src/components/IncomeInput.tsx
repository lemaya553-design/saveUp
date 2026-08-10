import { useState } from 'react'
import { Card } from './Card'

export function IncomeInput({
  monthlyIncome,
  onChange,
}: {
  monthlyIncome: number
  onChange: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(monthlyIncome || ''))

  function commit() {
    const value = Math.max(0, Number(draft) || 0)
    onChange(value)
    setDraft(String(value))
  }

  return (
    <Card title="Revenu mensuel" hint="On l'utilise pour calculer ton budget hebdomadaire disponible.">
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
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-lg text-ink placeholder-muted focus:border-primary focus:outline-none"
        />
      </label>
    </Card>
  )
}
