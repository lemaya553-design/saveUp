// SaveUp's own orange-family palette for the Budget page's charts only —
// deliberately NOT shared with lib/categoryColors.ts (Statistiques/
// Dashboard), which stays on the app's default blue/mauve accent so this
// page-scoped redesign can't bleed into pages nobody asked to change.
// Pure black is left out of the rotating hash palette on purpose: a
// #0A0A0A slice/dot is nearly invisible against a dark-mode card (whose
// surface is already a near-black #1a1a1a) — the brief's own "noir ou
// orange foncé" phrasing for trend bars gave the explicit opening to prefer
// the orange alternative everywhere contrast would otherwise suffer.
export const BUDGET_CHART_COLORS = [
  '#FF7A00', // orange vif
  '#CC5F00', // orange foncé
  '#FFB347', // ambre
  '#E5484D', // corail
  '#FFD9B0', // pêche
]

// Matches computeCategoryBreakdown's reserved 'Épargne' category (see
// lib/budgetInsights.ts) — kept distinct from the hash palette so it can't
// collide by coincidence, same convention as lib/categoryColors.ts.
export const BUDGET_SAVINGS_COLOR = '#CC5F00'
const SAVINGS_CATEGORY = 'Épargne'

// Deterministic hash of the category name (not list position), so a
// category keeps its color across re-renders/re-sorts.
function hashCategory(category: string): number {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function budgetColorForCategory(category: string): string {
  if (category === SAVINGS_CATEGORY) return BUDGET_SAVINGS_COLOR
  return BUDGET_CHART_COLORS[hashCategory(category) % BUDGET_CHART_COLORS.length]
}
