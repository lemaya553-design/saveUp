import { getMonthRange } from './format'

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly'

export const FREQUENCY_OPTIONS: { value: RecurringFrequency; label: string }[] = [
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'biweekly', label: 'Aux deux semaines' },
  { value: 'monthly', label: 'Mensuelle' },
  { value: 'yearly', label: 'Annuelle' },
]

export function frequencyLabel(frequency: RecurringFrequency): string {
  return FREQUENCY_OPTIONS.find((f) => f.value === frequency)?.label ?? frequency
}

export interface RecurringExpense {
  id: string
  description: string
  amount: number
  category: string
  account: string | null
  frequency: RecurringFrequency
  startDate: string
  endDate: string | null
  nextOccurrenceDate: string
}

// Mirrors the SQL add_months_clamped() exactly: adding calendar months
// naively overflows past month-end (Jan 31 + 1 month -> Mar 3 in plain JS
// Date math too, same root cause as Postgres's raw interval arithmetic) —
// this clamps to the target month's actual last day instead, so "the 31st"
// degrades predictably in short months rather than drifting.
export function addMonthsClamped(date: Date, n: number): Date {
  const monthStart = new Date(date.getFullYear(), date.getMonth() + n, 1)
  const daysInTargetMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
  const day = Math.min(date.getDate(), daysInTargetMonth)
  return new Date(monthStart.getFullYear(), monthStart.getMonth(), day)
}

// One step forward for a rule's cursor — same stepping rules as the DB
// function, kept in sync deliberately (see supabase/schema.sql
// generate_recurring_expenses_for_user) so the client's forecast and the
// server's actual generation never disagree on what date comes next.
export function advanceOccurrence(date: Date, frequency: RecurringFrequency): Date {
  switch (frequency) {
    case 'weekly':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7)
    case 'biweekly':
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 14)
    case 'monthly':
      return addMonthsClamped(date, 1)
    case 'yearly':
      return addMonthsClamped(date, 12)
  }
}

interface RecurringExpenseLike {
  amount: number
  frequency: RecurringFrequency
  nextOccurrenceDate: string
  endDate: string | null
}

// Occurrence dates for one rule that fall within `monthDate`'s month and
// haven't been generated yet (nextOccurrenceDate is the rule's own cursor —
// everything before it already exists as a real expense row). This is what
// "budget prévisionnel" reads: money already committed for this month, even
// before the actual transaction fires.
export function computeUpcomingOccurrencesInMonth(rule: RecurringExpenseLike, monthDate: Date): Date[] {
  const { start, end } = getMonthRange(monthDate)
  const endDate = rule.endDate ? new Date(rule.endDate + 'T00:00:00') : null
  const dates: Date[] = []
  let cursor = new Date(rule.nextOccurrenceDate + 'T00:00:00')
  if (cursor < start) cursor = start
  while (cursor < end) {
    if (endDate && cursor > endDate) break
    if (cursor >= start) dates.push(cursor)
    cursor = advanceOccurrence(cursor, rule.frequency)
  }
  return dates
}

// Sum of not-yet-generated occurrences across all rules, for the given
// month — the amount to subtract upfront from spendable budget alongside
// fixed_expenses, so recurring costs show up before they're actually
// charged. Already-generated occurrences are real `expenses` rows by the
// time this is read, so they're excluded here on purpose (they're already
// counted through the normal "spent this month" path) — adding them again
// would double-count.
export function computeUpcomingRecurringTotal(rules: RecurringExpenseLike[], monthDate: Date): number {
  return rules.reduce((sum, rule) => {
    const occurrences = computeUpcomingOccurrencesInMonth(rule, monthDate)
    return sum + occurrences.length * rule.amount
  }, 0)
}

// True once the cursor has caught up past end_date — nothing left to ever
// generate for this rule again.
export function isRecurringExpenseEnded(rule: RecurringExpenseLike): boolean {
  return rule.endDate !== null && rule.nextOccurrenceDate > rule.endDate
}
