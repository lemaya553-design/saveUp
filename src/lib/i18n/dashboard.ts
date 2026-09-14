import type { Lang } from './language'

export interface DashboardContent {
  pageHeader: { title: string; subtitle: string }
  help: { purpose: string; actions: string[] }
  freshUser: {
    title: string
    description: string
    actionLabel: string
  }
  streak: {
    days: (count: number) => string
    comeBackActive: string
    comeBackStart: string
  }
  starterBadge: {
    unlocked: (name: string) => string
    claim: string
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
  goFurther: string
  featureLinks: {
    to: string
    title: string
    description: string
  }[]
}

export const DASHBOARD: Record<Lang, DashboardContent> = {
  fr: {
    pageHeader: {
      title: "Comment tu t'en sors",
      subtitle: 'Ton portrait financier en un coup d’œil.',
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
    streak: {
      days: (count) => `${count} jour${count > 1 ? 's' : ''} de suite`,
      comeBackActive: 'Reviens demain pour garder ta série !',
      comeBackStart: 'Reviens demain pour commencer une série.',
    },
    starterBadge: {
      unlocked: (name) => `Badge débloqué : ${name}`,
      claim: 'Réclamer',
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
        description: 'Tendances et comparaisons mensuelles, en détail.',
      },
      {
        to: '/statistiques/recompenses',
        title: 'Récompenses',
        description: 'Tes badges et ta série de connexions.',
      },
    ],
  },
  en: {
    pageHeader: {
      title: "How you're doing",
      subtitle: 'Your whole financial picture, at a glance.',
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
    streak: {
      days: (count) => `${count} day${count > 1 ? 's' : ''} in a row`,
      comeBackActive: 'Come back tomorrow to keep your streak going!',
      comeBackStart: 'Come back tomorrow to start a streak.',
    },
    starterBadge: {
      unlocked: (name) => `Badge unlocked: ${name}`,
      claim: 'Claim',
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
        description: 'Monthly trends and comparisons, in detail.',
      },
      {
        to: '/statistiques/recompenses',
        title: 'Rewards',
        description: 'Your badges and your login streak.',
      },
    ],
  },
}
