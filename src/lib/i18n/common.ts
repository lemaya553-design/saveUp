import type { Lang } from './language'

// Strings shared by the small components mounted inside the landing page
// and/or Tarifs (header, footer, sticky CTA, the little illustrations) —
// kept separate from home.ts/tarifs.ts since these aren't tied to one page.
export interface CommonContent {
  header: {
    navComment: string
    navFeatures: string
    navResults: string
    navPricing: string
    navFaq: string
    ctaStart: string
    openMenu: string
    closeMenu: string
  }
  footer: {
    pricing: string
    privacy: string
    terms: string
  }
  stickyCta: {
    cta: string
    noCard: string
  }
  stats: {
    badges: string
    trends: string
    steps: string
    tools: string
    monthsSuffix: string
  }
  steps: {
    step1Badge: string
    step1Title: string
    step1Body: string
    perWeek: string
    step2Badge: string
    step2Title: string
    step2Body: string
    step3Badge: string
    step3Title: string
    step3Body: string
  }
  carousel: {
    prev: string
    next: string
    altFor: (label: string) => string
    comingSoon: (label: string) => string
    screenshots: { key: string; label: string; description: string }[]
  }
  simulatorPreview: {
    whatIf: string
    cutExample: string
    towardGoal: string
    perMonth: string
  }
  illustrations: {
    budgetRows: { label: string; pct: number }[]
    savingsGoalLabel: string
  }
  heroGauge: {
    ariaLabel: (score: number) => string
    caption: string
  }
}

export const COMMON: Record<Lang, CommonContent> = {
  fr: {
    header: {
      navComment: 'Comment ça marche',
      navFeatures: 'Fonctionnalités',
      navResults: 'Résultats',
      navPricing: 'Tarifs',
      navFaq: 'FAQ',
      ctaStart: 'Commencer gratuitement',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
    },
    footer: {
      pricing: 'Tarifs',
      privacy: 'Confidentialité',
      terms: "Conditions d'utilisation",
    },
    stickyCta: {
      cta: 'Commencer gratuitement',
      noCard: 'Aucune carte de crédit requise',
    },
    stats: {
      badges: 'badges à débloquer en épargnant',
      trends: 'de tendances visualisées d’un coup d’œil',
      steps: 'étapes pour un premier budget prêt',
      tools: 'outils réunis dans une seule app',
      monthsSuffix: ' mois',
    },
    steps: {
      step1Badge: 'Étape 1 · essaie-la',
      step1Title: "C'est quoi ton revenu mensuel ?",
      step1Body: 'On calcule tout de suite un aperçu de ton budget hebdomadaire.',
      perWeek: 'par semaine, avant tes dépenses fixes.',
      step2Badge: 'Étape 2',
      step2Title: 'Tes dépenses fixes',
      step2Body: 'Loyer, abonnements — pour affiner ton budget réel.',
      step3Badge: 'Étape 3',
      step3Title: 'Ton premier objectif',
      step3Body: 'Un montant, une date, et une progression à suivre.',
    },
    carousel: {
      prev: 'Capture précédente',
      next: 'Capture suivante',
      altFor: (label) => `Aperçu de la page ${label} de SaveUp`,
      comingSoon: (label) => `Capture de ${label} à venir`,
      screenshots: [
        { key: 'dashboard', label: 'Dashboard', description: 'Ton portrait financier en un coup d’œil.' },
        { key: 'budget', label: 'Budget', description: 'Chaque dépense, chaque catégorie, à jour automatiquement.' },
        { key: 'epargne', label: 'Épargne', description: 'Tes objectifs, et le simulateur « et si » pour les tester.' },
        { key: 'statistiques', label: 'Statistiques', description: 'Tendances et comparaisons mensuelles, visualisées.' },
        { key: 'recompenses', label: 'Récompenses', description: 'Des badges qui se méritent, pas des points arbitraires.' },
      ],
    },
    simulatorPreview: {
      whatIf: 'Et si tu coupais...',
      cutExample: 'Café à emporter, tous les jours',
      towardGoal: 'Vers ton objectif',
      perMonth: '/mois',
    },
    illustrations: {
      budgetRows: [
        { label: 'Alimentation', pct: 72 },
        { label: 'Transport', pct: 45 },
        { label: 'Loisirs', pct: 96 },
      ],
      savingsGoalLabel: "Objectif : Fonds d'urgence",
    },
    heroGauge: {
      ariaLabel: (score) => `Exemple : score de santé financière de ${score} sur 100`,
      caption: 'Score de santé financière · exemple',
    },
  },
  en: {
    header: {
      navComment: 'How it works',
      navFeatures: 'Features',
      navResults: 'Results',
      navPricing: 'Pricing',
      navFaq: 'FAQ',
      ctaStart: 'Start for free',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
    footer: {
      pricing: 'Pricing',
      privacy: 'Privacy',
      terms: 'Terms of Service',
    },
    stickyCta: {
      cta: 'Start for free',
      noCard: 'No credit card required',
    },
    stats: {
      badges: 'badges to unlock by saving',
      trends: 'months of trends, visualized at a glance',
      steps: 'steps to your first ready-to-go budget',
      tools: 'tools brought together in one app',
      monthsSuffix: ' mo',
    },
    steps: {
      step1Badge: 'Step 1 · try it now',
      step1Title: "What's your monthly income?",
      step1Body: "We'll work out a rough weekly budget right away.",
      perWeek: 'a week, before your fixed expenses.',
      step2Badge: 'Step 2',
      step2Title: 'Your fixed expenses',
      step2Body: 'Rent, subscriptions — to sharpen up your real budget.',
      step3Badge: 'Step 3',
      step3Title: 'Your first goal',
      step3Body: 'An amount, a date, and progress you can actually track.',
    },
    carousel: {
      prev: 'Previous screenshot',
      next: 'Next screenshot',
      altFor: (label) => `Preview of the SaveUp ${label} page`,
      comingSoon: (label) => `${label} screenshot coming soon`,
      screenshots: [
        { key: 'dashboard', label: 'Dashboard', description: 'Your whole financial picture, at a glance.' },
        { key: 'budget', label: 'Budget', description: 'Every expense, every category, updated automatically.' },
        { key: 'epargne', label: 'Savings', description: 'Your goals, and the "what if" simulator to test them.' },
        { key: 'statistiques', label: 'Statistics', description: 'Monthly trends and comparisons, visualized.' },
        { key: 'recompenses', label: 'Rewards', description: 'Badges you actually earn — not arbitrary points.' },
      ],
    },
    simulatorPreview: {
      whatIf: 'What if you cut...',
      cutExample: 'Takeout coffee, every single day',
      towardGoal: 'Toward your goal',
      perMonth: '/mo',
    },
    illustrations: {
      budgetRows: [
        { label: 'Groceries', pct: 72 },
        { label: 'Transport', pct: 45 },
        { label: 'Fun money', pct: 96 },
      ],
      savingsGoalLabel: 'Goal: Emergency fund',
    },
    heroGauge: {
      ariaLabel: (score) => `Example: financial health score of ${score} out of 100`,
      caption: 'Financial health score · example',
    },
  },
}
