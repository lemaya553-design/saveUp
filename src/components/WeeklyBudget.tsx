import { Card } from './Card'
import { formatCurrency } from '../lib/format'

export function WeeklyBudget({
  weeklyBudget,
  spentThisWeek,
  remainingThisWeek,
}: {
  weeklyBudget: number
  spentThisWeek: number
  remainingThisWeek: number
}) {
  const isOverBudget = remainingThisWeek < 0

  return (
    <Card
      title="Budget hebdomadaire"
      hint="Ce qu'il te reste à dépenser cette semaine, calculé automatiquement."
    >
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Budget</p>
          <p className="text-xl font-semibold text-ink">{formatCurrency(weeklyBudget)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Dépensé</p>
          <p className="text-xl font-semibold text-ink">{formatCurrency(spentThisWeek)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Restant</p>
          <p className={`text-xl font-semibold ${isOverBudget ? 'text-red-400' : 'text-success'}`}>
            {formatCurrency(remainingThisWeek)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted">
        Calcul: (revenu mensuel − dépenses fixes − épargne du mois) ÷ 4.33 semaines, moins les
        dépenses de la semaine en cours.
      </p>
    </Card>
  )
}
