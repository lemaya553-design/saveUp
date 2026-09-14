import type { Lang } from './language'

// Labels written INTO downloadable files (CSV/Excel/PDF), not on-screen JSX —
// used by useCsvExport.ts and useDataExport.ts so an export follows the
// app's active UI language at the moment of export, same as any other text.
export interface ExportsContent {
  csv: {
    dateHeader: string
    typeHeader: string
    descriptionHeader: string
    amountHeader: string
    categoryHeader: string
    expenseType: string
    fixedExpenseType: string
    savingsContributionType: string
    deletedGoal: string
    // `goalName` is either a real savings goal name (user data, passed
    // through verbatim) or the deletedGoal fallback above — never translated
    // itself, just wrapped in this label.
    savingsDescription: (goalName: string) => string
    savingsCategory: string
  }
  dataExport: {
    prepFailed: string
    reportGeneratedOn: string
    monthlyIncome: string
    totalFixedExpenses: string
    totalTransactions: string
    totalSaved: string
    sheetSummary: string
    sheetFixedExpenses: string
    sheetByCategory: string
    sheetTransactions: string
    sheetGoals: string
    colName: string
    colCategory: string
    colAmount: string
    colTotal: string
    colPctOfTotal: string
    colDate: string
    colDescription: string
    colGoal: string
    colCurrentAmount: string
    colTargetAmount: string
    colProgressPct: string
    pdfTitle: string
    pdfGeneratedOn: (date: string) => string
    pdfSummaryHead: string
    pdfValueHead: string
    pdfCategoryBreakdownHeading: string
    pdfColCurrent: string
    pdfColTarget: string
    pdfColProgress: string
  }
}

export const EXPORTS: Record<Lang, ExportsContent> = {
  fr: {
    csv: {
      dateHeader: 'Date',
      typeHeader: 'Type',
      descriptionHeader: 'Description',
      amountHeader: 'Montant',
      categoryHeader: 'Catégorie',
      expenseType: 'Dépense',
      fixedExpenseType: 'Dépense fixe',
      savingsContributionType: 'Contribution épargne',
      deletedGoal: 'Objectif supprimé',
      savingsDescription: (goalName) => `Épargne — ${goalName}`,
      savingsCategory: 'Épargne',
    },
    dataExport: {
      prepFailed: 'Erreur lors de la préparation des données.',
      reportGeneratedOn: 'SaveUp — Rapport exporté le',
      monthlyIncome: 'Revenu mensuel',
      totalFixedExpenses: 'Total dépenses fixes',
      totalTransactions: 'Total transactions',
      totalSaved: 'Total épargné (tous objectifs)',
      sheetSummary: 'Résumé',
      sheetFixedExpenses: 'Dépenses fixes',
      sheetByCategory: 'Par catégorie',
      sheetTransactions: 'Transactions',
      sheetGoals: 'Objectifs d’épargne',
      colName: 'Nom',
      colCategory: 'Catégorie',
      colAmount: 'Montant',
      colTotal: 'Total',
      colPctOfTotal: '% du total',
      colDate: 'Date',
      colDescription: 'Description',
      colGoal: 'Objectif',
      colCurrentAmount: 'Montant actuel',
      colTargetAmount: 'Montant cible',
      colProgressPct: 'Progression %',
      pdfTitle: 'SaveUp — Rapport financier',
      pdfGeneratedOn: (date) => `Généré le ${date}`,
      pdfSummaryHead: 'Résumé',
      pdfValueHead: 'Valeur',
      pdfCategoryBreakdownHeading: 'Répartition par catégorie',
      pdfColCurrent: 'Actuel',
      pdfColTarget: 'Cible',
      pdfColProgress: 'Progression',
    },
  },
  en: {
    csv: {
      dateHeader: 'Date',
      typeHeader: 'Type',
      descriptionHeader: 'Description',
      amountHeader: 'Amount',
      categoryHeader: 'Category',
      expenseType: 'Expense',
      fixedExpenseType: 'Fixed expense',
      savingsContributionType: 'Savings contribution',
      deletedGoal: 'Deleted goal',
      savingsDescription: (goalName) => `Savings — ${goalName}`,
      savingsCategory: 'Savings',
    },
    dataExport: {
      prepFailed: 'Error while preparing the data.',
      reportGeneratedOn: 'SaveUp — Report exported on',
      monthlyIncome: 'Monthly income',
      totalFixedExpenses: 'Total fixed expenses',
      totalTransactions: 'Total transactions',
      totalSaved: 'Total saved (all goals)',
      sheetSummary: 'Summary',
      sheetFixedExpenses: 'Fixed expenses',
      sheetByCategory: 'By category',
      sheetTransactions: 'Transactions',
      sheetGoals: 'Savings goals',
      colName: 'Name',
      colCategory: 'Category',
      colAmount: 'Amount',
      colTotal: 'Total',
      colPctOfTotal: '% of total',
      colDate: 'Date',
      colDescription: 'Description',
      colGoal: 'Goal',
      colCurrentAmount: 'Current amount',
      colTargetAmount: 'Target amount',
      colProgressPct: 'Progress %',
      pdfTitle: 'SaveUp — Financial report',
      pdfGeneratedOn: (date) => `Generated on ${date}`,
      pdfSummaryHead: 'Summary',
      pdfValueHead: 'Value',
      pdfCategoryBreakdownHeading: 'Breakdown by category',
      pdfColCurrent: 'Current',
      pdfColTarget: 'Target',
      pdfColProgress: 'Progress',
    },
  },
}
