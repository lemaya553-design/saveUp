export function BeforeAfterRow({
  label,
  before,
  after,
  formatValue,
  higherIsBetter,
}: {
  label: string
  before: number
  after: number
  formatValue: (value: number) => string
  higherIsBetter: boolean
}) {
  const delta = after - before
  const improved = delta !== 0 && (higherIsBetter ? delta > 0 : delta < 0)
  const worsened = delta !== 0 && (higherIsBetter ? delta < 0 : delta > 0)
  const deltaColorClass = improved ? 'text-success' : worsened ? 'text-red-400' : 'text-muted'
  const arrow = delta === 0 ? null : delta > 0 ? '↑' : '↓'

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
      <span className="text-ink">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-muted">{formatValue(before)}</span>
        <span className="text-muted" aria-hidden="true">
          →
        </span>
        <span className="font-semibold text-ink">{formatValue(after)}</span>
        {arrow && (
          <span className={`inline-flex items-center text-xs font-semibold ${deltaColorClass}`}>
            {arrow}
          </span>
        )}
      </span>
    </div>
  )
}
