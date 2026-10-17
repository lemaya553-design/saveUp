import type { Lang } from './language'

export interface PremiumContent {
  pageHeader: { title: string; subtitle: string }
  help: { title: string; purpose: string; actions: string[] }
  stats: {
    monthlyTotal: string
    annualTotal: string
  }
  item: {
    lastCharged: (date: string) => string
    occurrences: (n: number) => string
    keepButton: string
    reviewButton: string
  }
  empty: {
    title: string
    description: string
    importButton: string
    freeRemaining: (n: number) => string
    upgradeTitle: string
    upgradeUsedLimit: (limit: number) => string
    upgradeGeneric: string
  }
}

export const PREMIUM: Record<Lang, PremiumContent> = {
  fr: {
    pageHeader: {
      title: 'Premium',
      subtitle: 'Détecte tes abonnements et dépenses récurrentes à partir de tes transactions.',
    },
    help: {
      title: 'Premium',
      purpose:
        "Repère automatiquement les charges qui reviennent à peu près chaque mois (même marchand, montant proche) à partir des dépenses déjà dans ton compte.",
      actions: [
        "Importe un relevé bancaire (ou ajoute tes dépenses manuellement) pour avoir assez d'historique.",
        'Consulte le total mensuel et annuel de tes abonnements détectés.',
        'Marque chaque élément « Je garde » ou « À vérifier » — ça ne supprime jamais rien.',
      ],
    },
    stats: {
      monthlyTotal: 'Total par mois',
      annualTotal: 'Total par année',
    },
    item: {
      lastCharged: (date) => `Dernière charge : ${date}`,
      occurrences: (n) => `${n} fois détecté${n > 1 ? 'es' : 'e'}`,
      keepButton: 'Je garde',
      reviewButton: 'À vérifier',
    },
    empty: {
      title: 'Aucun abonnement détecté pour l’instant',
      description:
        "Importe un relevé bancaire (.csv ou .xlsx) depuis Budget → Import pour qu'on puisse repérer tes charges récurrentes — ou ajoute tes dépenses manuellement sur quelques mois.",
      importButton: 'Importer un relevé',
      freeRemaining: (n) => `Il te reste ${n} import${n > 1 ? 's' : ''} gratuit${n > 1 ? 's' : ''} ce mois-ci.`,
      upgradeTitle: 'Import de relevé — fonctionnalité Standard',
      upgradeUsedLimit: (limit) => `Tu as utilisé tes ${limit} imports gratuits. Passe à Standard pour continuer.`,
      upgradeGeneric: "L'import de relevé n'est pas inclus dans ton plan actuel.",
    },
  },
  en: {
    pageHeader: {
      title: 'Premium',
      subtitle: 'Detects your subscriptions and recurring charges from your transactions.',
    },
    help: {
      title: 'Premium',
      purpose:
        'Automatically spots charges that repeat roughly every month (same merchant, similar amount) from the expenses already in your account.',
      actions: [
        'Import a bank statement (or add your expenses manually) to have enough history.',
        'Check the monthly and yearly total of your detected subscriptions.',
        'Mark each item "Keep" or "To check" — this never deletes anything.',
      ],
    },
    stats: {
      monthlyTotal: 'Monthly total',
      annualTotal: 'Yearly total',
    },
    item: {
      lastCharged: (date) => `Last charged: ${date}`,
      occurrences: (n) => `Detected ${n} time${n > 1 ? 's' : ''}`,
      keepButton: 'Keep',
      reviewButton: 'To check',
    },
    empty: {
      title: 'No subscriptions detected yet',
      description:
        'Import a bank statement (.csv or .xlsx) from Budget → Import so we can spot your recurring charges — or add your expenses manually over a few months.',
      importButton: 'Import a statement',
      freeRemaining: (n) => `You have ${n} free import${n > 1 ? 's' : ''} left this month.`,
      upgradeTitle: 'Statement import — Standard feature',
      upgradeUsedLimit: (limit) => `You've used your ${limit} free imports. Upgrade to Standard to continue.`,
      upgradeGeneric: "Statement import isn't included in your current plan.",
    },
  },
}
