import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LandingHeader } from '../components/LandingHeader'
import { HelpButton } from '../components/HelpButton'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { PLAN_LIMITS, TRIAL_DAYS, type Plan } from '../lib/plans'
import { formatCurrency } from '../lib/format'

const TARIFS_HELP = {
  title: 'Tarifs',
  purpose: 'Compare les plans Gratuit, Standard et Premium et choisis celui qui correspond à tes besoins.',
  actions: [
    'Compare les fonctionnalités incluses dans chaque plan.',
    `Standard et Premium incluent ${TRIAL_DAYS} jours d'essai gratuit — une carte est demandée à l'inscription, mais rien n'est prélevé avant la fin de l'essai.`,
    'Si tu es déjà abonné, gère ou annule ton abonnement depuis ici.',
  ],
}

const plans: {
  id: Plan
  name: string
  description: string
  features: string[]
  highlight: boolean
}[] = [
  {
    id: 'free',
    name: 'Gratuit',
    description: 'Pour commencer à voir clair dans tes finances.',
    features: [
      'Dashboard',
      'Jusqu’à 5 catégories de budget',
      '1 objectif d’épargne actif',
      'Badges de base',
      'Saisie manuelle des dépenses',
      'Calculateur d’investissement',
    ],
    highlight: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Pour aller plus loin dans le suivi de tes objectifs.',
    features: [
      'Tout ce qui est dans Gratuit',
      'Catégories de budget illimitées',
      'Objectifs d’épargne illimités',
      'Statistiques complètes (tendances, comparaisons)',
      'Import CSV de tes relevés bancaires',
      'Tous les badges',
    ],
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Pour optimiser chaque dollar, jusque dans le détail.',
    features: [
      'Tout ce qui est dans Standard',
      'Simulateur financier avancé',
      'Alertes personnalisées',
      'Export des données en PDF/Excel',
    ],
    highlight: false,
  },
]

export function Tarifs() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const subscription = useSubscription()
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null)

  async function handleChoose(planId: Exclude<Plan, 'free'>) {
    if (!user) {
      navigate('/connexion', { state: { from: '/tarifs' } })
      return
    }
    setPendingPlan(planId)
    try {
      const url = await subscription.startCheckout(planId)
      if (url) window.location.href = url
    } finally {
      setPendingPlan(null)
    }
  }

  async function handleManage() {
    setPendingPlan(subscription.plan)
    try {
      const url = await subscription.openBillingPortal()
      if (url) window.location.href = url
    } finally {
      setPendingPlan(null)
    }
  }

  return (
    <div>
      {/* Logged-in visitors get here via the app's own Nav (Layout renders
          it for /tarifs once a user session exists) — showing this too
          would stack two header bars. */}
      {!user && <LandingHeader />}

      <section className="hero-gradient relative px-4 pb-24 pt-10 text-center sm:px-6">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <HelpButton title={TARIFS_HELP.title} purpose={TARIFS_HELP.purpose} actions={TARIFS_HELP.actions} />
        </div>

        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Un plan pour chaque étape de ton budget.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Commence gratuitement, débloque plus de suivi quand tu en as besoin.
        </p>

        {subscription.error && (
          <p className="mx-auto mt-6 max-w-md rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {subscription.error}
          </p>
        )}

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 text-left sm:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = user && !subscription.loading && subscription.plan === plan.id
            // Checkout only ever starts a brand-new subscription — a user
            // who already has ANY paid plan (moving up OR down) manages that
            // through the Stripe portal instead, so they never end up with
            // two overlapping subscriptions.
            const hasOtherPaidPlan =
              user && !subscription.loading && subscription.plan !== 'free' && subscription.plan !== plan.id
            const isLoadingThis = pendingPlan === plan.id

            return (
              <div
                key={plan.id}
                className={`glass relative rounded-2xl p-6 shadow-lg shadow-black/30 ${
                  plan.highlight ? 'border-accent/40' : ''
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                    Populaire
                  </span>
                )}

                <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted">{plan.description}</p>

                {plan.id !== 'free' && (
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                    🎁 {TRIAL_DAYS} jours d'essai gratuit
                  </span>
                )}

                <p className="mt-3 text-3xl font-bold text-ink">
                  {formatCurrency(PLAN_LIMITS[plan.id].monthlyPrice)}
                  {plan.id !== 'free' && <span className="text-base font-normal text-muted">/mois</span>}
                </p>
                {plan.id !== 'free' && (
                  <p className="mt-1 text-xs text-muted">
                    Gratuit {TRIAL_DAYS} jours, puis {formatCurrency(PLAN_LIMITS[plan.id].monthlyPrice)}/mois —
                    annule avant la fin de l'essai pour ne rien payer.
                  </p>
                )}

                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                      <span className="mt-0.5 text-success">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.id === 'free' ? (
                  <Link
                    to={user ? '/dashboard' : '/connexion'}
                    className="mt-8 block rounded-lg bg-primary-strong px-4 py-2 text-center font-medium text-white transition-all hover:brightness-110"
                  >
                    {user ? 'Aller au Dashboard' : 'Commencer gratuitement'}
                  </Link>
                ) : isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="mt-8 w-full cursor-not-allowed rounded-lg border border-overlay/10 px-4 py-2 font-medium text-muted"
                  >
                    Ton plan actuel
                  </button>
                ) : hasOtherPaidPlan ? (
                  <button
                    type="button"
                    onClick={handleManage}
                    disabled={isLoadingThis}
                    className="mt-8 w-full rounded-lg border border-overlay/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
                  >
                    {isLoadingThis ? 'Redirection...' : 'Gérer mon abonnement'}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleChoose(plan.id as Exclude<Plan, 'free'>)}
                      disabled={isLoadingThis}
                      className="mt-8 w-full rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
                    >
                      {isLoadingThis ? 'Redirection...' : `Essayer ${plan.name} gratuitement`}
                    </button>
                    <p className="mt-2 text-center text-xs text-muted">Carte de crédit requise à l'inscription.</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
