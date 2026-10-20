import type { Lang } from './language'

// The WhatsApp opt-in step (src/pages/WhatsappOptIn.tsx) — a single-purpose
// screen between signup and the onboarding quiz, styled like Connexion.tsx/
// Onboarding.tsx's literal black/orange/white identity rather than the
// app's theme-aware chrome, since it sits in that same pre-dashboard flow.
export interface WhatsappOptInContent {
  heading: string
  subtitle: string
  phoneLabel: string
  phonePlaceholder: string
  countryLabel: string
  countrySearchPlaceholder: string
  privacyNote: string
  consentLabel: string
  continueButton: string
  skipButton: string
  submitting: string
  errors: {
    invalidNumber: string
    saveFailed: string
  }
}

export const WHATSAPP_OPT_IN: Record<Lang, WhatsappOptInContent> = {
  fr: {
    heading: 'Ton numéro WhatsApp (optionnel)',
    subtitle: 'Si tu le donnes, on peut t’aider à démarrer directement sur WhatsApp. Sinon, aucun problème.',
    phoneLabel: 'Numéro de téléphone',
    phonePlaceholder: '514 555 0199',
    countryLabel: 'Indicatif',
    countrySearchPlaceholder: 'Rechercher un pays...',
    privacyNote:
      'On ne s’en sert que pour t’écrire sur WhatsApp, jamais pour autre chose, et jamais revendu. Laisse ce champ vide si tu préfères ne pas le donner.',
    consentLabel: 'J’accepte d’être contacté par WhatsApp par l’équipe SaveUp.',
    continueButton: 'Continuer',
    skipButton: 'Passer cette étape',
    submitting: 'Enregistrement...',
    errors: {
      invalidNumber: 'Ce numéro ne semble pas valide — vérifie l’indicatif et le numéro.',
      saveFailed: 'Impossible d’enregistrer ton numéro — réessaie.',
    },
  },
  en: {
    heading: 'Your WhatsApp number (optional)',
    subtitle: 'If you give it, we can help you get started right on WhatsApp. If not, that’s totally fine.',
    phoneLabel: 'Phone number',
    phonePlaceholder: '514 555 0199',
    countryLabel: 'Country code',
    countrySearchPlaceholder: 'Search for a country...',
    privacyNote:
      'Only ever used to message you on WhatsApp, never for anything else, never sold. Leave this blank if you’d rather not share it.',
    consentLabel: 'I agree to be contacted on WhatsApp by the SaveUp team.',
    continueButton: 'Continue',
    skipButton: 'Skip this step',
    submitting: 'Saving...',
    errors: {
      invalidNumber: 'This number doesn’t look valid — check the country code and number.',
      saveFailed: 'Could not save your number — try again.',
    },
  },
}
