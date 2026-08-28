export function ProgressBar({
  value,
  colorClass = 'bg-success',
}: {
  value: number
  colorClass?: string
}) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-overlay/10"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${colorClass} transition-all`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
