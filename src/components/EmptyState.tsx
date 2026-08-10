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
        <Link
          to={actionTo}
          className="mt-5 inline-block rounded-lg bg-primary-strong px-5 py-2.5 font-medium text-white transition-all hover:brightness-110"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-lg bg-primary-strong px-5 py-2.5 font-medium text-white transition-all hover:brightness-110"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
