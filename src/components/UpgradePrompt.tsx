import { Link } from 'react-router-dom'
import type { Plan } from '../lib/plans'

const PLAN_LABEL: Record<Plan, string> = { free: 'Gratuit', standard: 'Standard', premium: 'Premium' }

// Shown in place of a gated feature (or as a blocker before an action) —
// same message shape everywhere so an upgrade nudge always looks and reads
// the same regardless of which limit triggered it.
export function UpgradePrompt({
  title,
  description,
  minPlan,
}: {
  title: string
  description: string
  minPlan: Exclude<Plan, 'free'>
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
      <p className="font-medium text-ink">{title}</p>
      <p className="text-muted">{description}</p>
      <Link to="/tarifs" className="font-medium text-accent hover:text-accent/80">
        Passer à {PLAN_LABEL[minPlan]} →
      </Link>
    </div>
  )
}
