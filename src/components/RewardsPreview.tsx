import { Link } from 'react-router-dom'
import { TIER_ICONS, TIER_UNLOCKED_CLASS } from './rewardIcons'
import { REWARD_TIERS, getUnlockedTiers } from '../lib/rewards'

export function RewardsPreview({
  totalCurrentAmount,
  goals,
}: {
  totalCurrentAmount: number
  goals: { targetAmount: number; currentAmount: number }[]
}) {
  const unlockedTiers = getUnlockedTiers(totalCurrentAmount, goals)

  return (
    <Link
      to="/statistiques/recompenses"
      className="glass flex items-center justify-between rounded-2xl p-4 shadow-lg shadow-black/30 transition-colors hover:bg-overlay/5"
    >
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {unlockedTiers.length > 0 ? (
            unlockedTiers.slice(-3).map((tier) => {
              const Icon = TIER_ICONS[tier.id]
              return (
                <div
                  key={tier.id}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-canvas ${TIER_UNLOCKED_CLASS[tier.id]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              )
            })
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-canvas bg-overlay/5 text-muted">
              <span aria-hidden="true" className="text-sm">
                🏅
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">
            {unlockedTiers.length}/{REWARD_TIERS.length} badges débloqués
          </p>
          <p className="text-xs text-muted">Voir tes récompenses</p>
        </div>
      </div>
      <span aria-hidden="true" className="text-accent">
        →
      </span>
    </Link>
  )
}
