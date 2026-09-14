import { useState } from 'react'
import { Card } from './Card'
import { formatCurrency, formatCurrencyEN } from '../lib/format'
import { useLanguage } from '../hooks/useLanguage'
import { EPARGNE } from '../lib/i18n/epargne'
import type { Contribution } from '../hooks/useSavingsContributions'
import type { SavingsGoal } from '../hooks/useSavingsGoals'

const COLLAPSED_COUNT = 5

export function ContributionHistory({
  contributions,
  goals,
}: {
  contributions: Contribution[]
  goals: SavingsGoal[]
}) {
  const { lang } = useLanguage()
  const t = EPARGNE[lang].contributionHistory
  const formatMoney = lang === 'fr' ? formatCurrency : formatCurrencyEN
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? contributions : contributions.slice(0, COLLAPSED_COUNT)
  const goalNameById = new Map(goals.map((g) => [g.id, g.name]))

  return (
    <Card title={t.title} hint={t.hint}>
      {contributions.length === 0 ? (
        <p className="text-sm text-muted">{t.empty}</p>
      ) : (
        <>
          <ul className="divide-y divide-overlay/10">
            {visible.map((contribution) => (
              <li key={contribution.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="text-ink">
                    {contribution.goal_id ? goalNameById.get(contribution.goal_id) ?? t.deletedGoal : t.deletedGoal}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(contribution.created_at).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className="font-medium text-success">
                  +{formatMoney(contribution.amount)}
                </span>
              </li>
            ))}
          </ul>

          {contributions.length > COLLAPSED_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="-mx-2 mt-3 rounded-md px-2 py-1.5 text-sm text-accent hover:bg-accent/10 hover:text-accent/80"
            >
              {showAll ? t.collapse : t.viewAll(contributions.length)}
            </button>
          )}
        </>
      )}
    </Card>
  )
}
