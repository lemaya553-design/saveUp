import type { Lang } from './language'

// Strings shared by the small components mounted inside the landing page
// and/or Tarifs (header, footer, sticky CTA, the little illustrations) —
// kept separate from home.ts/tarifs.ts since these aren't tied to one page.
export interface CommonContent {
  // Universal action words repeated across dozens of components throughout
  // the signed-in app (edit/delete/save buttons, modal close, form nav).
  // Every page/component dictionary should reuse these via
  // COMMON[lang].app.* instead of re-declaring its own translation of
  // "Modifier"/"Supprimer"/etc., so the same action is never worded two
  // different ways in two different corners of the app.
  app: {
    modify: string
    delete: string
    cancel: string
    save: string
    add: string
    close: string
    continueAction: string
    back: string
    loading: string
    confirm: string
    createAction: string
    // Shared across every hook that guards a mutation behind a still-present
    // userId — reused instead of re-declaring the same sentence in
    // useAccounts.ts/useExpenses.ts/useSubscription.ts.
    sessionExpired: string
    // Generic insert-failure fallback shown only when the database didn't
    // return a more specific error message — reused across
    // useCategories.ts/useExpenses.ts/useFixedExpenses.ts/useSavingsGoals.ts.
    saveFailed: string
  }
  header: {
    navComment: string
    navFeatures: string
    navResults: string
    navPricing: string
    navFaq: string
    ctaStart: string
    // Narrow-phone variant of ctaStart (< sm breakpoint) — the full label
    // wraps to two lines at 375px once the always-visible language switcher
    // sits on the same row, so this frees the width that needs instead.
    ctaStartShort: string
    openMenu: string
    closeMenu: string
  }
  // Shared by Budget.tsx and Parametres.tsx (Compte tab) — same component,
  // same copy in both places.
  incomeInput: {
    title: string
    hint: string
  }
  // The signed-in app's own top nav (Nav.tsx) — distinct from `header`
  // above, which is the logged-out marketing header.
  nav: {
    dashboard: string
    budget: string
    epargne: string
    statistiques: string
    tarifs: string
    parametres: string
    signOut: string
    settingsAriaLabel: string
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
  // Display-only currency picker (Nav) — see CurrencySwitcher.tsx. The
  // confirm step only appears once the account has real data (useHasRealActivity),
  // so a brand-new user picking their currency up front never sees it.
  currencySwitcher: {
    ariaLabel: string
    confirmTitle: string
    confirmBody: (from: string, to: string) => string
  }
  // Shared by every manual expense-entry form that uses useCategorySuggestion
  // (QuickAddFab, FixedExpenses, RecurringExpenses' add form) — same two
  // messages regardless of which form is showing them.
  categorySuggestion: {
    suggestedHint: string
    newCategoryHint: (name: string) => string
  }
  // The "price in hours worked" equivalent shown under an amount, wherever
  // useWorkHours' caller decides it belongs — never generated centrally, see
  // lib/workHours.ts for the bucket thresholds (minutes / hours / hours+days).
  workHours: {
    minutes: (m: number) => string
    hours: (h: number) => string
    hoursAndDays: (h: number, d: number) => string
  }
}

export const COMMON: Record<Lang, CommonContent> = {
  fr: {
    app: {
      modify: 'Modifier',
      delete: 'Supprimer',
      cancel: 'Annuler',
      save: 'Enregistrer',
      add: 'Ajouter',
      close: 'Fermer',
      continueAction: 'Continuer',
      back: 'Retour',
      loading: 'Chargement...',
      confirm: 'Confirmer',
      createAction: 'Créer',
      sessionExpired: 'Ta session a expiré — reconnecte-toi et réessaie.',
      saveFailed: "Impossible d'enregistrer — réessaie.",
    },
    header: {
      navComment: 'Comment ça marche',
      navFeatures: 'Fonctionnalités',
      navResults: 'Résultats',
      navPricing: 'Tarifs',
      navFaq: 'FAQ',
      ctaStart: 'Créer mon compte gratuit',
      ctaStartShort: "S'inscrire",
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
    },
    incomeInput: {
      title: 'Revenu mensuel',
      hint: "On l'utilise pour calculer ton budget hebdomadaire disponible.",
    },
    nav: {
      dashboard: 'Dashboard',
      budget: 'Budget',
      epargne: 'Épargne',
      statistiques: 'Statistiques',
      tarifs: 'Tarifs',
      parametres: 'Paramètres',
      signOut: 'Déconnexion',
      settingsAriaLabel: 'Paramètres et personnalisation',
    },
    footer: {
      pricing: 'Tarifs',
      privacy: 'Confidentialité',
      terms: "Conditions d'utilisation",
    },
    stickyCta: {
      cta: 'Créer mon compte gratuit',
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
    currencySwitcher: {
      ariaLabel: 'Choisir la devise',
      confirmTitle: "Changer la devise d'affichage ?",
      confirmBody: (from, to) =>
        `Tes montants ont été saisis en ${from}. Ils seront affichés en ${to} sans conversion.`,
    },
    categorySuggestion: {
      suggestedHint: 'Catégorie suggérée à partir de la description — modifiable.',
      newCategoryHint: (name) => `Une nouvelle catégorie « ${name} » sera créée automatiquement.`,
    },
    workHours: {
      minutes: (m) => `${m} min de travail`,
      hours: (h) => `${h} h de travail`,
      hoursAndDays: (h, d) => `${h} h · ${d} jour${d > 1 ? 's' : ''}`,
    },
  },
  en: {
    app: {
      modify: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
      add: 'Add',
      close: 'Close',
      continueAction: 'Continue',
      back: 'Back',
      loading: 'Loading...',
      confirm: 'Confirm',
      createAction: 'Create',
      sessionExpired: 'Your session has expired — sign back in and try again.',
      saveFailed: "Couldn't save — try again.",
    },
    header: {
      navComment: 'How it works',
      navFeatures: 'Features',
      navResults: 'Results',
      navPricing: 'Pricing',
      navFaq: 'FAQ',
      ctaStart: 'Create my free account',
      ctaStartShort: 'Sign up',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
    incomeInput: {
      title: 'Monthly income',
      hint: 'Used to work out your available weekly budget.',
    },
    nav: {
      dashboard: 'Dashboard',
      budget: 'Budget',
      epargne: 'Savings',
      statistiques: 'Statistics',
      tarifs: 'Pricing',
      parametres: 'Settings',
      signOut: 'Sign out',
      settingsAriaLabel: 'Settings and personalization',
    },
    footer: {
      pricing: 'Pricing',
      privacy: 'Privacy',
      terms: 'Terms of Service',
    },
    stickyCta: {
      cta: 'Create my free account',
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
    currencySwitcher: {
      ariaLabel: 'Choose currency',
      confirmTitle: 'Change display currency?',
      confirmBody: (from, to) =>
        `Your amounts were entered in ${from}. They'll be displayed in ${to} without conversion.`,
    },
    categorySuggestion: {
      suggestedHint: 'Category suggested from the description — editable.',
      newCategoryHint: (name) => `A new category "${name}" will be created automatically.`,
    },
    workHours: {
      minutes: (m) => `${m} min of work`,
      hours: (h) => `${h} h of work`,
      hoursAndDays: (h, d) => `${h} h · ${d} day${d > 1 ? 's' : ''}`,
    },
  },
}
