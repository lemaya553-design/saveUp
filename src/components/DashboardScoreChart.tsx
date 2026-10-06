import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLanguage } from '../hooks/useLanguage'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { DASHBOARD } from '../lib/i18n/dashboard'
import type { ScoreSnapshot } from '../hooks/useFinancialHealth'
import { BudgetEmptyChart } from './BudgetEmptyChart'

const ORANGE_VIF = '#FF7A00'

function ChartIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5 9 12l4 3 7-10.5" />
    </svg>
  )
}

function GhostCurve() {
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ghost-score-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ORANGE_VIF} stopOpacity={0.35} />
          <stop offset="100%" stopColor={ORANGE_VIF} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d="M0,90 C40,70 60,80 90,60 C130,35 150,55 190,40 C230,25 260,45 300,20 L300,120 L0,120 Z"
        fill="url(#ghost-score-gradient)"
      />
      <path
        d="M0,90 C40,70 60,80 90,60 C130,35 150,55 190,40 C230,25 260,45 300,20"
        fill="none"
        stroke={ORANGE_VIF}
        strokeWidth={2.5}
      />
    </svg>
  )
}

function ScoreTooltip({
  active,
  payload,
  lang,
}: {
  active?: boolean
  payload?: { payload: ScoreSnapshot }[]
  lang: import('../lib/i18n/language').Lang
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/20">
      <p className="font-semibold text-ink">
        {new Date(point.score_date).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
          day: 'numeric',
          month: 'short',
        })}
      </p>
      <p className="text-muted">{point.score}/100</p>
    </div>
  )
}

export function DashboardScoreChart({ history }: { history: ScoreSnapshot[] }) {
  const { lang } = useLanguage()
  const t = DASHBOARD[lang].scoreChart
  const reduceMotion = usePrefersReducedMotion()
  const gradientId = useId()

  if (history.length < 2) {
    return (
      <BudgetEmptyChart
        ghost={<GhostCurve />}
        icon={<ChartIcon className="h-5 w-5" />}
        title={t.emptyTitle}
        description={t.emptyDescription}
        heightClassName="h-48"
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ORANGE_VIF} stopOpacity={0.35} />
            <stop offset="100%" stopColor={ORANGE_VIF} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="score_date" hide />
        <YAxis domain={[0, 100]} hide />
        <Tooltip content={<ScoreTooltip lang={lang} />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke={ORANGE_VIF}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={!reduceMotion}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
