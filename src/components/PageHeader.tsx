export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="hero-gradient -mx-4 mb-8 rounded-b-3xl px-4 pb-8 pt-10 sm:mx-0 sm:rounded-3xl sm:px-8">
      <h1 className="text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-1 text-muted">{subtitle}</p>
    </div>
  )
}
