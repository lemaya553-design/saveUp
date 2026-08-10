import type { ReactNode } from 'react'
import { ProgressBar } from './ProgressBar'

export function DashboardStat({
  label,
  value,
  valueColorClass = 'text-ink',
  suffix,
  trend,
  progress,
  progressColorClass,
  caption,
}: {
  label: string
  value: string
  valueColorClass?: string
  suffix?: string
  trend?: ReactNode
  progress?: number
  progressColorClass?: string
  caption?: ReactNode
}) {
  return (
    <div className="glass rounded-2xl p-5 shadow-lg shadow-black/30">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={`text-4xl font-bold ${valueColorClass}`}>{value}</span>
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
        {trend}
      </div>

      {progress !== undefined && (
        <div className="mt-3">
          <ProgressBar value={progress} colorClass={progressColorClass} />
        </div>
      )}

      {caption && <p className="mt-2 text-xs text-muted">{caption}</p>}
    </div>
  )
}
