import type { Lang } from './language'

export interface CalendrierContent {
  pageHeader: { title: string; subtitle: string }
  help: { title: string; purpose: string; actions: string[] }
  monthNav: {
    prev: string
    next: string
    today: string
  }
  stats: {
    average: string
    noAverage: string
    notedDays: (count: number) => string
    savedThisMonth: string
  }
  // The new "zone de moyennes" at the top of the page — always anchored to
  // today's real week/month/year, independent of which month is browsed
  // below (that one keeps using `stats.average` above).
  topStats: {
    week: string
    month: string
    year: string
  }
  weekdaysShort: [string, string, string, string, string, string, string]
  savingsIndicatorLabel: (date: string) => string
  dayAriaLabel: (date: string, rating: number | null) => string
  modal: {
    title: (date: string) => string
    ratingLabel: string
    descriptionLabel: string
    descriptionPlaceholder: string
    descriptionCounter: (used: number, max: number) => string
    saving: string
    saved: string
    saveError: string
    retry: string
    clear: string
    clearConfirmQuestion: string
    clearConfirmYes: string
  }
  mobile: {
    noNote: string
    weekLabel: (weekStart: string, weekEnd: string) => string
  }
}

export const CALENDRIER: Record<Lang, CalendrierContent> = {
  fr: {
    pageHeader: {
      title: 'Calendrier',
      subtitle: 'Note chaque journée sur 10, avec une courte description si tu veux.',
    },
    help: {
      title: 'Calendrier',
      purpose:
        'Un calendrier mensuel pour noter tes journées de 0 à 10 et garder une courte note avec. Les jours où tu as ajouté de l’épargne sont aussi repérés.',
      actions: [
        'Clique sur une case pour noter (ou modifier la note) de cette journée — tout s’enregistre automatiquement.',
        'Utilise les flèches pour changer de mois, ou « Aujourd’hui » pour revenir au mois courant.',
        'Tes notes sont privées — seul toi peux les voir.',
      ],
    },
    monthNav: {
      prev: 'Mois précédent',
      next: 'Mois suivant',
      today: "Aujourd'hui",
    },
    stats: {
      average: 'Moyenne du mois',
      noAverage: '—',
      notedDays: (count) => `${count} jour${count > 1 ? 's' : ''} noté${count > 1 ? 's' : ''}`,
      savedThisMonth: 'Épargné ce mois-ci',
    },
    topStats: {
      week: 'Cette semaine',
      month: 'Ce mois-ci',
      year: 'Cette année',
    },
    weekdaysShort: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    savingsIndicatorLabel: (date) => `Épargne ajoutée le ${date}`,
    dayAriaLabel: (date, rating) => (rating === null ? `${date}, aucune note` : `${date}, note de ${rating} sur 10`),
    modal: {
      title: (date) => date,
      ratingLabel: 'Ta note sur 10',
      descriptionLabel: 'Petite description (optionnel)',
      descriptionPlaceholder: "C'était comment, cette journée-là ?",
      descriptionCounter: (used, max) => `${used}/${max}`,
      saving: 'Enregistrement…',
      saved: 'Enregistré',
      saveError: "L'enregistrement a échoué.",
      retry: 'Réessayer',
      clear: 'Effacer la note',
      clearConfirmQuestion: 'Effacer cette note pour de bon ?',
      clearConfirmYes: 'Oui, effacer',
    },
    mobile: {
      noNote: 'Aucune note',
      weekLabel: (weekStart, weekEnd) => `${weekStart} – ${weekEnd}`,
    },
  },
  en: {
    pageHeader: {
      title: 'Calendar',
      subtitle: 'Rate each day out of 10, with a short description if you want.',
    },
    help: {
      title: 'Calendar',
      purpose:
        'A monthly calendar to rate your days from 0 to 10 and keep a short note with it. Days you added savings to are marked too.',
      actions: [
        'Click a day to rate (or edit the rating for) that day — everything saves automatically.',
        'Use the arrows to change month, or "Today" to jump back to the current one.',
        'Your notes are private — only you can see them.',
      ],
    },
    monthNav: {
      prev: 'Previous month',
      next: 'Next month',
      today: 'Today',
    },
    stats: {
      average: 'Month average',
      noAverage: '—',
      notedDays: (count) => `${count} day${count > 1 ? 's' : ''} rated`,
      savedThisMonth: 'Saved this month',
    },
    topStats: {
      week: 'This week',
      month: 'This month',
      year: 'This year',
    },
    weekdaysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    savingsIndicatorLabel: (date) => `Savings added on ${date}`,
    dayAriaLabel: (date, rating) => (rating === null ? `${date}, no rating` : `${date}, rated ${rating} out of 10`),
    modal: {
      title: (date) => date,
      ratingLabel: 'Your rating out of 10',
      descriptionLabel: 'Short description (optional)',
      descriptionPlaceholder: 'How was that day?',
      descriptionCounter: (used, max) => `${used}/${max}`,
      saving: 'Saving…',
      saved: 'Saved',
      saveError: "Couldn't save.",
      retry: 'Retry',
      clear: 'Clear rating',
      clearConfirmQuestion: 'Clear this rating for good?',
      clearConfirmYes: 'Yes, clear it',
    },
    mobile: {
      noNote: 'No rating',
      weekLabel: (weekStart, weekEnd) => `${weekStart} – ${weekEnd}`,
    },
  },
}
