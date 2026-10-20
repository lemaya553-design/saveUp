import {
  DEMO_CATEGORY_NAMES,
  DEMO_CONTRIBUTIONS,
  DEMO_FIXED_EXPENSES,
  DEMO_GOAL,
  DEMO_INCOME,
  buildDemoExpenseRows,
} from './demoData'
import { toDateString } from './format'
import { emitCategoriesChanged, emitExpensesChanged, emitGoalsChanged } from './events'

// Backs "Essayer sans compte" (Connexion.tsx): a full local stand-in for the
// handful of Supabase tables the core pages (Dashboard, Budget, Épargne,
// Statistiques) read from, scoped to this browser only. Nothing in this
// file ever calls supabase — that's the whole point: a guest's data must
// never touch a server until they actually create an account. Each data
// hook (useIncome, useExpenses, useFixedExpenses, useCategories,
// useSavingsGoals, useSavingsContributions, useExpenseHistory,
// useMonthlyExpenses) branches to the getters/setters below when
// useGuestMode().active is true, instead of its normal Supabase calls —
// same external shape either way, so the pages themselves need no changes.

export interface GuestExpense {
  id: string
  description: string
  amount: number
  category: string
  spent_at: string
  account: string | null
}

export interface GuestFixedExpense {
  id: string
  name: string
  amount: number
  category: string
}

export interface GuestCategory {
  id: string
  name: string
  monthlyBudget: number | null
}

export interface GuestGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string | null
  photoPath: null
  photoUrl: null
}

export interface GuestContribution {
  id: string
  amount: number
  goal_id: string | null
  created_at: string
}

interface GuestData {
  monthlyIncome: number
  hasIncomeRecord: boolean
  categories: GuestCategory[]
  fixedExpenses: GuestFixedExpense[]
  expenses: GuestExpense[]
  goals: GuestGoal[]
  contributions: GuestContribution[]
}

const STORAGE_KEY = 'saveup-guest-data'
const ACTIVE_KEY = 'saveup-guest-active'
// Set right before a guest who edited the sample goal signs up for real —
// read once by Dashboard.tsx on the first load of the new real account to
// carry that one goal over, then removed. See migratePendingGuestGoal.
const PENDING_GOAL_KEY = 'saveup-guest-pending-goal'

function newId(): string {
  return crypto.randomUUID()
}

// Spreads the 3 seed contributions over the last few weeks so the goal
// reads as "already in progress," not created-and-funded in the same
// instant — same reasoning as demoData.ts's expense seeds.
function buildSeedData(): GuestData {
  const goalId = newId()
  const now = new Date()
  const contributions: GuestContribution[] = DEMO_CONTRIBUTIONS.map((amount, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (28 - i * 10))
    return { id: newId(), amount, goal_id: goalId, created_at: date.toISOString() }
  })

  return {
    monthlyIncome: DEMO_INCOME,
    hasIncomeRecord: true,
    categories: DEMO_CATEGORY_NAMES.map((name) => ({ id: newId(), name, monthlyBudget: null })),
    fixedExpenses: DEMO_FIXED_EXPENSES.map((f) => ({ id: newId(), ...f })),
    expenses: buildDemoExpenseRows().map((e) => ({ id: newId(), ...e, account: null })),
    goals: [
      {
        id: goalId,
        name: DEMO_GOAL.name,
        targetAmount: DEMO_GOAL.targetAmount,
        currentAmount: contributions.reduce((sum, c) => sum + c.amount, 0),
        targetDate: DEMO_GOAL.targetDate,
        photoPath: null,
        photoUrl: null,
      },
    ],
    contributions,
  }
}

let cached: GuestData | null = null

function read(): GuestData {
  if (cached) return cached
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      cached = JSON.parse(raw) as GuestData
      return cached
    }
  } catch {
    // Malformed/unavailable storage — fall through and reseed.
  }
  cached = buildSeedData()
  write(cached)
  return cached
}

function write(data: GuestData): void {
  cached = data
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Private browsing / storage disabled — guest mode still works for the
    // rest of this page load, it just won't survive a refresh.
  }
}

export function isGuestModeActive(): boolean {
  try {
    return localStorage.getItem(ACTIVE_KEY) === '1'
  } catch {
    return false
  }
}

// Called once, from the "Essayer sans compte" button — (re)seeds fresh
// sample data so a previous guest session's edits don't leak into a new
// one, then flips the active flag.
export function activateGuestMode(): void {
  cached = buildSeedData()
  write(cached)
  try {
    localStorage.setItem(ACTIVE_KEY, '1')
  } catch {
    // Ignored — see write() above.
  }
}

// Called when a guest decides to sign up for real, and when they
// deliberately exit guest mode without signing up — either way the guest
// session is over. `keepPendingGoal` controls whether the current goal
// (possibly edited by the user) is queued for migration into the real
// account about to be created; see migratePendingGuestGoal.
export function deactivateGuestMode(keepPendingGoal: boolean): void {
  if (keepPendingGoal) {
    const goal = read().goals[0]
    if (goal) {
      try {
        localStorage.setItem(
          PENDING_GOAL_KEY,
          JSON.stringify({ name: goal.name, targetAmount: goal.targetAmount, targetDate: goal.targetDate }),
        )
      } catch {
        // If this fails, the real account just starts fresh — acceptable,
        // never a hard error for the person signing up.
      }
    }
  }
  try {
    localStorage.removeItem(ACTIVE_KEY)
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignored.
  }
  cached = null
}

// Dashboard.tsx calls this once a real session exists — returns the
// pending goal (if any) exactly once, consuming it, so a page refresh
// doesn't recreate it a second time. Caller is responsible for actually
// inserting it via the real useSavingsGoals().addGoal.
export function consumePendingGuestGoal(): { name: string; targetAmount: number; targetDate: string | null } | null {
  try {
    const raw = localStorage.getItem(PENDING_GOAL_KEY)
    if (!raw) return null
    localStorage.removeItem(PENDING_GOAL_KEY)
    return JSON.parse(raw) as { name: string; targetAmount: number; targetDate: string | null }
  } catch {
    return null
  }
}

// --- Reads ------------------------------------------------------------

export function getGuestIncome(): { monthlyIncome: number; hasIncomeRecord: boolean } {
  const d = read()
  return { monthlyIncome: d.monthlyIncome, hasIncomeRecord: d.hasIncomeRecord }
}

export function getGuestCategories(): GuestCategory[] {
  return read().categories
}

export function getGuestFixedExpenses(): GuestFixedExpense[] {
  return read().fixedExpenses
}

export function getGuestExpenses(): GuestExpense[] {
  return read().expenses
}

export function getGuestGoals(): GuestGoal[] {
  return read().goals
}

export function getGuestContributions(): GuestContribution[] {
  return read().contributions
}

// --- Writes -------------------------------------------------------------
// Every mutator re-emits the same window events the real Supabase-backed
// hooks already emit on a change (lib/events.ts) — any other mounted hook
// instance (e.g. the nav badge's own useSavingsGoals()) picks up guest
// edits the exact same way it picks up real ones, no separate guest event
// bus needed.

export function setGuestIncome(value: number): void {
  const d = read()
  write({ ...d, monthlyIncome: value, hasIncomeRecord: true })
}

export function addGuestCategory(name: string): GuestCategory {
  const d = read()
  const category: GuestCategory = { id: newId(), name, monthlyBudget: null }
  write({ ...d, categories: [...d.categories, category] })
  emitCategoriesChanged()
  return category
}

export function renameGuestCategory(id: string, newName: string): void {
  const d = read()
  const category = d.categories.find((c) => c.id === id)
  if (!category) return
  const oldName = category.name
  write({
    ...d,
    categories: d.categories.map((c) => (c.id === id ? { ...c, name: newName } : c)),
    fixedExpenses: d.fixedExpenses.map((f) => (f.category === oldName ? { ...f, category: newName } : f)),
    expenses: d.expenses.map((e) => (e.category === oldName ? { ...e, category: newName } : e)),
  })
  emitCategoriesChanged()
  emitExpensesChanged()
}

export function setGuestCategoryBudget(id: string, monthlyBudget: number | null): void {
  const d = read()
  write({ ...d, categories: d.categories.map((c) => (c.id === id ? { ...c, monthlyBudget } : c)) })
  emitCategoriesChanged()
}

export function removeGuestCategory(id: string, reassignTo?: string): void {
  const d = read()
  const category = d.categories.find((c) => c.id === id)
  if (!category) return
  write({
    ...d,
    categories: d.categories.filter((c) => c.id !== id),
    fixedExpenses: reassignTo
      ? d.fixedExpenses.map((f) => (f.category === category.name ? { ...f, category: reassignTo } : f))
      : d.fixedExpenses,
    expenses: reassignTo
      ? d.expenses.map((e) => (e.category === category.name ? { ...e, category: reassignTo } : e))
      : d.expenses,
  })
  emitCategoriesChanged()
  if (reassignTo) emitExpensesChanged()
}

export function addGuestFixedExpense(name: string, amount: number, category: string): GuestFixedExpense {
  const d = read()
  const expense: GuestFixedExpense = { id: newId(), name, amount, category }
  write({ ...d, fixedExpenses: [...d.fixedExpenses, expense] })
  return expense
}

export function updateGuestFixedExpense(id: string, name: string, amount: number, category: string): void {
  const d = read()
  write({ ...d, fixedExpenses: d.fixedExpenses.map((f) => (f.id === id ? { ...f, name, amount, category } : f)) })
}

export function removeGuestFixedExpense(id: string): void {
  const d = read()
  write({ ...d, fixedExpenses: d.fixedExpenses.filter((f) => f.id !== id) })
}

export function addGuestExpense(description: string, amount: number, category: string): GuestExpense {
  const d = read()
  const expense: GuestExpense = {
    id: newId(),
    description,
    amount,
    category,
    spent_at: toDateString(new Date()),
    account: null,
  }
  write({ ...d, expenses: [expense, ...d.expenses] })
  emitExpensesChanged()
  return expense
}

export function updateGuestExpense(id: string, description: string, amount: number, category: string): void {
  const d = read()
  write({ ...d, expenses: d.expenses.map((e) => (e.id === id ? { ...e, description, amount, category } : e)) })
  emitExpensesChanged()
}

export function removeGuestExpense(id: string): void {
  const d = read()
  write({ ...d, expenses: d.expenses.filter((e) => e.id !== id) })
  emitExpensesChanged()
}

export function addGuestGoal(name: string, targetAmount: number, targetDate: string | null): GuestGoal {
  const d = read()
  const goal: GuestGoal = { id: newId(), name, targetAmount, currentAmount: 0, targetDate, photoPath: null, photoUrl: null }
  write({ ...d, goals: [...d.goals, goal] })
  emitGoalsChanged()
  return goal
}

export function updateGuestGoal(id: string, name: string, targetAmount: number, targetDate: string | null): void {
  const d = read()
  write({ ...d, goals: d.goals.map((g) => (g.id === id ? { ...g, name, targetAmount, targetDate } : g)) })
  emitGoalsChanged()
}

export function removeGuestGoal(id: string): void {
  const d = read()
  write({ ...d, goals: d.goals.filter((g) => g.id !== id), contributions: d.contributions.filter((c) => c.goal_id !== id) })
  emitGoalsChanged()
}

export function addGuestContribution(goalId: string, amount: number): void {
  const d = read()
  const contribution: GuestContribution = { id: newId(), amount, goal_id: goalId, created_at: new Date().toISOString() }
  write({
    ...d,
    goals: d.goals.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g)),
    contributions: [contribution, ...d.contributions],
  })
  emitGoalsChanged()
}
