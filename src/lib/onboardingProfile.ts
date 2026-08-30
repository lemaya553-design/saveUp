export type MainGoal = 'epargner' | 'dettes' | 'comprendre' | 'autre'
export type TrackingFrequency = 'quotidien' | 'hebdomadaire' | 'mensuel'

export const MAIN_GOAL_OPTIONS: { value: MainGoal; label: string }[] = [
  { value: 'epargner', label: 'Épargner pour un projet' },
  { value: 'dettes', label: 'Réduire mes dettes' },
  { value: 'comprendre', label: 'Mieux comprendre mes dépenses' },
  { value: 'autre', label: 'Autre chose' },
]

export const FREQUENCY_OPTIONS: { value: TrackingFrequency; label: string }[] = [
  { value: 'quotidien', label: 'Au quotidien' },
  { value: 'hebdomadaire', label: 'Chaque semaine' },
  { value: 'mensuel', label: 'Une fois par mois' },
]

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
): OnboardingProfile {
  const base: Record<MainGoal, { name: string; description: string; previewPoints: string[] }> = {
    epargner: {
      name: 'Épargnant·e avec un but',
      description:
        'Tu épargnes pour quelque chose de précis — c\'est le moteur le plus efficace pour rester motivé·e sur la durée.',
      previewPoints: [
        'Ta page Épargne, pour suivre ta progression vers ton objectif.',
        'Relie un article de ta liste de souhaits à un objectif pour voir exactement combien il te reste à économiser.',
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
  }

  const frequencyLine: Record<TrackingFrequency, string> = {
    quotidien: 'Tu veux garder un œil quotidien — ton Dashboard résume tout en 10 secondes.',
    hebdomadaire: 'Un suivi hebdomadaire te convient bien — reviens chaque semaine pour ajuster le tir.',
    mensuel: 'Tu préfères une vue d\'ensemble mensuelle — Statistiques va devenir ton meilleur outil.',
  }

  const experienceLine = triedOtherApp
    ? 'Tu as déjà essayé d\'autres apps de budget — si quelque chose ne fonctionne pas pour toi ici, Paramètres est toujours à portée de main.'
    : 'C\'est ta première app de budget — prends ton temps, tout est pensé pour rester simple.'

  const profile = base[mainGoal]
  return {
    name: profile.name,
    description: `${profile.description} ${frequencyLine[frequency]} ${experienceLine}`,
    previewPoints: profile.previewPoints,
  }
}
