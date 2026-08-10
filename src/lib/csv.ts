function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n')
}

// Triggers a browser download of the given text as a .csv file. A UTF-8
// BOM is prepended so accented characters (é, è...) render correctly when
// the file is opened directly in Excel, not just in a text editor.
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
