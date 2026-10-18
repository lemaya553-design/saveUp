import type { Lang } from './language'
import type { ReviewReason } from '../subscriptionReview'

export interface PremiumContent {
  pageHeader: { title: string; subtitle: string }
  help: { title: string; purpose: string; actions: string[] }
  stats: {
    monthlyTotal: string
    annualTotalInline: (amount: string) => string
  }
  item: {
    lastCharged: (date: string) => string
    occurrences: (n: number) => string
    keepButton: string
    reviewButton: string
    reviewBadge: (reason: string) => string
    editReview: string
  }
  reasonLabels: Record<ReviewReason, string>
  reviewModal: {
    title: (name: string) => string
    questionReason: string
    questionUsage: string
    usageLow: string
    usageHigh: string
    questionNote: string
    notePlaceholder: string
    noteCounter: (used: number, max: number) => string
    save: string
    cancel: string
  }
  keptSection: {
    linkLabel: (n: number) => string
    heading: string
    restoreButton: string
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
  allKept: {
    title: string
    description: string
  }
  categoryBenchmark: {
    title: string
    hint: string
    disclaimer: string
    totalPre: string
    totalPost: string
    noIncome: string
    empty: {
      title: string
      description: string
    }
    categoryLabels: Record<'loyer' | 'epicerie' | 'restaurants' | 'transport' | 'abonnements' | 'autre', string>
    possessiveLabels: Record<'loyer' | 'epicerie' | 'restaurants' | 'transport' | 'abonnements' | 'autre', string>
    amountAndPct: (amount: string, pct: number) => string
    benchmarkLabel: (pct: number) => string
    overBenchmarkBadge: string
    reductionLabel: (pct: number) => string
    reductionSliderAria: (categoryLabel: string) => string
    reductionSentence: (possessiveLabel: string, reductionPct: number, monthly: string, annual: string) => string
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
      annualTotalInline: (amount) => `soit ${amount} par année`,
    },
    item: {
      lastCharged: (date) => `Dernière charge : ${date}`,
      occurrences: (n) => `${n} fois détecté${n > 1 ? 'es' : 'e'}`,
      keepButton: 'Je garde',
      reviewButton: 'À vérifier',
      reviewBadge: (reason) => `À vérifier · ${reason}`,
      editReview: 'Modifier',
    },
    reasonLabels: {
      dont_recognize: 'Je ne le reconnais pas',
      want_to_cancel: "Je veux l'annuler",
      rarely_use: "Je l'utilise peu",
      one_time_purchase: 'C’est un achat ponctuel',
      other: 'Autre',
    },
    reviewModal: {
      title: (name) => `À vérifier : ${name}`,
      questionReason: 'Pourquoi veux-tu vérifier cet abonnement ?',
      questionUsage: "À quel point tu l'utilises ?",
      usageLow: 'Jamais',
      usageHigh: 'Tout le temps',
      questionNote: 'Veux-tu une note ?',
      notePlaceholder: 'Ajoute une note (optionnel)...',
      noteCounter: (used, max) => `${used}/${max}`,
      save: 'Enregistrer',
      cancel: 'Annuler',
    },
    keptSection: {
      linkLabel: (n) => `Abonnements gardés (${n})`,
      heading: 'Abonnements gardés',
      restoreButton: 'Remettre dans la liste',
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
    allKept: {
      title: 'Tout est trié !',
      description: 'Tous tes abonnements détectés sont dans ta liste « Gardés », en bas de page.',
    },
    categoryBenchmark: {
      title: 'Dépenses par catégorie vs repères',
      hint: 'Basé sur tes transactions importées et ton revenu mensuel.',
      disclaimer: 'Les repères sont des repères généraux, pas des conseils financiers.',
      totalPre: 'Tes dépenses représentent',
      totalPost: 'de ton revenu ce mois-ci',
      noIncome: 'Ajoute ton revenu mensuel dans Paramètres pour voir cette analyse.',
      empty: {
        title: 'Importe un relevé pour voir cette analyse',
        description:
          'Dès que tu as importé un relevé bancaire (CSV ou Excel), tes dépenses par catégorie apparaissent ici, comparées à des repères généraux.',
      },
      categoryLabels: {
        loyer: 'Loyer',
        epicerie: 'Épicerie',
        restaurants: 'Restaurants',
        transport: 'Transport',
        abonnements: 'Abonnements',
        autre: 'Autre',
      },
      possessiveLabels: {
        loyer: 'ton loyer',
        epicerie: 'ton épicerie',
        restaurants: 'tes restaurants',
        transport: 'ton transport',
        abonnements: 'tes abonnements',
        autre: 'tes autres dépenses',
      },
      amountAndPct: (amount, pct) => `${amount} · ${pct.toFixed(0)} % du revenu`,
      benchmarkLabel: (pct) => `Repère : ${pct} % du revenu`,
      overBenchmarkBadge: 'Au-dessus du repère',
      reductionLabel: (pct) => `Réduction simulée : ${pct} %`,
      reductionSliderAria: (categoryLabel) => `Pourcentage de réduction simulé pour ${categoryLabel}`,
      reductionSentence: (possessiveLabel, reductionPct, monthly, annual) =>
        `Si tu réduis ${possessiveLabel} de ${reductionPct} %, tu gardes environ ${monthly} par mois, soit ${annual} par année.`,
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
      annualTotalInline: (amount) => `that's ${amount} per year`,
    },
    item: {
      lastCharged: (date) => `Last charged: ${date}`,
      occurrences: (n) => `Detected ${n} time${n > 1 ? 's' : ''}`,
      keepButton: 'Keep',
      reviewButton: 'To check',
      reviewBadge: (reason) => `To check · ${reason}`,
      editReview: 'Edit',
    },
    reasonLabels: {
      dont_recognize: "I don't recognize it",
      want_to_cancel: 'I want to cancel it',
      rarely_use: 'I rarely use it',
      one_time_purchase: 'It was a one-time purchase',
      other: 'Other',
    },
    reviewModal: {
      title: (name) => `To check: ${name}`,
      questionReason: 'Why do you want to check this subscription?',
      questionUsage: 'How much do you use it?',
      usageLow: 'Never',
      usageHigh: 'All the time',
      questionNote: 'Want to add a note?',
      notePlaceholder: 'Add a note (optional)...',
      noteCounter: (used, max) => `${used}/${max}`,
      save: 'Save',
      cancel: 'Cancel',
    },
    keptSection: {
      linkLabel: (n) => `Kept subscriptions (${n})`,
      heading: 'Kept subscriptions',
      restoreButton: 'Move back to the list',
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
    allKept: {
      title: 'All sorted!',
      description: 'Every detected subscription is in your "Kept" list, at the bottom of the page.',
    },
    categoryBenchmark: {
      title: 'Spending by category vs. reference points',
      hint: 'Based on your imported transactions and your monthly income.',
      disclaimer: 'These are general reference points, not financial advice.',
      totalPre: 'Your spending is',
      totalPost: 'of your income this month',
      noIncome: 'Add your monthly income in Settings to see this analysis.',
      empty: {
        title: 'Import a statement to see this analysis',
        description:
          'Once you import a bank statement (CSV or Excel), your spending by category shows up here, compared to general reference points.',
      },
      categoryLabels: {
        loyer: 'Rent',
        epicerie: 'Groceries',
        restaurants: 'Restaurants',
        transport: 'Transport',
        abonnements: 'Subscriptions',
        autre: 'Other',
      },
      possessiveLabels: {
        loyer: 'your rent',
        epicerie: 'your groceries',
        restaurants: 'your restaurant spending',
        transport: 'your transport spending',
        abonnements: 'your subscriptions',
        autre: 'your other expenses',
      },
      amountAndPct: (amount, pct) => `${amount} · ${pct.toFixed(0)}% of income`,
      benchmarkLabel: (pct) => `Reference: ${pct}% of income`,
      overBenchmarkBadge: 'Above reference',
      reductionLabel: (pct) => `Simulated cut: ${pct}%`,
      reductionSliderAria: (categoryLabel) => `Simulated reduction percentage for ${categoryLabel}`,
      reductionSentence: (possessiveLabel, reductionPct, monthly, annual) =>
        `If you cut ${possessiveLabel} by ${reductionPct}%, you'd keep about ${monthly} a month, or ${annual} a year.`,
    },
  },
}
