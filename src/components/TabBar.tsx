// Shared segmented-pill tab bar — extracted from the Épargne page's
// Objectifs/Simulateur toggle so every tabbed page (Budget, Épargne,
// Statistiques, Paramètres) renders the exact same control.
export interface TabDef<T extends string> {
  key: T
  label: string
}

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef<T>[]
  active: T
  onChange: (key: T) => void
}) {
  return (
    // overflow-x-auto (not wrap): on narrow screens 4 tabs plus the longer
    // French labels ("Simulateur « et si »") don't fit on one line — letting
    // them wrap or shrink either breaks to 2 lines or clips the last tab.
    // Scrolling keeps every label intact and on one line at any width.
    <div className="glass mb-6 flex max-w-full gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            active === t.key
              ? 'bg-primary-strong text-white shadow-md shadow-primary/30'
              : 'text-muted hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
