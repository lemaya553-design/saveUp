import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import { buildCsv, downloadCsv } from '../lib/csv'
import { toDateString } from '../lib/format'

interface CsvRow {
  date: string
  type: string
  description: string
  amount: number
  category: string
}

// Pulls the FULL history from Supabase (not the 50-row caps the in-app
// hooks use for display) so the export is complete, not a recent slice.
export function useCsvExport() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportAll = useCallback(async () => {
    setExporting(true)
    setError(null)

    const [expensesRes, fixedRes, contributionsRes, goalsRes] = await Promise.all([
      supabase.from('expenses').select('*'),
      supabase.from('fixed_expenses').select('*'),
      supabase.from('savings_contributions').select('*'),
      supabase.from('savings_goals').select('id, name'),
    ])

    const firstError = expensesRes.error || fixedRes.error || contributionsRes.error || goalsRes.error
    if (firstError) {
      setError(firstError.message)
      setExporting(false)
      return
    }

    const goalNameById = new Map((goalsRes.data ?? []).map((g) => [g.id, g.name]))
    const rows: CsvRow[] = []

    for (const e of expensesRes.data ?? []) {
      rows.push({
        date: toDateString(new Date(e.spent_at)),
        type: 'Dépense',
        description: e.description,
        amount: e.amount,
        category: e.category,
      })
    }

    for (const e of fixedRes.data ?? []) {
      rows.push({
        date: toDateString(new Date(e.created_at)),
        type: 'Dépense fixe',
        description: e.name,
        amount: e.amount,
        category: e.category,
      })
    }

    for (const c of contributionsRes.data ?? []) {
      const goalName = c.goal_id ? (goalNameById.get(c.goal_id) ?? 'Objectif supprimé') : 'Objectif supprimé'
      rows.push({
        date: toDateString(new Date(c.created_at)),
        type: 'Contribution épargne',
        description: `Épargne — ${goalName}`,
        amount: c.amount,
        category: 'Épargne',
      })
    }

    rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

    const csv = buildCsv([
      ['Date', 'Type', 'Description', 'Montant', 'Catégorie'],
      ...rows.map((r) => [r.date, r.type, r.description, r.amount.toFixed(2), r.category]),
    ])

    downloadCsv(`saveup-export-${toDateString(new Date())}.csv`, csv)
    setExporting(false)
  }, [])

  return { exporting, error, exportAll }
}
