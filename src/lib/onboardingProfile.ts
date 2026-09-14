import type { Lang } from './i18n/language'

export type MainGoal = 'epargner' | 'dettes' | 'comprendre' | 'autre'
export type TrackingFrequency = 'quotidien' | 'hebdomadaire' | 'mensuel'

const MAIN_GOAL_OPTIONS_BY_LANG: Record<Lang, { value: MainGoal; label: string }[]> = {
  fr: [
    { value: 'epargner', label: 'Épargner pour un projet' },
    { value: 'dettes', label: 'Réduire mes dettes' },
    { value: 'comprendre', label: 'Mieux comprendre mes dépenses' },
    { value: 'autre', label: 'Autre chose' },
  ],
  en: [
    { value: 'epargner', label: 'Save up for something' },
    { value: 'dettes', label: 'Pay down my debt' },
    { value: 'comprendre', label: 'Better understand my spending' },
    { value: 'autre', label: 'Something else' },
  ],
}

const FREQUENCY_OPTIONS_BY_LANG: Record<Lang, { value: TrackingFrequency; label: string }[]> = {
  fr: [
    { value: 'quotidien', label: 'Au quotidien' },
    { value: 'hebdomadaire', label: 'Chaque semaine' },
    { value: 'mensuel', label: 'Une fois par mois' },
  ],
  en: [
    { value: 'quotidien', label: 'Daily' },
    { value: 'hebdomadaire', label: 'Every week' },
    { value: 'mensuel', label: 'Once a month' },
  ],
}

export function getMainGoalOptions(lang: Lang) {
  return MAIN_GOAL_OPTIONS_BY_LANG[lang]
}

export function getFrequencyOptions(lang: Lang) {
  return FREQUENCY_OPTIONS_BY_LANG[lang]
}

export interface OnboardingProfile {
  name: string
  description: string
  previewPoints: string[]
}

// Rule-based, same spirit as lib/tips.ts — a fixed archetype per stated
// goal (the strongest signal), with frequency/prior-experience folded into
// the description rather than multiplying into a full archetype matrix.
export function computeOnboardingProfile(
  mainGoal: MainGoal,
  triedOtherApp: boolean,
  frequency: TrackingFrequency,
  lang: Lang,
): OnboardingProfile {
  const base: Record<Lang, Record<MainGoal, { name: string; description: string; previewPoints: string[] }>> = {
    fr: {
      epargner: {
        name: 'Épargnant·e avec un but',
        description:
          'Tu épargnes pour quelque chose de précis — c\'est le moteur le plus efficace pour rester motivé·e sur la durée.',
        previewPoints: [
          'Ta page Épargne, pour suivre ta progression vers ton objectif.',
          'Compare ton rythme d\'épargne actuel à ce qu\'il faudrait pour respecter tes échéances.',
          'Des conseils personnalisés qui soulignent chaque étape franchie.',
        ],
      },
      dettes: {
        name: 'Stratège du désendettement',
        description:
          'Réduire tes dettes demande de la discipline sur les dépenses — SaveUp t\'aide à repérer vite où ça dérape.',
        previewPoints: [
          'Ton Budget, pour voir exactement où part chaque dollar.',
          'Des conseils qui pointent une catégorie dès qu\'elle grimpe plus que d\'habitude.',
          'Un score de santé financière qui progresse avec toi.',
        ],
      },
      comprendre: {
        name: 'Détective de tes finances',
        description: 'Tu veux d\'abord voir clair avant d\'agir — exactement ce que SaveUp fait de mieux.',
        previewPoints: [
          'Statistiques détaillées : tendances et comparaisons mois par mois.',
          'Une répartition claire de tes dépenses par catégorie.',
          'Des conseils qui pointent les vrais changements dans tes habitudes.',
        ],
      },
      autre: {
        name: 'Explorateur·rice financier·ère',
        description: 'Tu es venu·e voir ce que SaveUp peut faire pour toi — explore à ton rythme.',
        previewPoints: [
          'Ton Dashboard, un portrait complet de tes finances en un coup d\'œil.',
          'Budget, Épargne, Statistiques — tout est relié et se met à jour automatiquement.',
          'Rien n\'est figé : ajuste tout ça n\'importe quand dans Paramètres.',
        ],
      },
    },
    en: {
      epargner: {
        name: 'Saver with a purpose',
        description:
          "You're saving for something specific — that's the most effective way to stay motivated over time.",
        previewPoints: [
          'Your Savings page, to track your progress toward your goal.',
          "Compares your current saving pace to what it'd take to hit your deadlines.",
          'Personalized tips that highlight every step you hit.',
        ],
      },
      dettes: {
        name: 'Debt payoff strategist',
        description:
          "Paying down debt takes discipline on spending — SaveUp helps you spot where things slip, fast.",
        previewPoints: [
          'Your Budget, to see exactly where every dollar goes.',
          'Tips that flag a category the moment it climbs more than usual.',
          'A financial health score that improves as you go.',
        ],
      },
      comprendre: {
        name: 'Finance detective',
        description: 'You want a clear picture before you act — exactly what SaveUp does best.',
        previewPoints: [
          'Detailed statistics: month-over-month trends and comparisons.',
          'A clear breakdown of your spending by category.',
          'Tips that flag the real changes in your habits.',
        ],
      },
      autre: {
        name: 'Financial explorer',
        description: "You came to see what SaveUp can do for you — explore at your own pace.",
        previewPoints: [
          'Your Dashboard, a full picture of your finances at a glance.',
          'Budget, Savings, Statistics — all connected and updated automatically.',
          "Nothing's set in stone: adjust any of it anytime in Settings.",
        ],
      },
    },
  }

  const frequencyLine: Record<Lang, Record<TrackingFrequency, string>> = {
    fr: {
      quotidien: 'Tu veux garder un œil quotidien — ton Dashboard résume tout en 10 secondes.',
      hebdomadaire: 'Un suivi hebdomadaire te convient bien — reviens chaque semaine pour ajuster le tir.',
      mensuel: 'Tu préfères une vue d\'ensemble mensuelle — Statistiques va devenir ton meilleur outil.',
    },
    en: {
      quotidien: 'You like to keep a daily eye on things — your Dashboard sums it up in 10 seconds.',
      hebdomadaire: 'Checking in weekly suits you — come back each week to adjust course.',
      mensuel: 'You prefer a monthly overview — Statistics is about to become your best tool.',
    },
  }

  const experienceLine: Record<Lang, string> = {
    fr: triedOtherApp
      ? 'Tu as déjà essayé d\'autres apps de budget — si quelque chose ne fonctionne pas pour toi ici, Paramètres est toujours à portée de main.'
      : 'C\'est ta première app de budget — prends ton temps, tout est pensé pour rester simple.',
    en: triedOtherApp
      ? "You've already tried other budgeting apps — if something doesn't work for you here, Settings is always within reach."
      : "This is your first budgeting app — take your time, everything's designed to stay simple.",
  }

  const profile = base[lang][mainGoal]
  return {
    name: profile.name,
    description: `${profile.description} ${frequencyLine[lang][frequency]} ${experienceLine[lang]}`,
    previewPoints: profile.previewPoints,
  }
}
