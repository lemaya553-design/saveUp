import { useCallback, useState } from 'react'
import type * as XLSXType from 'xlsx'
import { supabase } from '../lib/supabase'
import { formatCurrency, toDateString } from '../lib/format'

interface ExportData {
  monthlyIncome: number
  fixedExpenses: { name: string; category: string; amount: number }[]
  transactions: { date: string; description: string; category: string; amount: number }[]
  categoryTotals: { category: string; total: number; pct: number }[]
  goals: { name: string; current: number; target: number; progressPct: number }[]
}

// Full history (not the 50-row display caps the in-app hooks use), same
// rationale as useCsvExport.ts — an export missing older data would be
// misleading. Premium-only, gated by the caller (DataExportCard).
async function loadExportData(): Promise<{ data: ExportData | null; error: string | null }> {
  const [incomeRes, fixedRes, expensesRes, goalsRes] = await Promise.all([
    supabase.from('budget_settings').select('monthly_income').maybeSingle(),
    supabase.from('fixed_expenses').select('name, category, amount'),
    supabase.from('expenses').select('spent_at, description, category, amount'),
    supabase.from('savings_goals').select('name, current_amount, target_amount'),
  ])

  const firstError = incomeRes.error || fixedRes.error || expensesRes.error || goalsRes.error
  if (firstError) return { data: null, error: firstError.message }

  const transactions = (expensesRes.data ?? [])
    .map((e) => ({
      date: toDateString(new Date(e.spent_at)),
      description: e.description,
      category: e.category,
      amount: e.amount,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0)
  const byCategory = new Map<string, number>()
  for (const t of transactions) {
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount)
  }
  const categoryTotals = [...byCategory.entries()]
    .map(([category, total]) => ({ category, total, pct: totalSpent > 0 ? (total / totalSpent) * 100 : 0 }))
    .sort((a, b) => b.total - a.total)

  const goals = (goalsRes.data ?? []).map((g) => ({
    name: g.name,
    current: g.current_amount,
    target: g.target_amount,
    progressPct: g.target_amount > 0 ? Math.min(100, (g.current_amount / g.target_amount) * 100) : 0,
  }))

  return {
    data: {
      monthlyIncome: incomeRes.data?.monthly_income ?? 0,
      fixedExpenses: (fixedRes.data ?? []).map((e) => ({ name: e.name, category: e.category, amount: e.amount })),
      transactions,
      categoryTotals,
      goals,
    },
    error: null,
  }
}

export function useDataExport() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportExcel = useCallback(async () => {
    setExporting(true)
    setError(null)
    const { data, error: loadError } = await loadExportData()
    if (loadError || !data) {
      setError(loadError ?? 'Erreur lors de la préparation des données.')
      setExporting(false)
      return
    }

    const XLSX: typeof XLSXType = await import('xlsx')
    const wb = XLSX.utils.book_new()

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ['SaveUp — Rapport exporté le', toDateString(new Date())],
      [],
      ['Revenu mensuel', data.monthlyIncome],
      ['Total dépenses fixes', data.fixedExpenses.reduce((s, e) => s + e.amount, 0)],
      ['Total transactions', data.transactions.length],
      ['Total épargné (tous objectifs)', data.goals.reduce((s, g) => s + g.current, 0)],
    ])
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Résumé')

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(data.fixedExpenses.map((e) => ({ Nom: e.name, Catégorie: e.category, Montant: e.amount }))),
      'Dépenses fixes',
    )

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.categoryTotals.map((c) => ({
          Catégorie: c.category,
          Total: c.total,
          '% du total': Math.round(c.pct * 10) / 10,
        })),
      ),
      'Par catégorie',
    )

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.transactions.map((t) => ({
          Date: t.date,
          Description: t.description,
          Catégorie: t.category,
          Montant: t.amount,
        })),
      ),
      'Transactions',
    )

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.goals.map((g) => ({
          Objectif: g.name,
          'Montant actuel': g.current,
          'Montant cible': g.target,
          'Progression %': Math.round(g.progressPct * 10) / 10,
        })),
      ),
      'Objectifs d’épargne',
    )

    XLSX.writeFile(wb, `saveup-rapport-${toDateString(new Date())}.xlsx`)
    setExporting(false)
  }, [])

  const exportPdf = useCallback(async () => {
    setExporting(true)
    setError(null)
    const { data, error: loadError } = await loadExportData()
    if (loadError || !data) {
      setError(loadError ?? 'Erreur lors de la préparation des données.')
      setExporting(false)
      return
    }

    const [{ default: JsPDF }, { autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])

    const doc = new JsPDF()
    doc.setFontSize(16)
    doc.text('SaveUp — Rapport financier', 14, 18)
    doc.setFontSize(10)
    doc.text(`Généré le ${toDateString(new Date())}`, 14, 25)

    autoTable(doc, {
      startY: 32,
      head: [['Résumé', 'Valeur']],
      body: [
        ['Revenu mensuel', formatCurrency(data.monthlyIncome)],
        ['Total dépenses fixes', formatCurrency(data.fixedExpenses.reduce((s, e) => s + e.amount, 0))],
        ['Total transactions', String(data.transactions.length)],
        ['Total épargné (tous objectifs)', formatCurrency(data.goals.reduce((s, g) => s + g.current, 0))],
      ],
    })

    let cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

    if (data.fixedExpenses.length > 0) {
      doc.setFontSize(12)
      doc.text('Dépenses fixes', 14, cursorY)
      autoTable(doc, {
        startY: cursorY + 4,
        head: [['Nom', 'Catégorie', 'Montant']],
        body: data.fixedExpenses.map((e) => [e.name, e.category, formatCurrency(e.amount)]),
      })
      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    }

    if (data.categoryTotals.length > 0) {
      doc.setFontSize(12)
      doc.text('Répartition par catégorie', 14, cursorY)
      autoTable(doc, {
        startY: cursorY + 4,
        head: [['Catégorie', 'Total', '% du total']],
        body: data.categoryTotals.map((c) => [c.category, formatCurrency(c.total), `${Math.round(c.pct)}%`]),
      })
      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    }

    if (data.goals.length > 0) {
      doc.setFontSize(12)
      doc.text('Objectifs d’épargne', 14, cursorY)
      autoTable(doc, {
        startY: cursorY + 4,
        head: [['Objectif', 'Actuel', 'Cible', 'Progression']],
        body: data.goals.map((g) => [
          g.name,
          formatCurrency(g.current),
          formatCurrency(g.target),
          `${Math.round(g.progressPct)}%`,
        ]),
      })
      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    }

    if (data.transactions.length > 0) {
      doc.addPage()
      doc.setFontSize(12)
      doc.text('Transactions', 14, 18)
      autoTable(doc, {
        startY: 24,
        head: [['Date', 'Description', 'Catégorie', 'Montant']],
        body: data.transactions.map((t) => [t.date, t.description, t.category, formatCurrency(t.amount)]),
        styles: { fontSize: 8 },
      })
    }

    doc.save(`saveup-rapport-${toDateString(new Date())}.pdf`)
    setExporting(false)
  }, [])

  return { exporting, error, exportExcel, exportPdf }
}
