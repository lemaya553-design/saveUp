import { Skeleton } from './Skeleton'

// A generic "this page is loading" placeholder shaped like SaveUp's usual
// layout (a title, a subtitle, then a stack of glass cards) — used instead
// of a blank flash or a bare "Chargement..." line while Supabase data is
// still in flight.
export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-10">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />

      <div className="mt-8 grid gap-6">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 shadow-lg shadow-black/30">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
