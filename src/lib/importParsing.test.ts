import { describe, expect, it } from 'vitest'
import { parseFile } from './importParsing'

// Only the unsupported-extension rejection is exercised here — it's a pure
// synchronous check before any CSV/XLSX reading happens, so a minimal mock
// (just a `name`) is enough without needing a real File/FileReader, which
// aren't available in Vitest's default node environment.
function fakeFile(name: string): File {
  return { name } as unknown as File
}

describe('parseFile unsupported format', () => {
  it('rejects a PDF with a clear "wrong format" message, in French', async () => {
    await expect(parseFile(fakeFile('relevé-bancaire.pdf'), 'fr')).rejects.toThrow(
      /format de fichier n'est pas pris en charge/,
    )
  })

  it('rejects a PDF with a clear "wrong format" message, in English', async () => {
    await expect(parseFile(fakeFile('bank-statement.pdf'), 'en')).rejects.toThrow(/file format isn't supported/)
  })

  it('rejects a file with no extension at all', async () => {
    await expect(parseFile(fakeFile('relevé'), 'fr')).rejects.toThrow(/format de fichier/)
  })

  it('rejects a .docx the same way as a PDF', async () => {
    await expect(parseFile(fakeFile('relevé.docx'), 'fr')).rejects.toThrow(/format de fichier/)
  })

  it('does NOT reject .csv, .xlsx or .xls by extension (fails later, for a different reason)', async () => {
    // These still throw (empty mock file has no real content to parse),
    // but NOT with the unsupported-format message — confirms the
    // extension allowlist itself isn't accidentally blocking real formats.
    for (const name of ['relevé.csv', 'relevé.xlsx', 'relevé.xls']) {
      await expect(parseFile(fakeFile(name), 'fr')).rejects.not.toThrow(/format de fichier n'est pas pris en charge/)
    }
  })
})
