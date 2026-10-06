import { Link } from 'react-router-dom'

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: {
  title: string
  description: string
  actionLabel: string
  actionTo?: string
  onAction?: () => void
}) {
  return (
    <div className="glass rounded-2xl p-8 text-center shadow-lg shadow-black/30">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{description}</p>
      {actionTo ? (
        <Link to={actionTo} className="budget-btn-primary mt-5 inline-block rounded-lg px-5 py-2.5 font-medium transition-all">
          {actionLabel}
        </Link>
      ) : (
        <button type="button" onClick={onAction} className="budget-btn-primary mt-5 rounded-lg px-5 py-2.5 font-medium transition-all">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
