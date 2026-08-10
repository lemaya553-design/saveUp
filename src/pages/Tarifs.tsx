import { Link } from 'react-router-dom'
import { LandingHeader } from '../components/LandingHeader'

const plans = [
  {
    name: 'Gratuit',
    price: '0 $',
    period: '',
    description: 'Pour commencer à voir clair dans tes finances.',
    features: [
      'Budget hebdomadaire',
      'Dépenses illimitées',
      '1 objectif d’épargne',
      'Calculateur d’investissement',
    ],
    cta: 'available',
    highlight: false,
  },
  {
    name: 'Standard',
    price: '7,99 $',
    period: '/mois',
    description: 'Pour aller plus loin dans le suivi de tes objectifs.',
    features: [
      'Tout ce qui est dans Gratuit',
      'Objectifs d’épargne illimités',
      'Historique complet des dépenses',
      'Export CSV',
    ],
    cta: 'soon',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '14,99 $',
    period: '/mois',
    description: 'Pour optimiser chaque dollar, jusque dans le détail.',
    features: [
      'Tout ce qui est dans Standard',
      'Suivi multi-comptes',
      'Rapports mensuels',
      'Support prioritaire',
    ],
    cta: 'soon',
    highlight: false,
  },
]

export function Tarifs() {
  return (
    <div>
      <LandingHeader />

      <section className="hero-gradient px-4 pb-24 pt-10 text-center sm:px-6">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
          Un plan pour chaque étape de ton budget.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Commence gratuitement, débloque plus de suivi quand tu en as besoin.
        </p>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 text-left sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
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

              <p className="mt-4 text-3xl font-bold text-ink">
                {plan.price}
                <span className="text-base font-normal text-muted">{plan.period}</span>
              </p>

              <ul className="mt-6 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-0.5 text-success">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.cta === 'available' ? (
                <Link
                  to="/dashboard"
                  className="mt-8 block rounded-lg bg-primary-strong px-4 py-2 text-center font-medium text-white transition-all hover:brightness-110"
                >
                  Commencer gratuitement
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-8 w-full cursor-not-allowed rounded-lg border border-white/10 px-4 py-2 font-medium text-muted"
                >
                  Bientôt disponible
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
