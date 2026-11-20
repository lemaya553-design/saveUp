import type { Lang } from './language'

// Covers the Épargne page (Objectifs / Investissement tabs) and every child
// component that lives under it. One big dictionary rather than
// one-per-component, since most of these components are small and only
// ever rendered from this page's tree. Simulateur and Duels tabs (and their
// i18n) were removed from the UI — see App.tsx/Epargne.tsx's comments; no
// Supabase data was touched.
export interface EpargneContent {
  tabs: {
    objectifs: string
    investissement: string
  }
  pageHeader: {
    title: string
    subtitle: string
  }
  help: {
    objectifs: { title: string; purpose: string; actions: string[] }
    investissement: { title: string; purpose: string; actions: string[] }
  }
  objectifsTab: {
    emptyTitle: string
    emptyDescription: string
    emptyAction: string
    // 3 numbered steps shown in the empty state, before a first goal exists
    // — replaced entirely once hasGoals flips true (Epargne.tsx), never
    // shown again after.
    emptySteps: [string, string, string]
    savedLabel: string
    totalTargetLabel: string
    progressLabel: string
    activeGoalsLabel: string
    goalsCount: (n: number) => string
    limitReachedTitle: (max: number) => string
    limitReachedDescription: string
    paceCardTitle: string
    paceCardHint: string
  }
  goalCard: {
    namePlaceholder: string
    targetPlaceholder: string
    dueDateOptionalLabel: string
    photoOptionalLabel: string
    deleteAriaLabel: (name: string) => string
    pausedBadge: string
    dueDatePrefix: string
    percentReached: (pct: number) => string
    remainingSuffix: (amount: string) => string
    goalReached: string
    notEnoughHistory: string
    exceedsCeiling: string
    estimateIn: (duration: string) => string
    pastTargetDate: string
    onTargetDate: string
    aheadOfTarget: (gap: string) => string
    behindTarget: (gap: string) => string
    consistency: (done: number, total: number) => string
    wonDaysToast: (delta: number) => string
    addAmountAriaLabel: (name: string) => string
    addAmountPlaceholder: string
    addAmountConfirm: string
    addAmountEmptyError: string
    addAmountInvalidError: string
  }
  addGoalCard: {
    newGoalButton: string
    heading: string
    hint: string
    namePlaceholder: string
    targetPlaceholder: string
    dueDateOptionalLabel: string
    photoOptionalLabel: string
    creating: string
    photoUploadFailedToast: string
    requiredPace: (perWeek: string, perMonth: string) => string
    pastDeadline: string
  }
  contributeForm: {
    title: string
    hint: string
    amountPlaceholder: string
    submitting: string
    submitButton: string
    overBudget: (amount: string) => string
    budgetExhausted: string
    canContinueAnyway: string
  }
  contributionHistory: {
    title: string
    hint: string
    empty: string
    deletedGoal: string
    collapse: string
    viewAll: (n: number) => string
  }
  paceComparisonChart: {
    empty: string
    ahead: string
    behind: string
    actualLabel: string
    requiredLabel: string
    perMonth: (amount: string) => string
  }
  investissementTab: {
    currentAmountLabel: string
    currentAmountHint: string
    settingsTitle: string
    settingsHint: string
    initialAmountLabel: string
    annualRateLabel: string
    monthlyContributionLabel: string
    projectionTitle: string
    projectionHint: string
    years: (n: number) => string
    estimatedValueIn: (n: number) => string
    monthlyImpactTitle: string
    monthlyImpactHint: (amount: string, years: number) => string
    finalValueLabel: string
    whereMoneyTitle: string
    whereMoneyHint: (years: number) => string
    ruleOf72: (rate: number, years: string) => string
    ruleOf72Fallback: string
    goalsTitle: string
    goalsHint: string
    noGoalsHint: string
    setGoalButton: string
    alreadyReached: string
    wouldReachWithParams: (duration: string) => string
    wouldNotReach: string
    disclaimer: string
  }
  growthChart: {
    start: string
    monthsLabel: (n: number) => string
    yearsLabel: (n: number) => string
    yearsMonthsLabel: (years: number, months: number) => string
  }
  contributionsVsInterestChart: {
    empty: string
    ariaLabel: (contribPct: number, interestPct: number) => string
    contributionsLabel: string
    interestLabel: string
  }
  goalPhotoPicker: {
    premiumBadge: string
    formatError: string
    tooLargeError: (mb: number) => string
    uploading: string
    replacePhoto: string
    addPhoto: string
    removePhoto: string
  }
}

export const EPARGNE: Record<Lang, EpargneContent> = {
  fr: {
    tabs: {
      objectifs: 'Objectifs',
      investissement: 'Investissement',
    },
    pageHeader: {
      title: 'Vers quoi tu épargnes',
      subtitle: "Tes objectifs d'épargne et tes placements.",
    },
    help: {
      objectifs: {
        title: 'Objectifs',
        purpose: "Crée et suis tes objectifs d'épargne (voyage, fonds d'urgence...) et leur progression.",
        actions: [
          'Crée un nouvel objectif avec un montant cible et, si tu veux, une date.',
          'Ajoute une contribution à un objectif existant pour le faire avancer.',
          'Compare ton rythme actuel au rythme nécessaire pour atteindre tes dates cibles.',
        ],
      },
      investissement: {
        title: 'Investissement',
        purpose: "Estime la croissance future d'un placement grâce à l'intérêt composé.",
        actions: [
          'Indique le montant actuellement investi et un taux de rendement annuel.',
          'Compare la projection sur différentes durées (1, 5, 10 ans...).',
          "Consulte l'estimation du temps pour doubler ton placement (règle du 72).",
        ],
      },
    },
    objectifsTab: {
      emptyTitle: "Tu n'as pas encore d'objectif d'épargne",
      emptyDescription:
        'Fixe un montant à atteindre pour commencer à suivre ta progression et débloquer des badges.',
      emptyAction: 'Créer mon premier objectif',
      emptySteps: ['Choisis ton objectif', 'Mets un montant', 'Regarde ta barre se remplir'],
      savedLabel: 'Épargné',
      totalTargetLabel: 'Objectif total',
      progressLabel: 'Progression',
      activeGoalsLabel: 'Objectifs',
      goalsCount: (n) => `${n} objectif${n > 1 ? 's' : ''}`,
      limitReachedTitle: (max) => `Limite de ${max} objectif${max > 1 ? 's' : ''} atteinte`,
      limitReachedDescription:
        "Le plan Gratuit est limité à un objectif d'épargne actif. Passe à Standard pour en suivre autant que tu veux.",
      paceCardTitle: 'Rythme actuel vs nécessaire',
      paceCardHint:
        "Ce que tu mets de côté par mois, comparé à ce qu'il faudrait pour respecter l'échéance de chaque objectif.",
    },
    goalCard: {
      namePlaceholder: "Nom de l'objectif",
      targetPlaceholder: 'Montant cible',
      dueDateOptionalLabel: 'Échéance (optionnel)',
      photoOptionalLabel: 'Photo (optionnel)',
      deleteAriaLabel: (name) => `Supprimer ${name}`,
      pausedBadge: '🔒 En pause — passe à Standard pour la réactiver',
      dueDatePrefix: 'Échéance :',
      percentReached: (pct) => `${pct}% atteint`,
      remainingSuffix: (amount) => ` · ${amount} restant`,
      goalReached: '🎉 Objectif atteint.',
      notEnoughHistory:
        "Pas assez d'historique pour estimer — ajoute quelques contributions pour voir une projection.",
      exceedsCeiling:
        'À ce rythme, ça prendrait plus de 10 ans — augmente tes contributions pour une estimation utile.',
      estimateIn: (duration) => `≈ dans ${duration}`,
      pastTargetDate: 'Ta date visée est dépassée.',
      onTargetDate: 'Pile sur ta date visée.',
      aheadOfTarget: (gap) => `≈ ${gap} d'avance sur ta date visée`,
      behindTarget: (gap) => `≈ ${gap} de retard sur ta date visée`,
      consistency: (done, total) => `Régularité (${done}/${total} dernières semaines)`,
      wonDaysToast: (delta) => `Tu viens de gagner ${delta} jour${delta > 1 ? 's' : ''} !`,
      addAmountAriaLabel: (name) => `Ajouter un montant à ${name}`,
      addAmountPlaceholder: 'Montant à ajouter',
      addAmountConfirm: 'Ajouter',
      addAmountEmptyError: 'Entre un montant.',
      addAmountInvalidError: 'Le montant doit être plus grand que 0 $.',
    },
    addGoalCard: {
      newGoalButton: '+ Nouvel objectif',
      heading: 'Nouvel objectif',
      hint: 'Un nom, un montant à atteindre, et une échéance si tu en as une.',
      namePlaceholder: 'Nom (ex: Voyage)',
      targetPlaceholder: 'Montant cible',
      dueDateOptionalLabel: 'Échéance (optionnel)',
      photoOptionalLabel: 'Photo (optionnel)',
      creating: 'Création...',
      photoUploadFailedToast:
        "Objectif créé, mais la photo n'a pas pu être envoyée — réessaie depuis « Modifier ».",
      requiredPace: (perWeek, perMonth) =>
        `Pour l'atteindre à temps, épargne environ ${perWeek} par semaine (ou ${perMonth} par mois).`,
      pastDeadline: "L'échéance choisie est déjà passée.",
    },
    contributeForm: {
      title: 'Ajoute à ton épargne',
      hint: "Chaque fois que tu mets de l'argent de côté, note-le ici.",
      amountPlaceholder: 'Montant',
      submitting: 'Épargne...',
      submitButton: 'Épargner',
      overBudget: (amount) =>
        `Il ne te reste que ${amount} de budget disponible ce mois-ci — cette contribution le dépasserait.`,
      budgetExhausted: 'Ton budget disponible de ce mois-ci est déjà épuisé par tes épargnes.',
      canContinueAnyway: 'Tu peux quand même continuer.',
    },
    contributionHistory: {
      title: 'Historique des contributions',
      hint: 'Tes derniers ajouts, les plus récents en premier.',
      empty: "Aucune contribution enregistrée pour l'instant.",
      deletedGoal: 'Objectif supprimé',
      collapse: 'Réduire',
      viewAll: (n) => `Voir tout l'historique (${n})`,
    },
    paceComparisonChart: {
      empty: "Ajoute une échéance à un objectif pour voir son rythme actuel comparé à ce qu'il faudrait.",
      ahead: '↑ En avance',
      behind: '↓ En retard',
      actualLabel: 'Actuel',
      requiredLabel: 'Nécessaire',
      perMonth: (amount) => `${amount}/mois`,
    },
    investissementTab: {
      currentAmountLabel: 'Montant actuellement investi',
      currentAmountHint: 'Ton vrai montant investi à ce jour.',
      settingsTitle: 'Paramètres',
      settingsHint: "Un scénario hypothétique — n'affecte pas ton montant réellement investi ci-dessus.",
      initialAmountLabel: 'Montant initial',
      annualRateLabel: 'Taux de rendement annuel estimé (%)',
      monthlyContributionLabel: 'Contribution mensuelle',
      projectionTitle: 'Projection',
      projectionHint: "Ce que ton placement pourrait valoir, selon l'horizon choisi.",
      years: (n) => `${n} an${n > 1 ? 's' : ''}`,
      estimatedValueIn: (n) => `Valeur estimée dans ${n} an${n > 1 ? 's' : ''}.`,
      monthlyImpactTitle: 'Impact de ta contribution mensuelle',
      monthlyImpactHint: (amount, years) => `Ce que ${amount}/mois change sur ${years} an${years > 1 ? 's' : ''}.`,
      finalValueLabel: 'Valeur finale',
      whereMoneyTitle: "D'où vient l'argent",
      whereMoneyHint: (years) =>
        `Répartition entre tes contributions et les intérêts gagnés, sur ${years} an${years > 1 ? 's' : ''}.`,
      ruleOf72: (rate, years) =>
        `La règle du 72 : à ${rate}% par année, un montant placé double environ tous les ${years} ans, grâce à l'intérêt composé.`,
      ruleOf72Fallback:
        "La règle du 72 estime le temps pour doubler un placement (72 ÷ taux). Choisis un taux de rendement positif ci-dessus pour voir l'estimation.",
      goalsTitle: "Tes objectifs d'épargne",
      goalsHint: 'Combien de temps il te faudrait pour les atteindre avec ces paramètres.',
      noGoalsHint:
        "Fixe un objectif dans l'onglet Objectifs pour voir combien de temps il te faudrait pour l'atteindre avec ces paramètres.",
      setGoalButton: 'Fixer un objectif',
      alreadyReached: '🎉 Déjà atteint.',
      wouldReachWithParams: (duration) => `Avec ces paramètres, tu l'atteindrais en environ ${duration}.`,
      wouldNotReach:
        "Avec ces paramètres, tu ne l'atteindrais pas dans un horizon raisonnable — augmente le montant initial, la contribution ou le taux.",
      disclaimer:
        "Ceci est un outil éducatif basé sur un calcul d'intérêt composé théorique et ne constitue pas un conseil financier. Les rendements réels varient et peuvent être négatifs.",
    },
    growthChart: {
      start: 'Départ',
      monthsLabel: (n) => `${n} mois`,
      yearsLabel: (n) => `${n} an${n > 1 ? 's' : ''}`,
      yearsMonthsLabel: (years, months) => `${years} an${years > 1 ? 's' : ''} ${months} mois`,
    },
    contributionsVsInterestChart: {
      empty: 'Ajoute un montant initial ou une contribution mensuelle pour voir cette répartition.',
      ariaLabel: (contribPct, interestPct) => `${contribPct}% contributions, ${interestPct}% intérêts`,
      contributionsLabel: 'Contributions',
      interestLabel: 'Intérêts gagnés',
    },
    goalPhotoPicker: {
      premiumBadge: "🔒 Photo de l'objectif — Premium",
      formatError: 'Formats acceptés : JPG, PNG ou WebP.',
      tooLargeError: (mb) => `Image trop grande (max ${mb} Mo).`,
      uploading: 'Envoi en cours...',
      replacePhoto: 'Remplacer la photo',
      addPhoto: 'Ajouter une photo',
      removePhoto: 'Supprimer la photo',
    },
  },
  en: {
    tabs: {
      objectifs: 'Goals',
      investissement: 'Investing',
    },
    pageHeader: {
      title: "What you're saving for",
      subtitle: 'Your savings goals and your investments.',
    },
    help: {
      objectifs: {
        title: 'Goals',
        purpose: 'Create and track your savings goals (trip, emergency fund...) and their progress.',
        actions: [
          'Create a new goal with a target amount and, if you want, a date.',
          'Add a contribution to an existing goal to move it forward.',
          'Compare your current pace to the pace you need to hit your target dates.',
        ],
      },
      investissement: {
        title: 'Investing',
        purpose: "Estimate an investment's future growth through compound interest.",
        actions: [
          'Enter the amount currently invested and an annual rate of return.',
          'Compare the projection across different durations (1, 5, 10 years...).',
          'Check the estimated time to double your investment (rule of 72).',
        ],
      },
    },
    objectifsTab: {
      emptyTitle: "You don't have a savings goal yet",
      emptyDescription: 'Set an amount to reach to start tracking your progress and unlocking badges.',
      emptyAction: 'Create my first goal',
      emptySteps: ['Choose your goal', 'Set an amount', 'Watch your bar fill up'],
      savedLabel: 'Saved',
      totalTargetLabel: 'Total target',
      progressLabel: 'Progress',
      activeGoalsLabel: 'Goals',
      goalsCount: (n) => `${n} goal${n > 1 ? 's' : ''}`,
      limitReachedTitle: (max) => `${max} goal${max > 1 ? 's' : ''} limit reached`,
      limitReachedDescription:
        'The Free plan is limited to one active savings goal. Upgrade to Standard to track as many as you want.',
      paceCardTitle: 'Current pace vs. needed',
      paceCardHint: "What you're putting aside per month, compared to what's needed to hit each goal's deadline.",
    },
    goalCard: {
      namePlaceholder: 'Goal name',
      targetPlaceholder: 'Target amount',
      dueDateOptionalLabel: 'Due date (optional)',
      photoOptionalLabel: 'Photo (optional)',
      deleteAriaLabel: (name) => `Delete ${name}`,
      pausedBadge: '🔒 Paused — upgrade to Standard to reactivate it',
      dueDatePrefix: 'Due:',
      percentReached: (pct) => `${pct}% reached`,
      remainingSuffix: (amount) => ` · ${amount} left`,
      goalReached: '🎉 Goal reached.',
      notEnoughHistory: 'Not enough history to estimate yet — add a few contributions to see a projection.',
      exceedsCeiling: "At this pace, it'd take more than 10 years — increase your contributions for a useful estimate.",
      estimateIn: (duration) => `≈ in ${duration}`,
      pastTargetDate: 'Your target date has passed.',
      onTargetDate: 'Right on your target date.',
      aheadOfTarget: (gap) => `≈ ${gap} ahead of your target date`,
      behindTarget: (gap) => `≈ ${gap} behind your target date`,
      consistency: (done, total) => `Consistency (${done}/${total} last weeks)`,
      wonDaysToast: (delta) => `You just gained ${delta} day${delta > 1 ? 's' : ''}!`,
      addAmountAriaLabel: (name) => `Add an amount to ${name}`,
      addAmountPlaceholder: 'Amount to add',
      addAmountConfirm: 'Add',
      addAmountEmptyError: 'Enter an amount.',
      addAmountInvalidError: 'The amount must be greater than $0.',
    },
    addGoalCard: {
      newGoalButton: '+ New goal',
      heading: 'New goal',
      hint: 'A name, an amount to reach, and a due date if you have one.',
      namePlaceholder: 'Name (e.g. Trip)',
      targetPlaceholder: 'Target amount',
      dueDateOptionalLabel: 'Due date (optional)',
      photoOptionalLabel: 'Photo (optional)',
      creating: 'Creating...',
      photoUploadFailedToast: "Goal created, but the photo couldn't be uploaded — try again from “Edit”.",
      requiredPace: (perWeek, perMonth) => `To reach it in time, save around ${perWeek} a week (or ${perMonth} a month).`,
      pastDeadline: 'The date you picked has already passed.',
    },
    contributeForm: {
      title: 'Add to your savings',
      hint: 'Every time you set money aside, log it here.',
      amountPlaceholder: 'Amount',
      submitting: 'Saving...',
      submitButton: 'Save it',
      overBudget: (amount) =>
        `You only have ${amount} of available budget left this month — this contribution would go over that.`,
      budgetExhausted: "This month's available budget is already used up by your savings.",
      canContinueAnyway: 'You can still go ahead if you want.',
    },
    contributionHistory: {
      title: 'Contribution history',
      hint: 'Your latest additions, most recent first.',
      empty: 'No contribution logged yet.',
      deletedGoal: 'Deleted goal',
      collapse: 'Collapse',
      viewAll: (n) => `See full history (${n})`,
    },
    paceComparisonChart: {
      empty: "Add a due date to a goal to see its current pace compared to what's needed.",
      ahead: '↑ Ahead',
      behind: '↓ Behind',
      actualLabel: 'Current',
      requiredLabel: 'Needed',
      perMonth: (amount) => `${amount}/mo`,
    },
    investissementTab: {
      currentAmountLabel: 'Amount currently invested',
      currentAmountHint: 'Your real invested amount as of today.',
      settingsTitle: 'Settings',
      settingsHint: "A hypothetical scenario — doesn't affect your actual invested amount above.",
      initialAmountLabel: 'Initial amount',
      annualRateLabel: 'Estimated annual rate of return (%)',
      monthlyContributionLabel: 'Monthly contribution',
      projectionTitle: 'Projection',
      projectionHint: 'What your investment could be worth, depending on the horizon chosen.',
      years: (n) => `${n} year${n > 1 ? 's' : ''}`,
      estimatedValueIn: (n) => `Estimated value in ${n} year${n > 1 ? 's' : ''}.`,
      monthlyImpactTitle: 'Impact of your monthly contribution',
      monthlyImpactHint: (amount, years) => `What ${amount}/mo changes over ${years} year${years > 1 ? 's' : ''}.`,
      finalValueLabel: 'Final value',
      whereMoneyTitle: 'Where the money comes from',
      whereMoneyHint: (years) =>
        `Split between your contributions and interest earned, over ${years} year${years > 1 ? 's' : ''}.`,
      ruleOf72: (rate, years) =>
        `The rule of 72: at ${rate}% per year, an invested amount doubles roughly every ${years} years, thanks to compound interest.`,
      ruleOf72Fallback:
        'The rule of 72 estimates the time to double an investment (72 ÷ rate). Pick a positive rate of return above to see the estimate.',
      goalsTitle: 'Your savings goals',
      goalsHint: 'How long it would take to reach them with these settings.',
      noGoalsHint: 'Set a goal in the Goals tab to see how long it would take to reach it with these settings.',
      setGoalButton: 'Set a goal',
      alreadyReached: '🎉 Already reached.',
      wouldReachWithParams: (duration) => `With these settings, you'd reach it in about ${duration}.`,
      wouldNotReach:
        "With these settings, you wouldn't reach it within a reasonable horizon — increase the initial amount, the contribution, or the rate.",
      disclaimer:
        'This is an educational tool based on a theoretical compound-interest calculation and is not financial advice. Real returns vary and can be negative.',
    },
    growthChart: {
      start: 'Start',
      monthsLabel: (n) => `${n} mo`,
      yearsLabel: (n) => `${n} year${n > 1 ? 's' : ''}`,
      yearsMonthsLabel: (years, months) => `${years} year${years > 1 ? 's' : ''} ${months} mo`,
    },
    contributionsVsInterestChart: {
      empty: 'Add an initial amount or a monthly contribution to see this breakdown.',
      ariaLabel: (contribPct, interestPct) => `${contribPct}% contributions, ${interestPct}% interest`,
      contributionsLabel: 'Contributions',
      interestLabel: 'Interest earned',
    },
    goalPhotoPicker: {
      premiumBadge: '🔒 Goal photo — Premium',
      formatError: 'Accepted formats: JPG, PNG, or WebP.',
      tooLargeError: (mb) => `Image too large (max ${mb} MB).`,
      uploading: 'Uploading...',
      replacePhoto: 'Replace photo',
      addPhoto: 'Add a photo',
      removePhoto: 'Remove photo',
    },
  },
}
