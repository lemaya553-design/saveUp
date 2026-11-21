import { computeSavingsRegularity } from './financialHealth'
import type { Lang } from './i18n/language'

// Badge catalog/unlock logic lives in lib/badges.ts — this file is now just
// the "Score d'épargne" gauge (RecompensesTab's score card), a separate
// feature that predates the badge system and isn't itself a badge.

export interface SavingsScoreBreakdown {
  score: number
  amountScore: number
  regularityScore: number
  referenceAmount: number
}

// 0-100: how much has been saved relative to the active goal (or a $1000
// reference if no goal is set yet), blended with how regularly the user
// actually contributes — not just the total. Returns both sub-scores so
// the UI can explain what's moving the number, not just show it.
export function computeSavingsScoreBreakdown(
  currentAmount: number,
  targetAmount: number,
  contributions: { created_at: string }[],
  now = new Date(),
): SavingsScoreBreakdown {
  const referenceAmount = targetAmount > 0 ? targetAmount : 1000
  const amountScore = Math.round(Math.min(100, (currentAmount / referenceAmount) * 100))
  const regularityScore = Math.round(computeSavingsRegularity(contributions, now) * 100)
  const score = Math.round(0.6 * amountScore + 0.4 * regularityScore)
  return { score, amountScore, regularityScore, referenceAmount }
}

export interface SavingsScoreExplanation {
  label: string
  value: number
  max: number
  detail: string
}

export function getSavingsScoreExplanations(
  breakdown: SavingsScoreBreakdown,
  lang: Lang,
): SavingsScoreExplanation[] {
  if (lang === 'en') {
    return [
      {
        label: 'Amount saved',
        value: breakdown.amountScore,
        max: 100,
        detail:
          breakdown.amountScore >= 70
            ? "You're well on your way to your goal."
            : breakdown.amountScore >= 30
              ? "You're making progress — keep adding to your savings."
              : 'Add to your savings to move this score up.',
      },
      {
        label: 'Regularity',
        value: breakdown.regularityScore,
        max: 100,
        detail:
          breakdown.regularityScore >= 70
            ? 'You save regularly — that makes all the difference.'
            : breakdown.regularityScore >= 30
              ? 'Save a bit more often to improve this score.'
              : 'No recent regular savings — even a small amount each week helps.',
      },
    ]
  }
  return [
    {
      label: 'Montant épargné',
      value: breakdown.amountScore,
      max: 100,
      detail:
        breakdown.amountScore >= 70
          ? 'Tu es bien avancé vers ton objectif.'
          : breakdown.amountScore >= 30
            ? 'Tu progresses — continue d’ajouter à ton épargne.'
            : 'Ajoute à ton épargne pour faire progresser ce score.',
    },
    {
      label: 'Régularité',
      value: breakdown.regularityScore,
      max: 100,
      detail:
        breakdown.regularityScore >= 70
          ? 'Tu épargnes régulièrement, ça fait toute la différence.'
          : breakdown.regularityScore >= 30
            ? 'Épargne un peu plus souvent pour améliorer ce score.'
            : 'Aucune épargne régulière récente — même un petit montant chaque semaine aide.',
    },
  ]
}
