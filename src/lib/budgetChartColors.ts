// SaveUp's own blue-family palette for the Budget page's charts only —
// deliberately NOT shared with lib/categoryColors.ts (Statistiques/
// Dashboard), so this page-scoped palette can't bleed into pages nobody
// asked to change. Was an orange-family palette before the app-wide blue
// recolor (see git history) — same 5-slot rotation, same reasoning, just
// every hue remapped to a shade/tint of the one brand blue instead of
// orange. Pure black is left out of the rotating hash palette on purpose:
// a #0A0A0A slice/dot is nearly invisible against a dark-mode card (whose
// surface is already a near-black #1a1a1a).
export const BUDGET_CHART_COLORS = [
  '#4A6CF7', // bleu principal
  '#8DA9FF', // bleu pâle
  '#2DD4BF', // sarcelle (teal) — pour distinguer une 3e catégorie du bleu
  '#5B6B9E', // bleu ardoise
  '#D6E0FF', // bleu très pâle
]

// Matches computeCategoryBreakdown's reserved 'Épargne' category (see
// lib/budgetInsights.ts) — kept distinct from the hash palette so it can't
// collide by coincidence, same convention as lib/categoryColors.ts.
export const BUDGET_SAVINGS_COLOR = '#0B1A3A'
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
