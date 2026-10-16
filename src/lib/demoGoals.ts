import type { SavingsGoal } from '../hooks/useSavingsGoals'

// Sample data for DashboardGoalCard's "Essayer avec des données d'exemple"
// demo mode — a plain constant, never passed to any Supabase call or
// mutation function anywhere in this file or its one caller. Demo mode
// only ever swaps what DashboardGoalCard *displays*; it has no write path
// at all, so there's no code path by which these numbers could ever reach
// the real user's data.
export const DEMO_GOALS: SavingsGoal[] = [
  {
    id: 'demo-voyage',
    name: 'Voyage à Cancún',
    currentAmount: 650,
    targetAmount: 1200,
    targetDate: null,
    photoPath: null,
    photoUrl: null,
  },
  {
    id: 'demo-urgence',
    name: "Fonds d'urgence",
    currentAmount: 1800,
    targetAmount: 3000,
    targetDate: null,
    photoPath: null,
    photoUrl: null,
  },
  {
    id: 'demo-ordi',
    name: 'Nouvel ordinateur',
    currentAmount: 300,
    targetAmount: 900,
    targetDate: null,
    photoPath: null,
    photoUrl: null,
  },
]
