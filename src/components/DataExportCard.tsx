import { Card } from './Card'
import { UpgradePrompt } from './UpgradePrompt'
import { useDataExport } from '../hooks/useDataExport'
import { useLanguage } from '../hooks/useLanguage'
import { STATISTIQUES } from '../lib/i18n/statistiques'

// Placed right next to "Importer des transactions" on Statistiques, per the
// same "gérer mes données" logic — import brings data in, this sends a
// full report out. Premium-gated by the caller passing canExport.
export function DataExportCard({ canExport }: { canExport: boolean }) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].dataExportCard
  const { exporting, error, exportExcel, exportPdf } = useDataExport()

  return (
    <Card title={t.title} hint={t.hint}>
      {canExport ? (
        <>
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportExcel}
              disabled={exporting}
              className="rounded-lg border border-overlay/10 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
            >
              {exporting ? t.exporting : t.downloadExcel}
            </button>
            <button
              type="button"
              onClick={exportPdf}
              disabled={exporting}
              className="rounded-lg border border-overlay/10 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
            >
              {exporting ? t.exporting : t.downloadPdf}
            </button>
          </div>
        </>
      ) : (
        <UpgradePrompt title={t.upgradeTitle} description={t.upgradeDescription} minPlan="premium" />
      )}
    </Card>
  )
}
