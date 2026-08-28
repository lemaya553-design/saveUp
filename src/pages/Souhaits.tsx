import { PageHeader } from '../components/PageHeader'
import { WishlistItems } from '../components/WishlistItems'
import { PageSkeleton } from '../components/PageSkeleton'
import { useWishlist } from '../hooks/useWishlist'
import { useSavingsGoals } from '../hooks/useSavingsGoals'

const SOUHAITS_HELP = {
  purpose:
    'Note ce que tu aimerais t\'offrir et son prix, pour voir le total et suivre où tu en es à te le payer.',
  actions: [
    'Ajoute un article avec un nom et un prix.',
    'Relie-le (optionnel) à un objectif d\'épargne existant pour voir ta progression vers son prix.',
    'Modifie ou retire un article à tout moment.',
  ],
}

export function Souhaits() {
  const wishlist = useWishlist()
  const goals = useSavingsGoals()

  const loading = wishlist.loading || goals.loading
  const error = wishlist.error || goals.error

  if (loading) {
    return <PageSkeleton cards={2} />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Ta liste de souhaits"
        subtitle="Ce que tu aimerais t'offrir, et combien ça coûte."
        help={SOUHAITS_HELP}
      />

      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <WishlistItems
        items={wishlist.items}
        total={wishlist.total}
        goals={goals.goals}
        onAdd={wishlist.addItem}
        onUpdate={wishlist.updateItem}
        onRemove={wishlist.removeItem}
      />
    </div>
  )
}
