import type { Lang } from './language'

export interface HomeContent {
  hero: {
    freeBadge: string
    titleLine1: string
    titleHighlight: string
    subtitle: string
    ctaPrimary: string
    ctaSecondary: string
    trustBadges: string[]
  }
  whySaveupSection: {
    heading: string
    subheading: string
  }
  whySaveup: { key: string; title: string; description: string }[]
  features: {
    heading: string
    subheading: string
    simBadge: string
    simTitle: string
    simBody: string
    scoreBadge: string
    scoreBody: string
    budgetBadge: string
    budgetTitle: string
    statsBadge: string
    statsTitle: string
    rewardsBadge: string
    rewardsTitle: string
  }
  screenshots: {
    heading: string
    subheading: string
  }
  midCta: {
    title: string
    subtitle: string
    cta: string
  }
  howItWorks: {
    heading: string
    subheading: string
  }
  comparison: {
    heading: string
    subheading: string
    colSaveup: string
    colChatbot: string
    colExcel: string
    rows: { label: string; saveup: string; chatbot: string; excel: string }[]
  }
  privacy: {
    heading: string
    subheading: string
    points: string[]
  }
  results: {
    heading: string
    badge: string
    body: string
  }
  finalCta: {
    heading: string
    cta: string
    trustBadges: string[]
  }
  faq: {
    heading: string
    items: { question: string; answer: string }[]
  }
}

export const HOME: Record<Lang, HomeContent> = {
  fr: {
    hero: {
      freeBadge: '100% gratuit pour commencer',
      titleLine1: 'Tu veux économiser',
      titleHighlight: 'plus facilement',
      subtitle:
        "SaveUp t'aide à suivre tes dépenses, ton budget et tes objectifs d'épargne — au même endroit, sans compliqué.",
      ctaPrimary: 'Essayer gratuitement',
      ctaSecondary: 'Voir ce que ça donne',
      trustBadges: ['Sans carte requise', 'Configuration en 2 min', '100% en français'],
    },
    whySaveupSection: {
      heading: 'Pourquoi SaveUp ?',
      subheading: "Il existe déjà plein d'apps de budget. Voici ce qui change avec celle-ci.",
    },
    whySaveup: [
      {
        key: 'simple',
        title: 'Pensé pour rester simple',
        description:
          "Une interface pensée pour ne pas te prendre la tête — pas de jargon financier, pas d'écrans interminables.",
      },
      {
        key: 'made-for-you',
        title: 'Fait en français, pas traduit',
        description:
          "SaveUp est écrit en français dès le départ, pour des francophones — pas une traduction ajoutée après coup.",
      },
      {
        key: 'real-plan',
        title: 'Un vrai plan, pas juste un suivi',
        description:
          "Pas juste un suivi de dépenses : un vrai plan pour atteindre tes objectifs d'épargne, avec un rythme calculé pour toi.",
      },
    ],
    features: {
      heading: 'Un outil, pas cinq onglets Excel.',
      subheading: "Ce que tu vois dans l'app, dès les premières minutes.",
      simBadge: 'Simulateur « et si »',
      simTitle: 'Teste avant de trancher',
      simBody: "Coupe une dépense, avance une échéance — vois l'impact avant de le faire pour de vrai.",
      scoreBadge: 'Score de santé',
      scoreBody: 'Un chiffre qui résume tout, et qui bouge avec toi chaque semaine.',
      budgetBadge: 'Budget',
      budgetTitle: 'Par catégorie',
      statsBadge: 'Statistiques',
      statsTitle: 'Tes tendances',
      rewardsBadge: 'Récompenses',
      rewardsTitle: 'Des badges mérités',
    },
    screenshots: {
      heading: "L'app, telle quelle.",
      subheading: "Pas des maquettes — l'interface que tu utilises vraiment, page par page.",
    },
    midCta: {
      title: 'Convaincu jusqu’ici ?',
      subtitle: 'Ton premier budget est prêt en 2 minutes.',
      cta: 'Essayer gratuitement',
    },
    howItWorks: {
      heading: 'En 3 étapes, ton budget est prêt',
      subheading: "Teste la première étape tout de suite — les deux autres t'attendent dans l'app.",
    },
    comparison: {
      heading: 'SaveUp vs les alternatives',
      subheading:
        'Un chatbot répond bien à une question ponctuelle, et un tableur peut tout calculer — mais aucun des deux ne suit ton argent pour toi, jour après jour.',
      colSaveup: 'SaveUp',
      colChatbot: 'Chatbot gratuit',
      colExcel: 'Tableur Excel',
      rows: [
        {
          label: 'Suivi dans le temps',
          saveup: 'Historique et tendances calculés automatiquement',
          chatbot: "Aucune mémoire d'une conversation à l'autre",
          excel: 'Aucun suivi automatique dans le temps',
        },
        {
          label: 'Mise à jour',
          saveup: 'Automatique, dès que tu ajoutes une dépense',
          chatbot: 'Il faut tout réexpliquer à chaque fois',
          excel: 'Calculs manuels à refaire',
        },
        {
          label: 'Alertes',
          saveup: 'Alertes automatiques avant que ça dérape',
          chatbot: 'Il faut penser à demander à chaque fois',
          excel: 'Aucune alerte',
        },
        {
          label: 'Visualisation',
          saveup: 'Graphiques, jauges et barres de progression',
          chatbot: 'Pas de visuel, tout est en texte',
          excel: 'Des chiffres dans des cellules',
        },
        {
          label: 'Motivation',
          saveup: 'Badges de progression qui évoluent',
          chatbot: 'Rien qui suit ta progression',
          excel: 'Rien qui suit ta progression',
        },
      ],
    },
    privacy: {
      heading: 'Tes données, ta confidentialité',
      subheading: 'Simple à expliquer : voici exactement ce que SaveUp sait sur toi, et ce qu’il en fait.',
      points: [
        "Seulement les données que tu entres toi-même — tes dépenses, tes objectifs — ou que tu importes depuis un fichier CSV.",
        "Aucune connexion directe à ton compte bancaire : SaveUp ne se branche sur rien, tu gardes le contrôle de ce qui entre dans l'app.",
        'Ces données servent uniquement à te montrer tes propres statistiques. Elles ne sont jamais vendues ni partagées.',
      ],
    },
    results: {
      heading: 'Résultats',
      badge: 'À venir',
      body: "SaveUp est tout jeune — on n'a pas encore de résultats concrets d'utilisateurs à partager, et on ne va pas en inventer. Crée ton compte pour voir l'outil à l'œuvre avec tes propres chiffres.",
    },
    finalCta: {
      heading: 'Prêt à voir clair dans tes finances ?',
      cta: 'Commencer gratuitement',
      trustBadges: ['Sans carte requise', 'Configuration en 2 minutes', 'Annule quand tu veux'],
    },
    faq: {
      heading: 'Questions fréquentes',
      items: [
        {
          question: "C'est quoi SaveUp ?",
          answer:
            "Un outil de budget simple qui suit ton revenu, tes dépenses fixes et tes objectifs d'épargne, et qui te donne un score de santé financière qui évolue avec toi.",
        },
        {
          question: 'Combien ça coûte ?',
          answer:
            "Le plan Gratuit est gratuit pour toujours, sans limite de temps. Standard (7,99 $/mois) et Premium (14,99 $/mois) débloquent les catégories et objectifs illimités, l'import CSV, les statistiques complètes et plus — voir la page Tarifs pour le détail.",
        },
        {
          question: 'Mes données sont-elles sécurisées ?',
          answer:
            "Oui — chaque compte est protégé par un vrai système d'authentification, et tes données sont isolées : personne d'autre ne peut y accéder, peu importe qui utilise SaveUp. Elles sont hébergées sur une base de données sécurisée (Supabase).",
        },
        {
          question: 'Dois-je créer un compte ?',
          answer:
            "Oui, un compte gratuit est nécessaire pour que tes données restent privées et liées à toi seul(e) — ça prend moins de 2 minutes, sans carte requise.",
        },
        {
          question: 'Puis-je annuler ?',
          answer:
            'Oui, en tout temps, sans engagement. Le plan Gratuit reste gratuit sans limite ; pour Standard ou Premium, annule quand tu veux depuis Paramètres → Gérer mon abonnement — tu gardes l’accès jusqu’à la fin de la période déjà payée.',
        },
      ],
    },
  },
  en: {
    hero: {
      freeBadge: '100% free to start',
      titleLine1: 'Want to save',
      titleHighlight: 'more easily',
      subtitle:
        "SaveUp helps you track your spending, your budget, and your savings goals — all in one place, with none of the hassle.",
      ctaPrimary: 'Try it for free',
      ctaSecondary: 'See what it looks like',
      trustBadges: ['No credit card needed', '2-minute setup', 'Your money stays in CAD'],
    },
    whySaveupSection: {
      heading: 'Why SaveUp?',
      subheading: "Plenty of budgeting apps already exist. Here's what's different about this one.",
    },
    whySaveup: [
      {
        key: 'simple',
        title: 'Built to stay simple',
        description:
          "An interface built to not give you a headache — no finance jargon, no endless screens to click through.",
      },
      {
        key: 'made-for-you',
        title: 'Built for Canada, not ported over',
        description:
          "SaveUp speaks your language and keeps every dollar in CAD from the start — not a US app with the wrong currency bolted on after the fact.",
      },
      {
        key: 'real-plan',
        title: 'An actual plan, not just tracking',
        description:
          "Not just an expense tracker: a real plan to hit your savings goals, with a pace that's calculated for you.",
      },
    ],
    features: {
      heading: 'One tool, not five Excel tabs.',
      subheading: "What you'll see in the app, from the first few minutes.",
      simBadge: '"What if" simulator',
      simTitle: 'Test it before you commit',
      simBody: 'Cut an expense, move up a deadline — see the impact before you actually do it.',
      scoreBadge: 'Health score',
      scoreBody: 'One number that sums it all up, and moves with you every week.',
      budgetBadge: 'Budget',
      budgetTitle: 'By category',
      statsBadge: 'Statistics',
      statsTitle: 'Your trends',
      rewardsBadge: 'Rewards',
      rewardsTitle: 'Badges you actually earn',
    },
    screenshots: {
      heading: 'The app, as it really is.',
      subheading: 'No mockups — the actual interface you use, page by page.',
    },
    midCta: {
      title: 'Convinced so far?',
      subtitle: 'Your first budget is ready in 2 minutes.',
      cta: 'Try it for free',
    },
    howItWorks: {
      heading: '3 steps to a ready-to-go budget',
      subheading: 'Try the first step right now — the other two are waiting for you in the app.',
    },
    comparison: {
      heading: 'SaveUp vs. the alternatives',
      subheading:
        'A free chatbot answers a one-off question fine, and a spreadsheet can calculate anything — but neither one actually tracks your money for you, day after day.',
      colSaveup: 'SaveUp',
      colChatbot: 'Free chatbot',
      colExcel: 'Excel spreadsheet',
      rows: [
        {
          label: 'Tracking over time',
          saveup: 'History and trends calculated automatically',
          chatbot: 'No memory from one conversation to the next',
          excel: 'No automatic tracking over time',
        },
        {
          label: 'Updating',
          saveup: 'Automatic, the moment you log an expense',
          chatbot: 'You have to re-explain everything every time',
          excel: 'Manual calculations to redo',
        },
        {
          label: 'Alerts',
          saveup: 'Automatic alerts before things get out of hand',
          chatbot: 'You have to remember to ask every time',
          excel: 'No alerts at all',
        },
        {
          label: 'Visualization',
          saveup: 'Charts, gauges, and progress bars',
          chatbot: 'No visuals, everything is text',
          excel: 'Numbers stuck in cells',
        },
        {
          label: 'Motivation',
          saveup: 'Progress badges that actually evolve',
          chatbot: "Nothing that tracks your progress",
          excel: "Nothing that tracks your progress",
        },
      ],
    },
    privacy: {
      heading: 'Your data, your privacy',
      subheading: "Simple to explain: here's exactly what SaveUp knows about you, and what it does with it.",
      points: [
        'Only the data you enter yourself — your expenses, your goals — or import from a CSV file.',
        "No direct connection to your bank account: SaveUp doesn't plug into anything, so you stay in control of what goes into the app.",
        'That data is used only to show you your own statistics. It is never sold or shared.',
      ],
    },
    results: {
      heading: 'Results',
      badge: 'Coming soon',
      body: "SaveUp is brand new — we don't have real user results to share yet, and we're not going to make any up. Create your account to see the tool at work with your own numbers.",
    },
    finalCta: {
      heading: 'Ready to see your finances clearly?',
      cta: 'Start for free',
      trustBadges: ['No credit card needed', '2-minute setup', 'Cancel anytime'],
    },
    faq: {
      heading: 'Frequently asked questions',
      items: [
        {
          question: 'What is SaveUp?',
          answer:
            'A simple budgeting tool that tracks your income, fixed expenses, and savings goals, and gives you a financial health score that evolves along with you.',
        },
        {
          question: 'How much does it cost?',
          answer:
            'The Free plan is free forever, no time limit. Standard ($7.99 CAD/month) and Premium ($14.99 CAD/month) unlock unlimited categories and goals, CSV import, full statistics, and more — see the Pricing page for details.',
        },
        {
          question: 'Is my data secure?',
          answer:
            "Yes — every account is protected by a real authentication system, and your data is isolated: no one else can access it, no matter who else uses SaveUp. It's hosted on a secure database (Supabase).",
        },
        {
          question: 'Do I need to create an account?',
          answer:
            'Yes, a free account is needed so your data stays private and tied to you alone — it takes less than 2 minutes, no card required.',
        },
        {
          question: 'Can I cancel?',
          answer:
            "Yes, anytime, no commitment. The Free plan stays free with no limit; for Standard or Premium, cancel whenever you want from Settings → Manage subscription — you keep access until the end of the period you already paid for.",
        },
      ],
    },
  },
}
