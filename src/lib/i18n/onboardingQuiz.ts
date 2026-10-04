import type { Lang } from './language'
import type { Archetype } from '../onboardingQuiz'

export interface QuizQuestionContent {
  text: string
  options: { id: 'a' | 'b' | 'c' | 'd'; label: string }[]
}

export interface OnboardingQuizContent {
  // Index 0..14 matches QUIZ_QUESTION_IDS (q1..q15) in lib/onboardingQuiz.ts.
  questions: QuizQuestionContent[]
  progressLabel: (current: number, total: number) => string
  back: string
  skipLater: string
  result: {
    badge: string
    scoreSuffix: string
    shareButton: string
    shareGenerating: string
    sharedConfirmation: string
    downloadedConfirmation: string
    shareError: string
    continueButton: string
    shareCardFooter: string
    archetypes: Record<Archetype, { name: string; description: string; shareTagline: string }>
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
  }
}

export const ONBOARDING_QUIZ: Record<Lang, OnboardingQuizContent> = {
  fr: {
    questions: [
      {
        text: 'À quelle fréquence regardes-tu ton solde bancaire ?',
        options: [
          { id: 'a', label: 'Chaque jour' },
          { id: 'b', label: 'Quelques fois par semaine' },
          { id: 'c', label: 'Une fois par mois' },
          { id: 'd', label: "Jamais, j'ai peur de regarder" },
        ],
      },
      {
        text: 'Quand tu reçois ta paie, qu’est-ce que tu fais en premier ?',
        options: [
          { id: 'a', label: 'Je mets de l’argent de côté direct' },
          { id: 'b', label: 'Je paie mes factures' },
          { id: 'c', label: 'Je me fais plaisir un peu' },
          { id: 'd', label: 'Je ne regarde même pas' },
        ],
      },
      {
        text: 'Combien de fois par mois tu achètes quelque chose sur un coup de tête ?',
        options: [
          { id: 'a', label: 'Jamais' },
          { id: 'b', label: '1-2 fois' },
          { id: 'c', label: '3-5 fois' },
          { id: 'd', label: 'Je perds le compte' },
        ],
      },
      {
        text: 'Tu sais environ combien tu dépenses en nourriture/sorties chaque mois ?',
        options: [
          { id: 'a', label: 'Oui, exactement' },
          { id: 'b', label: 'Approximativement' },
          { id: 'c', label: 'Aucune idée' },
        ],
      },
      {
        text: 'As-tu un montant d’épargne de côté présentement ?',
        options: [
          { id: 'a', label: 'Oui, un bon coussin' },
          { id: 'b', label: 'Un peu' },
          { id: 'c', label: 'Rien du tout' },
        ],
      },
      {
        text: 'As-tu un objectif précis en tête (voyage, achat, urgence) ?',
        options: [
          { id: 'a', label: 'Oui, précis' },
          { id: 'b', label: 'Vague idée' },
          { id: 'c', label: 'Aucun objectif' },
        ],
      },
      {
        text: 'Si une dépense imprévue de 500 $ arrivait demain, tu ferais quoi ?',
        options: [
          { id: 'a', label: 'Je paie cash' },
          { id: 'b', label: 'Je pige dans mon épargne' },
          { id: 'c', label: 'Carte de crédit' },
          { id: 'd', label: 'Je paniquerais' },
        ],
      },
      {
        text: 'Tu épargnes en moyenne combien de ton revenu chaque mois ?',
        options: [
          { id: 'a', label: 'Plus de 20%' },
          { id: 'b', label: '10-20%' },
          { id: 'c', label: 'Moins de 10%' },
          { id: 'd', label: '0%' },
        ],
      },
      {
        text: 'Penser à ton argent te stresse-t-il ?',
        options: [
          { id: 'a', label: 'Jamais' },
          { id: 'b', label: 'Parfois' },
          { id: 'c', label: 'Souvent' },
          { id: 'd', label: 'Constamment' },
        ],
      },
      {
        text: 'Compares-tu souvent tes finances à celles des autres ?',
        options: [
          { id: 'a', label: 'Jamais' },
          { id: 'b', label: 'De temps en temps' },
          { id: 'c', label: 'Souvent' },
        ],
      },
      {
        text: 'As-tu déjà évité d’ouvrir une facture par peur du montant ?',
        options: [
          { id: 'a', label: 'Jamais' },
          { id: 'b', label: 'Une fois ou deux' },
          { id: 'c', label: 'Régulièrement' },
        ],
      },
      {
        text: 'Qu’est-ce qui te stresse le plus avec l’argent ?',
        options: [
          { id: 'a', label: 'Ne pas savoir où il va' },
          { id: 'b', label: 'Pas en avoir assez' },
          { id: 'c', label: 'Trop de dettes' },
          { id: 'd', label: 'Rien, je suis en contrôle' },
        ],
      },
      {
        text: 'Utilises-tu présentement un outil pour suivre ton budget ?',
        options: [
          { id: 'a', label: 'Oui, religieusement' },
          { id: 'b', label: 'J’ai essayé, j’ai lâché' },
          { id: 'c', label: 'Jamais essayé' },
        ],
      },
      {
        text: 'Qu’est-ce qui t’empêche le plus de bien gérer ton argent ?',
        options: [
          { id: 'a', label: 'Manque de temps' },
          { id: 'b', label: 'Trop compliqué' },
          { id: 'c', label: 'Manque de motivation' },
          { id: 'd', label: 'Je sais pas par où commencer' },
        ],
      },
      {
        text: 'C’est quoi ton objectif principal en ce moment ?',
        options: [
          { id: 'a', label: 'Sortir de mes dettes' },
          { id: 'b', label: 'Me bâtir un coussin de sécurité' },
          { id: 'c', label: 'Épargner pour un projet précis' },
          { id: 'd', label: 'Avoir une vue claire sur mes finances' },
        ],
      },
    ],
    progressLabel: (current, total) => `Question ${current} sur ${total}`,
    back: 'Précédent',
    skipLater: 'Passer le quiz',
    result: {
      badge: 'Ton profil financier',
      scoreSuffix: '/100',
      shareButton: 'Partager mon résultat',
      shareGenerating: 'Génération...',
      sharedConfirmation: 'Image copiée !',
      downloadedConfirmation: 'Image téléchargée !',
      shareError: "Le partage n'a pas fonctionné — réessaie.",
      continueButton: 'Voir les plans',
      shareCardFooter: 'saveup.store',
      archetypes: {
        stressed: {
          name: 'Le Stressé',
          description:
            "L'argent occupe beaucoup de place dans ta tête ces temps-ci. La bonne nouvelle : une vue claire sur tes finances suffit souvent à faire retomber la pression.",
          shareTagline: "Mon argent me stresse — mais j'apprends à reprendre le contrôle.",
        },
        impulsive: {
          name: "L'Impulsif",
          description:
            "Tu dépenses au gré de tes envies, sans trop suivre où ça va. Un peu de structure, sans te priver de tout, peut changer beaucoup de choses.",
          shareTagline: "Je dépense sur un coup de tête — je travaille à mieux suivre mon argent.",
        },
        cautious: {
          name: 'Le Prudent',
          description:
            "Tu as déjà de bonnes habitudes, mais il te manque les bons outils pour vraiment voir où tu t'en vas.",
          shareTagline: "J'ai de bonnes habitudes — maintenant je veux une vraie structure.",
        },
        master: {
          name: 'Le Maître',
          description:
            "Tu gères déjà ton argent avec discipline et une vue claire sur tes objectifs. SaveUp t'aide à aller encore plus loin.",
          shareTagline: 'Je gère déjà bien mon argent — et je vise encore plus loin.',
        },
      },
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
    },
  },
  en: {
    questions: [
      {
        text: 'How often do you check your bank balance?',
        options: [
          { id: 'a', label: 'Every day' },
          { id: 'b', label: 'A few times a week' },
          { id: 'c', label: 'Once a month' },
          { id: 'd', label: "Never, I'm afraid to look" },
        ],
      },
      {
        text: 'When you get paid, what do you do first?',
        options: [
          { id: 'a', label: 'I set money aside right away' },
          { id: 'b', label: 'I pay my bills' },
          { id: 'c', label: 'I treat myself a little' },
          { id: 'd', label: "I don't even check" },
        ],
      },
      {
        text: 'How many times a month do you buy something on impulse?',
        options: [
          { id: 'a', label: 'Never' },
          { id: 'b', label: '1-2 times' },
          { id: 'c', label: '3-5 times' },
          { id: 'd', label: "I lose count" },
        ],
      },
      {
        text: 'Do you know roughly how much you spend on food/going out each month?',
        options: [
          { id: 'a', label: 'Yes, exactly' },
          { id: 'b', label: 'Roughly' },
          { id: 'c', label: 'No idea' },
        ],
      },
      {
        text: 'Do you currently have any savings set aside?',
        options: [
          { id: 'a', label: 'Yes, a solid cushion' },
          { id: 'b', label: 'A little' },
          { id: 'c', label: 'Nothing at all' },
        ],
      },
      {
        text: 'Do you have a specific goal in mind (trip, purchase, emergency fund)?',
        options: [
          { id: 'a', label: 'Yes, a specific one' },
          { id: 'b', label: 'A vague idea' },
          { id: 'c', label: 'No goal' },
        ],
      },
      {
        text: 'If an unexpected $500 expense came up tomorrow, what would you do?',
        options: [
          { id: 'a', label: 'Pay cash' },
          { id: 'b', label: 'Dip into my savings' },
          { id: 'c', label: 'Credit card' },
          { id: 'd', label: 'Panic' },
        ],
      },
      {
        text: 'On average, how much of your income do you save each month?',
        options: [
          { id: 'a', label: 'More than 20%' },
          { id: 'b', label: '10-20%' },
          { id: 'c', label: 'Less than 10%' },
          { id: 'd', label: '0%' },
        ],
      },
      {
        text: 'Does thinking about your money stress you out?',
        options: [
          { id: 'a', label: 'Never' },
          { id: 'b', label: 'Sometimes' },
          { id: 'c', label: 'Often' },
          { id: 'd', label: 'Constantly' },
        ],
      },
      {
        text: 'Do you often compare your finances to other people\'s?',
        options: [
          { id: 'a', label: 'Never' },
          { id: 'b', label: 'Sometimes' },
          { id: 'c', label: 'Often' },
        ],
      },
      {
        text: "Have you ever avoided opening a bill out of fear of the amount?",
        options: [
          { id: 'a', label: 'Never' },
          { id: 'b', label: 'Once or twice' },
          { id: 'c', label: 'Regularly' },
        ],
      },
      {
        text: 'What stresses you out most about money?',
        options: [
          { id: 'a', label: "Not knowing where it goes" },
          { id: 'b', label: "Not having enough" },
          { id: 'c', label: 'Too much debt' },
          { id: 'd', label: "Nothing, I'm in control" },
        ],
      },
      {
        text: 'Do you currently use a tool to track your budget?',
        options: [
          { id: 'a', label: 'Yes, religiously' },
          { id: 'b', label: 'I tried, I gave up' },
          { id: 'c', label: 'Never tried' },
        ],
      },
      {
        text: "What's holding you back most from managing your money well?",
        options: [
          { id: 'a', label: 'Lack of time' },
          { id: 'b', label: 'Too complicated' },
          { id: 'c', label: 'Lack of motivation' },
          { id: 'd', label: "Don't know where to start" },
        ],
      },
      {
        text: "What's your main goal right now?",
        options: [
          { id: 'a', label: 'Get out of debt' },
          { id: 'b', label: 'Build a safety cushion' },
          { id: 'c', label: 'Save up for a specific project' },
          { id: 'd', label: 'Get a clear view of my finances' },
        ],
      },
    ],
    progressLabel: (current, total) => `Question ${current} of ${total}`,
    back: 'Back',
    skipLater: 'Skip the quiz',
    result: {
      badge: 'Your financial profile',
      scoreSuffix: '/100',
      shareButton: 'Share my result',
      shareGenerating: 'Generating...',
      sharedConfirmation: 'Image copied!',
      downloadedConfirmation: 'Image downloaded!',
      shareError: "Sharing didn't work — try again.",
      continueButton: 'See the plans',
      shareCardFooter: 'saveup.store',
      archetypes: {
        stressed: {
          name: 'The Stressed',
          description:
            "Money is taking up a lot of headspace right now. The good news: a clear view of your finances is often enough to take the pressure off.",
          shareTagline: "My money stresses me out — but I'm learning to take control.",
        },
        impulsive: {
          name: 'The Impulsive',
          description:
            "You spend on a whim without really tracking where it goes. A bit of structure, without giving up everything, can change a lot.",
          shareTagline: "I spend on impulse — working on tracking my money better.",
        },
        cautious: {
          name: 'The Cautious',
          description:
            "You already have good habits, but you're missing the right tools to really see where you stand.",
          shareTagline: "I have good habits — now I want real structure.",
        },
        master: {
          name: 'The Master',
          description:
            "You already manage your money with discipline and a clear view of your goals. SaveUp helps you go even further.",
          shareTagline: "I already manage my money well — aiming even higher.",
        },
      },
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
    },
  },
}
