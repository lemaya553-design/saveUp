import type { Lang } from './language'

export interface DuelAcceptContent {
  notFoundTitle: string
  notFoundBody: string
  inviteTitle: (creatorDisplayName: string) => string
  inviteBody: (durationDays: number) => string
  noGoalsAtAll: string
  allGoalsBusy: string
  yourGoalLabel: string
  chooseOption: string
  displayNameLabel: string
  namePlaceholder: string
  shareGoalNameLabel: string
  whatOpponentSeesTitle: string
  whatOpponentSeesBody: string
  acceptFailedFallback: string
  accepting: string
  acceptDuelButton: string
}

export const DUEL_ACCEPT: Record<Lang, DuelAcceptContent> = {
  fr: {
    notFoundTitle: 'Invitation introuvable',
    notFoundBody: 'Ce lien est invalide, déjà utilisé, ou a expiré. Demande un nouveau lien à ton ami.',
    inviteTitle: (creatorDisplayName) => `${creatorDisplayName} t'invite à un duel d'épargne`,
    inviteBody: (durationDays) =>
      `Un duel de ${durationDays} jours — chacun garde son propre objectif et son propre argent. Vous verrez seulement le % de progression de l'autre.`,
    noGoalsAtAll: "Tu n'as pas encore d'objectif d'épargne — crées-en un avant d'accepter ce duel.",
    allGoalsBusy: 'Tous tes objectifs sont déjà engagés dans un autre duel.',
    yourGoalLabel: 'Ton objectif',
    chooseOption: '— Choisir —',
    displayNameLabel: 'Ton prénom (affiché à ton adversaire)',
    namePlaceholder: 'Ex : Alex',
    shareGoalNameLabel: 'Partager le nom de mon objectif avec mon adversaire (optionnel)',
    whatOpponentSeesTitle: 'Ce que voit ton adversaire',
    whatOpponentSeesBody:
      "Seulement ton prénom et ton % de progression. Jamais tes montants en dollars — et le nom de ton objectif seulement si tu coches la case ci-dessus.",
    acceptFailedFallback: "Impossible d'accepter ce duel.",
    accepting: 'Acceptation...',
    acceptDuelButton: 'Accepter le duel',
  },
  en: {
    notFoundTitle: 'Invite not found',
    notFoundBody: 'This link is invalid, already used, or has expired. Ask your friend for a new link.',
    inviteTitle: (creatorDisplayName) => `${creatorDisplayName} is inviting you to a savings duel`,
    inviteBody: (durationDays) =>
      `A ${durationDays}-day duel — you each keep your own goal and your own money. You'll only see the other's % progress.`,
    noGoalsAtAll: "You don't have a savings goal yet — create one before accepting this duel.",
    allGoalsBusy: 'All your goals are already committed to another duel.',
    yourGoalLabel: 'Your goal',
    chooseOption: '— Choose —',
    displayNameLabel: 'Your first name (shown to your opponent)',
    namePlaceholder: 'E.g. Alex',
    shareGoalNameLabel: 'Share my goal name with my opponent (optional)',
    whatOpponentSeesTitle: 'What your opponent sees',
    whatOpponentSeesBody:
      'Only your first name and your % progress. Never your dollar amounts — and your goal name only if you check the box above.',
    acceptFailedFallback: 'Could not accept this duel.',
    accepting: 'Accepting...',
    acceptDuelButton: 'Accept the duel',
  },
}
