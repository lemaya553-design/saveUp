import type { Lang } from './language'
import type { RecurringFrequency } from '../recurringExpenses'

// Strings for a handful of globally-mounted components that don't belong to
// any one page: the quick-add FAB + modal (Layout.tsx, every signed-in
// page), the PWA install banner (Layout.tsx), the top-level crash fallback
// (main.tsx), and the "?" help popover (used broadly via PageHeader/Tarifs).
export interface MiscContent {
  quickAddFab: {
    fabAriaLabel: string
    modalTitle: string
    frequentLabel: string
    descriptionPlaceholder: string
    amountPlaceholder: string
    // Frequency labels owned locally (not imported from recurringExpenses.ts)
    // so this file doesn't take a cross-cutting dependency on a lib another
    // slice is translating — see src/lib/recurringExpenses.ts for the
    // canonical (currently French-only) FREQUENCY_OPTIONS this mirrors.
    frequencyOptions: { value: RecurringFrequency; label: string }[]
    makeRecurring: string
    recurringLimitTitle: (max: number) => string
    recurringLimitDescription: string
    frequencyLabel: string
    firstOccurrenceLabel: string
    endDateOptionalLabel: string
    submitAdd: string
    submitAdding: string
    submitCreateRecurring: string
    toastRecurringCreated: (label: string, amount: string) => string
    toastExpenseAdded: (label: string, amount: string) => string
  }
  pwaInstallBanner: {
    regionAriaLabel: string
    iosTitle: string
    iosStepPrefix: string
    iosStepMiddle: string
    iosStepAction: string
    androidTitle: string
    androidBody: string
    installButton: string
    closeAriaLabel: string
  }
  errorBoundary: {
    title: string
    body: string
    reload: string
  }
  helpButton: {
    ariaLabel: (title: string) => string
    purposeHeading: string
    actionsHeading: string
  }
}

export const MISC: Record<Lang, MiscContent> = {
  fr: {
    quickAddFab: {
      fabAriaLabel: 'Ajouter une dépense',
      modalTitle: 'Ajoute une dépense',
      frequentLabel: 'Dépenses fréquentes',
      descriptionPlaceholder: 'Description (ex: Café)',
      amountPlaceholder: 'Montant',
      frequencyOptions: [
        { value: 'weekly', label: 'Hebdomadaire' },
        { value: 'biweekly', label: 'Aux deux semaines' },
        { value: 'monthly', label: 'Mensuelle' },
        { value: 'yearly', label: 'Annuelle' },
      ],
      makeRecurring: '🔁 Rendre récurrente',
      recurringLimitTitle: (max) => `Limite de ${max} récurrence${max === 1 ? '' : 's'} atteinte`,
      recurringLimitDescription: 'Passe à Standard pour créer des récurrences illimitées.',
      frequencyLabel: 'Fréquence',
      firstOccurrenceLabel: 'Première occurrence',
      endDateOptionalLabel: 'Date de fin (optionnel)',
      submitAdd: 'Ajouter',
      submitAdding: 'Ajout...',
      submitCreateRecurring: 'Créer la récurrence',
      toastRecurringCreated: (label, amount) => `Récurrence créée : ${label} — ${amount}`,
      toastExpenseAdded: (label, amount) => `Dépense ajoutée : ${label} — ${amount}`,
    },
    pwaInstallBanner: {
      regionAriaLabel: 'Installer SaveUp',
      iosTitle: "Installe SaveUp sur ton écran d'accueil",
      iosStepPrefix: 'Appuie sur',
      iosStepMiddle: 'puis',
      iosStepAction: "« Ajouter à l'écran d'accueil »",
      androidTitle: 'Installe SaveUp sur cet appareil',
      androidBody: 'Accès plus rapide, en plein écran, comme une vraie app.',
      installButton: 'Installer',
      closeAriaLabel: 'Fermer',
    },
    errorBoundary: {
      title: 'Une erreur inattendue est survenue',
      body: "Quelque chose s'est mal passé de notre côté. Tes données sont en sécurité — essaie de recharger la page.",
      reload: 'Recharger la page',
    },
    helpButton: {
      ariaLabel: (title) => `Aide : ${title}`,
      purposeHeading: 'À quoi sert cette page',
      actionsHeading: "Comment l'utiliser",
    },
  },
  en: {
    quickAddFab: {
      fabAriaLabel: 'Add an expense',
      modalTitle: 'Add an expense',
      frequentLabel: 'Frequent expenses',
      descriptionPlaceholder: 'Description (e.g. Coffee)',
      amountPlaceholder: 'Amount',
      frequencyOptions: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Every two weeks' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
      ],
      makeRecurring: '🔁 Make it recurring',
      recurringLimitTitle: (max) => `${max} recurring expense${max === 1 ? '' : 's'} limit reached`,
      recurringLimitDescription: 'Upgrade to Standard for unlimited recurring expenses.',
      frequencyLabel: 'Frequency',
      firstOccurrenceLabel: 'First occurrence',
      endDateOptionalLabel: 'End date (optional)',
      submitAdd: 'Add',
      submitAdding: 'Adding...',
      submitCreateRecurring: 'Create the recurring expense',
      toastRecurringCreated: (label, amount) => `Recurring expense created: ${label} — ${amount}`,
      toastExpenseAdded: (label, amount) => `Expense added: ${label} — ${amount}`,
    },
    pwaInstallBanner: {
      regionAriaLabel: 'Install SaveUp',
      iosTitle: 'Install SaveUp on your home screen',
      iosStepPrefix: 'Tap',
      iosStepMiddle: 'then',
      iosStepAction: '"Add to Home Screen"',
      androidTitle: 'Install SaveUp on this device',
      androidBody: 'Faster access, full screen, like a real app.',
      installButton: 'Install',
      closeAriaLabel: 'Close',
    },
    errorBoundary: {
      title: 'Something unexpected happened',
      body: "Something went wrong on our end. Your data is safe — try reloading the page.",
      reload: 'Reload the page',
    },
    helpButton: {
      ariaLabel: (title) => `Help: ${title}`,
      purposeHeading: 'What this page is for',
      actionsHeading: 'How to use it',
    },
  },
}
