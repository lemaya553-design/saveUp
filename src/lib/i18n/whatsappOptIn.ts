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
  privacyNote: string
  consentLabel: string
  continueButton: string
  submitting: string
  errors: {
    invalidNumber: string
    saveFailed: string
  }
}

export const WHATSAPP_OPT_IN: Record<Lang, WhatsappOptInContent> = {
  fr: {
    heading: 'Mets ton numéro WhatsApp',
    subtitle: 'On s’en sert pour t’aider à démarrer avec SaveUp.',
    phoneLabel: 'Numéro de téléphone',
    phonePlaceholder: '514 555 0199',
    countryLabel: 'Indicatif',
    privacyNote: 'On t’écrit sur WhatsApp pour t’aider à démarrer. Pas de spam.',
    consentLabel: 'J’accepte d’être contacté par WhatsApp par l’équipe SaveUp.',
    continueButton: 'Continuer',
    submitting: 'Enregistrement...',
    errors: {
      invalidNumber: 'Ce numéro ne semble pas valide — vérifie l’indicatif et le numéro.',
      saveFailed: 'Impossible d’enregistrer ton numéro — réessaie.',
    },
  },
  en: {
    heading: 'Add your WhatsApp number',
    subtitle: 'We use it to help you get started with SaveUp.',
    phoneLabel: 'Phone number',
    phonePlaceholder: '514 555 0199',
    countryLabel: 'Country code',
    privacyNote: 'We text you on WhatsApp to help you get started. No spam.',
    consentLabel: 'I agree to be contacted on WhatsApp by the SaveUp team.',
    continueButton: 'Continue',
    submitting: 'Saving...',
    errors: {
      invalidNumber: 'This number doesn’t look valid — check the country code and number.',
      saveFailed: 'Could not save your number — try again.',
    },
  },
}
