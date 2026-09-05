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
    <div className="glass mb-6 inline-flex gap-1 rounded-full p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
