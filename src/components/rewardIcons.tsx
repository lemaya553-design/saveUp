import type { ComponentType } from 'react'

function FlagIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12l-2.5 3.5L18 11H6" />
    </svg>
  )
}

function TrendUpIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l5.5-5.5 4 4L21 6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6h6v6" />
    </svg>
  )
}

function ShieldIcon({ className }: { className: string }) {
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

function StarIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.8-4.6 6.6-.9L12 2.5z" />
    </svg>
  )
}

export const TIER_ICONS: Record<string, ComponentType<{ className: string }>> = {
  'first-100': FlagIcon,
  'first-500': TrendUpIcon,
  'first-1000': ShieldIcon,
  'goal-complete': StarIcon,
}

export const TIER_UNLOCKED_CLASS: Record<string, string> = {
  'first-100': 'bg-primary/15 text-primary',
  'first-500': 'bg-accent/15 text-accent',
  'first-1000': 'bg-success/15 text-success',
  'goal-complete':
    'bg-success/15 text-success ring-2 ring-success/40 shadow-[0_0_24px_rgba(34,197,94,0.35)]',
}
