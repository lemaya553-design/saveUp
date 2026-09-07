import type { Lang } from './language'
import type { Plan } from '../plans'

export interface TarifsContent {
  help: {
    title: string
    purpose: string
    actions: (trialDays: number) => string[]
  }
  hero: {
    title: string
    subtitle: string
  }
  popular: string
  trialBadge: (days: number) => string
  perMonth: string
  plans: Record<Plan, { name: string; description: string; features: string[] }>
  cta: {
    goToDashboard: string
    startFree: string
    currentPlan: string
    redirecting: string
    manageSubscription: string
    tryFree: (planName: string) => string
    cardRequired: string
  }
}

export const TARIFS: Record<Lang, TarifsContent> = {
  fr: {
    help: {
      title: 'Tarifs',
      purpose: 'Compare les plans Gratuit, Standard et Premium et choisis celui qui correspond à tes besoins.',
      actions: (trialDays) => [
        'Compare les fonctionnalités incluses dans chaque plan.',
        `Standard et Premium incluent ${trialDays} jours d'essai gratuit — une carte est demandée à l'inscription, mais rien n'est prélevé avant la fin de l'essai.`,
        'Si tu es déjà abonné, gère ou annule ton abonnement depuis ici.',
      ],
    },
    hero: {
      title: 'Un plan pour chaque étape de ton budget.',
      subtitle: 'Commence gratuitement, débloque plus de suivi quand tu en as besoin.',
    },
    popular: 'Populaire',
    trialBadge: (days) => `Essai gratuit de ${days} jours`,
    perMonth: '/mois',
    plans: {
      free: {
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
      },
      standard: {
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
      },
      premium: {
        name: 'Premium',
        description: 'Pour optimiser chaque dollar, jusque dans le détail.',
        features: [
          'Tout ce qui est dans Standard',
          'Simulateur financier avancé',
          'Alertes personnalisées',
          'Export des données en PDF/Excel',
        ],
      },
    },
    cta: {
      goToDashboard: 'Aller au Dashboard',
      startFree: 'Commencer gratuitement',
      currentPlan: 'Ton plan actuel',
      redirecting: 'Redirection...',
      manageSubscription: 'Gérer mon abonnement',
      tryFree: (planName) => `Essayer ${planName} gratuitement`,
      cardRequired: "Carte de crédit requise à l'inscription.",
    },
  },
  en: {
    help: {
      title: 'Pricing',
      purpose: 'Compare the Free, Standard, and Premium plans and pick the one that fits your needs.',
      actions: (trialDays) => [
        'Compare what each plan includes.',
        `Standard and Premium include a ${trialDays}-day free trial — a card is required to sign up, but nothing is charged until the trial ends.`,
        'Already subscribed? Manage or cancel your subscription right from here.',
      ],
    },
    hero: {
      title: 'A plan for every stage of your budget.',
      subtitle: 'Start for free, unlock more tracking as you need it.',
    },
    popular: 'Popular',
    trialBadge: (days) => `${days}-day free trial`,
    perMonth: '/mo',
    plans: {
      free: {
        name: 'Free',
        description: 'To start seeing your finances clearly.',
        features: [
          'Dashboard',
          'Up to 5 budget categories',
          '1 active savings goal',
          'Basic badges',
          'Manual expense entry',
          'Investment calculator',
        ],
      },
      standard: {
        name: 'Standard',
        description: 'To go further in tracking your goals.',
        features: [
          'Everything in Free',
          'Unlimited budget categories',
          'Unlimited savings goals',
          'Full statistics (trends, comparisons)',
          'CSV import for your bank statements',
          'All badges',
        ],
      },
      premium: {
        name: 'Premium',
        description: 'To optimize every dollar, down to the detail.',
        features: [
          'Everything in Standard',
          'Advanced financial simulator',
          'Custom alerts',
          'PDF/Excel data export',
        ],
      },
    },
    cta: {
      goToDashboard: 'Go to Dashboard',
      startFree: 'Start for free',
      currentPlan: 'Your current plan',
      redirecting: 'Redirecting...',
      manageSubscription: 'Manage subscription',
      tryFree: (planName) => `Try ${planName} free`,
      cardRequired: 'Credit card required to sign up.',
    },
  },
}
