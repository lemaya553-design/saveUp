import type { Lang } from './language'

// Hook-specific error strings that aren't generic enough to live in
// common.ts (COMMON[lang].app.sessionExpired / saveFailed cover the ones
// that repeat verbatim across hooks — see useAccounts.ts, useCategories.ts,
// useExpenses.ts, useFixedExpenses.ts, useSavingsGoals.ts, useSubscription.ts
// for where those shared keys are used instead of entries here).
export interface HookErrorsContent {
  accounts: {
    nameEmpty: string
    nameExists: string
    createFailed: string
  }
  categories: {
    // `name` is FALLBACK_CATEGORY (an app constant, e.g. "Autre"/"Other"),
    // never user-entered data.
    cannotDeleteFallback: (name: string) => string
  }
  duels: {
    // Only the hardcoded fallbacks used when the RPC itself didn't return an
    // rpcError.message — most real duel error text comes from Postgres
    // RAISE EXCEPTION strings server-side and is deliberately left untranslated
    // (see supabase/schema.sql), passed through as-is.
    createFailed: string
    acceptFailed: string
  }
  savingsGoals: {
    notSignedIn: string
    photoUploadFailed: string
  }
  subscription: {
    genericError: string
    badResponse: (status: number) => string
    unexpectedResponse: string
    networkError: string
  }
}

export const HOOK_ERRORS: Record<Lang, HookErrorsContent> = {
  fr: {
    accounts: {
      nameEmpty: 'Le nom du compte ne peut pas être vide.',
      nameExists: 'Ce nom de compte existe déjà.',
      createFailed: 'Impossible de créer ce compte.',
    },
    categories: {
      cannotDeleteFallback: (name) => `La catégorie « ${name} » ne peut pas être supprimée.`,
    },
    duels: {
      createFailed: 'Impossible de créer le duel.',
      acceptFailed: "Impossible d'accepter ce duel.",
    },
    savingsGoals: {
      notSignedIn: 'Non connecté.',
      photoUploadFailed: "Impossible d'envoyer la photo — réessaie.",
    },
    subscription: {
      genericError: 'Une erreur est survenue — réessaie.',
      badResponse: (status) =>
        `Le service de paiement n'a pas répondu correctement (code ${status}) — réessaie dans un instant.`,
      unexpectedResponse: 'Réponse inattendue du service de paiement — réessaie.',
      networkError: 'Impossible de contacter le service de paiement — vérifie ta connexion et réessaie.',
    },
  },
  en: {
    accounts: {
      nameEmpty: "Account name can't be empty.",
      nameExists: 'That account name already exists.',
      createFailed: "Couldn't create this account.",
    },
    categories: {
      cannotDeleteFallback: (name) => `The "${name}" category can't be deleted.`,
    },
    duels: {
      createFailed: "Couldn't create the duel.",
      acceptFailed: "Couldn't accept this duel.",
    },
    savingsGoals: {
      notSignedIn: 'Not signed in.',
      photoUploadFailed: "Couldn't upload the photo — try again.",
    },
    subscription: {
      genericError: 'Something went wrong — try again.',
      badResponse: (status) =>
        `The payment service didn't respond correctly (code ${status}) — try again in a moment.`,
      unexpectedResponse: 'Unexpected response from the payment service — try again.',
      networkError: "Couldn't reach the payment service — check your connection and try again.",
    },
  },
}
