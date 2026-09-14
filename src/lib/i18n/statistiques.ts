import type { Lang } from './language'

// Covers Statistiques.tsx itself plus every component exclusively mounted
// under it (SpendingBreakdownCard, CategoryDonutChart, CategorySpendingChart,
// MonthComparison, MonthOverlayChart, MonthlyTrendChart,
// IncomeExpenseTrendChart, BudgetVsActualChart, CategoryMomList,
// DataExportCard, RecompensesTab, PersonalizedTips) — centralized here since
// they're all one page's worth of UI and share a handful of strings (month
// nav arrows, "empty" states, transaction counts).
export interface StatistiquesContent {
  page: {
    title: string
    subtitle: string
  }
  tabs: {
    apercu: string
    tendances: string
    recompenses: string
  }
  help: {
    apercu: { title: string; purpose: string; actions: string[] }
    tendances: { title: string; purpose: string; actions: string[] }
    recompenses: { title: string; purpose: string; actions: string[] }
  }
  monthNav: {
    prev: string
    next: string
  }
  // A recurring "Contribution — {goal}" / "Contribution épargne" transaction
  // description built from real data — not the goal name itself (that's
  // user data, left alone), just the surrounding label.
  contributionDescription: (goalName: string) => string
  contributionDescriptionGeneric: string
  fallbackGoalName: string
  apercu: {
    categoryCard: {
      title: string
      hint: string
      pctNote: string
    }
    budgetVsActualCard: {
      title: string
      hint: string
    }
    manageData: {
      heading: string
    }
    csvCard: {
      title: string
      hint: string
      exporting: string
      download: string
    }
  }
  tendances: {
    comparisonCard: { title: string; hint: string }
    trendCard: { title: string; hint: string }
    momCard: { title: string; hint: string }
    incomeExpenseCard: { title: string; hint: string }
    upgradeTrends: { title: string; description: string }
    upgradeIncomeExpense: { title: string; description: string }
  }
  monthComparison: {
    heading: string
    hint: string
    thisMonth: string
    noData: string
  }
  spendingBreakdownCard: {
    title: string
    expensesTab: string
    incomeTab: string
    spentThisMonth: string
    monthlyIncome: string
    noIncome: string
    fixedNote: string
    fixedExpenseCount: (count: number) => string
    total: (amount: string, count: number) => string
    emptyExpenses: string
    emptyIncome: string
  }
  categoryDonut: {
    transactionCount: (count: number) => string
  }
  categorySpendingChart: {
    empty: string
    tooltipSavings: string
    tooltipPctOfIncome: (pct: string) => string
    tooltipNoIncome: string
    tooltipClickDetail: string
    transactionCount: (count: number) => string
    dragToReclassify: string
    dropHint: (description: string) => string
  }
  monthOverlayChart: {
    empty: string
    lastMonth: string
    thisMonth: string
    thisMonthOver: string
    tooltipLastMonth: (amount: string) => string
    tooltipThisMonth: (amount: string) => string
  }
  monthlyTrendChart: {
    notEnoughData: string
  }
  incomeExpenseTrendChart: {
    notEnoughData: string
    expenses: (amount: string) => string
    income: (amount: string) => string
    savingsRate: (pct: string) => string
    currentIncome: (amount: string) => string
    footnote: string
  }
  budgetVsActualChart: {
    empty: string
    pctUsed: (pct: number) => string
    spent: (amount: string) => string
    budget: (amount: string) => string
    overBudget: (amount: string) => string
    ariaLabel: (category: string, actual: string, budget: string) => string
  }
  categoryMomList: {
    empty: string
    new: string
    noChange: string
  }
  dataExportCard: {
    title: string
    hint: string
    exporting: string
    downloadExcel: string
    downloadPdf: string
    upgradeTitle: string
    upgradeDescription: string
  }
  recompenses: {
    loading: string
    streak: {
      days: (count: number) => string
      keepGoing: string
      startOne: string
    }
    starterBadge: {
      readyDefault: string
      claim: string
    }
    noGoal: {
      text: string
      cta: string
    }
    savingsScore: {
      title: string
      hint: string
      caption: string
      totalSaved: string
      seeHealthScore: string
    }
    goalSelector: {
      label: string
      allGoals: string
    }
    goalComplete: (goalName: string) => string
    goalProgress: (goalName: string) => string
    missingToComplete: (amount: string, goalName: string) => string
    andUnlockGoalBadge: string
    allUnlocked: string
    nextTier: (tierName: string) => string
    missingForTier: (amount: string, tierName: string) => string
    onGoal: (goalName: string) => string
    setGoalToSeeProgress: string
    yourBadges: string
    claimedCount: (claimed: number, total: number) => string
    toClaimCount: (count: number) => string
    badgeEarned: string
    claim: string
    goToStandard: string
    missingAmount: (amount: string) => string
    completeActiveGoal: string
    locked: string
    standard: string
    continueSaving: string
    continueSavingHint: string
  }
  personalizedTips: {
    title: string
    hint: string
    emptyPre: string
    emptyExpenseLink: string
    emptyAnd: string
    emptyGoalLink: string
    emptyPost: string
  }
}

export const STATISTIQUES: Record<Lang, StatistiquesContent> = {
  fr: {
    page: {
      title: 'Tes statistiques',
      subtitle: 'Où va ton argent, mois après mois.',
    },
    tabs: {
      apercu: 'Aperçu',
      tendances: 'Tendances',
      recompenses: 'Récompenses',
    },
    help: {
      apercu: {
        title: 'Aperçu',
        purpose: 'Ta répartition de dépenses du mois, et tes outils pour importer ou exporter tes données.',
        actions: [
          'Consulte la répartition de tes dépenses par catégorie, mois par mois.',
          'Compare ton budget par catégorie à ce que tu as réellement dépensé.',
          'Exporte tes données en CSV ou en rapport PDF/Excel.',
        ],
      },
      tendances: {
        title: 'Tendances',
        purpose: "Analyse tes tendances de dépenses sur plusieurs mois et compare-les d'un mois à l'autre.",
        actions: [
          'Consulte tes tendances de dépenses sur les 6 derniers mois.',
          'Compare ce mois-ci au mois précédent, par catégorie.',
          'Vois ton revenu et tes dépenses évoluer côte à côte.',
        ],
      },
      recompenses: {
        title: 'Récompenses',
        purpose: 'Débloque des badges au fil de ta progression et de ta constance dans l\'app.',
        actions: [
          'Consulte les badges déjà débloqués et ceux qui restent à atteindre.',
          'Vise le prochain palier (montant épargné, objectif atteint...) pour en débloquer un nouveau.',
          'Reviens régulièrement pour garder ta série de connexions active.',
        ],
      },
    },
    monthNav: {
      prev: 'Mois précédent',
      next: 'Mois suivant',
    },
    contributionDescription: (goalName) => `Contribution — ${goalName}`,
    contributionDescriptionGeneric: 'Contribution épargne',
    fallbackGoalName: 'Objectif',
    apercu: {
      categoryCard: {
        title: 'Dépenses par catégorie',
        hint: 'Tes dépenses ponctuelles du mois choisi, du plus gros poste au plus petit. Clique une colonne pour voir le détail.',
        pctNote: "Le % du revenu est basé sur ton revenu mensuel actuel, pas nécessairement celui de ce mois-là.",
      },
      budgetVsActualCard: {
        title: 'Budget vs réel',
        hint: 'Dépenses fixes et ponctuelles de ce mois-ci, comparées au budget fixé par catégorie (Budget → Catégories).',
      },
      manageData: {
        heading: 'Gérer mes données',
      },
      csvCard: {
        title: 'Exporter tes données',
        hint: "Toutes tes dépenses et contributions d'épargne, en CSV.",
        exporting: 'Export en cours...',
        download: 'Télécharger le CSV',
      },
    },
    tendances: {
      comparisonCard: {
        title: 'Comparaison avec le mois dernier, par catégorie',
        hint: 'La grande colonne est ce que tu as dépensé le mois dernier ; la portion colorée montre combien de ce montant est déjà dépensé ce mois-ci.',
      },
      trendCard: {
        title: 'Tendance sur 6 mois',
        hint: 'Total de tes dépenses ponctuelles, mois par mois.',
      },
      momCard: {
        title: 'Comparaison au mois dernier',
        hint: 'Variation de tes dépenses par catégorie par rapport au mois précédent.',
      },
      incomeExpenseCard: {
        title: 'Revenu vs dépenses',
        hint: "Tendance sur 6 mois, et le taux d'épargne qui en résulte chaque mois.",
      },
      upgradeTrends: {
        title: 'Tendances et comparaisons mensuelles — fonctionnalité Standard',
        description: "Vois l'évolution de tes dépenses mois après mois et compare chaque catégorie au mois précédent.",
      },
      upgradeIncomeExpense: {
        title: 'Revenu vs dépenses — fonctionnalité Standard',
        description: "Vois ton revenu et tes dépenses évoluer côte à côte sur 6 mois, avec le taux d'épargne que ça donne chaque mois.",
      },
    },
    monthComparison: {
      heading: 'Ce mois vs le mois passé',
      hint: 'Combien tu as dépensé, comparé au mois précédent.',
      thisMonth: 'Ce mois-ci',
      noData: 'Pas de données',
    },
    spendingBreakdownCard: {
      title: 'Répartition par catégorie',
      expensesTab: 'Dépenses',
      incomeTab: 'Revenus',
      spentThisMonth: 'Dépensé ce mois-là',
      monthlyIncome: 'Revenu mensuel',
      noIncome: 'Ajoute ton revenu mensuel dans Paramètres pour voir comment il se répartit.',
      fixedNote: "Tes dépenses fixes ne varient pas d'un mois à l'autre — cette répartition reste la même peu importe le mois choisi ci-dessus.",
      fixedExpenseCount: (count) => `${count} dépense${count > 1 ? 's' : ''} fixe${count > 1 ? 's' : ''}`,
      total: (amount, count) => `Total : ${amount} sur ${count} catégorie${count > 1 ? 's' : ''}`,
      emptyExpenses: 'Aucune dépense ponctuelle enregistrée ce mois-ci pour l\'instant.',
      emptyIncome: 'Aucun revenu mensuel défini.',
    },
    categoryDonut: {
      transactionCount: (count) => `${count} transaction${count > 1 ? 's' : ''}`,
    },
    categorySpendingChart: {
      empty: 'Aucune dépense ponctuelle enregistrée ce mois-ci pour l\'instant.',
      tooltipSavings: 'Mis de côté ce mois-là',
      tooltipPctOfIncome: (pct) => `${pct} de ton revenu`,
      tooltipNoIncome: 'Revenu mensuel non défini',
      tooltipClickDetail: 'Clique pour voir le détail',
      transactionCount: (count) => `${count} transaction${count > 1 ? 's' : ''}`,
      dragToReclassify: ' — glisse une ligne sur une autre colonne pour la reclasser',
      dropHint: (description) => `Dépose sur une catégorie pour y déplacer « ${description} ».`,
    },
    monthOverlayChart: {
      empty: "Pas assez de données du mois dernier pour comparer, pour l'instant.",
      lastMonth: 'Mois dernier',
      thisMonth: 'Ce mois-ci',
      thisMonthOver: 'Ce mois-ci (dépassé)',
      tooltipLastMonth: (amount) => `Mois dernier : ${amount}`,
      tooltipThisMonth: (amount) => `Ce mois-ci : ${amount}`,
    },
    monthlyTrendChart: {
      notEnoughData: "Pas encore assez d'historique pour une tendance — reviens dans quelques semaines.",
    },
    incomeExpenseTrendChart: {
      notEnoughData: "Pas encore assez d'historique pour une tendance — reviens dans quelques semaines.",
      expenses: (amount) => `Dépenses : ${amount}`,
      income: (amount) => `Revenu : ${amount}`,
      savingsRate: (pct) => `Taux d'épargne : ${pct}`,
      currentIncome: (amount) => `Revenu actuel : ${amount}`,
      footnote: "Basé sur ton revenu et tes dépenses fixes actuels appliqués rétroactivement — pas nécessairement ce qu'ils étaient chaque mois.",
    },
    budgetVsActualChart: {
      empty: 'Aucun budget défini pour l\'instant — ajoute un budget mensuel à tes catégories dans Paramètres pour voir cette comparaison.',
      pctUsed: (pct) => `${pct.toFixed(0)}% de ton budget utilisé`,
      spent: (amount) => `${amount} dépensé`,
      budget: (amount) => `Budget : ${amount}`,
      overBudget: (amount) => `Dépassement de ${amount}`,
      ariaLabel: (category, actual, budget) => `${category} : ${actual} dépensé sur un budget de ${budget}`,
    },
    categoryMomList: {
      empty: 'Pas encore assez de données pour comparer au mois dernier.',
      new: 'nouveau',
      noChange: '— 0%',
    },
    dataExportCard: {
      title: 'Exporter un rapport',
      hint: 'Résumé, dépenses fixes, transactions et objectifs, en PDF ou Excel.',
      exporting: 'Export en cours...',
      downloadExcel: 'Télécharger en Excel',
      downloadPdf: 'Télécharger en PDF',
      upgradeTitle: 'Export PDF/Excel — fonctionnalité Premium',
      upgradeDescription: 'Télécharge un rapport complet de ton budget, tes dépenses et tes objectifs, prêt à partager ou archiver.',
    },
    recompenses: {
      loading: 'Chargement...',
      streak: {
        days: (count) => `${count} jour${count > 1 ? 's' : ''} de suite`,
        keepGoing: 'Reviens demain pour garder ta série !',
        startOne: 'Reviens demain pour commencer une série.',
      },
      starterBadge: {
        readyDefault: 'Ton premier badge est prêt.',
        claim: 'Réclamer',
      },
      noGoal: {
        text: "Fixe un objectif d'épargne pour commencer à débloquer des badges.",
        cta: 'Fixer un objectif',
      },
      savingsScore: {
        title: "Score d'épargne",
        hint: 'Basé sur le montant épargné et la régularité de tes contributions.',
        caption: 'Reflète ton montant épargné et ta régularité.',
        totalSaved: 'Total épargné',
        seeHealthScore: 'Voir ton score de santé →',
      },
      goalSelector: {
        label: 'Voir :',
        allGoals: 'Tous les objectifs',
      },
      goalComplete: (goalName) => `🎉 « ${goalName} » est complété !`,
      goalProgress: (goalName) => `Progression de « ${goalName} »`,
      missingToComplete: (amount, goalName) => `Il te manque ${amount} pour compléter « ${goalName} »`,
      andUnlockGoalBadge: ' et débloquer « Objectif atteint ».',
      allUnlocked: '🎉 Tous les badges sont débloqués !',
      nextTier: (tierName) => `Prochain palier : ${tierName}`,
      missingForTier: (amount, tierName) => `Il te manque ${amount} pour débloquer « ${tierName} »`,
      onGoal: (goalName) => ` (sur « ${goalName} »)`,
      setGoalToSeeProgress: "Fixe un objectif d'épargne pour voir ta progression vers le prochain palier.",
      yourBadges: 'Tes badges',
      claimedCount: (claimed, total) => `${claimed}/${total} réclamés`,
      toClaimCount: (count) => `· ${count} à réclamer !`,
      badgeEarned: 'Badge mérité !',
      claim: 'Réclamer',
      goToStandard: 'Passer à Standard →',
      missingAmount: (amount) => `Il manque ${amount}`,
      completeActiveGoal: 'Complète un objectif actif',
      locked: 'Verrouillé',
      standard: 'Standard',
      continueSaving: "Continuer d'épargner",
      continueSavingHint: 'Ajoute une contribution pour progresser vers ton prochain badge.',
    },
    personalizedTips: {
      title: 'Conseils personnalisés',
      hint: 'Basés sur tes vraies dépenses, tendances et objectifs.',
      emptyPre: 'Pas encore de conseils — ajoute une ',
      emptyExpenseLink: 'dépense',
      emptyAnd: ' ou un ',
      emptyGoalLink: "objectif d'épargne",
      emptyPost: ' pour voir tes premiers conseils personnalisés ici.',
    },
  },
  en: {
    page: {
      title: 'Your stats',
      subtitle: 'Where your money goes, month after month.',
    },
    tabs: {
      apercu: 'Overview',
      tendances: 'Trends',
      recompenses: 'Rewards',
    },
    help: {
      apercu: {
        title: 'Overview',
        purpose: "This month's spending breakdown, plus your tools to import or export your data.",
        actions: [
          'Check your spending breakdown by category, month by month.',
          'Compare your budget by category to what you actually spent.',
          'Export your data as CSV, or a PDF/Excel report.',
        ],
      },
      tendances: {
        title: 'Trends',
        purpose: 'Analyze your spending trends over several months and compare them month to month.',
        actions: [
          'Check your spending trends over the last 6 months.',
          'Compare this month to last month, by category.',
          'Watch your income and expenses move side by side.',
        ],
      },
      recompenses: {
        title: 'Rewards',
        purpose: "Unlock badges as you make progress and stay consistent in the app.",
        actions: [
          'Check which badges you\'ve already unlocked and which ones are left.',
          'Aim for the next tier (amount saved, goal reached...) to unlock a new one.',
          'Come back regularly to keep your login streak going.',
        ],
      },
    },
    monthNav: {
      prev: 'Previous month',
      next: 'Next month',
    },
    contributionDescription: (goalName) => `Contribution — ${goalName}`,
    contributionDescriptionGeneric: 'Savings contribution',
    fallbackGoalName: 'Goal',
    apercu: {
      categoryCard: {
        title: 'Spending by category',
        hint: 'Your one-off expenses for the chosen month, biggest to smallest. Click a bar to see the detail.',
        pctNote: "The % of income is based on your current monthly income, not necessarily what it was that month.",
      },
      budgetVsActualCard: {
        title: 'Budget vs. actual',
        hint: 'Fixed and one-off expenses for this month, compared to the budget set per category (Budget → Categories).',
      },
      manageData: {
        heading: 'Manage my data',
      },
      csvCard: {
        title: 'Export your data',
        hint: 'All your expenses and savings contributions, as CSV.',
        exporting: 'Exporting...',
        download: 'Download CSV',
      },
    },
    tendances: {
      comparisonCard: {
        title: 'Comparison with last month, by category',
        hint: 'The tall bar is what you spent last month; the colored portion shows how much of that amount is already spent this month.',
      },
      trendCard: {
        title: '6-month trend',
        hint: 'Total one-off expenses, month by month.',
      },
      momCard: {
        title: 'Comparison to last month',
        hint: 'Change in your spending by category compared to the previous month.',
      },
      incomeExpenseCard: {
        title: 'Income vs. expenses',
        hint: '6-month trend, and the resulting savings rate each month.',
      },
      upgradeTrends: {
        title: 'Monthly trends and comparisons — Standard feature',
        description: 'See your spending evolve month after month and compare each category to the previous month.',
      },
      upgradeIncomeExpense: {
        title: 'Income vs. expenses — Standard feature',
        description: 'See your income and expenses evolve side by side over 6 months, with the savings rate that gives you each month.',
      },
    },
    monthComparison: {
      heading: 'This month vs. last month',
      hint: 'How much you spent, compared to the previous month.',
      thisMonth: 'This month',
      noData: 'No data',
    },
    spendingBreakdownCard: {
      title: 'Breakdown by category',
      expensesTab: 'Expenses',
      incomeTab: 'Income',
      spentThisMonth: 'Spent that month',
      monthlyIncome: 'Monthly income',
      noIncome: 'Add your monthly income in Settings to see how it breaks down.',
      fixedNote: "Your fixed expenses don't change from month to month — this breakdown stays the same no matter which month you pick above.",
      fixedExpenseCount: (count) => `${count} fixed expense${count > 1 ? 's' : ''}`,
      total: (amount, count) => `Total: ${amount} across ${count} categor${count > 1 ? 'ies' : 'y'}`,
      emptyExpenses: 'No one-off expenses recorded for this month yet.',
      emptyIncome: 'No monthly income set.',
    },
    categoryDonut: {
      transactionCount: (count) => `${count} transaction${count > 1 ? 's' : ''}`,
    },
    categorySpendingChart: {
      empty: 'No one-off expenses recorded for this month yet.',
      tooltipSavings: 'Set aside that month',
      tooltipPctOfIncome: (pct) => `${pct} of your income`,
      tooltipNoIncome: 'Monthly income not set',
      tooltipClickDetail: 'Click to see the detail',
      transactionCount: (count) => `${count} transaction${count > 1 ? 's' : ''}`,
      dragToReclassify: ' — drag a line onto another column to reclassify it',
      dropHint: (description) => `Drop on a category to move "${description}" there.`,
    },
    monthOverlayChart: {
      empty: "Not enough data from last month to compare yet.",
      lastMonth: 'Last month',
      thisMonth: 'This month',
      thisMonthOver: 'This month (over)',
      tooltipLastMonth: (amount) => `Last month: ${amount}`,
      tooltipThisMonth: (amount) => `This month: ${amount}`,
    },
    monthlyTrendChart: {
      notEnoughData: "Not enough history yet for a trend — check back in a few weeks.",
    },
    incomeExpenseTrendChart: {
      notEnoughData: "Not enough history yet for a trend — check back in a few weeks.",
      expenses: (amount) => `Expenses: ${amount}`,
      income: (amount) => `Income: ${amount}`,
      savingsRate: (pct) => `Savings rate: ${pct}`,
      currentIncome: (amount) => `Current income: ${amount}`,
      footnote: "Based on your current income and fixed expenses applied retroactively — not necessarily what they were each month.",
    },
    budgetVsActualChart: {
      empty: 'No budget set yet — add a monthly budget to your categories in Settings to see this comparison.',
      pctUsed: (pct) => `${pct.toFixed(0)}% of budget used`,
      spent: (amount) => `${amount} spent`,
      budget: (amount) => `Budget: ${amount}`,
      overBudget: (amount) => `${amount} over budget`,
      ariaLabel: (category, actual, budget) => `${category}: ${actual} spent out of a budget of ${budget}`,
    },
    categoryMomList: {
      empty: 'Not enough data yet to compare to last month.',
      new: 'new',
      noChange: '— 0%',
    },
    dataExportCard: {
      title: 'Export a report',
      hint: 'Summary, fixed expenses, transactions and goals, as PDF or Excel.',
      exporting: 'Exporting...',
      downloadExcel: 'Download as Excel',
      downloadPdf: 'Download as PDF',
      upgradeTitle: 'PDF/Excel export — Premium feature',
      upgradeDescription: 'Download a complete report of your budget, expenses and goals, ready to share or archive.',
    },
    recompenses: {
      loading: 'Loading...',
      streak: {
        days: (count) => `${count} day${count > 1 ? 's' : ''} in a row`,
        keepGoing: 'Come back tomorrow to keep your streak going!',
        startOne: 'Come back tomorrow to start a streak.',
      },
      starterBadge: {
        readyDefault: 'Your first badge is ready.',
        claim: 'Claim',
      },
      noGoal: {
        text: 'Set a savings goal to start unlocking badges.',
        cta: 'Set a goal',
      },
      savingsScore: {
        title: 'Savings score',
        hint: 'Based on the amount saved and how regularly you contribute.',
        caption: 'Reflects the amount you saved and how regularly you save.',
        totalSaved: 'Total saved',
        seeHealthScore: 'See your health score →',
      },
      goalSelector: {
        label: 'View:',
        allGoals: 'All goals',
      },
      goalComplete: (goalName) => `🎉 "${goalName}" is complete!`,
      goalProgress: (goalName) => `Progress on "${goalName}"`,
      missingToComplete: (amount, goalName) => `You need ${amount} more to complete "${goalName}"`,
      andUnlockGoalBadge: ' and unlock "Goal reached".',
      allUnlocked: '🎉 Every badge is unlocked!',
      nextTier: (tierName) => `Next tier: ${tierName}`,
      missingForTier: (amount, tierName) => `You need ${amount} more to unlock "${tierName}"`,
      onGoal: (goalName) => ` (on "${goalName}")`,
      setGoalToSeeProgress: 'Set a savings goal to see your progress toward the next tier.',
      yourBadges: 'Your badges',
      claimedCount: (claimed, total) => `${claimed}/${total} claimed`,
      toClaimCount: (count) => `· ${count} to claim!`,
      badgeEarned: 'Badge earned!',
      claim: 'Claim',
      goToStandard: 'Upgrade to Standard →',
      missingAmount: (amount) => `${amount} to go`,
      completeActiveGoal: 'Complete an active goal',
      locked: 'Locked',
      standard: 'Standard',
      continueSaving: 'Keep saving',
      continueSavingHint: 'Add a contribution to progress toward your next badge.',
    },
    personalizedTips: {
      title: 'Personalized tips',
      hint: 'Based on your real spending, trends and goals.',
      emptyPre: 'No tips yet — add an ',
      emptyExpenseLink: 'expense',
      emptyAnd: ' or a ',
      emptyGoalLink: 'savings goal',
      emptyPost: ' to see your first personalized tips here.',
    },
  },
}
