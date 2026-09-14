import type { Lang } from './language'

export interface OnboardingContent {
  // Step titles used both in the top "Étape X sur Y — {label}" indicator
  // and nowhere else — kept as a flat array to match the STEPS index used
  // by the wizard's `step` state.
  steps: string[]
  stepIndicator: (current: number, total: number, label: string) => string
  skipLater: string
  step0: {
    title: string
    importCardTitle: string
    importCardDesc: string
    importsRemaining: (count: number) => string
    upgradeTitle: string
    upgradeDescUsedLimit: (limit: number) => string
    upgradeDescFreePlan: string
    continueWithoutImport: string
  }
  step1: {
    title: string
    subtitle: string
    amountPlaceholder: string
  }
  step2: {
    title: string
    subtitle: string
    namePlaceholder: string
    amountPlaceholder: string
  }
  step3: {
    title: string
    subtitle: string
    namePlaceholder: string
    amountPlaceholder: string
    dueDateLabel: string
  }
  step4: {
    title: string
    subtitle: string
  }
  step5: {
    title: string
    subtitle: string
    yes: string
    no: string
  }
  step6: {
    title: string
    subtitle: string
  }
  step7: {
    badge: string
    previewTitle: string
    dashboardCta: string
  }
}

export const ONBOARDING: Record<Lang, OnboardingContent> = {
  fr: {
    steps: [
      'Données de départ',
      'Revenu',
      'Dépenses fixes',
      'Objectif d’épargne',
      'Ton objectif principal',
      'Ton expérience',
      'Ton rythme de suivi',
      'Ton profil',
    ],
    stepIndicator: (current, total, label) => `Étape ${current} sur ${total} — ${label}`,
    skipLater: 'Configurer plus tard',
    step0: {
      title: 'Remplis ton compte pour voir l’app en action',
      importCardTitle: '📄 Importer mon relevé bancaire',
      importCardDesc:
        'Depuis un fichier .csv ou .xlsx exporté de ta banque — tes vraies transactions, catégorisées automatiquement.',
      importsRemaining: (count) =>
        ` Il te reste ${count} import${count > 1 ? 's' : ''} gratuit${count > 1 ? 's' : ''} sur le plan Gratuit.`,
      upgradeTitle: 'Import CSV — fonctionnalité Standard',
      upgradeDescUsedLimit: (limit) =>
        `Tu as utilisé tes ${limit} imports gratuits — ajoute tes dépenses à la main, ou passe à Standard pour un import illimité.`,
      upgradeDescFreePlan:
        'Sur le plan Gratuit, ajoute tes dépenses à la main — ou passe à Standard pour importer un relevé bancaire directement.',
      continueWithoutImport: 'Continuer sans importer →',
    },
    step1: {
      title: 'C’est quoi ton revenu mensuel ?',
      subtitle: 'On s’en sert pour calculer ce que tu peux dépenser chaque semaine, automatiquement.',
      amountPlaceholder: '0.00',
    },
    step2: {
      title: 'Tes dépenses fixes principales',
      subtitle:
        'Loyer, abonnements, assurances — tout ce qui revient chaque mois. Tu pourras en ajouter d’autres plus tard.',
      namePlaceholder: 'Nom (ex: Loyer)',
      amountPlaceholder: 'Montant',
    },
    step3: {
      title: 'Fixe un premier objectif d’épargne',
      subtitle:
        'Un montant à atteindre, et une date si tu en as une en tête. Tu pourras l’ajuster n’importe quand.',
      namePlaceholder: 'Nom de l’objectif (ex: Mon premier objectif)',
      amountPlaceholder: 'Montant cible',
      dueDateLabel: 'Échéance (optionnel)',
    },
    step4: {
      title: 'Quel est ton objectif principal ?',
      subtitle: 'Ça nous aide à mettre en avant ce qui compte le plus pour toi.',
    },
    step5: {
      title: 'As-tu déjà essayé une autre app de budget avant ?',
      subtitle: 'Si quelque chose ne t\'a pas convaincu ailleurs, on aimerait mieux faire ici.',
      yes: 'Oui',
      no: 'Non',
    },
    step6: {
      title: 'À quelle fréquence veux-tu suivre tes finances ?',
      subtitle: 'On adapte ce qu\'on te montre en premier selon ton rythme.',
    },
    step7: {
      badge: 'Ton profil',
      previewTitle: 'Ce que SaveUp va te montrer',
      dashboardCta: 'Voir mon Dashboard',
    },
  },
  en: {
    steps: [
      'Starting data',
      'Income',
      'Fixed expenses',
      'Savings goal',
      'Your main goal',
      'Your experience',
      'Your tracking pace',
      'Your profile',
    ],
    stepIndicator: (current, total, label) => `Step ${current} of ${total} — ${label}`,
    skipLater: 'Set up later',
    step0: {
      title: 'Fill in your account to see the app in action',
      importCardTitle: '📄 Import my bank statement',
      importCardDesc:
        'From a .csv or .xlsx file exported from your bank — your real transactions, categorized automatically.',
      importsRemaining: (count) =>
        ` You have ${count} free import${count > 1 ? 's' : ''} left on the Free plan.`,
      upgradeTitle: 'CSV import — Standard feature',
      upgradeDescUsedLimit: (limit) =>
        `You've used your ${limit} free imports — add your expenses by hand, or upgrade to Standard for unlimited imports.`,
      upgradeDescFreePlan:
        'On the Free plan, add your expenses by hand — or upgrade to Standard to import a bank statement directly.',
      continueWithoutImport: 'Continue without importing →',
    },
    step1: {
      title: "What's your monthly income?",
      subtitle: "We use it to automatically work out what you can spend each week.",
      amountPlaceholder: '0.00',
    },
    step2: {
      title: 'Your main fixed expenses',
      subtitle:
        "Rent, subscriptions, insurance — anything that comes back every month. You can add more later.",
      namePlaceholder: 'Name (e.g. Rent)',
      amountPlaceholder: 'Amount',
    },
    step3: {
      title: 'Set your first savings goal',
      subtitle: "A target amount, and a date if you have one in mind. You can adjust it anytime.",
      namePlaceholder: 'Goal name (e.g. My first goal)',
      amountPlaceholder: 'Target amount',
      dueDateLabel: 'Deadline (optional)',
    },
    step4: {
      title: "What's your main goal?",
      subtitle: 'This helps us highlight what matters most to you.',
    },
    step5: {
      title: 'Have you tried another budgeting app before?',
      subtitle: "If something didn't win you over elsewhere, we'd like to do better here.",
      yes: 'Yes',
      no: 'No',
    },
    step6: {
      title: 'How often do you want to track your finances?',
      subtitle: "We tailor what we show you first to your pace.",
    },
    step7: {
      badge: 'Your profile',
      previewTitle: "What SaveUp is going to show you",
      dashboardCta: 'See my Dashboard',
    },
  },
}
