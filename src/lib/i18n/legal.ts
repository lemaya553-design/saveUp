import type { Lang } from './language'

// Dictionary for the two Loi 25 / legal pages: Confidentialite.tsx (Privacy
// Policy) and Conditions.tsx (Terms of Service). Structured to mirror each
// page's actual JSX so paragraphs that contain an inline emphasized term
// (wrapped in <span className="text-ink">) or an inline <Link> are split
// into "before / emphasis / after" (or "before / link / after") pieces that
// the component re-assembles — this keeps the existing inline styling and
// internal links working in both languages without touching the JSX
// structure itself. Bulleted "Label — description" items are split into
// { label, desc } pairs for the same reason.

interface LabelDesc {
  label: string
  desc: string
}

export interface LegalContent {
  back: string
  lastUpdatedLabel: string
  temporaryAddressNote: string

  privacy: {
    title: string
    introBeforeAct: string
    actName: string
    introAfterAct: string

    dataCollected: {
      title: string
      intro: string
      items: LabelDesc[]
      outro: string
    }
    dataUse: {
      title: string
      para1Before: string
      para1Emphasis: string
      para1After: string
      para2: string
    }
    dataStorage: {
      title: string
      para1Before: string
      supabase: string
      para1After: string
      items: [
        string,
        { before: string; emphasis: string; after: string },
        string,
      ]
    }
    rights: {
      title: string
      intro: string
      items: LabelDesc[]
      outro: string
    }
    retention: {
      title: string
      para1: string
      para2Before: string
      days: string
      para2After: string
    }
    contact: {
      title: string
      intro: string
    }
    cookies: {
      title: string
      para1Before: string
      para1Emphasis: string
      para1After: string
      para2Before: string
      localStorage: string
      para2After: string
      items: string[]
      para3: string
    }

    footerBefore: string
    footerLinkText: string
    footerAfter: string
  }

  terms: {
    title: string
    introBefore: string
    introLinkText: string
    introAfter: string

    service: {
      title: string
      para1: string
      para2Part1Before: string
      para2Emphasis1: string
      para2Part2Before: string
      para2Emphasis2: string
      para2After: string
    }
    account: {
      title: string
      items: string[]
    }
    plans: {
      title: string
      intro: string
      items: LabelDesc[]
      para2Before: string
      para2Emphasis: string
      para2After: string
      para3: string
      para4Before: string
      stripe: string
      para4After: string
    }
    acceptableUse: {
      title: string
      intro: string
      items: string[]
    }
    liability: {
      title: string
      para1: string
      para2: string
      para3: string
    }
    termination: {
      title: string
      para1Before: string
      linkText: string
      para1After: string
      para2: string
    }
    changes: {
      title: string
      para1: string
    }
    governingLaw: {
      title: string
      para1: string
    }
    contact: {
      title: string
      intro: string
    }

    footerBefore: string
    footerPrivacyLinkText: string
    footerMiddle: string
    footerPricingLinkText: string
    footerAfter: string
  }
}

export const LEGAL: Record<Lang, LegalContent> = {
  fr: {
    back: '← Retour',
    lastUpdatedLabel: 'Dernière mise à jour :',
    temporaryAddressNote:
      "(Adresse temporaire de lancement — à ajuster lorsque SaveUp aura une adresse de contact officielle.)",

    privacy: {
      title: 'Politique de confidentialité',
      introBeforeAct:
        "SaveUp (« nous », « l'application ») est une application québécoise de gestion de budget personnel. Cette politique explique quels renseignements personnels nous collectons, pourquoi, où ils sont conservés, et quels droits tu as sur tes propres données en vertu de la ",
      actName: 'Loi 25',
      introAfterAct:
        " (Loi modernisant des dispositions législatives en matière de protection des renseignements personnels, Québec).",

      dataCollected: {
        title: '1. Quelles données sont collectées',
        intro: 'Pour fonctionner, SaveUp collecte et conserve les renseignements suivants, liés à ton compte :',
        items: [
          { label: 'Courriel', desc: 'utilisé pour créer et sécuriser ton compte.' },
          {
            label: 'Mot de passe',
            desc: "jamais stocké en clair ; géré et chiffré par notre fournisseur d'authentification (Supabase Auth), inaccessible à SaveUp lui-même.",
          },
          { label: 'Revenu mensuel', desc: 'pour calculer ton budget disponible.' },
          {
            label: 'Dépenses fixes et ponctuelles',
            desc: 'description, montant, catégorie et date de chaque dépense que tu notes.',
          },
          { label: 'Catégories personnalisées', desc: 'les catégories de dépenses que tu crées ou renommes.' },
          {
            label: "Objectifs et contributions d'épargne",
            desc: 'noms, montants cibles, échéances et historique de tes contributions.',
          },
          { label: 'Montant investi', desc: 'le solde que tu suis manuellement sur la page Investissement.' },
        ],
        outro:
          "Nous ne collectons aucune donnée au-delà de ce qui précède : pas de géolocalisation, pas de contacts, pas d'informations bancaires réelles (SaveUp ne se connecte à aucune institution financière — tous les montants sont entrés manuellement par toi).",
      },

      dataUse: {
        title: '2. Comment les données sont utilisées',
        para1Before: 'Tes renseignements servent ',
        para1Emphasis: 'exclusivement',
        para1After:
          " à faire fonctionner SaveUp pour toi : calculer ton budget hebdomadaire et mensuel, ton score de santé financière, tes projections d'investissement, ta progression vers tes objectifs d'épargne, et tes badges de récompense.",
        para2:
          "Nous ne vendons, ne louons et ne partageons jamais tes renseignements personnels à des tiers à des fins publicitaires ou de marketing. Il n'y a aucun profilage commercial, ni aucune revente de données, sous quelque forme que ce soit.",
      },

      dataStorage: {
        title: '3. Où les données sont stockées',
        para1Before: "Tes données sont hébergées sur l'infrastructure de ",
        supabase: 'Supabase',
        para1After: " (base de données PostgreSQL gérée), notre fournisseur d'hébergement et d'authentification.",
        items: [
          'Toutes les communications entre l\'application et la base de données sont chiffrées en transit (HTTPS/TLS).',
          {
            before: 'Chaque compte est isolé des autres par des règles de sécurité au niveau des lignes (',
            emphasis: 'Row Level Security',
            after:
              ") : un utilisateur connecté ne peut techniquement lire ou modifier que ses propres données, jamais celles d'un autre compte.",
          },
          "L'accès à ton compte requiert une authentification par courriel et mot de passe, avec possibilité de réinitialisation sécurisée.",
        ],
      },

      rights: {
        title: '4. Tes droits',
        intro: 'Conformément à la Loi 25, tu disposes des droits suivants sur tes renseignements personnels :',
        items: [
          {
            label: "Droit d'accès",
            desc: "obtenir une copie des renseignements que nous détenons sur toi. Tu peux déjà exporter la majorité de tes données toi-même (Paramètres → Exporter tes données), ou nous écrire pour une copie complète.",
          },
          {
            label: 'Droit de rectification',
            desc: "corriger un renseignement inexact ou incomplet. La plupart des champs sont modifiables directement dans l'application ; pour le reste, écris-nous.",
          },
          {
            label: 'Droit à la suppression',
            desc: 'demander la suppression de ton compte et de l\'ensemble des données qui y sont associées.',
          },
          {
            label: 'Droit de retirer ton consentement',
            desc: "en tout temps, ce qui entraîne la fermeture de ton compte, puisque le service ne peut pas fonctionner sans les renseignements listés à la section 1.",
          },
          {
            label: 'Droit à la portabilité',
            desc: 'recevoir tes données dans un format structuré et lisible (CSV).',
          },
        ],
        outro:
          "Pour exercer l'un de ces droits, écris-nous à l'adresse indiquée à la section 6. La suppression de compte en libre-service n'est pas encore offerte directement dans l'application — jusqu'à ce qu'elle le soit, toute demande de suppression est traitée manuellement par courriel.",
      },

      retention: {
        title: '5. Conservation des données',
        para1: 'Tes données sont conservées tant que ton compte est actif, afin de te fournir le service.',
        para2Before:
          'Lorsqu\'un compte est supprimé (à ta demande), ses données sont retirées de notre base de données active dans les meilleurs délais. Des copies résiduelles peuvent subsister temporairement dans nos sauvegardes de sécurité, purgées dans un délai maximal de ',
        days: '90 jours',
        para2After: ' suivant la suppression.',
      },

      contact: {
        title: '6. Nous contacter',
        intro:
          'Pour toute question sur cette politique, pour exercer l\'un de tes droits, ou pour signaler une préoccupation liée à la protection de tes renseignements personnels, écris-nous à :',
      },

      cookies: {
        title: '7. Cookies et stockage local',
        para1Before: "SaveUp n'utilise ",
        para1Emphasis: 'aucun cookie publicitaire ou de suivi',
        para1After: ', et ne partage aucune donnée de navigation avec des tiers.',
        para2Before: 'Le navigateur utilise le stockage local (',
        localStorage: 'localStorage',
        para2After: ') uniquement à des fins fonctionnelles :',
        items: [
          "garder ta session ouverte (jeton d'authentification), pour éviter d'avoir à te reconnecter à chaque visite ;",
          "retenir quels badges de récompense t'ont déjà été montrés, pour ne pas rejouer une animation déjà vue.",
        ],
        para3: "Rien de ce stockage local n'est transmis à des tiers ni utilisé à des fins publicitaires.",
      },

      footerBefore:
        "Cette politique peut être mise à jour au fil de l'évolution de SaveUp. Les changements importants seront communiqués aux utilisateurs. Voir aussi la ",
      footerLinkText: 'page Tarifs',
      footerAfter: '.',
    },

    terms: {
      title: "Conditions d'utilisation",
      introBefore:
        "En créant un compte ou en utilisant SaveUp, tu acceptes les conditions décrites ci-dessous. Si tu n'es pas d'accord avec l'une d'elles, tu ne dois pas utiliser le service. Voir aussi notre ",
      introLinkText: 'politique de confidentialité',
      introAfter: ', qui fait partie intégrante de ces conditions.',

      service: {
        title: '1. Description du service',
        para1:
          "SaveUp est un outil de gestion de budget personnel et de suivi d'épargne : revenu, dépenses fixes et ponctuelles, objectifs d'épargne, score de santé financière et projections d'investissement.",
        para2Part1Before: '',
        para2Emphasis1: "SaveUp n'est pas un conseiller financier",
        para2Part2Before:
          ", ni une institution financière, et ne détient ni ne déplace ton argent réel. Le score de santé financière, les projections d'investissement et toute estimation affichée dans l'app sont fournis ",
        para2Emphasis2: 'à titre informatif seulement',
        para2After:
          ", basés sur des calculs théoriques et sur les chiffres que tu entres toi-même — ils ne constituent pas un conseil financier, fiscal ou d'investissement professionnel.",
      },

      account: {
        title: '2. Compte utilisateur',
        items: [
          'Tu es responsable de garder ton mot de passe confidentiel et de toute activité effectuée depuis ton compte.',
          "Tu t'engages à fournir un courriel valide et des renseignements exacts lors de la création de ton compte.",
          'Un compte est destiné à un usage personnel, par une seule personne.',
          'Préviens-nous rapidement (voir section 9) si tu soupçonnes un accès non autorisé à ton compte.',
        ],
      },

      plans: {
        title: '3. Plans et paiements',
        intro: 'SaveUp propose actuellement trois plans :',
        items: [
          { label: 'Gratuit', desc: '0 $, sans limite de temps.' },
          { label: 'Standard', desc: '7,99 $/mois.' },
          { label: 'Premium', desc: '14,99 $/mois.' },
        ],
        para2Before: 'Les plans Standard et Premium ne sont ',
        para2Emphasis: "pas encore disponibles à l'achat",
        para2After:
          " (voir la page Tarifs) ; les conditions ci-dessous s'appliqueront dès leur mise en ligne.",
        para3:
          "Les abonnements payants sont facturés de façon récurrente (mensuellement) jusqu'à annulation. Tu peux annuler en tout temps ; l'annulation prend effet à la fin de la période déjà payée, sans remboursement de la portion entamée, sauf lorsque la loi l'exige.",
        para4Before: 'Les paiements sont traités par un fournisseur tiers sécurisé (',
        stripe: 'Stripe',
        para4After:
          '). SaveUp ne stocke, ne voit ni ne conserve aucune information de carte de crédit — ces renseignements transitent uniquement par Stripe.',
      },

      acceptableUse: {
        title: '4. Utilisation acceptable',
        intro: 'En utilisant SaveUp, tu t\'engages à ne pas :',
        items: [
          'utiliser le service à des fins illégales ou frauduleuses ;',
          "tenter de contourner, désactiver ou compromettre les mesures de sécurité de l'application ou de son infrastructure ;",
          'partager les identifiants de ton compte avec d\'autres personnes au-delà de l\'usage personnel prévu par ton plan (le suivi « multi-comptes » du plan Premium désigne le suivi de plusieurs comptes financiers personnels, pas le partage d\'un même identifiant SaveUp entre plusieurs personnes) ;',
          "tenter d'extraire massivement les données d'autres utilisateurs ou de perturber le fonctionnement du service.",
        ],
      },

      liability: {
        title: '5. Limitation de responsabilité',
        para1:
          "SaveUp fournit des outils d'aide à la décision financière personnelle. Les décisions financières que tu prends — combien épargner, combien dépenser, où investir — restent entièrement les tiennes ; SaveUp n'est pas responsable des conséquences de ces décisions.",
        para2:
          "Les projections, scores et calculs affichés sont théoriques et basés sur des hypothèses simplifiées (par exemple un taux de rendement constant) : ils peuvent différer significativement de la réalité et ne garantissent aucun résultat futur.",
        para3:
          "Dans la mesure permise par la loi, SaveUp est fourni « tel quel », sans garantie d'absence d'erreur ou d'interruption de service.",
      },

      termination: {
        title: '6. Résiliation',
        para1Before:
          'Tu peux fermer ton compte en tout temps en nous écrivant (voir section 9) — voir aussi la section « Conservation des données » de notre ',
        linkText: 'politique de confidentialité',
        para1After: ' pour ce qui advient de tes données ensuite.',
        para2:
          'SaveUp peut suspendre ou résilier un compte qui contrevient à la section 4 (Utilisation acceptable), après un avis raisonnable lorsque les circonstances le permettent.',
      },

      changes: {
        title: '7. Modifications des conditions',
        para1:
          'SaveUp peut mettre à jour ces conditions au fil de l\'évolution du service. Les changements mineurs prennent effet dès leur publication sur cette page ; les changements importants seront communiqués aux utilisateurs (par exemple par courriel ou avis dans l\'application) avant leur entrée en vigueur.',
      },

      governingLaw: {
        title: '8. Droit applicable',
        para1:
          'Ces conditions sont régies par les lois de la province de Québec et les lois du Canada applicables, sans égard aux principes de conflits de lois. Tout litige sera soumis à la compétence des tribunaux du Québec.',
      },

      contact: {
        title: '9. Nous contacter',
        intro: "Pour toute question sur ces conditions d'utilisation, écris-nous à :",
      },

      footerBefore: 'Voir aussi notre ',
      footerPrivacyLinkText: 'politique de confidentialité',
      footerMiddle: ' et notre ',
      footerPricingLinkText: 'page Tarifs',
      footerAfter: '.',
    },
  },

  en: {
    back: '← Back',
    lastUpdatedLabel: 'Last updated:',
    temporaryAddressNote:
      '(Temporary launch address — to be updated once SaveUp has an official contact address.)',

    privacy: {
      title: 'Privacy Policy',
      introBeforeAct:
        'SaveUp ("we", "the app") is a Québec-based personal budgeting app. This policy explains what personal information we collect, why, where it is stored, and what rights you have over your own data under ',
      actName: 'Act 25',
      introAfterAct:
        " (An Act to modernize legislative provisions as regards the protection of personal information, Québec).",

      dataCollected: {
        title: '1. What data we collect',
        intro: 'To function, SaveUp collects and retains the following information tied to your account:',
        items: [
          { label: 'Email', desc: 'used to create and secure your account.' },
          {
            label: 'Password',
            desc: 'never stored in plain text; managed and encrypted by our authentication provider (Supabase Auth), inaccessible to SaveUp itself.',
          },
          { label: 'Monthly income', desc: 'used to calculate your available budget.' },
          {
            label: 'Fixed and one-time expenses',
            desc: 'the description, amount, category, and date of each expense you log.',
          },
          { label: 'Custom categories', desc: 'the expense categories you create or rename.' },
          {
            label: 'Savings goals and contributions',
            desc: 'names, target amounts, deadlines, and your contribution history.',
          },
          { label: 'Amount invested', desc: 'the balance you track manually on the Investment page.' },
        ],
        outro:
          "We do not collect any data beyond what's listed above: no geolocation, no contacts, no real banking information (SaveUp does not connect to any financial institution — all amounts are entered manually by you).",
      },

      dataUse: {
        title: '2. How your data is used',
        para1Before: 'Your information is used ',
        para1Emphasis: 'exclusively',
        para1After:
          " to make SaveUp work for you: calculating your weekly and monthly budget, your financial health score, your investment projections, your progress toward your savings goals, and your reward badges.",
        para2:
          'We never sell, rent, or share your personal information with third parties for advertising or marketing purposes. There is no commercial profiling and no resale of data, in any form.',
      },

      dataStorage: {
        title: '3. Where your data is stored',
        para1Before: "Your data is hosted on ",
        supabase: 'Supabase',
        para1After: "'s infrastructure (a managed PostgreSQL database), our hosting and authentication provider.",
        items: [
          'All communication between the app and the database is encrypted in transit (HTTPS/TLS).',
          {
            before: 'Each account is isolated from others by row-level security rules (',
            emphasis: 'Row Level Security',
            after:
              "): a logged-in user can technically only read or modify their own data, never another account's.",
          },
          'Access to your account requires email-and-password authentication, with a secure password-reset option available.',
        ],
      },

      rights: {
        title: '4. Your rights',
        intro: 'In accordance with Act 25, you have the following rights over your personal information:',
        items: [
          {
            label: 'Right of access',
            desc: 'obtain a copy of the information we hold about you. You can already export most of your data yourself (Settings → Export your data), or write to us for a full copy.',
          },
          {
            label: 'Right of rectification',
            desc: 'correct information that is inaccurate or incomplete. Most fields can be edited directly in the app; for anything else, write to us.',
          },
          {
            label: 'Right to erasure',
            desc: 'request the deletion of your account and all data associated with it.',
          },
          {
            label: 'Right to withdraw consent',
            desc: 'at any time, which results in your account being closed, since the service cannot function without the information listed in section 1.',
          },
          {
            label: 'Right to data portability',
            desc: 'receive your data in a structured, readable format (CSV).',
          },
        ],
        outro:
          'To exercise any of these rights, write to us at the address listed in section 6. Self-service account deletion is not yet available directly in the app — until it is, all deletion requests are handled manually by email.',
      },

      retention: {
        title: '5. Data retention',
        para1: 'Your data is kept for as long as your account is active, in order to provide you the service.',
        para2Before:
          'When an account is deleted (at your request), its data is removed from our active database as soon as reasonably possible. Residual copies may temporarily remain in our security backups, purged within a maximum of ',
        days: '90 days',
        para2After: ' following deletion.',
      },

      contact: {
        title: '6. Contact us',
        intro:
          'For any question about this policy, to exercise any of your rights, or to report a concern related to the protection of your personal information, write to us at:',
      },

      cookies: {
        title: '7. Cookies and local storage',
        para1Before: 'SaveUp does not use ',
        para1Emphasis: 'any advertising or tracking cookies',
        para1After: ', and does not share any browsing data with third parties.',
        para2Before: 'The browser uses local storage (',
        localStorage: 'localStorage',
        para2After: ') solely for functional purposes:',
        items: [
          "keeping you signed in (authentication token), so you don't have to log in again on every visit;",
          "remembering which reward badges have already been shown to you, so a previously seen animation isn't replayed.",
        ],
        para3: 'None of this local storage data is transmitted to third parties or used for advertising purposes.',
      },

      footerBefore:
        'This policy may be updated as SaveUp evolves. Significant changes will be communicated to users. See also the ',
      footerLinkText: 'Pricing page',
      footerAfter: '.',
    },

    terms: {
      title: 'Terms of Service',
      introBefore:
        'By creating an account or using SaveUp, you agree to the terms described below. If you do not agree with any of them, you must not use the service. See also our ',
      introLinkText: 'Privacy Policy',
      introAfter: ', which forms an integral part of these terms.',

      service: {
        title: '1. Description of the service',
        para1:
          'SaveUp is a personal budgeting and savings-tracking tool: income, fixed and one-time expenses, savings goals, financial health score, and investment projections.',
        para2Part1Before: '',
        para2Emphasis1: 'SaveUp is not a financial advisor',
        para2Part2Before:
          ', nor a financial institution, and it does not hold or move your real money. The financial health score, investment projections, and any estimate shown in the app are provided ',
        para2Emphasis2: 'for informational purposes only',
        para2After:
          ', based on theoretical calculations and the figures you enter yourself — they do not constitute professional financial, tax, or investment advice.',
      },

      account: {
        title: '2. User account',
        items: [
          'You are responsible for keeping your password confidential and for any activity carried out from your account.',
          'You agree to provide a valid email address and accurate information when creating your account.',
          'An account is intended for personal use by a single person.',
          'Let us know promptly (see section 9) if you suspect unauthorized access to your account.',
        ],
      },

      plans: {
        title: '3. Plans and payments',
        intro: 'SaveUp currently offers three plans:',
        items: [
          { label: 'Free', desc: '$0, no time limit.' },
          { label: 'Standard', desc: '$7.99/month.' },
          { label: 'Premium', desc: '$14.99/month.' },
        ],
        para2Before: 'The Standard and Premium plans are ',
        para2Emphasis: 'not yet available for purchase',
        para2After: ' (see the Pricing page); the terms below will apply once they go live.',
        para3:
          'Paid subscriptions are billed on a recurring (monthly) basis until cancelled. You can cancel at any time; cancellation takes effect at the end of the period already paid for, with no refund for the unused portion, except where required by law.',
        para4Before: 'Payments are processed by a secure third-party provider (',
        stripe: 'Stripe',
        para4After: '). SaveUp does not store, see, or retain any credit card information — that information passes through Stripe only.',
      },

      acceptableUse: {
        title: '4. Acceptable use',
        intro: 'By using SaveUp, you agree not to:',
        items: [
          'use the service for illegal or fraudulent purposes;',
          'attempt to bypass, disable, or compromise the security measures of the app or its infrastructure;',
          'share your account credentials with other people beyond the personal use provided for by your plan (the Premium plan\'s "multi-account" tracking refers to tracking multiple personal financial accounts, not sharing a single SaveUp login among several people);',
          "attempt to bulk-extract other users' data or disrupt the operation of the service.",
        ],
      },

      liability: {
        title: '5. Limitation of liability',
        para1:
          'SaveUp provides tools to help with personal financial decision-making. The financial decisions you make — how much to save, how much to spend, where to invest — remain entirely your own; SaveUp is not responsible for the consequences of those decisions.',
        para2:
          'The projections, scores, and calculations shown are theoretical and based on simplified assumptions (for example, a constant rate of return): they may differ significantly from reality and do not guarantee any future outcome.',
        para3:
          'To the extent permitted by law, SaveUp is provided "as is", without warranty against errors or service interruptions.',
      },

      termination: {
        title: '6. Termination',
        para1Before:
          'You can close your account at any time by writing to us (see section 9) — see also the "Data retention" section of our ',
        linkText: 'Privacy Policy',
        para1After: ' for what happens to your data afterward.',
        para2:
          'SaveUp may suspend or terminate an account that violates section 4 (Acceptable use), following reasonable notice where circumstances allow.',
      },

      changes: {
        title: '7. Changes to these terms',
        para1:
          'SaveUp may update these terms as the service evolves. Minor changes take effect as soon as they are published on this page; significant changes will be communicated to users (for example by email or an in-app notice) before they take effect.',
      },

      governingLaw: {
        title: '8. Governing law',
        para1:
          'These terms are governed by the laws of the province of Québec and the applicable laws of Canada, without regard to conflict-of-law principles. Any dispute will be subject to the jurisdiction of the courts of Québec.',
      },

      contact: {
        title: '9. Contact us',
        intro: 'For any question about these Terms of Service, write to us at:',
      },

      footerBefore: 'See also our ',
      footerPrivacyLinkText: 'Privacy Policy',
      footerMiddle: ' and our ',
      footerPricingLinkText: 'Pricing page',
      footerAfter: '.',
    },
  },
}
