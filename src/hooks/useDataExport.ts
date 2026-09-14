import { useCallback, useState } from 'react'
import type * as XLSXType from 'xlsx'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatCurrencyEN, toDateString } from '../lib/format'
import { useLanguage } from './useLanguage'
import { EXPORTS } from '../lib/i18n/exports'
import type { Lang } from '../lib/i18n/language'

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

// EN exports reuse formatCurrencyEN (CAD-suffixed) so an English reader
// doesn't misread a bare "$" as USD — same rationale as the marketing pages,
// see lib/format.ts.
function fmtCurrency(amount: number, lang: Lang): string {
  return lang === 'en' ? formatCurrencyEN(amount) : formatCurrency(amount)
}

export function useDataExport() {
  const { lang } = useLanguage()
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportExcel = useCallback(async () => {
    const t = EXPORTS[lang].dataExport
    setExporting(true)
    setError(null)
    const { data, error: loadError } = await loadExportData()
    if (loadError || !data) {
      setError(loadError ?? t.prepFailed)
      setExporting(false)
      return
    }

    const XLSX: typeof XLSXType = await import('xlsx')
    const wb = XLSX.utils.book_new()

    const summarySheet = XLSX.utils.aoa_to_sheet([
      [t.reportGeneratedOn, toDateString(new Date())],
      [],
      [t.monthlyIncome, data.monthlyIncome],
      [t.totalFixedExpenses, data.fixedExpenses.reduce((s, e) => s + e.amount, 0)],
      [t.totalTransactions, data.transactions.length],
      [t.totalSaved, data.goals.reduce((s, g) => s + g.current, 0)],
    ])
    XLSX.utils.book_append_sheet(wb, summarySheet, t.sheetSummary)

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.fixedExpenses.map((e) => ({ [t.colName]: e.name, [t.colCategory]: e.category, [t.colAmount]: e.amount })),
      ),
      t.sheetFixedExpenses,
    )

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.categoryTotals.map((c) => ({
          [t.colCategory]: c.category,
          [t.colTotal]: c.total,
          [t.colPctOfTotal]: Math.round(c.pct * 10) / 10,
        })),
      ),
      t.sheetByCategory,
    )

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.transactions.map((tr) => ({
          [t.colDate]: tr.date,
          [t.colDescription]: tr.description,
          [t.colCategory]: tr.category,
          [t.colAmount]: tr.amount,
        })),
      ),
      t.sheetTransactions,
    )

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        data.goals.map((g) => ({
          [t.colGoal]: g.name,
          [t.colCurrentAmount]: g.current,
          [t.colTargetAmount]: g.target,
          [t.colProgressPct]: Math.round(g.progressPct * 10) / 10,
        })),
      ),
      t.sheetGoals,
    )

    XLSX.writeFile(wb, `saveup-rapport-${toDateString(new Date())}.xlsx`)
    setExporting(false)
  }, [lang])

  const exportPdf = useCallback(async () => {
    const t = EXPORTS[lang].dataExport
    setExporting(true)
    setError(null)
    const { data, error: loadError } = await loadExportData()
    if (loadError || !data) {
      setError(loadError ?? t.prepFailed)
      setExporting(false)
      return
    }

    const [{ default: JsPDF }, { autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])

    const doc = new JsPDF()
    doc.setFontSize(16)
    doc.text(t.pdfTitle, 14, 18)
    doc.setFontSize(10)
    doc.text(t.pdfGeneratedOn(toDateString(new Date())), 14, 25)

    autoTable(doc, {
      startY: 32,
      head: [[t.pdfSummaryHead, t.pdfValueHead]],
      body: [
        [t.monthlyIncome, fmtCurrency(data.monthlyIncome, lang)],
        [t.totalFixedExpenses, fmtCurrency(data.fixedExpenses.reduce((s, e) => s + e.amount, 0), lang)],
        [t.totalTransactions, String(data.transactions.length)],
        [t.totalSaved, fmtCurrency(data.goals.reduce((s, g) => s + g.current, 0), lang)],
      ],
    })

    let cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

    if (data.fixedExpenses.length > 0) {
      doc.setFontSize(12)
      doc.text(t.sheetFixedExpenses, 14, cursorY)
      autoTable(doc, {
        startY: cursorY + 4,
        head: [[t.colName, t.colCategory, t.colAmount]],
        body: data.fixedExpenses.map((e) => [e.name, e.category, fmtCurrency(e.amount, lang)]),
      })
      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    }

    if (data.categoryTotals.length > 0) {
      doc.setFontSize(12)
      doc.text(t.pdfCategoryBreakdownHeading, 14, cursorY)
      autoTable(doc, {
        startY: cursorY + 4,
        head: [[t.colCategory, t.colTotal, t.colPctOfTotal]],
        body: data.categoryTotals.map((c) => [c.category, fmtCurrency(c.total, lang), `${Math.round(c.pct)}%`]),
      })
      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    }

    if (data.goals.length > 0) {
      doc.setFontSize(12)
      doc.text(t.sheetGoals, 14, cursorY)
      autoTable(doc, {
        startY: cursorY + 4,
        head: [[t.colGoal, t.pdfColCurrent, t.pdfColTarget, t.pdfColProgress]],
        body: data.goals.map((g) => [
          g.name,
          fmtCurrency(g.current, lang),
          fmtCurrency(g.target, lang),
          `${Math.round(g.progressPct)}%`,
        ]),
      })
      cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    }

    if (data.transactions.length > 0) {
      doc.addPage()
      doc.setFontSize(12)
      doc.text(t.sheetTransactions, 14, 18)
      autoTable(doc, {
        startY: 24,
        head: [[t.colDate, t.colDescription, t.colCategory, t.colAmount]],
        body: data.transactions.map((tr) => [tr.date, tr.description, tr.category, fmtCurrency(tr.amount, lang)]),
        styles: { fontSize: 8 },
      })
    }

    doc.save(`saveup-rapport-${toDateString(new Date())}.pdf`)
    setExporting(false)
  }, [lang])

  return { exporting, error, exportExcel, exportPdf }
}
