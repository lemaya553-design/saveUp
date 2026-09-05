import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Card } from '../components/Card'
import { TabBar, type TabDef } from '../components/TabBar'
import { PersonalizationSettings } from '../components/PersonalizationSettings'
import { IncomeInput } from '../components/IncomeInput'
import { PageSkeleton } from '../components/PageSkeleton'
import { useIncome } from '../hooks/useIncome'
import { useSubscription } from '../hooks/useSubscription'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { useToast } from '../components/ToastProvider'
import { PLAN_LIMITS } from '../lib/plans'
import { formatCurrency } from '../lib/format'

type Tab = 'compte' | 'abonnement' | 'preferences'
const TABS: Tab[] = ['compte', 'abonnement', 'preferences']
const TAB_DEFS: TabDef<Tab>[] = [
  { key: 'compte', label: 'Compte' },
  { key: 'abonnement', label: 'Abonnement' },
  { key: 'preferences', label: 'Préférences' },
]

const COMPTE_HELP = {
  title: 'Compte',
  purpose: 'Ton revenu mensuel, et les infos légales sur SaveUp.',
  actions: [
    'Modifie ton revenu mensuel — le reste de l\'app se recalcule automatiquement.',
    'Consulte la politique de confidentialité et les conditions d\'utilisation.',
  ],
}

const ABONNEMENT_HELP = {
  title: 'Abonnement',
  purpose: 'Ton plan actuel, ce qu\'il débloque, et la gestion de ton abonnement.',
  actions: [
    'Consulte ton plan actuel et la date de fin de ton essai, s\'il y a lieu.',
    'Passe à un plan supérieur ou gère/annule ton abonnement.',
  ],
}

const PREFERENCES_HELP = {
  title: 'Préférences',
  purpose: 'L\'apparence de SaveUp, juste pour toi.',
  actions: [
    'Choisis ta couleur d\'accent et ton thème.',
    'Personnalise ton avatar.',
  ],
}

const HELP_BY_TAB: Record<Tab, typeof COMPTE_HELP> = {
  compte: COMPTE_HELP,
  abonnement: ABONNEMENT_HELP,
  preferences: PREFERENCES_HELP,
}

export function Parametres() {
  const { tab: tabParam } = useParams<{ tab: string }>()
  const navigate = useNavigate()
  const income = useIncome()
  const subscription = useSubscription()
  const pwaInstall = usePwaInstall()
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

  if (!tabParam || !TABS.includes(tabParam as Tab)) {
    return <Navigate to="/parametres/compte" replace />
  }
  const tab = tabParam as Tab

  if (income.loading) {
    return <PageSkeleton cards={3} />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10">
      <PageHeader
        title="Paramètres"
        subtitle="Ton compte, ton abonnement, et tes préférences."
        help={HELP_BY_TAB[tab]}
      />

      <TabBar tabs={TAB_DEFS} active={tab} onChange={(next) => navigate(`/parametres/${next}`)} />

      {tab === 'compte' && income.error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {income.error}
        </div>
      )}

      {tab === 'compte' && (
        <div className="grid gap-6">
          <IncomeInput monthlyIncome={income.monthlyIncome} onChange={income.setMonthlyIncome} />

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

          <Card title="Application" hint="Ajoute SaveUp à ton écran d'accueil pour un accès plus rapide.">
            {pwaInstall.standalone ? (
              <p className="text-sm text-muted">✅ SaveUp est installée sur cet appareil.</p>
            ) : pwaInstall.platform === 'unsupported' ? (
              <p className="text-sm text-muted">
                L'installation n'est pas proposée par ce navigateur.
              </p>
            ) : (
              <button
                type="button"
                onClick={pwaInstall.reopen}
                className="rounded-lg border border-overlay/10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-overlay/5"
              >
                Revoir l'invite d'installation
              </button>
            )}
          </Card>
        </div>
      )}

      {tab === 'abonnement' && (
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
        </div>
      )}

      {tab === 'preferences' && (
        <div className="grid gap-6">
          <PersonalizationSettings />
        </div>
      )}
    </div>
  )
}
