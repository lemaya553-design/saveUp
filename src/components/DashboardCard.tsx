import type { ReactNode } from 'react'

// The white, rounded, lightly-shadowed card used by Dashboard's "Évolution
// de ton score" and every other Dashboard card — extracted here so
// Statistiques' new Aperçu charts (same visual language, per the request
// that introduced them) can reuse it instead of a second near-identical
// card style living in two places.
export const CARD_BORDER = 'color-mix(in srgb, var(--color-overlay) 10%, transparent)'

export function DashboardCard({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: CARD_BORDER }}
    >
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{hint}</p>
      {children}
    </section>
  )
}
