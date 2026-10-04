// Quiet, muted multi-hue set — NOT built from the brand orange: the
// minimalist system treats orange as a strategic accent reserved for CTAs
// and key indicators ("jamais plus d'un orange accentué par zone"), so a
// chart showing 6 simultaneous category colors shouldn't be 6 shades of
// the same accent competing with every real button on the page. Shared by
// every category chart on Statistiques (bar chart, donut) so the same
// category always renders the same color everywhere on the page. Green and
// gray are deliberately excluded here — reserved below for "Épargne" and
// "Disponible" respectively, so neither can ever collide with a real
// spending category by coincidence of the hash.
export const CATEGORY_COLORS = [
  '#64748b', // slate
  '#a16207', // ochre
  '#7c6f64', // taupe
  '#475569', // deep slate
  '#b45309', // clay
  '#94a3b8', // light slate
]

// Matches the 'Épargne' → success-green convention already established on
// the Budget page (lib/budgetInsights.ts computeCategoryBreakdown).
export const SAVINGS_COLOR = '#22c55e'
export const SAVINGS_CATEGORY = 'Épargne'

// The Revenus tab's "money not yet allocated to a fixed expense" slice —
// neutral on purpose, since it isn't a spending category at all.
export const AVAILABLE_COLOR = '#6b7280'
export const AVAILABLE_LABEL = 'Disponible'

// Deterministic hash of the category NAME string — not its position in a
// list — so a category keeps the same color from one month/list to the
// next even as sort order shifts with the amounts.
function colorForCategory(category: string): string {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

// Resolves the reserved names first so they never fall through to the hash
// palette, then hashes everything else.
export function colorForCategoryLabel(category: string): string {
  if (category === SAVINGS_CATEGORY) return SAVINGS_COLOR
  if (category === AVAILABLE_LABEL) return AVAILABLE_COLOR
  return colorForCategory(category)
}
