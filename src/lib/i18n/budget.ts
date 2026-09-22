import type { Lang } from './language'

// Everything rendered by the Budget page (src/pages/Budget.tsx) and the
// components it mounts across its 4 tabs: FixedExpenses, RecurringExpenses,
// CategoryManager, CategorySuggestions, RecategorizeCard,
// ImportTransactionsModal, ConvertToRecurringModal, RecentExpenses,
// AddExpenseForm, CategoryBreakdown, ExpenseTrendChart. Kept as one big
// dictionary (rather than one per component) since most of these pieces are
// tiny and only ever mounted from this one page.
export interface BudgetContent {
  pageHeader: { title: string; subtitle: string }
  tabs: { depenses: string; categories: string; import: string; recurrences: string }
  help: {
    depenses: { title: string; purpose: string; actions: string[] }
    categories: { title: string; purpose: string; actions: string[] }
    import: { title: string; purpose: string; actions: string[] }
    recurrences: { title: string; purpose: string; actions: string[] }
  }
  noIncome: { title: string; description: string; actionLabel: string }
  remaining: {
    label: string
    progressCaption: (spentPct: number, monthProgressPct: number) => string
    includesSavings: (amount: string) => string
    upcomingRecurring: (amount: string) => string
  }
  breakdownCard: { title: string; hint: string }
  trendCard: { title: string; hint: string }
  categoryBreakdown: { empty: string }
  expenseTrendChart: { empty: string }
  importTab: {
    cardTitle: string
    cardHint: string
    importButton: string
    freeRemaining: (n: number) => string
    upgradeTitle: string
    upgradeUsedLimit: (limit: number) => string
    upgradeGeneric: string
  }
  fixedExpenses: {
    cardTitle: string
    cardHint: string
    empty: string
    recurringButton: string
    recurringButtonTitle: string
    namePlaceholder: string
    amountPlaceholder: string
    adding: string
    total: string
    deleteAria: (name: string) => string
  }
  recurringExpenses: {
    cardTitle: string
    cardHint: string
    empty: string
    applyToPast: string
    firstOccurrence: string
    endDateLabel: string
    creating: string
    createButton: string
    namePlaceholder: string
    amountPlaceholder: string
    deleteAria: (name: string) => string
    ended: string
    upcomingCount: (n: number) => string
    noneUpcoming: string
    limitReached: (max: number) => string
    limitDescription: string
  }
  convertModal: {
    title: string
    description: (name: string, amount: string) => string
    frequency: string
    firstOccurrence: string
    endDateLabel: string
    convertButton: string
    converting: string
    limitReached: (max: number) => string
    limitDescription: string
  }
  categoryManager: {
    cardTitle: string
    cardHint: string
    loading: string
    monthlyBudget: string
    nonePlaceholder: string
    rename: string
    checking: string
    confirmDelete: (name: string, count: number, fallbackLabel: string) => string
    reassignAndDelete: string
    newCategoryPlaceholder: string
    adding: string
    limitReached: (max: number) => string
    limitDescription: string
  }
  categorySuggestions: {
    cardTitle: string
    cardHint: string
    detectedPrefix: string
    detectedCount: (count: number) => string
    detectedAt: string
    detectedSuffix: string
    nameAriaLabel: string
    creating: string
    ignore: string
    limitReached: (max: number) => string
    limitDescription: string
    limitErrorMessage: (max: number) => string
  }
  recategorizeCard: {
    cardTitle: string
    cardHint: string
    button: string
    running: string
    errorPrefix: (err: string) => string
    none: (fallbackLabel: string) => string
    result: (updated: number, checked: number) => string
    previewTitle: string
    noMatch: string
    recurring: {
      sectionTitle: string
      itemLabel: (description: string, category: string) => string
      applyFutureOnly: string
      applyAll: string
      applying: string
    }
  }
  recentExpenses: {
    cardTitle: string
    cardHint: string
    empty: string
    searchPlaceholder: string
    allCategories: string
    from: string
    to: string
    clearFilters: string
    noMatch: string
    deleteAria: (description: string) => string
    showAll: (count: number) => string
    collapse: string
  }
  addExpenseForm: {
    cardTitle: string
    cardHint: string
    descriptionPlaceholder: string
    amountPlaceholder: string
    adding: string
  }
  importModal: {
    title: string
    fileLabel: string
    fileReadError: string
    accountCreateError: string
    upload: {
      intro: (fallbackLabel: string) => string
      readingFile: (fileName: string) => string
      dropCta: string
      dropHint: string
      howToSummary: string
      formatTitle: string
      formatBody: string
      obtainTitle: string
      obtainBody: string
    }
    account: {
      question: string
      hint: string
      existingAccounts: string
      newAccountLabel: string
      newAccountLabelAlone: string
      newAccountPlaceholder: string
      creating: string
      create: string
      selected: (name: string) => string
      restart: string
      continueButton: string
    }
    mapping: {
      rowsDetected: (count: number) => string
      accountLabel: string
      hint: string
      dateColumn: string
      descriptionColumn: string
      categoryColumn: string
      categoryHintPrefix: string
      suggestedBadge: string
      categoryHintSuffix: string
      amountLabel: string
      singleMode: string
      splitMode: string
      amountColumn: string
      signQuestion: string
      negativeOption: string
      positiveOption: string
      debitColumn: string
      creditColumn: string
      noneOption: string
      selectedLabel: (count: number) => string
      duplicatesSummary: (count: number) => string
      skippedSummary: (count: number) => string
      checkingDuplicates: string
      selectAll: string
      deselectAll: string
      tableDate: string
      tableDescription: string
      tableCategory: string
      tableAmount: string
      tableStatus: string
      duplicateBadge: string
      readyBadge: string
      previewLimited: (shown: number, remaining: number) => string
      restart: string
      importing: string
      importButton: (count: number) => string
      invalidHint: string
    }
    result: {
      partialError: (imported: number) => string
      failed: string
      zeroImported: string
      success: (count: number) => string
      importAnother: string
    }
    skipLabels: { invalidDate: string; invalidAmount: string; notAnExpense: string }
  }
}

export const BUDGET: Record<Lang, BudgetContent> = {
  fr: {
    pageHeader: {
      title: 'Où va ton argent ce mois-ci',
      subtitle: 'Revenu, dépenses fixes et budget de la semaine.',
    },
    tabs: {
      depenses: 'Dépenses',
      categories: 'Catégories',
      import: 'Import',
      recurrences: 'Récurrences',
    },
    help: {
      depenses: {
        title: 'Dépenses',
        purpose: 'Suis tes dépenses par catégorie ce mois-ci, et compare-les à ton revenu et tes dépenses fixes.',
        actions: [
          'Ajoute ton revenu mensuel et tes dépenses fixes (loyer, abonnements...).',
          'Enregistre une dépense et choisis sa catégorie.',
          'Repère les catégories où tu dépasses ton budget habituel.',
        ],
      },
      categories: {
        title: 'Catégories',
        purpose: 'Gère tes catégories de dépenses, leur budget mensuel, et corrige leur classement.',
        actions: [
          'Ajoute, renomme ou fixe un budget mensuel pour une catégorie.',
          'Accepte les suggestions de nouvelles catégories détectées dans tes dépenses.',
          'Relance le classement automatique sur tes dépenses déjà enregistrées.',
        ],
      },
      import: {
        title: 'Import',
        purpose: 'Importe un relevé bancaire au lieu de saisir tes dépenses une par une.',
        actions: [
          "Choisis un fichier .csv ou .xlsx depuis ta banque.",
          "Associe les colonnes du fichier aux bons champs.",
          'Confirme pour ajouter toutes les transactions à ton budget.',
        ],
      },
      recurrences: {
        title: 'Récurrences',
        purpose: "Crée une dépense une fois — loyer, abonnement, facture — et laisse-la se reproduire toute seule.",
        actions: [
          'Choisis une fréquence (hebdomadaire, aux deux semaines, mensuelle, annuelle) et une date de fin optionnelle.',
          'Les transactions se génèrent automatiquement à chaque échéance, même si tu ne rouvres pas l\'app.',
          'Modifie ou supprime une récurrence à tout moment — tu choisis si ça s\'applique aussi aux transactions déjà générées.',
        ],
      },
    },
    noIncome: {
      title: "Tu n'as pas encore de budget",
      description: 'Commence par ajouter ton revenu mensuel — le reste se calcule automatiquement à partir de là.',
      actionLabel: 'Ajouter mes revenus',
    },
    remaining: {
      label: 'Il te reste ce mois-ci',
      progressCaption: (spentPct, monthProgressPct) =>
        `${Math.round(spentPct)}% dépensé · ${Math.round(monthProgressPct)}% du mois écoulé (repère blanc)`,
      includesSavings: (amount) => ` — inclut ${amount} déjà mis de côté ce mois-ci.`,
      upcomingRecurring: (amount) =>
        `Dont ${amount} de récurrences à venir ce mois-ci — voir l'onglet Récurrences.`,
    },
    breakdownCard: {
      title: 'Répartition par catégorie',
      hint: 'Dépenses fixes, dépenses du mois et épargne, regroupées par catégorie.',
    },
    trendCard: {
      title: 'Tendance sur 3 mois',
      hint: 'Total de tes dépenses du jour le jour, mois par mois.',
    },
    categoryBreakdown: {
      empty: 'Ajoute des dépenses fixes ou quotidiennes pour voir la répartition par catégorie.',
    },
    expenseTrendChart: {
      empty: "Pas encore assez d'historique — reviens dans quelques semaines pour voir ta tendance.",
    },
    importTab: {
      cardTitle: 'Importer des transactions',
      cardHint: 'Depuis un relevé de carte de crédit ou de compte (.csv, .xlsx).',
      importButton: 'Importer un fichier',
      freeRemaining: (n) => `Il te reste ${n} import${n > 1 ? 's' : ''} gratuit${n > 1 ? 's' : ''} sur le plan Gratuit.`,
      upgradeTitle: 'Import CSV — fonctionnalité Standard',
      upgradeUsedLimit: (limit) =>
        `Tu as utilisé tes ${limit} imports gratuits — passe à Standard pour un import illimité.`,
      upgradeGeneric: 'Importe directement un relevé bancaire au lieu de saisir tes dépenses une par une.',
    },
    fixedExpenses: {
      cardTitle: 'Dépenses fixes',
      cardHint: 'Loyer, abonnements, assurances — tout ce qui revient chaque mois.',
      empty: "Aucune dépense fixe pour l'instant — ajoute ton loyer ou un abonnement ci-dessous.",
      recurringButton: '🔁 Récurrence',
      recurringButtonTitle: 'Transforme cette dépense fixe en récurrence qui génère de vraies transactions automatiquement',
      namePlaceholder: 'Nom (ex: Loyer)',
      amountPlaceholder: 'Montant',
      adding: 'Ajout...',
      total: 'Total :',
      deleteAria: (name) => `Supprimer ${name}`,
    },
    recurringExpenses: {
      cardTitle: 'Récurrences',
      cardHint: 'Loyer, abonnements, factures — créées une fois, générées automatiquement à chaque échéance.',
      empty: "Aucune récurrence pour l'instant — crée-en une ci-dessous, ou depuis le bouton + en ajoutant une dépense.",
      applyToPast: 'Appliquer aussi aux transactions déjà générées par cette récurrence',
      firstOccurrence: 'Première occurrence',
      endDateLabel: 'Date de fin (optionnel — laisse décoché pour indéfini)',
      creating: 'Création...',
      createButton: 'Créer la récurrence',
      namePlaceholder: 'Nom (ex: Loyer)',
      amountPlaceholder: 'Montant',
      deleteAria: (name) => `Supprimer ${name}`,
      ended: 'terminée',
      upcomingCount: (n) => `${n} à venir ce mois-ci`,
      noneUpcoming: 'rien à venir ce mois-ci',
      limitReached: (max) => `Limite de ${max} récurrence${max === 1 ? '' : 's'} atteinte`,
      limitDescription: 'Le plan Gratuit est limité en nombre de récurrences actives. Passe à Standard pour en créer autant que tu veux.',
    },
    convertModal: {
      title: 'Convertir en récurrence',
      description: (name, amount) =>
        `${name} — ${amount} deviendra une vraie transaction générée automatiquement à chaque échéance, et sera retirée de tes dépenses fixes.`,
      frequency: 'Fréquence',
      firstOccurrence: 'Première occurrence',
      endDateLabel: 'Date de fin (optionnel)',
      convertButton: 'Convertir',
      converting: 'Conversion...',
      limitReached: (max) => `Limite de ${max} récurrence${max === 1 ? '' : 's'} atteinte`,
      limitDescription: 'Le plan Gratuit est limité en nombre de récurrences actives. Passe à Standard pour en créer autant que tu veux.',
    },
    categoryManager: {
      cardTitle: 'Catégories',
      cardHint: 'Crée, renomme ou supprime tes catégories de dépenses, et fixe un budget mensuel par catégorie (visible dans Statistiques).',
      loading: 'Chargement des catégories...',
      monthlyBudget: 'Budget mensuel',
      nonePlaceholder: 'Aucun',
      rename: 'Renommer',
      checking: 'Vérification...',
      confirmDelete: (name, count, fallbackLabel) =>
        `« ${name} » est utilisée par ${count} dépense${count > 1 ? 's' : ''}. Les réassigner à « ${fallbackLabel} » et supprimer la catégorie ?`,
      reassignAndDelete: 'Réassigner et supprimer',
      newCategoryPlaceholder: 'Nouvelle catégorie',
      adding: 'Ajout...',
      limitReached: (max) => `Limite de ${max} catégories atteinte`,
      limitDescription: 'Le plan Gratuit est limité à un petit nombre de catégories. Passe à Standard pour en créer autant que tu veux.',
    },
    categorySuggestions: {
      cardTitle: 'Catégories suggérées',
      cardHint: 'Des dépenses « Autre » qui reviennent souvent — tu peux créer une catégorie pour elles en un clic, ou ignorer.',
      detectedPrefix: 'On a détecté',
      detectedCount: (count) => `${count} dépense${count > 1 ? 's' : ''}`,
      detectedAt: 'chez',
      detectedSuffix: '— ça ressemble à une catégorie à part.',
      nameAriaLabel: 'Nom de la catégorie suggérée',
      creating: 'Création...',
      ignore: 'Ignorer',
      limitReached: (max) => `Limite de ${max} catégories atteinte`,
      limitDescription: 'Tu peux toujours réassigner vers une catégorie existante ci-dessous, mais créer une nouvelle catégorie demande de passer à Standard.',
      limitErrorMessage: (max) => `Limite de ${max} catégories atteinte — passe à Standard pour en créer d'autres.`,
    },
    recategorizeCard: {
      cardTitle: 'Recatégorisation automatique',
      cardHint: 'Ré-essaie de deviner la catégorie de tes dépenses classées « Autre », à partir du nom du commerçant.',
      button: 'Recatégoriser mes dépenses existantes',
      running: 'Recatégorisation en cours...',
      errorPrefix: (err) => `Une erreur est survenue : ${err}`,
      none: (fallbackLabel) => `Aucune dépense classée « ${fallbackLabel} » à recatégoriser.`,
      result: (updated, checked) =>
        `${updated} transaction${updated > 1 ? 's' : ''} recatégorisée${updated > 1 ? 's' : ''} sur ${checked}.`,
      previewTitle: 'Aperçu de ce qui a été vérifié',
      noMatch: 'aucune correspondance',
      recurring: {
        sectionTitle: 'Dépenses récurrentes',
        itemLabel: (description, category) => `« ${description} » ressemble à : ${category}`,
        applyFutureOnly: 'Appliquer aux prochaines seulement',
        applyAll: 'Appliquer à toutes (passées et futures)',
        applying: 'Application...',
      },
    },
    recentExpenses: {
      cardTitle: 'Dépenses récentes',
      cardHint: "Tes dernières dépenses (jusqu'à 50), les plus récentes en premier.",
      empty: 'Aucune dépense enregistrée pour l\'instant.',
      searchPlaceholder: 'Rechercher une description...',
      allCategories: 'Toutes les catégories',
      from: 'Du',
      to: 'Au',
      clearFilters: 'Effacer les filtres',
      noMatch: 'Aucune dépense ne correspond à ces filtres.',
      deleteAria: (description) => `Supprimer ${description}`,
      showAll: (count) => `Voir tout l'historique (${count})`,
      collapse: 'Réduire',
    },
    addExpenseForm: {
      cardTitle: 'Ajoute une dépense',
      cardHint: 'Note-la en 5 secondes pour garder ton budget à jour.',
      descriptionPlaceholder: 'Description (ex: Café)',
      amountPlaceholder: 'Montant',
      adding: 'Ajout...',
    },
    importModal: {
      title: 'Importer des transactions',
      fileLabel: 'Fichier :',
      fileReadError: 'Impossible de lire ce fichier.',
      accountCreateError: 'Impossible de créer ce compte — réessaie.',
      upload: {
        intro: (fallbackLabel) =>
          `Importe un relevé de carte de crédit ou de compte bancaire (.csv ou .xlsx). SaveUp essaie de deviner la catégorie de chaque transaction à partir du commerçant (sinon « ${fallbackLabel} » par défaut) — tu pourras toujours ajuster après l'import.`,
        readingFile: (fileName) => `Lecture de ${fileName}...`,
        dropCta: 'Clique pour choisir un fichier',
        dropHint: '.csv ou .xlsx',
        howToSummary: 'Comment obtenir ce fichier de ta banque ?',
        formatTitle: 'Format attendu',
        formatBody:
          "Un fichier .csv ou .xlsx avec au minimum une colonne Date et une colonne Montant. Une colonne Description aide à deviner la catégorie automatiquement ; une colonne Catégorie est optionnelle. Tu pourras corriger l'association des colonnes à l'étape suivante si la détection automatique se trompe.",
        obtainTitle: "Comment l'obtenir",
        obtainBody:
          'Dans le portail en ligne de ta banque, cherche « Historique des transactions », « Relevés » ou « Exporter » sur le compte ou la carte de crédit visé, choisis une plage de dates, puis sélectionne le format CSV ou Excel (pas PDF).',
      },
      account: {
        question: 'De quel compte proviennent ces transactions ?',
        hint: 'Ex : « Carte de crédit », « Débit » — pour retrouver facilement la source de chaque dépense plus tard.',
        existingAccounts: 'Comptes existants',
        newAccountLabel: 'Ou crée un nouveau compte',
        newAccountLabelAlone: 'Nom du compte',
        newAccountPlaceholder: 'Ex : Carte de crédit',
        creating: 'Création...',
        create: 'Créer',
        selected: (name) => `✓ Compte sélectionné : ${name}`,
        restart: 'Recommencer',
        continueButton: 'Continuer →',
      },
      mapping: {
        rowsDetected: (count) => `${count} ligne${count > 1 ? 's' : ''} détectée${count > 1 ? 's' : ''}`,
        accountLabel: '· Compte :',
        hint: "Associe les colonnes du fichier à Date, Description et Montant si la détection automatique s'est trompée.",
        dateColumn: 'Colonne Date',
        descriptionColumn: 'Colonne Description (optionnel)',
        categoryColumn: 'Colonne Catégorie (optionnel)',
        categoryHintPrefix: 'Sans colonne (ou si elle est vide), SaveUp devine la catégorie à partir du nom du commerçant — repérable au badge',
        suggestedBadge: 'suggéré',
        categoryHintSuffix: "ci-dessous. Recatégorise après l'import si besoin.",
        amountLabel: 'Montant',
        singleMode: 'Une seule colonne Montant',
        splitMode: 'Débit et Crédit séparés',
        amountColumn: 'Colonne Montant',
        signQuestion: 'Dans cette colonne, les dépenses sont :',
        negativeOption: 'Négatives (-45,00)',
        positiveOption: 'Positives (45,00)',
        debitColumn: "Colonne Débit (sorties d'argent)",
        creditColumn: "Colonne Crédit (entrées d'argent, optionnel)",
        noneOption: '— Aucune —',
        selectedLabel: (count) => `sélectionnée${count > 1 ? 's' : ''}`,
        duplicatesSummary: (count) =>
          `${count} doublon${count > 1 ? 's' : ''} détecté${count > 1 ? 's' : ''} (non sélectionné${count > 1 ? 's' : ''})`,
        skippedSummary: (count) => `${count} ignorée${count > 1 ? 's' : ''}`,
        checkingDuplicates: 'Vérification des doublons...',
        selectAll: 'Tout sélectionner',
        deselectAll: 'Tout désélectionner',
        tableDate: 'Date',
        tableDescription: 'Description',
        tableCategory: 'Catégorie',
        tableAmount: 'Montant',
        tableStatus: 'Statut',
        duplicateBadge: 'doublon possible',
        readyBadge: '✓ prêt',
        previewLimited: (shown, remaining) =>
          `Aperçu limité à ${shown} lignes — les ${remaining} autres sont incluses dans le total et la sélection ci-dessus.`,
        restart: 'Recommencer',
        importing: 'Import en cours...',
        importButton: (count) => `Importer ${count} transaction${count > 1 ? 's' : ''}`,
        invalidHint: 'Choisis au moins une colonne Date et une colonne Montant (ou Débit) pour continuer.',
      },
      result: {
        partialError: (imported) =>
          `${imported} transaction${imported > 1 ? 's ont' : ' a'} été importée${imported > 1 ? 's' : ''} avant qu'une erreur survienne :`,
        failed: "L'import a échoué :",
        zeroImported: "Aucune transaction n'a été importée. Réessaie — si ça persiste, reconnecte-toi et recommence l'import.",
        success: (count) =>
          `${count} transaction${count > 1 ? 's' : ''} importée${count > 1 ? 's' : ''} avec succès, catégorisée${count > 1 ? 's' : ''} automatiquement quand possible.`,
        importAnother: 'Importer un autre fichier',
      },
      skipLabels: {
        invalidDate: 'date illisible',
        invalidAmount: 'montant illisible',
        notAnExpense: 'pas une dépense (revenu ou 0 $) — ignoré',
      },
    },
  },
  en: {
    pageHeader: {
      title: "Where your money's going this month",
      subtitle: 'Income, fixed expenses, and your weekly budget.',
    },
    tabs: {
      depenses: 'Expenses',
      categories: 'Categories',
      import: 'Import',
      recurrences: 'Recurring',
    },
    help: {
      depenses: {
        title: 'Expenses',
        purpose: 'Track your spending by category this month, and compare it to your income and fixed expenses.',
        actions: [
          'Add your monthly income and fixed expenses (rent, subscriptions...).',
          'Log an expense and pick its category.',
          'Spot the categories where you\'re going over your usual budget.',
        ],
      },
      categories: {
        title: 'Categories',
        purpose: 'Manage your expense categories, their monthly budget, and fix how they get sorted.',
        actions: [
          'Add, rename, or set a monthly budget for a category.',
          'Accept suggestions for new categories detected in your expenses.',
          'Rerun automatic categorization on your already-logged expenses.',
        ],
      },
      import: {
        title: 'Import',
        purpose: 'Import a bank statement instead of entering your expenses one by one.',
        actions: [
          'Pick a .csv or .xlsx file from your bank.',
          'Match the file\'s columns to the right fields.',
          'Confirm to add every transaction to your budget.',
        ],
      },
      recurrences: {
        title: 'Recurring',
        purpose: 'Set up an expense once — rent, a subscription, a bill — and let it repeat on its own.',
        actions: [
          'Pick a frequency (weekly, biweekly, monthly, yearly) and an optional end date.',
          "Transactions generate automatically on each due date, even if you don't reopen the app.",
          'Edit or delete a recurring expense anytime — you choose whether it also applies to transactions already generated.',
        ],
      },
    },
    noIncome: {
      title: "You don't have a budget yet",
      description: 'Start by adding your monthly income — everything else gets calculated automatically from there.',
      actionLabel: 'Add my income',
    },
    remaining: {
      label: 'Left this month',
      progressCaption: (spentPct, monthProgressPct) =>
        `${Math.round(spentPct)}% spent · ${Math.round(monthProgressPct)}% of the month gone (white marker)`,
      includesSavings: (amount) => ` — includes ${amount} already set aside this month.`,
      upcomingRecurring: (amount) => `Includes ${amount} of upcoming recurring expenses this month — see the Recurring tab.`,
    },
    breakdownCard: {
      title: 'Breakdown by category',
      hint: 'Fixed expenses, this month\'s spending, and savings, grouped by category.',
    },
    trendCard: {
      title: '3-month trend',
      hint: 'Your total day-to-day spending, month by month.',
    },
    categoryBreakdown: {
      empty: 'Add fixed or day-to-day expenses to see the breakdown by category.',
    },
    expenseTrendChart: {
      empty: 'Not enough history yet — check back in a few weeks to see your trend.',
    },
    importTab: {
      cardTitle: 'Import transactions',
      cardHint: 'From a credit card or account statement (.csv, .xlsx).',
      importButton: 'Import a file',
      freeRemaining: (n) => `You have ${n} free import${n > 1 ? 's' : ''} left on the Free plan.`,
      upgradeTitle: 'CSV import — Standard feature',
      upgradeUsedLimit: (limit) =>
        `You've used your ${limit} free imports — upgrade to Standard for unlimited imports.`,
      upgradeGeneric: 'Import a bank statement directly instead of entering your expenses one by one.',
    },
    fixedExpenses: {
      cardTitle: 'Fixed expenses',
      cardHint: 'Rent, subscriptions, insurance — anything that comes back every month.',
      empty: 'No fixed expenses yet — add your rent or a subscription below.',
      recurringButton: '🔁 Recurring',
      recurringButtonTitle: 'Turn this fixed expense into a recurring one that generates real transactions automatically',
      namePlaceholder: 'Name (e.g. Rent)',
      amountPlaceholder: 'Amount',
      adding: 'Adding...',
      total: 'Total:',
      deleteAria: (name) => `Delete ${name}`,
    },
    recurringExpenses: {
      cardTitle: 'Recurring expenses',
      cardHint: 'Rent, subscriptions, bills — set up once, generated automatically on each due date.',
      empty: 'No recurring expenses yet — create one below, or from the + button when adding an expense.',
      applyToPast: 'Also apply to transactions already generated by this recurring expense',
      firstOccurrence: 'First occurrence',
      endDateLabel: 'End date (optional — leave unchecked for indefinite)',
      creating: 'Creating...',
      createButton: 'Create recurring expense',
      namePlaceholder: 'Name (e.g. Rent)',
      amountPlaceholder: 'Amount',
      deleteAria: (name) => `Delete ${name}`,
      ended: 'ended',
      upcomingCount: (n) => `${n} upcoming this month`,
      noneUpcoming: 'nothing upcoming this month',
      limitReached: (max) => `Limit of ${max} recurring expense${max === 1 ? '' : 's'} reached`,
      limitDescription: 'The Free plan is limited in the number of active recurring expenses. Upgrade to Standard to create as many as you want.',
    },
    convertModal: {
      title: 'Convert to recurring',
      description: (name, amount) =>
        `${name} — ${amount} will become a real transaction generated automatically on each due date, and will be removed from your fixed expenses.`,
      frequency: 'Frequency',
      firstOccurrence: 'First occurrence',
      endDateLabel: 'End date (optional)',
      convertButton: 'Convert',
      converting: 'Converting...',
      limitReached: (max) => `Limit of ${max} recurring expense${max === 1 ? '' : 's'} reached`,
      limitDescription: 'The Free plan is limited in the number of active recurring expenses. Upgrade to Standard to create as many as you want.',
    },
    categoryManager: {
      cardTitle: 'Categories',
      cardHint: 'Create, rename, or delete your expense categories, and set a monthly budget per category (visible in Statistics).',
      loading: 'Loading categories...',
      monthlyBudget: 'Monthly budget',
      nonePlaceholder: 'None',
      rename: 'Rename',
      checking: 'Checking...',
      confirmDelete: (name, count, fallbackLabel) =>
        `"${name}" is used by ${count} expense${count > 1 ? 's' : ''}. Reassign them to "${fallbackLabel}" and delete the category?`,
      reassignAndDelete: 'Reassign and delete',
      newCategoryPlaceholder: 'New category',
      adding: 'Adding...',
      limitReached: (max) => `Limit of ${max} categories reached`,
      limitDescription: 'The Free plan is limited to a small number of categories. Upgrade to Standard to create as many as you want.',
    },
    categorySuggestions: {
      cardTitle: 'Suggested categories',
      cardHint: 'Expenses classified as "Other" that keep coming back — create a category for them in one click, or dismiss.',
      detectedPrefix: 'We noticed',
      detectedCount: (count) => `${count} expense${count > 1 ? 's' : ''}`,
      detectedAt: 'at',
      detectedSuffix: "— looks like it could be its own category.",
      nameAriaLabel: 'Suggested category name',
      creating: 'Creating...',
      ignore: 'Dismiss',
      limitReached: (max) => `Limit of ${max} categories reached`,
      limitDescription: 'You can still reassign to an existing category below, but creating a new one requires upgrading to Standard.',
      limitErrorMessage: (max) => `Limit of ${max} categories reached — upgrade to Standard to create more.`,
    },
    recategorizeCard: {
      cardTitle: 'Automatic recategorization',
      cardHint: 'Try again to guess the category of your expenses classified as "Other", based on the merchant name.',
      button: 'Recategorize my existing expenses',
      running: 'Recategorizing...',
      errorPrefix: (err) => `Something went wrong: ${err}`,
      none: (fallbackLabel) => `No expenses classified as "${fallbackLabel}" to recategorize.`,
      result: (updated, checked) =>
        `${updated} transaction${updated > 1 ? 's' : ''} recategorized out of ${checked}.`,
      previewTitle: 'Preview of what was checked',
      noMatch: 'no match',
      recurring: {
        sectionTitle: 'Recurring expenses',
        itemLabel: (description, category) => `"${description}" looks like: ${category}`,
        applyFutureOnly: 'Apply to upcoming only',
        applyAll: 'Apply to all (past and future)',
        applying: 'Applying...',
      },
    },
    recentExpenses: {
      cardTitle: 'Recent expenses',
      cardHint: 'Your latest expenses (up to 50), most recent first.',
      empty: 'No expenses logged yet.',
      searchPlaceholder: 'Search a description...',
      allCategories: 'All categories',
      from: 'From',
      to: 'To',
      clearFilters: 'Clear filters',
      noMatch: 'No expenses match these filters.',
      deleteAria: (description) => `Delete ${description}`,
      showAll: (count) => `See full history (${count})`,
      collapse: 'Collapse',
    },
    addExpenseForm: {
      cardTitle: 'Add an expense',
      cardHint: 'Log it in 5 seconds to keep your budget up to date.',
      descriptionPlaceholder: 'Description (e.g. Coffee)',
      amountPlaceholder: 'Amount',
      adding: 'Adding...',
    },
    importModal: {
      title: 'Import transactions',
      fileLabel: 'File:',
      fileReadError: 'Unable to read this file.',
      accountCreateError: 'Unable to create this account — try again.',
      upload: {
        intro: (fallbackLabel) =>
          `Import a credit card or bank account statement (.csv or .xlsx). SaveUp tries to guess the category of each transaction from the merchant (or "${fallbackLabel}" by default) — you can always adjust it after the import.`,
        readingFile: (fileName) => `Reading ${fileName}...`,
        dropCta: 'Click to choose a file',
        dropHint: '.csv or .xlsx',
        howToSummary: 'How do I get this file from my bank?',
        formatTitle: 'Expected format',
        formatBody:
          "A .csv or .xlsx file with at least a Date column and an Amount column. A Description column helps guess the category automatically; a Category column is optional. You'll be able to fix the column mapping on the next step if automatic detection gets it wrong.",
        obtainTitle: 'How to get it',
        obtainBody:
          'In your bank\'s online portal, look for "Transaction history", "Statements", or "Export" on the account or credit card you want, pick a date range, then choose the CSV or Excel format (not PDF).',
      },
      account: {
        question: 'Which account are these transactions from?',
        hint: 'E.g. "Credit card", "Debit" — so you can easily find the source of each expense later.',
        existingAccounts: 'Existing accounts',
        newAccountLabel: 'Or create a new account',
        newAccountLabelAlone: 'Account name',
        newAccountPlaceholder: 'E.g. Credit card',
        creating: 'Creating...',
        create: 'Create',
        selected: (name) => `✓ Account selected: ${name}`,
        restart: 'Start over',
        continueButton: 'Continue →',
      },
      mapping: {
        rowsDetected: (count) => `${count} row${count > 1 ? 's' : ''} detected`,
        accountLabel: '· Account:',
        hint: 'Match the file\'s columns to Date, Description, and Amount if automatic detection got it wrong.',
        dateColumn: 'Date column',
        descriptionColumn: 'Description column (optional)',
        categoryColumn: 'Category column (optional)',
        categoryHintPrefix: 'With no column (or an empty one), SaveUp guesses the category from the merchant name — flagged with the',
        suggestedBadge: 'suggested',
        categoryHintSuffix: 'badge below. You can recategorize after the import if needed.',
        amountLabel: 'Amount',
        singleMode: 'Single Amount column',
        splitMode: 'Separate Debit and Credit',
        amountColumn: 'Amount column',
        signQuestion: 'In this column, expenses are:',
        negativeOption: 'Negative (-45.00)',
        positiveOption: 'Positive (45.00)',
        debitColumn: 'Debit column (money out)',
        creditColumn: 'Credit column (money in, optional)',
        noneOption: '— None —',
        selectedLabel: () => `selected`,
        duplicatesSummary: (count) => `${count} duplicate${count > 1 ? 's' : ''} detected (not selected)`,
        skippedSummary: (count) => `${count} skipped`,
        checkingDuplicates: 'Checking for duplicates...',
        selectAll: 'Select all',
        deselectAll: 'Deselect all',
        tableDate: 'Date',
        tableDescription: 'Description',
        tableCategory: 'Category',
        tableAmount: 'Amount',
        tableStatus: 'Status',
        duplicateBadge: 'possible duplicate',
        readyBadge: '✓ ready',
        previewLimited: (shown, remaining) =>
          `Preview limited to ${shown} rows — the other ${remaining} are included in the total and selection above.`,
        restart: 'Start over',
        importing: 'Importing...',
        importButton: (count) => `Import ${count} transaction${count > 1 ? 's' : ''}`,
        invalidHint: 'Choose at least a Date column and an Amount column (or Debit) to continue.',
      },
      result: {
        partialError: (imported) =>
          `${imported} transaction${imported > 1 ? 's were' : ' was'} imported before an error occurred:`,
        failed: 'The import failed:',
        zeroImported: 'No transactions were imported. Try again — if it keeps happening, sign out, sign back in, and restart the import.',
        success: (count) =>
          `${count} transaction${count > 1 ? 's' : ''} imported successfully, categorized automatically where possible.`,
        importAnother: 'Import another file',
      },
      skipLabels: {
        invalidDate: 'unreadable date',
        invalidAmount: 'unreadable amount',
        notAnExpense: 'not an expense (income or $0) — skipped',
      },
    },
  },
}
