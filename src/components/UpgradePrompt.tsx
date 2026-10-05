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
  variantClassName = 'border-accent/30 bg-accent/10',
  linkClassName = 'text-accent hover:text-accent/80',
}: {
  title: string
  description: string
  minPlan: Exclude<Plan, 'free'>
  // Lets a page override the app's default violet accent without forcing
  // every other caller onto it — the Budget page redesign passes its fixed
  // orange here instead.
  variantClassName?: string
  linkClassName?: string
}) {
  return (
    <div className={`flex flex-col items-start gap-2 rounded-xl border px-4 py-3 text-sm ${variantClassName}`}>
      <p className="font-medium text-ink">{title}</p>
      <p className="text-muted">{description}</p>
      <Link to="/tarifs" className={`font-medium ${linkClassName}`}>
        Passer à {PLAN_LABEL[minPlan]} →
      </Link>
    </div>
  )
}
