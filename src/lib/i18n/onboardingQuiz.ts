import type { Lang } from './language'
import type {
  FinancialMood,
  FixedExpensesRange,
  IncomeRange,
  MoneyLeak,
  PayFrequency,
  SavingsGoalType,
  WorkStatus,
} from '../onboardingQuiz'

// Content for Onboarding.tsx's 10-question flow (Q1-10) plus the kept
// plan-selection step after it. File/export names kept as "onboardingQuiz"
// for low churn — see lib/onboardingQuiz.ts's header comment. payFrequencies
// is shared with Paramètres' PayScheduleSettings.tsx (pill button labels
// there) — relabeling it here changes both screens at once, which is the
// point: one source of truth for those 4 labels.
export interface SingleChoiceOption<T extends string> {
  id: T
  label: string
}

export interface OnboardingQuizContent {
  progressLabel: (current: number, total: number) => string
  back: string
  q1: { title: string; placeholder: string; continueButton: string; emptyError: string }
  q2: { title: string; options: SingleChoiceOption<WorkStatus>[] }
  q3: { title: string; options: SingleChoiceOption<IncomeRange>[] }
  q4: { title: string; options: SingleChoiceOption<PayFrequency>[] }
  payFrequencies: Record<PayFrequency, string>
  q5: { title: string; options: SingleChoiceOption<FixedExpensesRange>[] }
  q6: { title: string; options: SingleChoiceOption<MoneyLeak>[]; continueButton: string }
  q7: {
    title: string
    // `name` is the clean (no-emoji) goal name saved to savings_goals when
    // this option is picked — `label` (with emoji) is only ever shown on
    // the button itself. Empty for 'autre', which uses the typed custom
    // name instead.
    options: (SingleChoiceOption<SavingsGoalType> & { name: string })[]
    customNamePlaceholder: string
    customNameEmptyError: string
    continueButton: string
  }
  q8: {
    title: string
    amountPlaceholder: string
    dateLabel: string
    perPayLine: (amount: string) => string
    continueButton: string
    amountEmptyError: string
  }
  q9: { title: string; options: SingleChoiceOption<FinancialMood>[] }
  q10: {
    title: string
    phonePlaceholder: string
    continueButton: string
    declineButton: string
    privacyNote: string
    countryLabel: string
    countrySearchPlaceholder: string
    consentLabel: string
    invalidNumberError: string
    saveFailedError: string
  }
  // Score screen — shown once, right after Q10, before the kept
  // plan-selection step. scoreHeading takes the first name typed in Q1.
  result: {
    scoreHeading: (firstName: string) => string
    scoreSuffix: string
    scoreCaption: string
    goalSummary: (goalName: string, amount: string, date: string, perPay: string) => string
    goalSummaryNoDate: (goalName: string, amount: string) => string
    goodHeading: string
    watchHeading: string
    helpHeading: string
    good: {
      fixedExpenses: string
      goalPace: string
      leaksAware: string
      moodGood: string
      fallback: string
    }
    watch: {
      fixedExpenses: string
      goalPace: string
      leaksUnknown: string
      leaksTop: (leakLabel: string) => string
      moodStressed: string
    }
    help: {
      goalCreated: (goalName: string) => string
      budgetCategories: string
      statsAndRewards: string
      importStatement: string
    }
    leakLabels: Record<MoneyLeak, string>
    continueButton: string
  }
  plans: {
    heading: string
    subtitle: string
    popular: string
    promoBadge: string
    promoWasPrice: string
    promoPerMonth: string
    promoDisclaimer: string
    premiumCta: string
    standardCta: string
    redirecting: string
    freeLink: string
    checkoutFailed: string
  }
}

export const ONBOARDING_QUIZ: Record<Lang, OnboardingQuizContent> = {
  fr: {
    progressLabel: (current, total) => `${current}/${total}`,
    back: 'Retour',
    q1: {
      title: 'Comment on t’appelle ? 👋',
      placeholder: 'Ton prénom',
      continueButton: 'Continuer',
      emptyError: 'Dis-nous comment t’appeler.',
    },
    q2: {
      title: 'T’es plus…',
      options: [
        { id: 'etudiant', label: '🎓 Étudiant' },
        { id: 'travail', label: '💼 Je travaille' },
        { id: 'les_deux', label: '⚡ Les deux' },
      ],
    },
    q3: {
      title: 'Il rentre combien d’argent par mois, à peu près ?',
      options: [
        { id: 'moins_500', label: 'Moins de 500 $' },
        { id: '500_1500', label: '500 $ - 1 500 $' },
        { id: '1500_3000', label: '1 500 $ - 3 000 $' },
        { id: '3000_plus', label: '3 000 $ et plus' },
      ],
    },
    q4: {
      title: 'Ta paye rentre…',
      options: [
        { id: 'hebdomadaire', label: 'Chaque semaine' },
        { id: 'aux_deux_semaines', label: 'Aux 2 semaines' },
        { id: 'mensuelle', label: 'Une fois par mois' },
        { id: 'ca_change', label: 'Ça change' },
      ],
    },
    payFrequencies: {
      hebdomadaire: 'Chaque semaine',
      aux_deux_semaines: 'Aux 2 semaines',
      mensuelle: 'Une fois par mois',
      ca_change: 'Ça change',
    },
    q5: {
      title: 'Tes dépenses fixes par mois (loyer, cell, char…) ?',
      options: [
        { id: 'chez_parents', label: 'Je vis chez mes parents' },
        { id: 'moins_500', label: 'Moins de 500 $' },
        { id: '500_1500', label: '500 $ - 1 500 $' },
        { id: 'plus_1500', label: 'Plus de 1 500 $' },
      ],
    },
    q6: {
      title: 'Où ton argent disparaît sans que tu le remarques ? 👀',
      options: [
        { id: 'restos', label: '🍔 Restos/livraison' },
        { id: 'shopping', label: '🛍️ Shopping' },
        { id: 'abonnements', label: '📺 Abonnements' },
        { id: 'sorties', label: '🎉 Sorties' },
        { id: 'jeux', label: '🎮 Jeux' },
        { id: 'sais_pas', label: '🤷 Je sais pas' },
      ],
      continueButton: 'Continuer',
    },
    q7: {
      title: 'T’épargnes pour quoi en premier ? 🎯',
      options: [
        { id: 'voyage', label: '✈️ Voyage', name: 'Voyage' },
        { id: 'auto', label: '🚗 Char', name: 'Char' },
        { id: 'appart', label: '🏠 Appart', name: 'Appart' },
        { id: 'urgence', label: '🛟 Fonds d’urgence', name: 'Fonds d’urgence' },
        { id: 'autre', label: '✏️ Autre', name: '' },
      ],
      customNamePlaceholder: 'Nom de ton objectif',
      customNameEmptyError: 'Donne un nom à ton objectif.',
      continueButton: 'Continuer',
    },
    q8: {
      title: 'Combien, et pour quand ?',
      amountPlaceholder: 'Montant total',
      dateLabel: 'Pour quand ?',
      perPayLine: (amount) => `Ça fait ${amount} par paye 💥`,
      continueButton: 'Continuer',
      amountEmptyError: 'Entre un montant plus grand que 0 $.',
    },
    q9: {
      title: 'Tu te sens comment avec ton argent en ce moment ?',
      options: [
        { id: 'en_controle', label: '😌 En contrôle' },
        { id: 'correct', label: '😐 Correct' },
        { id: 'stresse', label: '😰 Stressé' },
      ],
    },
    q10: {
      title: 'Veux-tu des rappels sur WhatsApp ? 📲',
      phonePlaceholder: '514 555 0199',
      continueButton: 'Continuer',
      declineButton: 'Non merci',
      privacyNote:
        'On ne s’en sert que pour t’écrire sur WhatsApp, jamais pour autre chose, et jamais revendu. Laisse ce champ vide si tu préfères ne pas le donner.',
      countryLabel: 'Indicatif',
      countrySearchPlaceholder: 'Rechercher un pays...',
      consentLabel: 'J’accepte d’être contacté par WhatsApp par l’équipe SaveUp.',
      invalidNumberError: 'Ce numéro ne semble pas valide — vérifie l’indicatif et le numéro.',
      saveFailedError: 'Impossible d’enregistrer ton numéro — réessaie.',
    },
    result: {
      scoreHeading: (firstName) => `${firstName}, voici ton score`,
      scoreSuffix: '/100',
      scoreCaption: 'Score SaveUp',
      goalSummary: (goalName, amount, date, perPay) =>
        `${goalName} : ${amount} d’ici ${date} = ${perPay} par paye`,
      goalSummaryNoDate: (goalName, amount) => `${goalName} : ${amount}`,
      goodHeading: '✅ Ce qui va bien',
      watchHeading: '⚠️ À surveiller',
      helpHeading: '🚀 Comment SaveUp t’aide',
      good: {
        fixedExpenses: 'Tes dépenses fixes laissent une bonne marge de manœuvre.',
        goalPace: 'Ton objectif est réaliste par rapport à ton revenu.',
        leaksAware: 'Tu as une bonne idée de où part ton argent.',
        moodGood: 'Tu te sens en contrôle de tes finances — un bel atout.',
        fallback: 'Tu as pris le temps de faire le point sur tes finances — c’est déjà un pas important.',
      },
      watch: {
        fixedExpenses: 'Tes dépenses fixes prennent une grosse partie de ton revenu.',
        goalPace: 'Ton objectif demande un effort important par paye — rien d’obligatoire, tu pourras l’ajuster.',
        leaksUnknown: 'Tu ne sais pas trop où ton argent part en ce moment — on va éclaircir ça ensemble.',
        leaksTop: (leakLabel) => `Les ${leakLabel} sont ton piège principal.`,
        moodStressed: 'Tu te sens stressé·e par l’argent en ce moment — c’est fréquent, et ça s’allège avec un portrait clair.',
      },
      help: {
        goalCreated: (goalName) => `On vient de créer ton objectif « ${goalName} » — tu verras sa progression en temps réel.`,
        budgetCategories: 'Le budget par catégories te montre exactement où va chaque dollar, mois après mois.',
        statsAndRewards: 'Les Statistiques et les Récompenses suivent ta progression au fil du temps.',
        importStatement: 'Importe ton relevé bancaire et SaveUp repère tes dépenses récurrentes automatiquement.',
      },
      leakLabels: {
        restos: 'restos/livraison',
        shopping: 'achats impulsifs',
        abonnements: 'abonnements oubliés',
        sorties: 'sorties',
        jeux: 'jeux et achats in-app',
        sais_pas: 'dépenses non identifiées',
      },
      continueButton: 'Voir mon tableau de bord',
    },
    plans: {
      heading: 'Choisis ton plan',
      subtitle: 'Commence gratuitement, ou débloque tout dès maintenant.',
      popular: 'Populaire',
      promoBadge: 'Offre de lancement',
      promoWasPrice: '14,99 $',
      promoPerMonth: '/mois',
      promoDisclaimer:
        'Premier mois à 7,99 $, puis 14,99 $/mois dès le 2e mois. Sans engagement — annulable en tout temps.',
      premiumCta: 'Choisir Premium à 7,99 $',
      standardCta: 'Choisir Standard — 7,99 $/mois',
      redirecting: 'Redirection...',
      freeLink: 'Continuer avec le plan gratuit',
      checkoutFailed: "Impossible de démarrer le paiement — réessaie dans un instant.",
    },
  },
  en: {
    progressLabel: (current, total) => `${current}/${total}`,
    back: 'Back',
    q1: {
      title: 'What should we call you? 👋',
      placeholder: 'Your first name',
      continueButton: 'Continue',
      emptyError: 'Tell us what to call you.',
    },
    q2: {
      title: 'You’re more…',
      options: [
        { id: 'etudiant', label: '🎓 A student' },
        { id: 'travail', label: '💼 Working' },
        { id: 'les_deux', label: '⚡ Both' },
      ],
    },
    q3: {
      title: 'Roughly how much comes in per month?',
      options: [
        { id: 'moins_500', label: 'Less than $500' },
        { id: '500_1500', label: '$500 - $1,500' },
        { id: '1500_3000', label: '$1,500 - $3,000' },
        { id: '3000_plus', label: '$3,000 and up' },
      ],
    },
    q4: {
      title: 'Your pay comes in…',
      options: [
        { id: 'hebdomadaire', label: 'Every week' },
        { id: 'aux_deux_semaines', label: 'Every 2 weeks' },
        { id: 'mensuelle', label: 'Once a month' },
        { id: 'ca_change', label: 'It varies' },
      ],
    },
    payFrequencies: {
      hebdomadaire: 'Every week',
      aux_deux_semaines: 'Every 2 weeks',
      mensuelle: 'Once a month',
      ca_change: 'It varies',
    },
    q5: {
      title: 'Your fixed monthly costs (rent, phone, car…)?',
      options: [
        { id: 'chez_parents', label: 'I live with my parents' },
        { id: 'moins_500', label: 'Less than $500' },
        { id: '500_1500', label: '$500 - $1,500' },
        { id: 'plus_1500', label: 'More than $1,500' },
      ],
    },
    q6: {
      title: 'Where does your money disappear without you noticing? 👀',
      options: [
        { id: 'restos', label: '🍔 Takeout/delivery' },
        { id: 'shopping', label: '🛍️ Shopping' },
        { id: 'abonnements', label: '📺 Subscriptions' },
        { id: 'sorties', label: '🎉 Going out' },
        { id: 'jeux', label: '🎮 Gaming' },
        { id: 'sais_pas', label: '🤷 Not sure' },
      ],
      continueButton: 'Continue',
    },
    q7: {
      title: 'What are you saving for first? 🎯',
      options: [
        { id: 'voyage', label: '✈️ A trip', name: 'Trip' },
        { id: 'auto', label: '🚗 A car', name: 'Car' },
        { id: 'appart', label: '🏠 An apartment', name: 'Apartment' },
        { id: 'urgence', label: '🛟 Emergency fund', name: 'Emergency fund' },
        { id: 'autre', label: '✏️ Something else', name: '' },
      ],
      customNamePlaceholder: 'Name your goal',
      customNameEmptyError: 'Give your goal a name.',
      continueButton: 'Continue',
    },
    q8: {
      title: 'How much, and by when?',
      amountPlaceholder: 'Total amount',
      dateLabel: 'By when?',
      perPayLine: (amount) => `That's ${amount} per paycheck 💥`,
      continueButton: 'Continue',
      amountEmptyError: 'Enter an amount greater than $0.',
    },
    q9: {
      title: 'How are you feeling about money right now?',
      options: [
        { id: 'en_controle', label: '😌 In control' },
        { id: 'correct', label: '😐 Okay' },
        { id: 'stresse', label: '😰 Stressed' },
      ],
    },
    q10: {
      title: 'Want reminders on WhatsApp? 📲',
      phonePlaceholder: '514 555 0199',
      continueButton: 'Continue',
      declineButton: 'No thanks',
      privacyNote: 'Only ever used to message you on WhatsApp, never for anything else, never sold. Leave this blank if you’d rather not share it.',
      countryLabel: 'Country code',
      countrySearchPlaceholder: 'Search for a country...',
      consentLabel: 'I agree to be contacted on WhatsApp by the SaveUp team.',
      invalidNumberError: 'This number doesn’t look valid — check the country code and number.',
      saveFailedError: 'Could not save your number — try again.',
    },
    result: {
      scoreHeading: (firstName) => `${firstName}, here's your score`,
      scoreSuffix: '/100',
      scoreCaption: 'SaveUp Score',
      goalSummary: (goalName, amount, date, perPay) => `${goalName}: ${amount} by ${date} = ${perPay} per paycheck`,
      goalSummaryNoDate: (goalName, amount) => `${goalName}: ${amount}`,
      goodHeading: '✅ What’s going well',
      watchHeading: '⚠️ Worth watching',
      helpHeading: '🚀 How SaveUp helps',
      good: {
        fixedExpenses: 'Your fixed expenses leave you good breathing room.',
        goalPace: 'Your goal is realistic given your income.',
        leaksAware: 'You have a good sense of where your money goes.',
        moodGood: 'You feel in control of your finances — a real asset.',
        fallback: 'You took the time to take stock of your finances — that’s already an important step.',
      },
      watch: {
        fixedExpenses: 'Your fixed expenses take up a big share of your income.',
        goalPace: 'Your goal asks for a sizeable chunk of each paycheck — nothing is locked in, you can adjust it.',
        leaksUnknown: 'You’re not quite sure where your money goes right now — we’ll help clear that up together.',
        leaksTop: (leakLabel) => `${leakLabel} is your main leak.`,
        moodStressed: 'You’re feeling stressed about money right now — that’s common, and a clear picture helps ease it.',
      },
      help: {
        goalCreated: (goalName) => `We just created your "${goalName}" goal — you'll see its progress in real time.`,
        budgetCategories: 'Budget by category shows you exactly where every dollar goes, month after month.',
        statsAndRewards: 'Statistics and Rewards track your progress over time.',
        importStatement: 'Import your bank statement and SaveUp automatically spots your recurring expenses.',
      },
      leakLabels: {
        restos: 'Takeout/delivery',
        shopping: 'Impulse shopping',
        abonnements: 'Forgotten subscriptions',
        sorties: 'Going out',
        jeux: 'Gaming and in-app purchases',
        sais_pas: 'Unidentified spending',
      },
      continueButton: 'See my dashboard',
    },
    plans: {
      heading: 'Choose your plan',
      subtitle: 'Start for free, or unlock everything right now.',
      popular: 'Popular',
      promoBadge: 'Launch offer',
      promoWasPrice: '$14.99',
      promoPerMonth: '/mo',
      promoDisclaimer:
        'First month at $7.99, then $14.99/mo starting month 2. No commitment — cancel anytime.',
      premiumCta: 'Choose Premium at $7.99',
      standardCta: 'Choose Standard — $7.99/mo',
      redirecting: 'Redirecting...',
      freeLink: 'Continue with the free plan',
      checkoutFailed: "Couldn't start checkout — try again in a moment.",
    },
  },
}
