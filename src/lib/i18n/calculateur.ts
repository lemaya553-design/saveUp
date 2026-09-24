import type { Lang } from './language'

// src/pages/Calculateur.tsx — public, unauthenticated, standalone page (not
// part of the signed-in app or its usual chrome). The hours-worked
// breakdown itself reuses COMMON[lang].workHours (same minutes/hours/
// hoursAndDays copy the in-app feature uses) rather than duplicating it here.
export interface CalculateurContent {
  meta: {
    title: string
    description: string
  }
  heading: string
  subtitle: string
  amountLabel: string
  amountPlaceholder: string
  hourlyRateLabel: string
  hourlyRatePlaceholder: string
  resultEmpty: string
  shareButton: string
  shareGenerating: string
  downloadButton: string
  copiedConfirmation: string
  shareError: string
  shareCard: {
    tagline: string
  }
  ctaPrefix: string
  ctaLink: string
}

export const CALCULATEUR: Record<Lang, CalculateurContent> = {
  fr: {
    meta: {
      title: 'Calculateur — Combien d’heures de travail ? | SaveUp',
      description:
        'Entre un montant et ton salaire horaire net pour voir combien d’heures de travail ça représente vraiment.',
    },
    heading: 'Combien d’heures de travail pour ça ?',
    subtitle:
        'Un montant en dollars est abstrait. Des heures de ta propre vie, non. Entre un montant et ton salaire horaire net.',
    amountLabel: 'Montant',
    amountPlaceholder: '0.00',
    hourlyRateLabel: 'Ton salaire horaire net',
    hourlyRatePlaceholder: '0.00',
    resultEmpty: 'Entre un montant et un taux horaire pour voir le résultat.',
    shareButton: 'Partager',
    shareGenerating: 'Génération...',
    downloadButton: "Télécharger l'image",
    copiedConfirmation: 'Image copiée !',
    shareError: "Impossible de générer l'image sur cet appareil — essaie le téléchargement.",
    shareCard: {
      tagline: 'Combien d’heures de travail ?',
    },
    ctaPrefix: 'Envie de voir ça pour toutes tes dépenses ? ',
    ctaLink: 'Essaie SaveUp gratuitement',
  },
  en: {
    meta: {
      title: 'Calculator — How many hours of work? | SaveUp',
      description: 'Enter an amount and your net hourly rate to see how many hours of work it really represents.',
    },
    heading: 'How many hours of work is that?',
    subtitle:
        "A dollar amount is abstract. Hours of your own life aren't. Enter an amount and your net hourly rate.",
    amountLabel: 'Amount',
    amountPlaceholder: '0.00',
    hourlyRateLabel: 'Your net hourly rate',
    hourlyRatePlaceholder: '0.00',
    resultEmpty: 'Enter an amount and an hourly rate to see the result.',
    shareButton: 'Share',
    shareGenerating: 'Generating...',
    downloadButton: 'Download image',
    copiedConfirmation: 'Image copied!',
    shareError: "Couldn't generate the image on this device — try downloading instead.",
    shareCard: {
      tagline: 'How many hours of work?',
    },
    ctaPrefix: 'Want to see this for all your spending? ',
    ctaLink: 'Try SaveUp for free',
  },
}
