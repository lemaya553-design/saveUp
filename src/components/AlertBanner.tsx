import type { ReactNode } from 'react'

export function AlertBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-start gap-3 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
      <span aria-hidden="true" className="mt-0.5">
        ⚠
      </span>
      <p>{children}</p>
    </div>
  )
}
