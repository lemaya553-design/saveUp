import type { ReactNode } from 'react'

export function Card({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="glass rounded-2xl p-5 shadow-lg shadow-black/30">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {hint && <p className="mb-4 mt-1 text-xs text-muted">{hint}</p>}
      <div className={hint ? undefined : 'mt-4'}>{children}</div>
    </section>
  )
}
