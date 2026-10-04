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
    <div className="hero-gradient relative -mx-4 mb-8 rounded-b-3xl px-4 pb-8 pt-10 sm:mx-0 sm:rounded-3xl sm:px-8">
      {help && (
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <HelpButton title={help.title ?? title} purpose={help.purpose} actions={help.actions} />
        </div>
      )}
      <h1
        className={`max-w-[calc(100%-2.5rem)] font-extrabold tracking-tight text-ink ${
          compact ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl'
        }`}
      >
        {title}
      </h1>
      <p className="mt-1 text-muted">{subtitle}</p>
    </div>
  )
}
