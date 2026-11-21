import { useId, type ComponentType } from 'react'
import type { BadgeRarity } from '../lib/badges'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

// viewBox is taller than it is wide (100x124) to leave room for the ribbon
// tails hanging below the medal disc — every percentage-based overlay below
// is positioned against this same box.
const VIEW_W = 100
const VIEW_H = 124
const DISC_CX = 50
const DISC_CY = 46
const DISC_R = 38

const RARITY_STOPS: Record<BadgeRarity, { from: string; to: string; stroke: string; text: string }> = {
  bronze: { from: '#E0AE78', to: '#8B5A2B', stroke: '#6B4423', text: '#2E1B0A' },
  silver: { from: '#F4F6F9', to: '#AEB4BD', stroke: '#7C838D', text: '#262A30' },
  gold: { from: '#FFF0B8', to: '#D4A017', stroke: '#9C7A0E', text: '#3A2B00' },
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="5.5" y="11" width="13" height="9" rx="1.8" />
      <path strokeLinecap="round" d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  )
}

export function BadgeMedal({
  rarity,
  icon: Icon,
  resultLabel,
  unlocked,
}: {
  rarity: BadgeRarity
  icon: ComponentType<{ className?: string }>
  resultLabel: string
  unlocked: boolean
}) {
  const uid = useId().replace(/[:]/g, '')
  const reducedMotion = usePrefersReducedMotion()
  const stops = RARITY_STOPS[rarity]
  const discGradientId = `badge-disc-${uid}`
  const clipId = `badge-clip-${uid}`

  return (
    <div
      className={`relative mx-auto w-full transition-[filter,opacity] duration-500 ${
        unlocked ? '' : 'opacity-70 grayscale blur-[0.4px]'
      }`}
      style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={discGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stops.from} />
            <stop offset="100%" stopColor={stops.to} />
          </linearGradient>
          <clipPath id={clipId}>
            <circle cx={DISC_CX} cy={DISC_CY} r={DISC_R} />
          </clipPath>
        </defs>

        {/* Ribbon tails — the app's own brand blue, regardless of medal
            rarity, so every badge still reads as unmistakably "SaveUp". */}
        <path
          d={`M${DISC_CX - 10},58 L${DISC_CX - 10},116 L${DISC_CX},104 L${DISC_CX + 10},116 L${DISC_CX + 10},58 Z`}
          fill="var(--color-primary-strong)"
        />
        <path
          d={`M${DISC_CX - 8},58 L${DISC_CX - 8},110 L${DISC_CX},100 L${DISC_CX + 8},110 L${DISC_CX + 8},58 Z`}
          fill="var(--color-primary)"
          opacity="0.85"
        />

        {/* Medal disc */}
        <circle cx={DISC_CX} cy={DISC_CY} r={DISC_R} fill={`url(#${discGradientId})`} stroke={stops.stroke} strokeWidth="2" />
        <circle cx={DISC_CX} cy={DISC_CY} r={DISC_R - 6} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

        {/* Shine */}
        <ellipse
          cx={DISC_CX - 13}
          cy={DISC_CY - 15}
          rx="17"
          ry="8"
          fill="white"
          opacity="0.3"
          transform={`rotate(-25 ${DISC_CX - 13} ${DISC_CY - 15})`}
        />

        {/* Gold-only animated shimmer sweep, clipped to the disc. */}
        {unlocked && rarity === 'gold' && !reducedMotion && (
          <g clipPath={`url(#${clipId})`}>
            <rect x={-40} y={DISC_CY - DISC_R} width="30" height={DISC_R * 2} fill="white" opacity="0.5" className="badge-shimmer-sweep" />
          </g>
        )}
      </svg>

      <div
        className="absolute flex flex-col items-center justify-center gap-1 px-[16%] text-center"
        style={{
          left: 0,
          right: 0,
          top: `${((DISC_CY - DISC_R) / VIEW_H) * 100}%`,
          height: `${((DISC_R * 2) / VIEW_H) * 100}%`,
          color: unlocked ? stops.text : undefined,
        }}
      >
        <Icon className={`h-[26%] w-[26%] ${unlocked ? '' : 'text-muted'}`} />
        <p className={`text-[9px] font-bold leading-tight sm:text-[10px] ${unlocked ? '' : 'text-muted'}`}>
          {unlocked ? resultLabel : ''}
        </p>
      </div>

      {!unlocked && (
        <div
          className="absolute flex items-center justify-center rounded-full bg-overlay/10 text-muted ring-2 ring-canvas"
          style={{ right: '6%', bottom: '34%', width: '26%', aspectRatio: '1 / 1' }}
        >
          <LockIcon className="h-[55%] w-[55%]" />
        </div>
      )}
    </div>
  )
}
