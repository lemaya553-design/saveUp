import { toDateString } from './format'

// Fictional starter data for "Voir un exemple" in onboarding — realistic
// enough (varied merchants, spread over 3 months, a goal already in
// progress) that every page has something worth looking at, but clearly
// fake amounts so nobody mistakes it for a real imported statement.

export const DEMO_INCOME = 4200

export const DEMO_CATEGORY_NAMES = ['Logement', 'Alimentation', 'Transport', 'Loisirs', 'Santé', 'Autre']

export const DEMO_FIXED_EXPENSES: { name: string; amount: number; category: string }[] = [
  { name: 'Loyer', amount: 1450, category: 'Logement' },
  { name: 'Internet et cellulaire', amount: 95, category: 'Logement' },
  { name: 'Assurance auto', amount: 120, category: 'Transport' },
  { name: 'Abonnements (Netflix, Spotify)', amount: 35, category: 'Loisirs' },
]

export const DEMO_GOAL = { name: 'Fonds d’urgence', targetAmount: 5000, targetDate: null as string | null }

export const DEMO_CONTRIBUTIONS = [200, 200, 150]

interface DemoExpenseSeed {
  daysAgo: number
  description: string
  amount: number
  category: string
}

// ~10 transactions per month across the last 3 months, so the trend chart
// has a real shape and the month-over-month comparisons have something on
// both sides.
const DEMO_EXPENSE_SEEDS: DemoExpenseSeed[] = [
  // this month
  { daysAgo: 2, description: 'IGA', amount: 64.32, category: 'Alimentation' },
  { daysAgo: 4, description: 'Uber', amount: 18.5, category: 'Transport' },
  { daysAgo: 5, description: 'Tim Hortons', amount: 7.85, category: 'Alimentation' },
  { daysAgo: 6, description: 'Pharmaprix', amount: 22.4, category: 'Santé' },
  { daysAgo: 8, description: 'Metro', amount: 51.1, category: 'Alimentation' },
  { daysAgo: 9, description: 'Cinéma Cineplex', amount: 32.0, category: 'Loisirs' },
  { daysAgo: 11, description: 'Station Esso', amount: 58.2, category: 'Transport' },
  { daysAgo: 13, description: 'Restaurant St-Hubert', amount: 44.75, category: 'Loisirs' },
  { daysAgo: 15, description: 'IGA', amount: 71.9, category: 'Alimentation' },
  { daysAgo: 18, description: 'Amazon', amount: 39.99, category: 'Autre' },
  { daysAgo: 20, description: 'Pharmaprix', amount: 15.6, category: 'Santé' },
  { daysAgo: 22, description: 'STM', amount: 94.5, category: 'Transport' },
  // last month
  { daysAgo: 33, description: 'IGA', amount: 68.15, category: 'Alimentation' },
  { daysAgo: 36, description: 'Uber', amount: 24.1, category: 'Transport' },
  { daysAgo: 38, description: 'Metro', amount: 47.6, category: 'Alimentation' },
  { daysAgo: 40, description: 'Cinéma Cineplex', amount: 28.0, category: 'Loisirs' },
  { daysAgo: 43, description: 'Pharmaprix', amount: 19.3, category: 'Santé' },
  { daysAgo: 45, description: 'Restaurant St-Hubert', amount: 52.4, category: 'Loisirs' },
  { daysAgo: 48, description: 'Station Esso', amount: 61.0, category: 'Transport' },
  { daysAgo: 50, description: 'IGA', amount: 59.8, category: 'Alimentation' },
  { daysAgo: 53, description: 'Amazon', amount: 27.5, category: 'Autre' },
  { daysAgo: 56, description: 'STM', amount: 94.5, category: 'Transport' },
  // two months ago
  { daysAgo: 63, description: 'IGA', amount: 55.4, category: 'Alimentation' },
  { daysAgo: 66, description: 'Metro', amount: 49.2, category: 'Alimentation' },
  { daysAgo: 69, description: 'Uber', amount: 15.75, category: 'Transport' },
  { daysAgo: 72, description: 'Cinéma Cineplex', amount: 32.0, category: 'Loisirs' },
  { daysAgo: 75, description: 'Pharmaprix', amount: 24.1, category: 'Santé' },
  { daysAgo: 78, description: 'Station Esso', amount: 57.3, category: 'Transport' },
  { daysAgo: 81, description: 'Restaurant St-Hubert', amount: 39.6, category: 'Loisirs' },
  { daysAgo: 84, description: 'IGA', amount: 62.9, category: 'Alimentation' },
]

export function buildDemoExpenseRows(): { description: string; amount: number; category: string; spent_at: string }[] {
  const now = new Date()
  return DEMO_EXPENSE_SEEDS.map((seed) => {
    const date = new Date(now)
    date.setDate(date.getDate() - seed.daysAgo)
    return {
      description: seed.description,
      amount: seed.amount,
      category: seed.category,
      spent_at: toDateString(date),
    }
  })
}
