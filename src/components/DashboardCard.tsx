import type { ReactNode } from 'react'

// The white, rounded, lightly-shadowed card used by Dashboard's "Évolution
// de ton score" and every other Dashboard card — extracted here so
// Statistiques' new Aperçu charts (same visual language, per the request
// that introduced them) can reuse it instead of a second near-identical
// card style living in two places.
export const CARD_BORDER = 'color-mix(in srgb, var(--color-overlay) 10%, transparent)'

// accent: the hairline blue gradient ring reserved for a handful of
// genuinely important cards — skips the inline borderColor (card-accent
// hides it via border-color: transparent anyway, and an inline style would
// still win over the class's own color).
export function DashboardCard({
  title,
  hint,
  children,
  accent = false,
}: {
  title: string
  hint: string
  children: ReactNode
  accent?: boolean
}) {
  return (
    <section
      className={`budget-card-in hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6 ${
        accent ? 'card-accent' : ''
      }`}
      style={accent ? undefined : { borderColor: CARD_BORDER }}
    >
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{hint}</p>
      {children}
    </section>
  )
}
