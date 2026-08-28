// Small, self-contained visual previews of what each core page looks like —
// not real screenshots (this app has no way to capture its own UI), but
// stylized mockups built from the same primitives (progress bars, colored
// bars) the real pages use, in the app's own palette. Two sizes: 'card' for
// a landing-page feature showcase, 'icon' for a compact list-row glyph
// (Dashboard's feature links).

const ICON_TILE = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl'

export function BudgetIllustration({ variant = 'card' }: { variant?: 'card' | 'icon' }) {
  const rows = [
    { label: 'Alimentation', pct: 72, color: 'bg-primary' },
    { label: 'Transport', pct: 45, color: 'bg-accent' },
    { label: 'Loisirs', pct: 96, color: 'bg-red-400' },
  ]

  if (variant === 'icon') {
    return (
      <div className={`${ICON_TILE} bg-primary/15`}>
        <div className="flex h-5 items-end gap-1" aria-hidden="true">
          {[40, 90, 65].map((h, i) => (
            <span key={i} className="w-1.5 rounded-t bg-primary" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex justify-between text-[11px] text-muted">
            <span>{r.label}</span>
            <span>{r.pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-overlay/10">
            <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SavingsIllustration({ variant = 'card' }: { variant?: 'card' | 'icon' }) {
  if (variant === 'icon') {
    return (
      <div className={`${ICON_TILE} bg-success/15`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-success" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 7v5l3 2" />
        </svg>
      </div>
    )
  }

  return (
    <div aria-hidden="true">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted">Objectif : Fonds d'urgence</span>
        <span className="text-sm font-semibold text-success">54 %</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-overlay/10">
        <div className="h-full rounded-full bg-success" style={{ width: '54%' }} />
      </div>
      <p className="mt-3 text-2xl font-bold text-ink">
        1 620 $<span className="ml-1.5 text-sm font-normal text-muted">/ 3 000 $</span>
      </p>
    </div>
  )
}

// Mirrors the real locked/unlocked visual language from the Récompenses
// page (grey circle vs. colored circle) — 2 of 4 lit, matching
// REWARD_TIERS.length exactly rather than an arbitrary illustrative count.
export function BadgesIllustration({ variant = 'card' }: { variant?: 'card' | 'icon' }) {
  const STAR_PATH = 'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.8-4.6 6.6-.9L12 2.5z'

  if (variant === 'icon') {
    return (
      <div className={`${ICON_TILE} bg-primary/15`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor" aria-hidden="true">
          <path d={STAR_PATH} />
        </svg>
      </div>
    )
  }

  const badges = [
    'bg-primary/15 text-primary',
    'bg-accent/15 text-accent',
    'bg-overlay/5 text-muted',
    'bg-overlay/5 text-muted',
  ]
  return (
    <div className="flex justify-center gap-3" aria-hidden="true">
      {badges.map((color, i) => (
        <div key={i} className={`flex h-11 w-11 items-center justify-center rounded-full ${color}`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d={STAR_PATH} />
          </svg>
        </div>
      ))}
    </div>
  )
}

export function StatsIllustration({ variant = 'card' }: { variant?: 'card' | 'icon' }) {
  if (variant === 'icon') {
    return (
      <div className={`${ICON_TILE} bg-accent/15`}>
        <div className="flex h-5 items-end gap-1" aria-hidden="true">
          {[45, 85, 60].map((h, i) => (
            <span key={i} className="w-1.5 rounded-t bg-accent" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    )
  }

  const bars = [40, 70, 55, 90, 35, 60]
  return (
    <div className="flex h-24 items-end gap-2" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t ${i % 2 === 0 ? 'bg-primary' : 'bg-accent'}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}
