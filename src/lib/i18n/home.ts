import type { Lang } from './language'

export interface HomeContent {
  // <title>/<meta name="description">/og:*/twitter:* — see MetaTags.tsx.
  meta: {
    title: string
    description: string
  }
  hero: {
    title: string
    subtitle: string
    benefits: string[]
    cta: string
    trustLine: string
  }
  problemSolution: {
    heading: string
    subheading: string
    pairs: { problem: string; solution: string }[]
  }
  story: {
    heading: string
    body: string[]
    founderName: string
    founderRole: string
    photoAlt: string
  }
  demo: {
    heading: string
    subheading: string
    placeholderLabel: string
    placeholderDuration: string
  }
  solutionSteps: {
    heading: string
    subheading: string
    items: { title: string; body: string }[]
  }
  community: {
    heading: string
    body: string
    discordCta: string
    discordComingSoon: string
  }
  // Public progress counter (ProgressCounter.tsx) — the live count comes
  // from api/customer-count.ts (paying, non-trial customers only). Not
  // currently placed on the page (see Home.tsx), kept so the component
  // and its real data stay wired and ready to drop back in.
  progressCounter: {
    context: string
    progress: (count: number, target: number) => string
  }
  faq: {
    heading: string
    items: { question: string; answer: string }[]
  }
}

export const HOME: Record<Lang, HomeContent> = {
  fr: {
    meta: {
      title: 'SaveUp — Reprends le contrôle de ton argent, simplement',
      description:
        'Importe ton relevé bancaire, budgète et épargne au même endroit — sans tableur compliqué. 100% gratuit pour commencer.',
    },
    hero: {
      title: 'Gère ton budget en 3 clics',
      subtitle:
        "Importe ton relevé bancaire (CSV) et laisse SaveUp catégoriser tes dépenses automatiquement — budget, épargne et objectifs, enfin réunis au même endroit.",
      benefits: [
        'Import CSV de ton relevé bancaire',
        'Catégorisation automatique en un clic',
        "Suivi de tes objectifs d'épargne et de ta santé financière",
      ],
      cta: 'Commencer gratuitement, sans carte requise',
      trustLine: 'Rejoins les premiers utilisateurs de SaveUp',
    },
    problemSolution: {
      heading: 'Tu te reconnais ?',
      subheading: 'SaveUp existe pour régler exactement ces problèmes-là.',
      pairs: [
        {
          problem: 'Gérer ton budget dans un tableur que tu abandonnes après deux semaines.',
          solution: 'Une interface simple, pensée pour durer plus de deux semaines.',
        },
        {
          problem: 'Tu ne sais jamais vraiment où va ton argent chaque mois.',
          solution: 'Un dashboard qui montre tes dépenses par catégorie, en un coup d’œil.',
        },
        {
          problem: "Tu as déjà essayé d'épargner, sans jamais vraiment y arriver.",
          solution: "Des objectifs d'épargne concrets, avec une progression que tu peux suivre.",
        },
        {
          problem: 'Entrer chaque dépense à la main te décourage avant même de commencer.',
          solution: 'Importe ton relevé bancaire — SaveUp catégorise pour toi.',
        },
        {
          problem: 'Les apps de budget existantes sont trop compliquées, ou pas en français.',
          solution: 'SaveUp est pensé pour rester simple, et écrit en français dès le départ.',
        },
      ],
    },
    story: {
      heading: 'Pourquoi SaveUp',
      body: [
        "J'ai créé SaveUp parce que les autres applications de budget me semblaient toujours trop compliquées — trop d'onglets, trop de jargon financier, pour finalement les abandonner après une semaine.",
        "SaveUp, c'est l'application que j'aurais aimé avoir : simple, honnête, et qui va droit au but.",
      ],
      founderName: 'Alex',
      founderRole: 'Fondateur de SaveUp',
      photoAlt: "Photo d'Alex, fondateur de SaveUp",
    },
    demo: {
      heading: 'Vois SaveUp en action',
      subheading: "Une démo complète de l'application, en un peu moins de 3 minutes.",
      placeholderLabel: 'Vidéo à venir',
      placeholderDuration: '~3 min',
    },
    solutionSteps: {
      heading: 'Comment ça marche',
      subheading: 'Trois étapes, et ton budget tourne presque tout seul.',
      items: [
        {
          title: 'Importer ton relevé bancaire',
          body: "Télécharge le CSV de ta banque — SaveUp s'occupe du reste.",
        },
        {
          title: 'Recatégoriser en un clic',
          body: 'Ajuste une catégorie une fois, SaveUp la retient pour la prochaine fois.',
        },
        {
          title: 'Suivre tes objectifs et ta santé financière',
          body: 'Un score qui évolue avec toi, et une progression claire vers chaque objectif.',
        },
      ],
    },
    community: {
      heading: 'Rejoins la communauté SaveUp',
      body: "SaveUp est en phase de lancement. Rejoins le Discord pour échanger avec les premiers utilisateurs, proposer des idées, ou simplement suivre l'évolution du projet.",
      discordCta: 'Rejoindre le Discord',
      discordComingSoon: 'Le lien du Discord arrive bientôt.',
    },
    progressCounter: {
      context: "SaveUp est construit par une seule personne. Voici où j'en suis.",
      progress: (count, target) => `${count} client${count === 1 ? '' : 's'} sur ${target} d'ici Noël`,
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
          question: 'Quelles sont les limites du plan gratuit ?',
          answer:
            "Le plan Gratuit te donne un Dashboard complet, jusqu'à 5 catégories de budget, 1 objectif d'épargne actif, 2 dépenses récurrentes et jusqu'à 2 imports CSV — sans aucune limite de temps. Standard et Premium débloquent les catégories, objectifs et imports illimités.",
        },
        {
          question: 'Puis-je importer mon relevé bancaire ?',
          answer:
            "Oui — exporte le CSV depuis le site de ta banque et importe-le dans SaveUp, qui catégorise automatiquement tes transactions. Le plan Gratuit inclut 2 imports ; Standard et Premium sont illimités.",
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
    meta: {
      title: 'SaveUp — Take control of your money, simply',
      description:
        'Import your bank statement, budget and save in one place — no complicated spreadsheet. 100% free to start.',
    },
    hero: {
      title: 'Manage your budget in 3 clicks',
      subtitle:
        'Import your bank statement (CSV) and let SaveUp categorize your spending automatically — budget, savings, and goals, finally in one place.',
      benefits: [
        'CSV import of your bank statement',
        'Automatic categorization in one click',
        'Track your savings goals and your financial health',
      ],
      cta: 'Get started free, no card required',
      trustLine: 'Join the first SaveUp users',
    },
    problemSolution: {
      heading: 'Sound familiar?',
      subheading: 'SaveUp exists to fix exactly these problems.',
      pairs: [
        {
          problem: 'Managing your budget in a spreadsheet you abandon after two weeks.',
          solution: 'A simple interface, built to last longer than two weeks.',
        },
        {
          problem: "You never really know where your money goes each month.",
          solution: 'A dashboard that shows your spending by category, at a glance.',
        },
        {
          problem: "You've tried to save before, without ever really getting there.",
          solution: 'Concrete savings goals, with progress you can actually track.',
        },
        {
          problem: 'Entering every expense by hand discourages you before you even start.',
          solution: 'Import your bank statement — SaveUp categorizes it for you.',
        },
        {
          problem: 'Existing budget apps are either too complicated, or not in French.',
          solution: 'SaveUp is built to stay simple — and written in French from day one.',
        },
      ],
    },
    story: {
      heading: 'Why SaveUp',
      body: [
        "I built SaveUp because every other budget app felt too complicated — too many tabs, too much financial jargon, until I'd abandon it within a week.",
        'SaveUp is the app I wish I had: simple, honest, and to the point.',
      ],
      founderName: 'Alex',
      founderRole: 'Founder of SaveUp',
      photoAlt: 'Photo of Alex, founder of SaveUp',
    },
    demo: {
      heading: 'See SaveUp in action',
      subheading: 'A full walkthrough of the app, in just under 3 minutes.',
      placeholderLabel: 'Video coming soon',
      placeholderDuration: '~3 min',
    },
    solutionSteps: {
      heading: 'How it works',
      subheading: 'Three steps, and your budget runs almost on its own.',
      items: [
        {
          title: 'Import your bank statement',
          body: "Download the CSV from your bank — SaveUp takes care of the rest.",
        },
        {
          title: 'Recategorize in one click',
          body: 'Adjust a category once, SaveUp remembers it next time.',
        },
        {
          title: 'Track your goals and your financial health',
          body: 'A score that evolves with you, and clear progress toward every goal.',
        },
      ],
    },
    community: {
      heading: 'Join the SaveUp community',
      body: "SaveUp is in launch phase. Join the Discord to talk with the first users, suggest ideas, or just follow along as the project grows.",
      discordCta: 'Join the Discord',
      discordComingSoon: 'The Discord link is coming soon.',
    },
    progressCounter: {
      context: "SaveUp is built by one person. Here's where I'm at.",
      progress: (count, target) => `${count} customer${count === 1 ? '' : 's'} out of ${target} by Christmas`,
    },
    faq: {
      heading: 'Frequently asked questions',
      items: [
        {
          question: 'What is SaveUp?',
          answer:
            'A simple budgeting tool that tracks your income, fixed expenses, and savings goals, and gives you a financial health score that evolves with you.',
        },
        {
          question: "What are the Free plan's limits?",
          answer:
            "The Free plan gives you a full Dashboard, up to 5 budget categories, 1 active savings goal, 2 recurring expenses, and up to 2 CSV imports — with no time limit at all. Standard and Premium unlock unlimited categories, goals, and imports.",
        },
        {
          question: 'Can I import my bank statement?',
          answer:
            "Yes — export the CSV from your bank's website and import it into SaveUp, which categorizes your transactions automatically. The Free plan includes 2 imports; Standard and Premium are unlimited.",
        },
        {
          question: 'Is my data secure?',
          answer:
            "Yes — every account is protected by real authentication, and your data is isolated: no one else can access it, no matter who else uses SaveUp. It's hosted on a secure database (Supabase).",
        },
        {
          question: 'Do I need to create an account?',
          answer:
            'Yes, a free account is required so your data stays private and tied to you alone — it takes less than 2 minutes, no card required.',
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
