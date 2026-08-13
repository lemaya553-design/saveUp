import { Card } from './Card'
import { UpgradePrompt } from './UpgradePrompt'
import { useDataExport } from '../hooks/useDataExport'

// Placed right next to "Importer des transactions" on Statistiques, per the
// same "gérer mes données" logic — import brings data in, this sends a
// full report out. Premium-gated by the caller passing canExport.
export function DataExportCard({ canExport }: { canExport: boolean }) {
  const { exporting, error, exportExcel, exportPdf } = useDataExport()

  return (
    <Card
      title="Exporter un rapport"
      hint="Résumé, dépenses fixes, transactions et objectifs, en PDF ou Excel."
    >
      {canExport ? (
        <>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportExcel}
              disabled={exporting}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white/5 disabled:opacity-60"
            >
              {exporting ? 'Export en cours...' : 'Télécharger en Excel'}
            </button>
            <button
              type="button"
              onClick={exportPdf}
              disabled={exporting}
              className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white/5 disabled:opacity-60"
            >
              {exporting ? 'Export en cours...' : 'Télécharger en PDF'}
            </button>
          </div>
        </>
      ) : (
        <UpgradePrompt
          title="Export PDF/Excel — fonctionnalité Premium"
          description="Télécharge un rapport complet de ton budget, tes dépenses et tes objectifs, prêt à partager ou archiver."
          minPlan="premium"
        />
      )}
    </Card>
  )
}
