import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { PersonalizationSettings } from '../components/PersonalizationSettings'
import { IncomeInput } from '../components/IncomeInput'
import { CategoryManager } from '../components/CategoryManager'
import { CategorySuggestions } from '../components/CategorySuggestions'
import { RecategorizeCard } from '../components/RecategorizeCard'
import { PageSkeleton } from '../components/PageSkeleton'
import { useIncome } from '../hooks/useIncome'
import { useCsvExport } from '../hooks/useCsvExport'
import { useSubscription } from '../hooks/useSubscription'
import { useToast } from '../components/ToastProvider'
import { PLAN_LIMITS } from '../lib/plans'
import { formatCurrency } from '../lib/format'

const PARAMETRES_HELP = {
  purpose: 'Gère ton revenu, tes catégories de budget, ton abonnement et tes données.',
  actions: [
    'Modifie ton revenu mensuel et tes catégories de dépenses.',
    'Personnalise la couleur d\'accent, le thème et ton avatar.',
    'Consulte ton plan actuel et gère ou annule ton abonnement.',
    'Exporte tes données en CSV, ou relance l\'import d\'un relevé bancaire.',
  ],
}

export function Parametres() {
  const income = useIncome()
  const csvExport = useCsvExport()
  const subscription = useSubscription()
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [managingBilling, setManagingBilling] = useState(false)

  // Webhook usually beats the redirect back from Stripe Checkout, but not
  // always — force a fresh read instead of waiting for the next natural
  // reload, and clear the query param so this doesn't refire on revisit.
  useEffect(() => {
    if (searchParams.get('checkout') !== 'success') return
    subscription.refresh()
    showToast('Abonnement activé — merci !')
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('checkout')
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function handleManageBilling() {
    setManagingBilling(true)
    const url = await subscription.openBillingPortal()
    if (url) window.location.href = url
    setManagingBilling(false)
  }

  if (income.loading) {
    return <PageSkeleton cards={3} />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Paramètres"
        subtitle="Ton revenu, tes catégories, et tes données."
        help={PARAMETRES_HELP}
      />

      {income.error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {income.error}
        </div>
      )}

      <div className="grid gap-6">
        <Card title="Mon abonnement" hint="Ton plan actuel et ce qu'il débloque.">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                {PLAN_LIMITS[subscription.plan].label}
              </span>
              {subscription.isTrialing && (
                <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                  Essai gratuit
                </span>
              )}
              {subscription.loading && <span className="text-xs text-muted">Chargement...</span>}
            </div>
            {subscription.plan === 'free' ? (
              <Link
                to="/tarifs"
                className="rounded-lg bg-primary-strong px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
              >
                Voir les plans
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleManageBilling}
                disabled={managingBilling}
                className="rounded-lg border border-overlay/10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
              >
                {managingBilling ? 'Redirection...' : 'Gérer mon abonnement'}
              </button>
            )}
          </div>
          {subscription.isTrialing && subscription.currentPeriodEnd && (
            <p className="mt-3 text-sm text-muted">
              Ton essai se termine le{' '}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-CA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              . Ensuite, {formatCurrency(PLAN_LIMITS[subscription.plan].monthlyPrice)}/mois — annule avant cette date
              depuis « Gérer mon abonnement » pour ne rien payer.
            </p>
          )}
          {subscription.error && <p className="mt-3 text-sm text-red-400">{subscription.error}</p>}
        </Card>

        <PersonalizationSettings />

        <IncomeInput monthlyIncome={income.monthlyIncome} onChange={income.setMonthlyIncome} />

        <CategoryManager />

        <CategorySuggestions />

        <RecategorizeCard />

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
