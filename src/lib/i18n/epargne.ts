import type { Lang } from './language'

// Covers the Épargne page (Objectifs / Simulateur / Duels / Investissement
// tabs) and every child component that lives under it. One big dictionary
// rather than one-per-component, since most of these components are small
// and only ever rendered from this page's tree.
export interface EpargneContent {
  tabs: {
    objectifs: string
    simulateur: string
    duels: string
    investissement: string
  }
  pageHeader: {
    title: string
    subtitle: string
  }
  help: {
    objectifs: { title: string; purpose: string; actions: string[] }
    simulateur: { title: string; purpose: string; actions: string[] }
    duels: { title: string; purpose: string; actions: string[] }
    investissement: { title: string; purpose: string; actions: string[] }
  }
  objectifsTab: {
    emptyTitle: string
    emptyDescription: string
    emptyAction: string
    savedLabel: string
    totalTargetLabel: string
    goalsCount: (n: number) => string
    limitReachedTitle: (max: number) => string
    limitReachedDescription: string
    paceCardTitle: string
    paceCardHint: string
  }
  simulatorGate: {
    title: string
    description: string
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
    duelActiveLink: string
    startDuelButton: string
    wonDaysToast: (delta: number) => string
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
  simulateurTab: {
    notModifiedYet: string
    adjustmentsCount: (n: number) => string
    reset: string
    appliedSuccess: string
    adjustScenario: string
    fixedExpensesTitle: string
    fixedExpensesHint: string
    noFixedExpenses: { before: string; linkText: string; after: string }
    monthlySpendingTitle: string
    monthlySpendingHint: string
    noCategorySpending: string
    savingsRowLabel: string
    resultsTitle: string
    beforeAfterTitle: string
    beforeAfterHint: string
    availableBudgetLabel: string
    remainingToSpendLabel: string
    healthScoreLabel: string
    savingsImpactTitle: string
    savingsImpactHint: string
    noGoalsForImpact: string
    setGoalButton: string
    alreadyReached: (goalName: string) => string
    notEnoughHistoryForGoal: (goalName: string) => string
    noProgressScenario: (goalName: string) => string
    wouldReachIn: (goalName: string, duration: string) => string
    totalSavingsHeader: (months: number) => string
    readyToApplyTitle: string
    willModify: string
    modifiedClause: (n: number) => string
    addedClause: (n: number) => string
    applyJoin: string
    willApply: (clauses: string) => string
    applying: string
    applyForReal: string
  }
  hypotheticalExpenses: {
    namePlaceholder: string
    newBadge: string
    removeButton: string
    removeAria: (name: string) => string
    fallbackName: string
    perMonthDelta: (amount: string) => string
    amountAria: (name: string) => string
    addButton: string
  }
  simRow: {
    actual: (amount: string) => string
    simulatedAmountAria: (label: string) => string
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
  duelsTab: {
    linkCopied: string
    emptyTitle: string
    emptyDescription: string
    emptyAction: string
    activeSection: string
    pastSection: string
  }
  duelCard: {
    statusLabel: Record<'pending' | 'active' | 'completed' | 'abandoned', string>
    inviteSent: (days: number) => string
    copyInviteLink: string
    you: string
    leadingSuffix: string
    opponentFallback: string
    abandonedMessage: string
    tie: string
    youWon: string
    theyWon: (opponentName: string) => string
    confirmAbandonPrompt: string
    abandoning: string
    abandonDuelButton: string
    timeRemaining: (label: string) => string
    duelOver: string
  }
  createDuelModal: {
    modalTitle: string
    nameRequired: string
    createFailedFallback: string
    sendLinkHint: (days: number) => string
    copied: string
    copy: string
    goalLabelPrefix: string
    durationLabel: string
    daysOption: (d: number) => string
    displayNameLabel: string
    namePlaceholder: string
    whatOpponentSeesTitle: string
    whatOpponentSeesBody: string
    creating: string
    generateLink: string
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
  savingsComparisonChart: {
    today: string
    monthsLabel: (n: number) => string
    tooltip: (monthLabel: string, currentAmount: string, simulatedAmount: string) => string
    currentLabel: string
    simulatedLabel: string
  }
}

export const EPARGNE: Record<Lang, EpargneContent> = {
  fr: {
    tabs: {
      objectifs: 'Objectifs',
      simulateur: 'Simulateur « et si »',
      duels: 'Duels',
      investissement: 'Investissement',
    },
    pageHeader: {
      title: 'Vers quoi tu épargnes',
      subtitle: "Tes objectifs d'épargne, un simulateur, tes duels et tes placements.",
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
      simulateur: {
        title: 'Simulateur « et si »',
        purpose:
          "Teste l'effet d'un changement (revenu, dépenses, rythme d'épargne) avant de l'appliquer pour de vrai.",
        actions: [
          'Ajuste les curseurs pour simuler un changement de revenu ou de dépenses par catégorie.',
          "Regarde l'impact estimé sur ta capacité d'épargne mensuelle.",
          "Rien n'est enregistré ici : c'est un essai, pas une vraie modification de ton budget.",
        ],
      },
      duels: {
        title: 'Duels',
        purpose: "Affronte un ami sur vos objectifs d'épargne respectifs, chacun sur son propre argent.",
        actions: [
          'Lance un duel depuis un de tes objectifs (onglet Objectifs), et envoie le lien à un ami.',
          "Vous voyez chacun le % de progression de l'autre — jamais les montants en dollars.",
          'Le duel dure 30, 60 ou 90 jours ; à la fin, celui qui a le plus progressé gagne.',
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
      emptyAction: 'Fixer mon premier objectif',
      savedLabel: 'Épargné',
      totalTargetLabel: 'Objectif total',
      goalsCount: (n) => `${n} objectif${n > 1 ? 's' : ''}`,
      limitReachedTitle: (max) => `Limite de ${max} objectif${max > 1 ? 's' : ''} atteinte`,
      limitReachedDescription:
        "Le plan Gratuit est limité à un objectif d'épargne actif. Passe à Standard pour en suivre autant que tu veux.",
      paceCardTitle: 'Rythme actuel vs nécessaire',
      paceCardHint:
        "Ce que tu mets de côté par mois, comparé à ce qu'il faudrait pour respecter l'échéance de chaque objectif.",
    },
    simulatorGate: {
      title: 'Simulateur « et si » — fonctionnalité Premium',
      description:
        'Teste des scénarios de dépenses/épargne et vois leur impact sur ton budget et ton score avant de les appliquer pour de vrai.',
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
      duelActiveLink: '⚔ En duel — voir le résultat',
      startDuelButton: '⚔ Lancer un duel',
      wonDaysToast: (delta) => `Tu viens de gagner ${delta} jour${delta > 1 ? 's' : ''} !`,
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
    simulateurTab: {
      notModifiedYet: "Rien n'est modifié tant que tu n'as pas cliqué sur « Appliquer pour de vrai ».",
      adjustmentsCount: (n) => `${n} ajustement${n > 1 ? 's' : ''}`,
      reset: '↺ Réinitialiser',
      appliedSuccess: 'Modifications appliquées à tes vraies dépenses fixes ✓',
      adjustScenario: 'Ajuste ton scénario',
      fixedExpensesTitle: 'Dépenses fixes',
      fixedExpensesHint: 'Ajuste chaque dépense, ou ajoute-en une nouvelle à tester.',
      noFixedExpenses: {
        before: "Aucune dépense fixe pour l'instant — ",
        linkText: 'ajoutes-en dans Budget',
        after: ' ou teste-en une hypothétique ci-dessous.',
      },
      monthlySpendingTitle: 'Dépenses du mois',
      monthlySpendingHint: 'Tes dépenses ponctuelles par catégorie, et ton épargne.',
      noCategorySpending: 'Aucune dépense ponctuelle enregistrée ce mois-ci pour l’instant.',
      savingsRowLabel: 'Épargne',
      resultsTitle: 'Résultats',
      beforeAfterTitle: 'Avant → après',
      beforeAfterHint: "L'impact de ce scénario sur ton budget et ton score.",
      availableBudgetLabel: 'Budget disponible ce mois-ci',
      remainingToSpendLabel: 'Reste à dépenser ce mois-ci',
      healthScoreLabel: 'Score de santé financière',
      savingsImpactTitle: 'Impact sur ton épargne',
      savingsImpactHint: 'Basé sur le rythme de tes contributions récentes, par objectif.',
      noGoalsForImpact: "Fixe un objectif pour voir l'impact de ce scénario sur ton épargne.",
      setGoalButton: 'Fixer un objectif',
      alreadyReached: (goalName) => `🎉 ${goalName} — déjà atteint.`,
      notEnoughHistoryForGoal: (goalName) =>
        `${goalName} : pas assez d'historique de contributions pour estimer un rythme.`,
      noProgressScenario: (goalName) =>
        `${goalName} : avec ce scénario, tu ne progresserais plus vers cet objectif.`,
      wouldReachIn: (goalName, duration) =>
        `${goalName} : avec ce scénario, tu l'atteindrais en environ ${duration}.`,
      totalSavingsHeader: (months) => `Épargne totale — ${months} prochains mois`,
      readyToApplyTitle: "Prêt à l'appliquer ?",
      willModify: 'Ceci modifiera tes vraies dépenses fixes.',
      modifiedClause: (n) => `${n} dépense(s) modifiée(s)`,
      addedClause: (n) => `${n} nouvelle(s) dépense(s) ajoutée(s)`,
      applyJoin: ' et ',
      willApply: (clauses) => `Ceci va appliquer ${clauses} à tes vraies dépenses fixes.`,
      applying: 'Application...',
      applyForReal: 'Appliquer pour de vrai',
    },
    hypotheticalExpenses: {
      namePlaceholder: 'Nom (ex: Nouvel abonnement)',
      newBadge: 'nouvelle',
      removeButton: 'Retirer',
      removeAria: (name) => `Retirer ${name}`,
      fallbackName: 'cette dépense hypothétique',
      perMonthDelta: (amount) => `+${amount}/mois`,
      amountAria: (name) => `Montant hypothétique pour ${name}`,
      addButton: '+ Ajouter une dépense hypothétique',
    },
    simRow: {
      actual: (amount) => `Actuel : ${amount}`,
      simulatedAmountAria: (label) => `Montant simulé pour ${label}`,
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
    duelsTab: {
      linkCopied: 'Lien copié.',
      emptyTitle: 'Aucun duel pour l’instant',
      emptyDescription:
        "Lance un duel depuis un de tes objectifs d'épargne, dans l'onglet Objectifs, pour affronter un ami.",
      emptyAction: 'Voir mes objectifs',
      activeSection: 'En cours',
      pastSection: 'Terminés',
    },
    duelCard: {
      statusLabel: {
        pending: "En attente d'un adversaire",
        active: 'En cours',
        completed: 'Terminé',
        abandoned: 'Abandonné',
      },
      inviteSent: (days) => `Invitation envoyée — dès que ton adversaire l'accepte, le duel de ${days} jours commence.`,
      copyInviteLink: "Copier le lien d'invitation",
      you: 'Toi',
      leadingSuffix: '— en tête',
      opponentFallback: 'Adversaire',
      abandonedMessage: 'Ce duel a été abandonné.',
      tie: 'Égalité !',
      youWon: '🏆 Tu as gagné ce duel.',
      theyWon: (opponentName) => `🏆 ${opponentName} a gagné ce duel.`,
      confirmAbandonPrompt: 'Abandonner ce duel ?',
      abandoning: 'Abandon...',
      abandonDuelButton: 'Abandonner le duel',
      timeRemaining: (label) => `${label} restant`,
      duelOver: 'Terminé',
    },
    createDuelModal: {
      modalTitle: "Lancer un duel d'épargne",
      nameRequired: 'Un prénom est requis.',
      createFailedFallback: 'Impossible de créer le duel.',
      sendLinkHint: (days) =>
        `Envoie ce lien à ton adversaire — dès qu'il l'ouvre et choisit un de ses objectifs, le duel commence pour ${days} jours.`,
      copied: 'Copié !',
      copy: 'Copier',
      goalLabelPrefix: 'Objectif :',
      durationLabel: 'Durée du duel',
      daysOption: (d) => `${d} jours`,
      displayNameLabel: 'Ton prénom (affiché à ton adversaire)',
      namePlaceholder: 'Ex : Alex',
      whatOpponentSeesTitle: 'Ce que voit ton adversaire',
      whatOpponentSeesBody:
        'Seulement ton prénom et ton % de progression. Jamais tes montants en dollars, ni le nom de ton objectif.',
      creating: 'Création...',
      generateLink: 'Générer le lien',
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
    savingsComparisonChart: {
      today: "Aujourd'hui",
      monthsLabel: (n) => `${n} mois`,
      tooltip: (monthLabel, currentAmount, simulatedAmount) => `${monthLabel} · ${currentAmount} vs ${simulatedAmount}`,
      currentLabel: 'Actuel',
      simulatedLabel: 'Simulé',
    },
  },
  en: {
    tabs: {
      objectifs: 'Goals',
      simulateur: '"What if" simulator',
      duels: 'Duels',
      investissement: 'Investing',
    },
    pageHeader: {
      title: "What you're saving for",
      subtitle: 'Your savings goals, a simulator, your duels, and your investments.',
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
      simulateur: {
        title: '"What if" simulator',
        purpose: 'Test the effect of a change (income, expenses, savings pace) before actually applying it.',
        actions: [
          'Drag the sliders to simulate a change in income or spending by category.',
          'See the estimated impact on your monthly savings capacity.',
          "Nothing is saved here — it's a trial run, not a real change to your budget.",
        ],
      },
      duels: {
        title: 'Duels',
        purpose: 'Face off against a friend on your own savings goals, each with your own money.',
        actions: [
          'Start a duel from one of your goals (Goals tab), and send the link to a friend.',
          "You each see the other's % progress — never dollar amounts.",
          'The duel lasts 30, 60, or 90 days; at the end, whoever made the most progress wins.',
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
      emptyAction: 'Set my first goal',
      savedLabel: 'Saved',
      totalTargetLabel: 'Total target',
      goalsCount: (n) => `${n} goal${n > 1 ? 's' : ''}`,
      limitReachedTitle: (max) => `${max} goal${max > 1 ? 's' : ''} limit reached`,
      limitReachedDescription:
        'The Free plan is limited to one active savings goal. Upgrade to Standard to track as many as you want.',
      paceCardTitle: 'Current pace vs. needed',
      paceCardHint: "What you're putting aside per month, compared to what's needed to hit each goal's deadline.",
    },
    simulatorGate: {
      title: '"What if" simulator — Premium feature',
      description:
        'Test spending/savings scenarios and see their impact on your budget and score before actually applying them.',
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
      duelActiveLink: '⚔ In a duel — see the result',
      startDuelButton: '⚔ Start a duel',
      wonDaysToast: (delta) => `You just gained ${delta} day${delta > 1 ? 's' : ''}!`,
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
    simulateurTab: {
      notModifiedYet: 'Nothing is changed until you click “Apply for real”.',
      adjustmentsCount: (n) => `${n} adjustment${n > 1 ? 's' : ''}`,
      reset: '↺ Reset',
      appliedSuccess: 'Changes applied to your real fixed expenses ✓',
      adjustScenario: 'Adjust your scenario',
      fixedExpensesTitle: 'Fixed expenses',
      fixedExpensesHint: 'Adjust each expense, or add a new one to test.',
      noFixedExpenses: {
        before: 'No fixed expenses yet — ',
        linkText: 'add some in Budget',
        after: ' or test a hypothetical one below.',
      },
      monthlySpendingTitle: "This month's spending",
      monthlySpendingHint: 'Your one-off spending by category, and your savings.',
      noCategorySpending: 'No one-off spending logged this month yet.',
      savingsRowLabel: 'Savings',
      resultsTitle: 'Results',
      beforeAfterTitle: 'Before → after',
      beforeAfterHint: "This scenario's impact on your budget and score.",
      availableBudgetLabel: 'Available budget this month',
      remainingToSpendLabel: 'Left to spend this month',
      healthScoreLabel: 'Financial health score',
      savingsImpactTitle: 'Impact on your savings',
      savingsImpactHint: 'Based on the pace of your recent contributions, per goal.',
      noGoalsForImpact: 'Set a goal to see this scenario’s impact on your savings.',
      setGoalButton: 'Set a goal',
      alreadyReached: (goalName) => `🎉 ${goalName} — already reached.`,
      notEnoughHistoryForGoal: (goalName) => `${goalName}: not enough contribution history to estimate a pace.`,
      noProgressScenario: (goalName) => `${goalName}: with this scenario, you'd stop progressing toward this goal.`,
      wouldReachIn: (goalName, duration) => `${goalName}: with this scenario, you'd reach it in about ${duration}.`,
      totalSavingsHeader: (months) => `Total savings — next ${months} months`,
      readyToApplyTitle: 'Ready to apply it?',
      willModify: 'This will change your real fixed expenses.',
      modifiedClause: (n) => `${n} expense(s) modified`,
      addedClause: (n) => `${n} new expense(s) added`,
      applyJoin: ' and ',
      willApply: (clauses) => `This will apply ${clauses} to your real fixed expenses.`,
      applying: 'Applying...',
      applyForReal: 'Apply for real',
    },
    hypotheticalExpenses: {
      namePlaceholder: 'Name (e.g. New subscription)',
      newBadge: 'new',
      removeButton: 'Remove',
      removeAria: (name) => `Remove ${name}`,
      fallbackName: 'this hypothetical expense',
      perMonthDelta: (amount) => `+${amount}/mo`,
      amountAria: (name) => `Hypothetical amount for ${name}`,
      addButton: '+ Add a hypothetical expense',
    },
    simRow: {
      actual: (amount) => `Current: ${amount}`,
      simulatedAmountAria: (label) => `Simulated amount for ${label}`,
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
    duelsTab: {
      linkCopied: 'Link copied.',
      emptyTitle: 'No duels yet',
      emptyDescription: 'Start a duel from one of your savings goals, in the Goals tab, to face off against a friend.',
      emptyAction: 'See my goals',
      activeSection: 'Ongoing',
      pastSection: 'Finished',
    },
    duelCard: {
      statusLabel: {
        pending: 'Waiting for an opponent',
        active: 'Ongoing',
        completed: 'Finished',
        abandoned: 'Abandoned',
      },
      inviteSent: (days) => `Invite sent — as soon as your opponent accepts, the ${days}-day duel starts.`,
      copyInviteLink: 'Copy invite link',
      you: 'You',
      leadingSuffix: '— leading',
      opponentFallback: 'Opponent',
      abandonedMessage: 'This duel was abandoned.',
      tie: 'Tie!',
      youWon: '🏆 You won this duel.',
      theyWon: (opponentName) => `🏆 ${opponentName} won this duel.`,
      confirmAbandonPrompt: 'Abandon this duel?',
      abandoning: 'Abandoning...',
      abandonDuelButton: 'Abandon the duel',
      timeRemaining: (label) => `${label} left`,
      duelOver: 'Over',
    },
    createDuelModal: {
      modalTitle: 'Start a savings duel',
      nameRequired: 'A first name is required.',
      createFailedFallback: 'Could not create the duel.',
      sendLinkHint: (days) =>
        `Send this link to your opponent — as soon as they open it and pick one of their goals, the duel starts for ${days} days.`,
      copied: 'Copied!',
      copy: 'Copy',
      goalLabelPrefix: 'Goal:',
      durationLabel: 'Duel length',
      daysOption: (d) => `${d} days`,
      displayNameLabel: 'Your first name (shown to your opponent)',
      namePlaceholder: 'E.g. Alex',
      whatOpponentSeesTitle: 'What your opponent sees',
      whatOpponentSeesBody: 'Only your first name and your % progress. Never your dollar amounts, nor your goal name.',
      creating: 'Creating...',
      generateLink: 'Generate link',
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
    savingsComparisonChart: {
      today: 'Today',
      monthsLabel: (n) => `${n} months`,
      tooltip: (monthLabel, currentAmount, simulatedAmount) => `${monthLabel} · ${currentAmount} vs ${simulatedAmount}`,
      currentLabel: 'Current',
      simulatedLabel: 'Simulated',
    },
  },
}
