import { Link } from 'react-router-dom'
import { DashboardCard, CARD_BORDER } from './DashboardCard'
import { useLanguage } from '../hooks/useLanguage'
import { DASHBOARD } from '../lib/i18n/dashboard'

function CheckIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Step({
  index,
  title,
  description,
  actionLabel,
  done,
  to,
  onAction,
}: {
  index: number
  title: string
  description: string
  actionLabel: string
  done: boolean
  to?: string
  onAction?: () => void
}) {
  const badge = (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
        done ? 'bg-[#FF7A00] text-white' : 'border-2 text-muted'
      }`}
      style={!done ? { borderColor: CARD_BORDER } : undefined}
      aria-hidden="true"
    >
      {done ? <CheckIcon className="h-4 w-4" /> : index}
    </span>
  )

  const actionClassName = 'budget-btn-primary shrink-0 self-start rounded-lg px-4 py-2 text-xs font-medium transition-all sm:self-auto'

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 transition-opacity sm:flex-row sm:items-center sm:justify-between ${
        done ? 'opacity-60' : ''
      }`}
      style={{ borderColor: CARD_BORDER }}
    >
      <div className="flex items-start gap-3">
        {badge}
        <div className="min-w-0">
          <p className="font-semibold text-ink">{title}</p>
          <p className="text-xs text-muted">{description}</p>
        </div>
      </div>
      {!done &&
        (to ? (
          <Link to={to} onClick={onAction} className={actionClassName}>
            {actionLabel}
          </Link>
        ) : (
          <button type="button" onClick={onAction} className={actionClassName}>
            {actionLabel}
          </button>
        ))}
    </div>
  )
}

// First-launch checklist on Dashboard: goal → import → explore. Hides
// itself once all 3 are done so it doesn't linger for established
// accounts — this is onboarding guidance, not a permanent widget.
export function GettingStartedGuide({
  hasGoal,
  hasData,
  viewedStats,
  onImportClick,
  onViewStatsClick,
}: {
  hasGoal: boolean
  hasData: boolean
  viewedStats: boolean
  onImportClick: () => void
  onViewStatsClick: () => void
}) {
  const { lang } = useLanguage()
  const t = DASHBOARD[lang].gettingStarted

  if (hasGoal && hasData && viewedStats) return null

  return (
    <div className="mb-6">
      <DashboardCard title={t.title} hint={t.hint}>
        <div className="flex flex-col gap-3">
          <Step
            index={1}
            title={t.step1.title}
            description={t.step1.description}
            actionLabel={t.step1.actionLabel}
            done={hasGoal}
            to="/epargne/objectifs"
          />
          <Step
            index={2}
            title={t.step2.title}
            description={t.step2.description}
            actionLabel={t.step2.actionLabel}
            done={hasData}
            onAction={onImportClick}
          />
          <Step
            index={3}
            title={t.step3.title}
            description={t.step3.description}
            actionLabel={t.step3.actionLabel}
            done={viewedStats}
            to="/statistiques/apercu"
            onAction={onViewStatsClick}
          />
        </div>
      </DashboardCard>
    </div>
  )
}
