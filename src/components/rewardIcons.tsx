import type { ComponentType } from 'react'

// Plain line-art icon set shown inside each badge medal (see BadgeMedal.tsx)
// — kept as simple, recognizable glyphs rather than detailed illustrations
// since they render as small as ~24px on mobile.

export function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12l-2.5 3.5L18 11H6" />
    </svg>
  )
}

export function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l5.5-5.5 4 4L21 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6h6v6" />
    </svg>
  )
}

export function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.5l7 2.8v5.2c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6.3l7-2.8Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4.5" />
    </svg>
  )
}

export function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.8-4.6 6.6-.9L12 2.5z" />
    </svg>
  )
}

export function RocketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3c2.5 1.5 4 4.5 4 8.5l-4 4-4-4c0-4 1.5-7 4-8.5Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14 6 16.5 7 20l3.5-2.5M15.5 14 18 16.5 17 20l-3.5-2.5" />
      <circle cx="12" cy="10" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

// Stacked coins — savings tiers past the first two (first-1000, savings-2500).
export function CoinsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <ellipse cx="9" cy="7" rx="5.5" ry="2.5" />
      <path strokeLinecap="round" d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7" />
      <path strokeLinecap="round" d="M3.5 11v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4" />
      <ellipse cx="16" cy="14" rx="4.5" ry="2" />
      <path strokeLinecap="round" d="M11.5 14v3c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-3" />
    </svg>
  )
}

// Top savings tier (savings-5000) — a cut gemstone for "elite" rarity.
export function DiamondIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinejoin="round" d="M7 4h10l4 5.5L12 21 3 9.5 7 4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5h18M9 4l-2 5.5L12 21l5-11.5L15 4" />
    </svg>
  )
}

// Multi-goal tiers (goals-3, goals-5) — a trophy cup, distinct from the
// single-star "goal-complete" first badge.
export function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path strokeLinecap="round" d="M7 5H4.5a1 1 0 0 0-1 1.2l.6 2A3 3 0 0 0 7 10.5M17 5h2.5a1 1 0 0 1 1 1.2l-.6 2A3 3 0 0 1 17 10.5" />
      <path strokeLinecap="round" d="M12 14v3M9 20.5h6M9.5 20.5c0-1.8.9-3 2.5-3s2.5 1.2 2.5 3" />
    </svg>
  )
}

// Streak tiers — a flame, scales with rarity color only (same glyph every
// tier, matching the existing 🔥 streak card elsewhere in the app).
export function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2.5c1 3-3 4.5-3 8a3 3 0 0 0 6 0c0-1.3-.6-2-1-2.8 1.8.7 3 2.6 3 4.8a5 5 0 0 1-10 0c0-4.3 3.3-6.3 5-10Z"
      />
    </svg>
  )
}

// Expense-logging tiers — a receipt.
export function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3v-17Z"
      />
      <path strokeLinecap="round" d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" />
    </svg>
  )
}

// Import tiers — an upload arrow into a tray.
export function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V4m0 0 3.5 3.5M12 4 8.5 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 14.5V18a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3.5" />
    </svg>
  )
}

export type BadgeIcon = ComponentType<{ className?: string }>
