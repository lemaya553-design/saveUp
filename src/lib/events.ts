// Cross-component sync for expenses: there's no global state store in this
// app, so each page mounts its own hook instances (useExpenses,
// useExpenseHistory, useMonthlyExpenses...). Without this, an expense added
// from one instance (e.g. the floating quick-add button) wouldn't be
// visible in another instance mounted at the same time (e.g. the Budget
// page's own history/trend hooks) until a full page reload.
const EXPENSES_CHANGED_EVENT = 'saveup:expenses-changed'

export function emitExpensesChanged(): void {
  window.dispatchEvent(new Event(EXPENSES_CHANGED_EVENT))
}

export function onExpensesChanged(handler: () => void): () => void {
  window.addEventListener(EXPENSES_CHANGED_EVENT, handler)
  return () => window.removeEventListener(EXPENSES_CHANGED_EVENT, handler)
}

// Same idea for categories: renaming or deleting one (from Paramètres)
// needs every other mounted category dropdown to pick up the change.
const CATEGORIES_CHANGED_EVENT = 'saveup:categories-changed'

export function emitCategoriesChanged(): void {
  window.dispatchEvent(new Event(CATEGORIES_CHANGED_EVENT))
}

export function onCategoriesChanged(handler: () => void): () => void {
  window.addEventListener(CATEGORIES_CHANGED_EVENT, handler)
  return () => window.removeEventListener(CATEGORIES_CHANGED_EVENT, handler)
}

// Same idea for savings goals: the nav bar's badge count mounts its own
// useSavingsGoals() instance and stays mounted across every route change,
// so it needs to hear about goals/contributions added from whichever page
// is actually open.
const GOALS_CHANGED_EVENT = 'saveup:goals-changed'

export function emitGoalsChanged(): void {
  window.dispatchEvent(new Event(GOALS_CHANGED_EVENT))
}

export function onGoalsChanged(handler: () => void): () => void {
  window.addEventListener(GOALS_CHANGED_EVENT, handler)
  return () => window.removeEventListener(GOALS_CHANGED_EVENT, handler)
}
