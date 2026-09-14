import type { Lang } from './language'

export interface ParametresContent {
  pageHeader: { title: string; subtitle: string }
  tabs: { compte: string; abonnement: string; preferences: string }
  help: {
    compte: { title: string; purpose: string; actions: string[] }
    abonnement: { title: string; purpose: string; actions: string[] }
    preferences: { title: string; purpose: string; actions: string[] }
  }
  toasts: {
    subscriptionActivated: string
  }
  compte: {
    legal: {
      title: string
      hint: string
      privacyLink: string
      termsLink: string
    }
    app: {
      title: string
      hint: string
      installed: string
      unsupported: string
      reopenPrompt: string
    }
  }
  abonnement: {
    cardTitle: string
    cardHint: string
    trialBadge: string
    seePlans: string
    // Interpolates the locale-formatted trial-end date, the plan's monthly
    // price (already formatted with currency), and the exact label of the
    // "manage subscription" button so the sentence can point at it by name
    // in either language.
    trialEndsSentence: (date: string, price: string, manageLabel: string) => string
  }
  personalization: {
    cardTitle: string
    cardHint: string
    accentColor: string
    theme: string
    dark: string
    light: string
    avatar: string
    avatarAriaLabel: (emoji: string) => string
  }
}

export const PARAMETRES: Record<Lang, ParametresContent> = {
  fr: {
    pageHeader: {
      title: 'Paramètres',
      subtitle: 'Ton compte, ton abonnement, et tes préférences.',
    },
    tabs: {
      compte: 'Compte',
      abonnement: 'Abonnement',
      preferences: 'Préférences',
    },
    help: {
      compte: {
        title: 'Compte',
        purpose: 'Ton revenu mensuel, et les infos légales sur SaveUp.',
        actions: [
          "Modifie ton revenu mensuel — le reste de l'app se recalcule automatiquement.",
          "Consulte la politique de confidentialité et les conditions d'utilisation.",
        ],
      },
      abonnement: {
        title: 'Abonnement',
        purpose: "Ton plan actuel, ce qu'il débloque, et la gestion de ton abonnement.",
        actions: [
          "Consulte ton plan actuel et la date de fin de ton essai, s'il y a lieu.",
          'Passe à un plan supérieur ou gère/annule ton abonnement.',
        ],
      },
      preferences: {
        title: 'Préférences',
        purpose: "L'apparence de SaveUp, juste pour toi.",
        actions: ["Choisis ta couleur d'accent et ton thème.", 'Personnalise ton avatar.'],
      },
    },
    toasts: {
      subscriptionActivated: 'Abonnement activé — merci !',
    },
    compte: {
      legal: {
        title: 'Légal',
        hint: 'Quelles données on garde, comment elles sont utilisées, et les conditions du service.',
        privacyLink: 'Voir la politique de confidentialité →',
        termsLink: "Voir les conditions d'utilisation →",
      },
      app: {
        title: 'Application',
        hint: "Ajoute SaveUp à ton écran d'accueil pour un accès plus rapide.",
        installed: '✅ SaveUp est installée sur cet appareil.',
        unsupported: "L'installation n'est pas proposée par ce navigateur.",
        reopenPrompt: "Revoir l'invite d'installation",
      },
    },
    abonnement: {
      cardTitle: 'Mon abonnement',
      cardHint: "Ton plan actuel et ce qu'il débloque.",
      trialBadge: 'Essai gratuit',
      seePlans: 'Voir les plans',
      trialEndsSentence: (date, price, manageLabel) =>
        `Ton essai se termine le ${date}. Ensuite, ${price}/mois — annule avant cette date depuis « ${manageLabel} » pour ne rien payer.`,
    },
    personalization: {
      cardTitle: 'Personnalisation',
      cardHint: "L'apparence de SaveUp, juste pour toi.",
      accentColor: "Couleur d'accent",
      theme: 'Thème',
      dark: 'Sombre',
      light: 'Clair',
      avatar: 'Avatar',
      avatarAriaLabel: (emoji) => `Avatar ${emoji}`,
    },
  },
  en: {
    pageHeader: {
      title: 'Settings',
      subtitle: 'Your account, your subscription, and your preferences.',
    },
    tabs: {
      compte: 'Account',
      abonnement: 'Subscription',
      preferences: 'Preferences',
    },
    help: {
      compte: {
        title: 'Account',
        purpose: "Your monthly income, and SaveUp's legal info.",
        actions: [
          'Update your monthly income — the rest of the app recalculates automatically.',
          'Check out the privacy policy and terms of service.',
        ],
      },
      abonnement: {
        title: 'Subscription',
        purpose: 'Your current plan, what it unlocks, and managing your subscription.',
        actions: [
          "Check your current plan and your trial end date, if you're on one.",
          'Upgrade to a higher plan, or manage/cancel your subscription.',
        ],
      },
      preferences: {
        title: 'Preferences',
        purpose: "SaveUp's look, just for you.",
        actions: ['Choose your accent color and theme.', 'Personalize your avatar.'],
      },
    },
    toasts: {
      subscriptionActivated: 'Subscription activated — thank you!',
    },
    compte: {
      legal: {
        title: 'Legal',
        hint: "What data we keep, how it's used, and the terms of the service.",
        privacyLink: 'See the privacy policy →',
        termsLink: 'See the terms of service →',
      },
      app: {
        title: 'App',
        hint: 'Add SaveUp to your home screen for quicker access.',
        installed: '✅ SaveUp is installed on this device.',
        unsupported: "This browser doesn't offer installation.",
        reopenPrompt: 'Show the install prompt again',
      },
    },
    abonnement: {
      cardTitle: 'My subscription',
      cardHint: 'Your current plan and what it unlocks.',
      trialBadge: 'Free trial',
      seePlans: 'See plans',
      trialEndsSentence: (date, price, manageLabel) =>
        `Your trial ends on ${date}. After that, it's ${price}/month — cancel before then from "${manageLabel}" to avoid being charged.`,
    },
    personalization: {
      cardTitle: 'Personalization',
      cardHint: "SaveUp's look, just for you.",
      accentColor: 'Accent color',
      theme: 'Theme',
      dark: 'Dark',
      light: 'Light',
      avatar: 'Avatar',
      avatarAriaLabel: (emoji) => `Avatar ${emoji}`,
    },
  },
}
