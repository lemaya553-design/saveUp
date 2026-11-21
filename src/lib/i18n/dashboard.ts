import type { Lang } from './language'

export interface DashboardContent {
  pageHeader: { title: string; subtitle: string; reassuranceStressed: string }
  help: { purpose: string; actions: string[] }
  freshUser: {
    title: string
    description: string
    actionLabel: string
  }
  // Dashboard-only "Donner mon avis" entry point — separate from Sidebar's
  // generic free-text one (useFeedback.ts/feedback table is shared by
  // both; the question and placement are the only things different here).
  feedbackPrompt: {
    buttonLabel: string
    modalTitle: string
    question: string
    questionPlaceholder: string
    optionalLabel: string
    optionalPlaceholder: string
    send: string
    sending: string
    successMessage: string
  }
  streak: {
    days: (count: number) => string
    comeBackActive: string
    comeBackStart: string
  }
  score: {
    label: string
    caption: string
    linkText: string
  }
  spent: {
    label: string
  }
  saved: {
    label: string
    noGoal: string
    oneGoal: (target: string) => string
    manyGoals: (count: number) => string
  }
  accumulated: {
    title: string
    hint: string
    savedLabel: string
    investedLabel: string
  }
  scoreChart: {
    title: string
    hint: string
    emptyTitle: string
    emptyDescription: string
  }
  factors: {
    title: string
    hint: string
  }
  goFurther: string
  featureLinks: {
    to: string
    title: string
    description: string
  }[]
  gettingStarted: {
    title: string
    hint: string
    step1: { title: string; description: string; actionLabel: string }
    step2: { title: string; description: string; actionLabel: string }
    step3: { title: string; description: string; actionLabel: string }
  }
  goalCard: {
    eyebrow: string
    outOf: (target: string) => string
    remaining: (amount: string) => string
    goalReached: string
    viewDetail: string
    // Keyed by getGoalEncouragementTier (lib/goalEncouragement.ts).
    encouragement: Record<'start' | 'progress' | 'half' | 'final' | 'done', string>
    empty: {
      title: string
      description: string
      actionLabel: string
      demoActionLabel: string
    }
    demoBanner: {
      label: string
      description: string
      exitButton: string
    }
    // Same copy as Épargne's own goal-card quick-add (lib/i18n/epargne.ts)
    // — same interaction, just a second place it's reachable from.
    quickAdd: {
      ariaLabel: (name: string) => string
      placeholder: string
      confirm: string
      emptyError: string
      invalidError: string
    }
  }
  needsLimit: {
    title: string
    hint: string
    needsLabel: string
    needsAriaLabel: string
    savingsLabel: string
    savingsAriaLabel: string
    ofLimit: (amount: string) => string
    barAriaLabel: string
    pctUsed: (pct: number) => string
    savingsTargetLine: (amount: string) => string
    disclaimer: string
  }
  subscriptionsFound: {
    title: string
    hint: (monthlyTotal: string) => string
    moreCount: (n: number) => string
  }
  welcomeTutorial: {
    modalTitle: string
    stepLabel: (step: number) => string
    skip: string
    back: string
    next: string
    step1Title: string
    step1Hint: string
    presets: { id: 'urgence' | 'vacances' | 'achat' | 'autre'; label: string; name: string }[]
    customNamePlaceholder: string
    customNameEmptyError: string
    step2Title: string
    step2Hint: string
    amountPlaceholder: string
    amountAriaLabel: string
    amountEmptyError: string
    step3Title: string
    step3Hint: string
    demoOutOf: (amount: string) => string
    barAriaLabel: string
    previewBadge: string
    previewNote: string
    create: string
    creating: string
    createError: string
  }
}

export const DASHBOARD: Record<Lang, DashboardContent> = {
  fr: {
    pageHeader: {
      title: "Comment tu t'en sors",
      subtitle: 'Ton portrait financier en un coup d’œil.',
      reassuranceStressed: 'Tu es au bon endroit — on y va un pas à la fois. 💙',
    },
    help: {
      purpose:
        "Un coup d'œil sur ta santé financière : ton score, ce qu'il te reste à dépenser ce mois-ci et la progression de tes objectifs.",
      actions: [
        'Consulte ton score de santé financière et son évolution récente.',
        'Vérifie combien il te reste à dépenser ce mois-ci.',
        'Lis tes conseils personnalisés — générés à partir de tes vraies dépenses et objectifs.',
        'Clique sur une carte (Budget, Épargne, Statistiques...) pour y aller directement.',
      ],
    },
    freshUser: {
      title: "Tu n'as pas encore de budget",
      description:
        "Commence par ajouter ton revenu mensuel — tout le reste (budget, alertes, score) se calcule automatiquement à partir de là.",
      actionLabel: 'Ajouter mes revenus',
    },
    feedbackPrompt: {
      buttonLabel: 'Donner mon avis',
      modalTitle: 'Donner mon avis',
      question: 'Qu’est-ce qui te ferait revenir ?',
      questionPlaceholder: 'Dis-nous en quelques mots...',
      optionalLabel: 'Autre chose à ajouter ? (optionnel)',
      optionalPlaceholder: 'Ton commentaire...',
      send: 'Envoyer',
      sending: 'Envoi...',
      successMessage: 'Merci, ton avis est reçu.',
    },
    streak: {
      days: (count) => `${count} jour${count > 1 ? 's' : ''} de suite`,
      comeBackActive: 'Reviens demain pour garder ta série !',
      comeBackStart: 'Reviens demain pour commencer une série.',
    },
    score: {
      label: 'Score de santé',
      caption: 'Reflète tes habitudes de dépenses et de budget.',
      linkText: 'Voir tes récompenses →',
    },
    spent: {
      label: 'Dépensé ce mois-ci',
    },
    saved: {
      label: 'Épargné',
      noGoal: 'Fixe un objectif dans Épargne →',
      oneGoal: (target) => `vers ${target} →`,
      manyGoals: (count) => `${count} objectifs actifs →`,
    },
    accumulated: {
      title: 'Ce que tu as accumulé',
      hint: 'Épargne totale (tous objectifs) et montant réellement investi à ce jour.',
      savedLabel: 'Épargné',
      investedLabel: 'Investi',
    },
    scoreChart: {
      title: 'Évolution de ton score',
      hint: 'Ton score de santé financière, jour par jour.',
      emptyTitle: 'Pas encore assez d’historique',
      emptyDescription: 'Reviens dans quelques jours pour voir l’évolution de ton score.',
    },
    factors: {
      title: 'Ce qui compose ton score',
      hint: 'Rythme de dépenses, régularité d’épargne et dépenses fixes vs revenu.',
    },
    goFurther: 'Aller plus loin',
    featureLinks: [
      {
        to: '/budget',
        title: 'Budget',
        description: "Dépenses par catégorie, comparées à ce que tu t'es fixé.",
      },
      {
        to: '/epargne',
        title: 'Épargne',
        description: 'Tes objectifs et leur progression.',
      },
      {
        to: '/statistiques',
        title: 'Statistiques',
        description: 'Ta répartition de dépenses par catégorie, en détail.',
      },
      {
        to: '/statistiques/recompenses',
        title: 'Récompenses',
        description: 'Tes badges et ta série de connexions.',
      },
    ],
    gettingStarted: {
      title: 'Bien démarrer',
      hint: '3 étapes pour voir ton portrait financier au complet.',
      step1: {
        title: 'Choisis ton objectif',
        description: 'Dis-nous ce que tu veux accomplir — on personnalise le reste autour de ça.',
        actionLabel: 'Choisir un objectif',
      },
      step2: {
        title: 'Importe le fichier de ta banque',
        description: "Un relevé CSV ou Excel suffit pour voir toutes tes dépenses d'un coup.",
        actionLabel: 'Importer un fichier',
      },
      step3: {
        title: 'Vois où va ton argent',
        description: 'Explore tes dépenses par catégorie, par semaine et par mois.',
        actionLabel: 'Voir mes statistiques',
      },
    },
    goalCard: {
      eyebrow: 'Mon objectif',
      outOf: (target) => `sur ${target}`,
      remaining: (amount) => `Il te reste ${amount}`,
      goalReached: 'Objectif atteint !',
      viewDetail: 'Voir le détail',
      encouragement: {
        start: 'Beau départ, chaque dollar compte.',
        progress: 'Tu avances bien, continue comme ça.',
        half: 'Plus de la moitié, tu y es presque.',
        final: 'Dernière ligne droite !',
        done: 'Objectif atteint, bravo ! 🎉',
      },
      empty: {
        title: 'Quel est ton premier objectif ?',
        description: 'Voyage, auto, cadeau… choisis ce qui te motive.',
        actionLabel: 'Créer mon objectif',
        demoActionLabel: "Essayer avec des données d'exemple",
      },
      demoBanner: {
        label: 'Mode démo',
        description: 'Données fictives — rien n’est enregistré dans ton compte.',
        exitButton: 'Revenir à mes données',
      },
      quickAdd: {
        ariaLabel: (name) => `Ajouter un montant à ${name}`,
        placeholder: 'Montant à ajouter',
        confirm: 'Ajouter',
        emptyError: 'Entre un montant.',
        invalidError: 'Le montant doit être plus grand que 0 $.',
      },
    },
    needsLimit: {
      title: 'Limite du mois',
      hint: 'Repères généraux pour tes besoins et ton épargne, à partir de ton revenu.',
      needsLabel: 'Besoins',
      needsAriaLabel: 'Pourcentage du revenu réservé aux besoins',
      savingsLabel: 'Épargne',
      savingsAriaLabel: "Pourcentage du revenu réservé à l'épargne",
      ofLimit: (amount) => `sur ${amount} alloués`,
      barAriaLabel: 'Dépenses de besoins par rapport à la limite',
      pctUsed: (pct) => `${pct}% de ta limite de besoins utilisée`,
      savingsTargetLine: (amount) => `Objectif d'épargne suggéré ce mois-ci : ${amount}.`,
      disclaimer: 'Repère général, pas un conseil financier.',
    },
    subscriptionsFound: {
      title: 'Abonnements trouvés',
      hint: (monthlyTotal) => `Détectés automatiquement dans tes dépenses — ${monthlyTotal} par mois.`,
      moreCount: (n) => `+ ${n} autre${n > 1 ? 's' : ''}`,
    },
    welcomeTutorial: {
      modalTitle: 'Bienvenue sur SaveUp',
      stepLabel: (step) => `Étape ${step} sur 3`,
      skip: 'Passer',
      back: 'Retour',
      next: 'Suivant',
      step1Title: 'Choisis un objectif',
      step1Hint: "Tu pourras en ajouter d'autres plus tard.",
      presets: [
        { id: 'urgence', label: "🛟 Fonds d'urgence", name: "Fonds d'urgence" },
        { id: 'vacances', label: '✈️ Vacances', name: 'Vacances' },
        { id: 'achat', label: '🛍️ Achat important', name: 'Achat important' },
        { id: 'autre', label: '🎯 Autre', name: '' },
      ],
      customNamePlaceholder: 'Nom de ton objectif',
      customNameEmptyError: 'Donne un nom à ton objectif.',
      step2Title: 'Combien veux-tu économiser ?',
      step2Hint: 'Tu pourras changer ce montant à tout moment.',
      amountPlaceholder: 'Montant total',
      amountAriaLabel: 'Montant à économiser',
      amountEmptyError: 'Entre un montant plus grand que 0 $.',
      step3Title: 'Regarde ta barre se remplir',
      step3Hint: 'Chaque fois que tu ajoutes un montant, ta barre avance — jusqu\'à 100 %.',
      demoOutOf: (amount) => `sur ${amount}`,
      barAriaLabel: 'Aperçu de la progression de ton objectif',
      previewBadge: 'Aperçu',
      previewNote: 'Ton objectif commencera à 0 $ une fois créé.',
      create: 'Créer mon objectif',
      creating: 'Création…',
      createError: "Impossible de créer l'objectif. Réessaie.",
    },
  },
  en: {
    pageHeader: {
      title: "How you're doing",
      subtitle: 'Your whole financial picture, at a glance.',
      reassuranceStressed: "You're in the right place — one step at a time. 💙",
    },
    help: {
      purpose:
        "A quick look at your financial health: your score, what you have left to spend this month, and how your goals are progressing.",
      actions: [
        "Check your financial health score and how it's trending.",
        'See how much you have left to spend this month.',
        'Read your personalized tips — generated from your real spending and goals.',
        'Click a card (Budget, Savings, Statistics...) to jump straight there.',
      ],
    },
    freshUser: {
      title: "You don't have a budget yet",
      description:
        'Start by adding your monthly income — everything else (budget, alerts, score) gets calculated automatically from there.',
      actionLabel: 'Add my income',
    },
    feedbackPrompt: {
      buttonLabel: 'Give feedback',
      modalTitle: 'Give feedback',
      question: 'What would bring you back?',
      questionPlaceholder: 'Tell us in a few words...',
      optionalLabel: 'Anything else to add? (optional)',
      optionalPlaceholder: 'Your comment...',
      send: 'Send',
      sending: 'Sending...',
      successMessage: 'Thanks, your feedback was received.',
    },
    streak: {
      days: (count) => `${count} day${count > 1 ? 's' : ''} in a row`,
      comeBackActive: 'Come back tomorrow to keep your streak going!',
      comeBackStart: 'Come back tomorrow to start a streak.',
    },
    score: {
      label: 'Health score',
      caption: 'Reflects your spending and budgeting habits.',
      linkText: 'See your rewards →',
    },
    spent: {
      label: 'Spent this month',
    },
    saved: {
      label: 'Saved',
      noGoal: 'Set a goal in Savings →',
      oneGoal: (target) => `toward ${target} →`,
      manyGoals: (count) => `${count} active goals →`,
    },
    accumulated: {
      title: "What you've built up",
      hint: 'Total savings (all goals) and the amount actually invested so far.',
      savedLabel: 'Saved',
      investedLabel: 'Invested',
    },
    scoreChart: {
      title: 'Your score over time',
      hint: 'Your financial health score, day by day.',
      emptyTitle: 'Not enough history yet',
      emptyDescription: 'Check back in a few days to see your score trend.',
    },
    factors: {
      title: "What makes up your score",
      hint: 'Spending pace, savings regularity, and fixed expenses vs. income.',
    },
    goFurther: 'Go further',
    featureLinks: [
      {
        to: '/budget',
        title: 'Budget',
        description: 'Expenses by category, compared to what you set.',
      },
      {
        to: '/epargne',
        title: 'Savings',
        description: "Your goals and how they're progressing.",
      },
      {
        to: '/statistiques',
        title: 'Statistics',
        description: 'Your spending breakdown by category, in detail.',
      },
      {
        to: '/statistiques/recompenses',
        title: 'Rewards',
        description: 'Your badges and your login streak.',
      },
    ],
    gettingStarted: {
      title: 'Get started',
      hint: '3 steps to see your full financial picture.',
      step1: {
        title: 'Choose your goal',
        description: "Tell us what you're working toward — we personalize the rest around it.",
        actionLabel: 'Choose a goal',
      },
      step2: {
        title: 'Import your bank file',
        description: 'A CSV or Excel statement is all it takes to see all your spending at once.',
        actionLabel: 'Import a file',
      },
      step3: {
        title: 'See where your money goes',
        description: 'Explore your spending by category, week, and month.',
        actionLabel: 'View my stats',
      },
    },
    goalCard: {
      eyebrow: 'My goal',
      outOf: (target) => `of ${target}`,
      remaining: (amount) => `${amount} left to save`,
      goalReached: 'Goal reached!',
      viewDetail: 'View detail',
      encouragement: {
        start: 'Great start — every dollar counts.',
        progress: "You're making progress, keep it up.",
        half: "Past the halfway mark, you're almost there.",
        final: 'Home stretch!',
        done: 'Goal reached, nice work! 🎉',
      },
      empty: {
        title: "What's your first goal?",
        description: 'Trip, car, gift… pick what motivates you.',
        actionLabel: 'Create my goal',
        demoActionLabel: 'Try with sample data',
      },
      demoBanner: {
        label: 'Demo mode',
        description: 'Sample data — nothing is saved to your account.',
        exitButton: 'Back to my data',
      },
      quickAdd: {
        ariaLabel: (name) => `Add an amount to ${name}`,
        placeholder: 'Amount to add',
        confirm: 'Add',
        emptyError: 'Enter an amount.',
        invalidError: 'The amount must be greater than $0.',
      },
    },
    needsLimit: {
      title: 'Monthly limit',
      hint: 'General reference points for your needs and savings, based on your income.',
      needsLabel: 'Needs',
      needsAriaLabel: 'Percentage of income set aside for needs',
      savingsLabel: 'Savings',
      savingsAriaLabel: 'Percentage of income set aside for savings',
      ofLimit: (amount) => `of ${amount} allotted`,
      barAriaLabel: 'Needs spending relative to the limit',
      pctUsed: (pct) => `${pct}% of your needs limit used`,
      savingsTargetLine: (amount) => `Suggested savings target this month: ${amount}.`,
      disclaimer: 'General reference point, not financial advice.',
    },
    subscriptionsFound: {
      title: 'Subscriptions found',
      hint: (monthlyTotal) => `Detected automatically in your expenses — ${monthlyTotal} a month.`,
      moreCount: (n) => `+ ${n} more`,
    },
    welcomeTutorial: {
      modalTitle: 'Welcome to SaveUp',
      stepLabel: (step) => `Step ${step} of 3`,
      skip: 'Skip',
      back: 'Back',
      next: 'Next',
      step1Title: 'Choose a goal',
      step1Hint: 'You can add more later.',
      presets: [
        { id: 'urgence', label: '🛟 Emergency fund', name: 'Emergency fund' },
        { id: 'vacances', label: '✈️ Vacation', name: 'Vacation' },
        { id: 'achat', label: '🛍️ Big purchase', name: 'Big purchase' },
        { id: 'autre', label: '🎯 Other', name: '' },
      ],
      customNamePlaceholder: 'Name your goal',
      customNameEmptyError: 'Give your goal a name.',
      step2Title: 'How much do you want to save?',
      step2Hint: 'You can change this amount any time.',
      amountPlaceholder: 'Total amount',
      amountAriaLabel: 'Amount to save',
      amountEmptyError: 'Enter an amount greater than $0.',
      step3Title: 'Watch your bar fill up',
      step3Hint: 'Every time you add an amount, your bar moves forward — all the way to 100%.',
      demoOutOf: (amount) => `out of ${amount}`,
      barAriaLabel: 'Preview of your goal progress',
      previewBadge: 'Preview',
      previewNote: 'Your goal will start at $0 once created.',
      create: 'Create my goal',
      creating: 'Creating…',
      createError: 'Could not create the goal. Try again.',
    },
  },
}
