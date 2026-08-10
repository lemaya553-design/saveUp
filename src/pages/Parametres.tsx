import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { IncomeInput } from '../components/IncomeInput'
import { CategoryManager } from '../components/CategoryManager'
import { PageSkeleton } from '../components/PageSkeleton'
import { useIncome } from '../hooks/useIncome'
import { useCsvExport } from '../hooks/useCsvExport'

export function Parametres() {
  const income = useIncome()
  const csvExport = useCsvExport()

  if (income.loading) {
    return <PageSkeleton cards={3} />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader title="Paramètres" subtitle="Ton revenu, tes catégories, et tes données." />

      {income.error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {income.error}
        </div>
      )}

      <div className="grid gap-6">
        <IncomeInput monthlyIncome={income.monthlyIncome} onChange={income.setMonthlyIncome} />

        <CategoryManager />

        <Card title="Exporter tes données" hint="Toutes tes dépenses et contributions d'épargne, en CSV.">
          {csvExport.error && <p className="mb-3 text-sm text-red-400">{csvExport.error}</p>}
          <button
            type="button"
            onClick={csvExport.exportAll}
            disabled={csvExport.exporting}
            className="rounded-lg bg-primary-strong px-5 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
          >
            {csvExport.exporting ? 'Export en cours...' : 'Télécharger le CSV'}
          </button>
        </Card>

        <Card
          title="Légal"
          hint="Quelles données on garde, comment elles sont utilisées, et les conditions du service."
        >
          <div className="flex flex-col gap-2">
            <Link
              to="/confidentialite"
              className="text-sm font-medium text-accent hover:text-accent/80"
            >
              Voir la politique de confidentialité →
            </Link>
            <Link
              to="/conditions"
              className="text-sm font-medium text-accent hover:text-accent/80"
            >
              Voir les conditions d'utilisation →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
