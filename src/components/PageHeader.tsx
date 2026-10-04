import { HelpButton } from './HelpButton'

// compact: for a title long enough to wrap onto two lines at the default
// size on common desktop widths (this page's container caps at max-w-3xl,
// so the available width doesn't grow past that regardless of screen size).
export function PageHeader({
  title,
  subtitle,
  compact = false,
  help,
}: {
  title: string
  subtitle: string
  compact?: boolean
  help?: { title?: string; purpose: string; actions: string[] }
}) {
  return (
    // Flat, no card/gradient treatment — the minimalist system's headers
    // are plain title + subtitle on the page canvas, generous whitespace
    // doing the work a colored hero block used to.
    <div className="relative mb-8 pb-2 pt-8 sm:pt-10">
      {help && (
        <div className="absolute right-0 top-8 sm:top-10">
          <HelpButton title={help.title ?? title} purpose={help.purpose} actions={help.actions} />
        </div>
      )}
      <h1
        className={`max-w-[calc(100%-2.5rem)] font-bold tracking-tight text-ink ${
          compact ? 'text-2xl' : 'text-[32px]'
        }`}
      >
        {title}
      </h1>
      <p className="mt-1.5 text-muted">{subtitle}</p>
    </div>
  )
}
