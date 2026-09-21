import type { Lang } from './language'

// Strings for Connexion.tsx — sign-in / sign-up / forgot-password /
// reset-password / email-confirmation-sent flows. Strings that come back
// from useAuth()'s mapAuthError() are NOT covered here (different scope) —
// only text literally written inside Connexion.tsx itself.
export interface ConnexionContent {
  common: {
    submitting: string
    backToSignIn: string
    checkYourEmail: string
    emailLabel: string
    emailPlaceholder: string
    passwordLabel: string
    newPasswordLabel: string
    confirmPasswordLabel: string
  }
  errors: {
    linkExpired: string
    linkInvalid: string
    signInMissingFields: string
    signUpMissingFields: string
    passwordTooShort: string
    passwordMismatch: string
    forgotMissingEmail: string
  }
  resend: {
    sent: string
  }
  recovery: {
    title: string
    subtitle: string
    submit: string
  }
  confirmationSent: {
    bodyPrefix: string
    bodySuffix: string
    spamPrefix: string
    spamBold: string
    spamSuffix: string
    resendIdle: string
    resendBusy: string
  }
  forgot: {
    title: string
    subtitle: string
    submit: string
    linkSentPrefix: string
    linkSentSuffix: string
  }
  signInUp: {
    signInTitle: string
    signUpTitle: string
    signInSubtitle: string
    signUpSubtitle: string
    googleContinue: string
    googleSignUp: string
    googleRedirecting: string
    // Only shown under the Google button in signup mode — addresses the
    // specific hesitation OAuth triggers for an unfamiliar product (fear of
    // auto-posting, broad account access) right before the moment someone
    // decides whether to click through to Google's consent screen at all.
    googleReassurance: string
    noAccountHint: string
    createAccount: string
    useEmailInstead: string
    orWithEmail: string
    forgotPasswordLink: string
    signInSubmit: string
    signUpSubmit: string
    noAccountYet: string
    signUpLink: string
    alreadyAccount: string
    signInLink: string
  }
}

export const CONNEXION: Record<Lang, ConnexionContent> = {
  fr: {
    common: {
      submitting: 'Un instant...',
      backToSignIn: 'Retour à la connexion',
      checkYourEmail: 'Vérifie ta boîte courriel',
      emailLabel: 'Courriel',
      emailPlaceholder: 'toi@exemple.com',
      passwordLabel: 'Mot de passe',
      newPasswordLabel: 'Nouveau mot de passe',
      confirmPasswordLabel: 'Confirme le mot de passe',
    },
    errors: {
      linkExpired: 'Ce lien de réinitialisation a expiré. Demande-en un nouveau ci-dessous.',
      linkInvalid: "Ce lien n'est plus valide. Demande-en un nouveau ci-dessous.",
      signInMissingFields: 'Entre ton courriel et ton mot de passe.',
      signUpMissingFields: 'Entre un courriel et un mot de passe.',
      passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères.',
      passwordMismatch: 'Les mots de passe ne correspondent pas.',
      forgotMissingEmail: 'Entre ton courriel.',
    },
    resend: {
      sent: 'Courriel renvoyé.',
    },
    recovery: {
      title: 'Choisis un nouveau mot de passe',
      subtitle: "Ton nouveau mot de passe remplace l'ancien immédiatement.",
      submit: 'Enregistrer le nouveau mot de passe',
    },
    confirmationSent: {
      bodyPrefix: 'On a envoyé un lien de confirmation à ',
      bodySuffix: '. Clique-le pour activer ton compte, puis reviens te connecter ici.',
      spamPrefix: 'Rien reçu après quelques minutes ? Vérifie ton dossier',
      spamBold: ' indésirables / pourriels',
      spamSuffix: " — c'est souvent là qu'il atterrit.",
      resendIdle: 'Renvoyer le courriel',
      resendBusy: 'Envoi...',
    },
    forgot: {
      title: 'Mot de passe oublié',
      subtitle: "Entre ton courriel — on t'envoie un lien pour en choisir un nouveau.",
      submit: 'Envoyer le lien',
      linkSentPrefix: 'Si un compte existe avec ',
      linkSentSuffix: ", un lien pour réinitialiser le mot de passe vient d'être envoyé.",
    },
    signInUp: {
      signInTitle: 'Content de te revoir',
      signUpTitle: 'Crée ton compte',
      signInSubtitle: 'Connecte-toi pour retrouver ton budget.',
      signUpSubtitle: 'Un courriel, un mot de passe — tes données restent les tiennes.',
      googleContinue: 'Continuer avec Google',
      googleSignUp: "S'inscrire avec Google",
      googleRedirecting: 'Redirection...',
      googleReassurance: 'On ne demande que ton nom et ton courriel — rien n\'est jamais publié en ton nom.',
      noAccountHint: 'Aucun compte avec ce courriel — tu veux en créer un ?',
      createAccount: 'Créer un compte',
      useEmailInstead: 'ou utiliser un courriel',
      orWithEmail: 'ou avec un courriel',
      forgotPasswordLink: 'Mot de passe oublié ?',
      signInSubmit: 'Se connecter',
      signUpSubmit: 'Créer mon compte',
      noAccountYet: 'Pas encore de compte ?',
      signUpLink: 'Inscris-toi',
      alreadyAccount: 'Déjà un compte ?',
      signInLink: 'Connecte-toi',
    },
  },
  en: {
    common: {
      submitting: 'One sec...',
      backToSignIn: 'Back to sign in',
      checkYourEmail: 'Check your inbox',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      newPasswordLabel: 'New password',
      confirmPasswordLabel: 'Confirm password',
    },
    errors: {
      linkExpired: 'This reset link has expired. Request a new one below.',
      linkInvalid: "This link isn't valid anymore. Request a new one below.",
      signInMissingFields: 'Enter your email and password.',
      signUpMissingFields: 'Enter an email and password.',
      passwordTooShort: 'Password must be at least 6 characters.',
      passwordMismatch: "Passwords don't match.",
      forgotMissingEmail: 'Enter your email.',
    },
    resend: {
      sent: 'Email resent.',
    },
    recovery: {
      title: 'Choose a new password',
      subtitle: 'Your new password replaces the old one immediately.',
      submit: 'Save new password',
    },
    confirmationSent: {
      bodyPrefix: 'We sent a confirmation link to ',
      bodySuffix: '. Click it to activate your account, then come back here to sign in.',
      spamPrefix: "Nothing after a few minutes? Check your",
      spamBold: ' spam / junk',
      spamSuffix: ' folder — that\'s usually where it ends up.',
      resendIdle: 'Resend email',
      resendBusy: 'Sending...',
    },
    forgot: {
      title: 'Forgot password',
      subtitle: "Enter your email — we'll send you a link to choose a new one.",
      submit: 'Send link',
      linkSentPrefix: 'If an account exists for ',
      linkSentSuffix: ', a password reset link was just sent.',
    },
    signInUp: {
      signInTitle: 'Welcome back',
      signUpTitle: 'Create your account',
      signInSubtitle: 'Sign in to get back to your budget.',
      signUpSubtitle: 'An email, a password — your data stays yours.',
      googleContinue: 'Continue with Google',
      googleSignUp: 'Sign up with Google',
      googleRedirecting: 'Redirecting...',
      googleReassurance: "We only ask for your name and email — nothing is ever posted on your behalf.",
      noAccountHint: "No account with this email — want to create one?",
      createAccount: 'Create account',
      useEmailInstead: 'or use an email',
      orWithEmail: 'or with an email',
      forgotPasswordLink: 'Forgot password?',
      signInSubmit: 'Sign in',
      signUpSubmit: 'Create my account',
      noAccountYet: "Don't have an account yet?",
      signUpLink: 'Sign up',
      alreadyAccount: 'Already have an account?',
      signInLink: 'Sign in',
    },
  },
}
