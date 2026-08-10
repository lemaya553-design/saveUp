import { useState } from 'react'
import { Card } from './Card'
import { formatCurrency } from '../lib/format'
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
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? contributions : contributions.slice(0, COLLAPSED_COUNT)
  const goalNameById = new Map(goals.map((g) => [g.id, g.name]))

  return (
    <Card title="Historique des contributions" hint="Tes derniers ajouts, les plus récents en premier.">
      {contributions.length === 0 ? (
        <p className="text-sm text-muted">Aucune contribution enregistrée pour l'instant.</p>
      ) : (
        <>
          <ul className="divide-y divide-white/10">
            {visible.map((contribution) => (
              <li key={contribution.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="text-ink">
                    {contribution.goal_id ? goalNameById.get(contribution.goal_id) ?? 'Objectif supprimé' : 'Objectif supprimé'}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(contribution.created_at).toLocaleDateString('fr-CA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className="font-medium text-success">
                  +{formatCurrency(contribution.amount)}
                </span>
              </li>
            ))}
          </ul>

          {contributions.length > COLLAPSED_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 text-sm text-accent hover:text-accent/80"
            >
              {showAll ? 'Réduire' : `Voir tout l'historique (${contributions.length})`}
            </button>
          )}
        </>
      )}
    </Card>
  )
}
