import type { ComponentType } from 'react'
import type { Lang } from './i18n/language'
import {
  FlagIcon,
  TrendUpIcon,
  CoinsIcon,
  DiamondIcon,
  StarIcon,
  TrophyIcon,
  RocketIcon,
  FlameIcon,
  ReceiptIcon,
  ShieldIcon,
  UploadIcon,
} from '../components/rewardIcons'

export type BadgeCategory = 'starter' | 'savings' | 'goals' | 'streak' | 'expenses' | 'budget' | 'import'
export type BadgeRarity = 'bronze' | 'silver' | 'gold'

export interface BadgeDef {
  id: string
  category: BadgeCategory
  rarity: BadgeRarity
  // Meaning depends on category: a dollar amount (savings), a day count
  // (streak), a count of goals/expenses/months (goals, expenses, budget),
  // or just 1 (starter, import — plain "has this happened yet").
  threshold: number
  icon: ComponentType<{ className?: string }>
  name: Record<Lang, string>
  // Free plan gets the easiest 1-2 badges per category ("badges de base");
  // deeper engagement needs Standard — same split the old 4-tier system
  // used (first-100/first-500 free, first-1000/goal-complete Standard).
  minPlan?: 'standard'
}

// Ids for the 5 badges that predate this catalog (first-100, first-500,
// first-1000, goal-complete, starter) are kept EXACTLY as they were in the
// old REWARD_TIERS/STARTER_BADGE — claimed_badges.tier_id is a plain string
// with no schema tie to this array, so any account that already claimed one
// of those keeps it claimed under the same id. Every other id is new.
export const BADGES: BadgeDef[] = [
  {
    id: 'starter',
    category: 'starter',
    rarity: 'bronze',
    threshold: 1,
    icon: RocketIcon,
    name: { fr: "C'est parti !", en: "Let's go!" },
  },
  {
    id: 'first-100',
    category: 'savings',
    rarity: 'bronze',
    threshold: 100,
    icon: FlagIcon,
    name: { fr: 'Premier pas', en: 'First step' },
  },
  {
    id: 'first-500',
    category: 'savings',
    rarity: 'bronze',
    threshold: 500,
    icon: TrendUpIcon,
    name: { fr: 'Sur la bonne voie', en: 'On track' },
  },
  {
    id: 'first-1000',
    category: 'savings',
    rarity: 'silver',
    threshold: 1000,
    icon: CoinsIcon,
    name: { fr: 'Épargnant sérieux', en: 'Serious saver' },
    minPlan: 'standard',
  },
  {
    id: 'savings-2500',
    category: 'savings',
    rarity: 'silver',
    threshold: 2500,
    icon: CoinsIcon,
    name: { fr: 'Épargne solide', en: 'Solid savings' },
    minPlan: 'standard',
  },
  {
    id: 'savings-5000',
    category: 'savings',
    rarity: 'gold',
    threshold: 5000,
    icon: DiamondIcon,
    name: { fr: 'Épargnant d\'élite', en: 'Elite saver' },
    minPlan: 'standard',
  },
  {
    id: 'goal-complete',
    category: 'goals',
    rarity: 'bronze',
    threshold: 1,
    icon: StarIcon,
    name: { fr: 'Objectif atteint', en: 'Goal reached' },
    minPlan: 'standard',
  },
  {
    id: 'goals-3',
    category: 'goals',
    rarity: 'silver',
    threshold: 3,
    icon: TrophyIcon,
    name: { fr: 'Collectionneur d\'objectifs', en: 'Goal collector' },
    minPlan: 'standard',
  },
  {
    id: 'goals-5',
    category: 'goals',
    rarity: 'gold',
    threshold: 5,
    icon: TrophyIcon,
    name: { fr: 'Stratège de l\'épargne', en: 'Savings strategist' },
    minPlan: 'standard',
  },
  {
    id: 'streak-3',
    category: 'streak',
    rarity: 'bronze',
    threshold: 3,
    icon: FlameIcon,
    name: { fr: 'Bonne habitude', en: 'Good habit' },
  },
  {
    id: 'streak-7',
    category: 'streak',
    rarity: 'bronze',
    threshold: 7,
    icon: FlameIcon,
    name: { fr: 'Une semaine de suite', en: 'One week running' },
  },
  {
    id: 'streak-14',
    category: 'streak',
    rarity: 'silver',
    threshold: 14,
    icon: FlameIcon,
    name: { fr: 'Régularité au top', en: 'Rock-solid routine' },
  },
  {
    id: 'streak-30',
    category: 'streak',
    rarity: 'gold',
    threshold: 30,
    icon: FlameIcon,
    name: { fr: 'Un mois sans faute', en: 'A flawless month' },
  },
  {
    id: 'expenses-10',
    category: 'expenses',
    rarity: 'bronze',
    threshold: 10,
    icon: ReceiptIcon,
    name: { fr: 'Premier suivi', en: 'First tracking' },
  },
  {
    id: 'expenses-30',
    category: 'expenses',
    rarity: 'silver',
    threshold: 30,
    icon: ReceiptIcon,
    name: { fr: 'Suivi assidu', en: 'Diligent tracker' },
  },
  {
    id: 'expenses-100',
    category: 'expenses',
    rarity: 'gold',
    threshold: 100,
    icon: ReceiptIcon,
    name: { fr: 'Maître du suivi', en: 'Tracking master' },
    minPlan: 'standard',
  },
  {
    id: 'budget-1',
    category: 'budget',
    rarity: 'silver',
    threshold: 1,
    icon: ShieldIcon,
    name: { fr: 'Budget respecté', en: 'On budget' },
  },
  {
    id: 'budget-3',
    category: 'budget',
    rarity: 'gold',
    threshold: 3,
    icon: ShieldIcon,
    name: { fr: 'Discipline de fer', en: 'Iron discipline' },
    minPlan: 'standard',
  },
  {
    id: 'import-1',
    category: 'import',
    rarity: 'bronze',
    threshold: 1,
    icon: UploadIcon,
    name: { fr: 'Relevé importé', en: 'Statement imported' },
  },
]

export interface BadgeContext {
  totalSaved: number
  completedGoalsCount: number
  streakDays: number
  expenseCount: number
  csvImportCount: number
  budgetMonthsRespected: number
  hasIncomeRecord: boolean
}

function currentValueFor(category: BadgeCategory, ctx: BadgeContext): number {
  switch (category) {
    case 'starter':
      return ctx.hasIncomeRecord ? 1 : 0
    case 'savings':
      return ctx.totalSaved
    case 'goals':
      return ctx.completedGoalsCount
    case 'streak':
      return ctx.streakDays
    case 'expenses':
      return ctx.expenseCount
    case 'budget':
      return ctx.budgetMonthsRespected
    case 'import':
      return ctx.csvImportCount
  }
}

export interface BadgeProgress {
  current: number
  target: number
  pct: number
}

export function getBadgeProgress(def: BadgeDef, ctx: BadgeContext): BadgeProgress {
  const current = currentValueFor(def.category, ctx)
  const target = def.threshold
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 100
  return { current, target, pct }
}

export function isBadgeUnlocked(def: BadgeDef, ctx: BadgeContext): boolean {
  return currentValueFor(def.category, ctx) >= def.threshold
}

// The short line inscribed on the medal itself once unlocked — always the
// badge's own threshold (not whatever the user is at right now), since
// reaching e.g. the $500 tier is itself the true, permanent "500 $
// épargnés" fact being commemorated.
export function getBadgeResultLabel(
  def: BadgeDef,
  lang: Lang,
  formatMoney: (amount: number) => string,
): string {
  const n = def.threshold
  switch (def.category) {
    case 'starter':
      return lang === 'en' ? 'Account set up' : 'Compte configuré'
    case 'savings':
      return lang === 'en' ? `${formatMoney(n)} saved` : `${formatMoney(n)} épargnés`
    case 'goals':
      return n === 1
        ? lang === 'en'
          ? '1st goal reached'
          : '1er objectif atteint'
        : lang === 'en'
          ? `${n} goals reached`
          : `${n} objectifs atteints`
    case 'streak':
      return lang === 'en' ? `${n}-day streak` : `${n} jours de suite`
    case 'expenses':
      return lang === 'en' ? `${n} expenses logged` : `${n} dépenses notées`
    case 'budget':
      return n === 1
        ? lang === 'en'
          ? '1 month on budget'
          : '1 mois de budget respecté'
        : lang === 'en'
          ? `${n} months on budget`
          : `${n} mois de budget respectés`
    case 'import':
      return lang === 'en' ? '1st statement imported' : '1er relevé importé'
  }
}

// What a locked badge's card shows as its unlock condition.
export function getBadgeRequirementText(
  def: BadgeDef,
  lang: Lang,
  formatMoney: (amount: number) => string,
): string {
  const n = def.threshold
  switch (def.category) {
    case 'starter':
      return lang === 'en' ? 'Finish setting up your account' : 'Termine la configuration de ton compte'
    case 'savings':
      return lang === 'en' ? `Save ${formatMoney(n)} to unlock` : `Épargne ${formatMoney(n)} pour débloquer`
    case 'goals':
      return lang === 'en'
        ? `Complete ${n} goal${n > 1 ? 's' : ''} to unlock`
        : `Complète ${n} objectif${n > 1 ? 's' : ''} pour débloquer`
    case 'streak':
      return lang === 'en'
        ? `Come back ${n} days in a row to unlock`
        : `Reviens ${n} jours de suite pour débloquer`
    case 'expenses':
      return lang === 'en' ? `Log ${n} expenses to unlock` : `Note ${n} dépenses pour débloquer`
    case 'budget':
      return lang === 'en'
        ? `Stay on budget for ${n} month${n > 1 ? 's' : ''} to unlock`
        : `Respecte ton budget ${n} mois pour débloquer`
    case 'import':
      return lang === 'en' ? 'Import a bank statement to unlock' : 'Importe un relevé pour débloquer'
  }
}

// Personalized thank-you + encouragement for the full-screen unlock
// celebration — one template per category (so the tone fits what was
// actually accomplished), interpolated with the real first name and the
// badge's own result label, so every badge reads as its own message even
// though only ~7 templates exist rather than 19 bespoke paragraphs.
export function getBadgeUnlockMessage(
  def: BadgeDef,
  lang: Lang,
  firstName: string,
  resultLabel: string,
): string {
  const name = firstName.trim() || (lang === 'en' ? 'there' : 'toi')
  switch (def.category) {
    case 'starter':
      return lang === 'en'
        ? `Welcome, ${name}! Your account is ready — everything else builds from real data. 🌱`
        : `Bienvenue ${name} ! Ton compte est prêt — la suite se construit avec de vraies données. 🌱`
    case 'savings':
      return lang === 'en'
        ? `Nice work, ${name}! ${resultLabel} — that's huge. Every dollar gets you closer to your goal. Keep going 💪`
        : `Bravo ${name} ! ${resultLabel}, c'est énorme. Chaque dollar te rapproche de ton objectif. Continue comme ça 💪`
    case 'goals':
      return lang === 'en'
        ? `Amazing, ${name}! ${resultLabel} — you're turning plans into reality. 🎯`
        : `Incroyable ${name} ! ${resultLabel} — tu transformes tes projets en réalité. 🎯`
    case 'streak':
      return lang === 'en'
        ? `${name}, ${resultLabel}! Your consistency is your biggest strength. Keep the rhythm 🔥`
        : `${name}, ${resultLabel} ! Ta régularité est ta plus grande force. Garde le rythme 🔥`
    case 'expenses':
      return lang === 'en'
        ? `Well done, ${name}! ${resultLabel} — you have a clear view of your money. 📊`
        : `Bien joué ${name} ! ${resultLabel} : tu as une vue claire sur ton argent. 📊`
    case 'budget':
      return lang === 'en'
        ? `${name}, ${resultLabel}! Staying on budget is the secret to savings that last. 👏`
        : `${name}, ${resultLabel} ! Respecter ton budget, c'est le secret d'une épargne qui dure. 👏`
    case 'import':
      return lang === 'en'
        ? `${name}, your first statement is in! Your tracking just got a lot faster. 🚀`
        : `${name}, premier relevé importé ! Tout ton suivi vient d'accélérer. 🚀`
  }
}

export type StatusId = 'debutant' | 'epargnant' | 'pro' | 'expert' | 'legende'

export interface StatusLevel {
  id: StatusId
  min: number
  max: number | null
  icon: string
  name: Record<Lang, string>
}

// Thresholds are counts of CLAIMED badges — "obtenus" means revealed/yours,
// not just technically earned-but-not-yet-celebrated.
export const STATUS_LEVELS: StatusLevel[] = [
  { id: 'debutant', min: 0, max: 2, icon: '🌱', name: { fr: 'Débutant', en: 'Beginner' } },
  { id: 'epargnant', min: 3, max: 5, icon: '💪', name: { fr: 'Épargnant', en: 'Saver' } },
  { id: 'pro', min: 6, max: 9, icon: '⚡', name: { fr: 'Pro du budget', en: 'Budget pro' } },
  { id: 'expert', min: 10, max: 14, icon: '💎', name: { fr: 'Expert', en: 'Expert' } },
  { id: 'legende', min: 15, max: null, icon: '👑', name: { fr: 'Légende', en: 'Legend' } },
]

export function getUserStatus(claimedCount: number): StatusLevel {
  return (
    STATUS_LEVELS.find((level) => claimedCount >= level.min && (level.max === null || claimedCount <= level.max)) ??
    STATUS_LEVELS[0]
  )
}

export function getNextStatus(claimedCount: number): StatusLevel | null {
  const current = getUserStatus(claimedCount)
  const index = STATUS_LEVELS.findIndex((level) => level.id === current.id)
  return STATUS_LEVELS[index + 1] ?? null
}
