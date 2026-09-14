import { useEffect, useMemo, useRef, useState } from 'react'
import { Modal } from './Modal'
import { supabase } from '../lib/supabase'
import { FALLBACK_CATEGORY } from '../lib/categories'
import { useExpenses } from '../hooks/useExpenses'
import { useAccounts } from '../hooks/useAccounts'
import { useCategories } from '../hooks/useCategories'
import { useCustomKeywords } from '../hooks/useCustomKeywords'
import { useSubscription } from '../hooks/useSubscription'
import { usePreferences } from '../hooks/usePreferences'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { BUDGET } from '../lib/i18n/budget'
import { COMMON } from '../lib/i18n/common'
import {
  parseFile,
  detectColumnMapping,
  buildImportRows,
  markDuplicates,
  type AmountMode,
  type ColumnMapping,
  type ExistingExpenseForDedup,
  type ExpenseSign,
  type ParsedFile,
} from '../lib/importParsing'

type Step = 'upload' | 'account' | 'mapping' | 'result'

const PREVIEW_LIMIT = 25

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-primary-strong text-white' : 'bg-overlay/5 text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function ColumnSelect({
  label,
  headers,
  value,
  onChange,
  allowNone = false,
  noneLabel,
}: {
  label: string
  headers: string[]
  value: number | null
  onChange: (value: number | null) => void
  allowNone?: boolean
  noneLabel?: string
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted">
      {label}
      <select
        value={value === null ? '' : value}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink focus:border-primary focus:outline-none"
      >
        {allowNone && (
          <option value="" className="bg-surface">
            {noneLabel}
          </option>
        )}
        {headers.map((header, i) => (
          <option key={i} value={i} className="bg-surface">
            {header}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ImportTransactionsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = BUDGET[lang].importModal
  const formatMoney = useMoneyFormat()
  const SKIP_LABELS: Record<string, string> = {
    'invalid-date': t.skipLabels.invalidDate,
    'invalid-amount': t.skipLabels.invalidAmount,
    'not-an-expense': t.skipLabels.notAnExpense,
  }
  const { addExpensesBulk } = useExpenses()
  const { accounts, addAccount } = useAccounts()
  const { categoryNames } = useCategories()
  const { keywords: customKeywords } = useCustomKeywords()
  const subscription = useSubscription()
  const preferences = usePreferences()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [fileError, setFileError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [reading, setReading] = useState(false)
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping | null>(null)
  const [existing, setExisting] = useState<ExistingExpenseForDedup[] | null>(null)
  const [dedupLoading, setDedupLoading] = useState(false)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ imported: number; error: string | null } | null>(null)

  const [selectedAccountName, setSelectedAccountName] = useState<string | null>(null)
  const [newAccountName, setNewAccountName] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)

  function resetAll() {
    setStep('upload')
    setFileError(null)
    setFileName('')
    setReading(false)
    setParsedFile(null)
    setMapping(null)
    setExisting(null)
    setSelected(new Set())
    setImporting(false)
    setResult(null)
    setSelectedAccountName(null)
    setNewAccountName('')
    setCreatingAccount(false)
    setAccountError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleClose() {
    resetAll()
    onClose()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError(null)
    setFileName(file.name)
    setReading(true)
    try {
      const parsed = await parseFile(file, lang)
      setParsedFile(parsed)
      setMapping(detectColumnMapping(parsed.headers))
      setStep('account')
    } catch (err) {
      setFileError(err instanceof Error ? err.message : t.fileReadError)
    } finally {
      setReading(false)
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newAccountName.trim()
    if (!trimmed) return
    setAccountError(null)
    setCreatingAccount(true)
    const { account, error } = await addAccount(trimmed)
    setCreatingAccount(false)
    if (!account) {
      setAccountError(error ?? t.accountCreateError)
      return
    }
    setSelectedAccountName(account.name)
    setNewAccountName('')
  }

  const importRows = useMemo(() => {
    if (!parsedFile || !mapping) return []
    const built = buildImportRows(parsedFile.rows, mapping, categoryNames, FALLBACK_CATEGORY, lang, customKeywords)
    return existing ? markDuplicates(built, existing) : built
  }, [parsedFile, mapping, existing, categoryNames, lang])

  const dateRangeKey = useMemo(() => {
    const dates = importRows.map((r) => r.spentAt).filter((d): d is string => d !== null)
    if (dates.length === 0) return null
    return `${dates.reduce((a, b) => (a < b ? a : b))}_${dates.reduce((a, b) => (a > b ? a : b))}`
  }, [importRows])

  // Duplicate check queries only the file's own date range — RLS already
  // scopes results to the signed-in user, no manual filter needed.
  useEffect(() => {
    if (!dateRangeKey || step !== 'mapping') return
    const [start, end] = dateRangeKey.split('_')
    let cancelled = false
    setDedupLoading(true)
    supabase
      .from('expenses')
      .select('amount, spent_at, description')
      .gte('spent_at', start)
      .lte('spent_at', `${end}T23:59:59`)
      .then(({ data }) => {
        if (cancelled) return
        setExisting(data ?? [])
        setDedupLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [dateRangeKey, step])

  // Default selection whenever the mapping or duplicate list changes: every
  // valid, non-duplicate row checked; duplicates start unchecked so the user
  // has to deliberately opt into re-importing them.
  useEffect(() => {
    setSelected(new Set(importRows.filter((r) => !r.skipReason && !r.isDuplicate).map((r) => r.index)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedFile, mapping, existing])

  function toggleRow(index: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function updateMapping(patch: Partial<ColumnMapping>) {
    setMapping((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const isMappingValid =
    mapping !== null &&
    mapping.dateColumn !== null &&
    (mapping.amountMode === 'single' ? mapping.amountColumn !== null : mapping.debitColumn !== null)

  const validCount = importRows.filter((r) => !r.skipReason).length
  const skippedCount = importRows.length - validCount
  const duplicateCount = importRows.filter((r) => r.isDuplicate).length
  const selectedCount = selected.size
  const selectedTotal = importRows
    .filter((r) => selected.has(r.index) && r.amount !== null)
    .reduce((sum, r) => sum + (r.amount ?? 0), 0)

  async function handleImport() {
    setImporting(true)
    const rows = importRows
      .filter((r) => selected.has(r.index) && r.amount !== null && r.spentAt !== null)
      .map((r) => ({
        description: r.description,
        amount: r.amount as number,
        category: r.category,
        spent_at: r.spentAt as string,
        account: selectedAccountName,
      }))
    const outcome = await addExpensesBulk(rows)
    setImporting(false)
    setResult(outcome)
    setStep('result')
    // Standard/Premium have unlimited import — only Free's 2-import
    // exception needs tracking.
    if (subscription.plan === 'free') {
      preferences.incrementCsvImportCount()
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={t.title} maxWidthClassName="max-w-3xl">
      {step === 'upload' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">{t.upload.intro(translateCategoryLabel(FALLBACK_CATEGORY, lang))}</p>

          <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-overlay/15 p-6 text-center text-sm text-muted transition-colors hover:border-primary/40 hover:text-ink">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            {reading ? (
              <span>{t.upload.readingFile(fileName)}</span>
            ) : (
              <>
                <span className="font-medium">{t.upload.dropCta}</span>
                <span className="text-xs">{t.upload.dropHint}</span>
              </>
            )}
          </label>

          {fileError && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
              {fileError}
            </p>
          )}

          <details className="group rounded-xl border border-overlay/10 bg-overlay/[0.03] px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-ink marker:content-none">
              <span className="mr-1.5 inline-block transition-transform group-open:rotate-90">›</span>
              {t.upload.howToSummary}
            </summary>
            <div className="mt-3 flex flex-col gap-3 text-sm text-muted">
              <div>
                <p className="font-medium text-ink">{t.upload.formatTitle}</p>
                <p className="mt-1">{t.upload.formatBody}</p>
              </div>
              <div>
                <p className="font-medium text-ink">{t.upload.obtainTitle}</p>
                <p className="mt-1">{t.upload.obtainBody}</p>
              </div>
            </div>
          </details>
        </div>
      )}

      {step === 'account' && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm text-muted">
              {t.fileLabel} <span className="text-ink">{fileName}</span>
            </p>
            <p className="mt-1 text-sm text-ink">{t.account.question}</p>
            <p className="mt-1 text-xs text-muted">{t.account.hint}</p>
          </div>

          {accounts.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted">{t.account.existingAccounts}</p>
              <div className="flex flex-wrap gap-2">
                {accounts.map((account) => (
                  <ToggleButton
                    key={account.id}
                    active={selectedAccountName === account.name}
                    onClick={() => setSelectedAccountName(account.name)}
                  >
                    {account.name}
                  </ToggleButton>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="flex flex-wrap items-end gap-2">
            <label className="flex flex-1 flex-col gap-1 text-sm text-muted">
              {accounts.length > 0 ? t.account.newAccountLabel : t.account.newAccountLabelAlone}
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder={t.account.newAccountPlaceholder}
                className="min-w-[180px] rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={creatingAccount || !newAccountName.trim()}
              className="rounded-lg border border-overlay/10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
            >
              {creatingAccount ? t.account.creating : t.account.create}
            </button>
          </form>

          {accountError && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
              {accountError}
            </p>
          )}

          {selectedAccountName && (
            <p className="text-sm text-success">{t.account.selected(selectedAccountName)}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="rounded-lg border border-overlay/10 px-4 py-2 text-sm text-muted hover:text-ink"
            >
              {t.account.restart}
            </button>
            <button
              type="button"
              disabled={!selectedAccountName}
              onClick={() => setStep('mapping')}
              className="ml-auto rounded-lg bg-primary-strong px-5 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              {t.account.continueButton}
            </button>
          </div>
        </div>
      )}

      {step === 'mapping' && mapping && parsedFile && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm text-muted">
              {t.fileLabel} <span className="text-ink">{fileName}</span> — {t.mapping.rowsDetected(parsedFile.rows.length)}
              {' '}
              {t.mapping.accountLabel} <span className="text-ink">{selectedAccountName}</span>.
            </p>
            <p className="mt-1 text-xs text-muted">{t.mapping.hint}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColumnSelect
              label={t.mapping.dateColumn}
              headers={parsedFile.headers}
              value={mapping.dateColumn}
              onChange={(v) => updateMapping({ dateColumn: v })}
            />
            <ColumnSelect
              label={t.mapping.descriptionColumn}
              headers={parsedFile.headers}
              value={mapping.descriptionColumn}
              onChange={(v) => updateMapping({ descriptionColumn: v })}
              allowNone
              noneLabel={t.mapping.noneOption}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColumnSelect
              label={t.mapping.categoryColumn}
              headers={parsedFile.headers}
              value={mapping.categoryColumn}
              onChange={(v) => updateMapping({ categoryColumn: v })}
              allowNone
              noneLabel={t.mapping.noneOption}
            />
            <p className="self-end pb-2 text-xs text-muted">
              {t.mapping.categoryHintPrefix} <span className="text-accent">{t.mapping.suggestedBadge}</span>{' '}
              {t.mapping.categoryHintSuffix}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm text-muted">{t.mapping.amountLabel}</p>
            <div className="flex flex-wrap gap-2">
              <ToggleButton
                active={mapping.amountMode === 'single'}
                onClick={() => updateMapping({ amountMode: 'single' as AmountMode })}
              >
                {t.mapping.singleMode}
              </ToggleButton>
              <ToggleButton
                active={mapping.amountMode === 'split'}
                onClick={() => updateMapping({ amountMode: 'split' as AmountMode })}
              >
                {t.mapping.splitMode}
              </ToggleButton>
            </div>
          </div>

          {mapping.amountMode === 'single' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ColumnSelect
                label={t.mapping.amountColumn}
                headers={parsedFile.headers}
                value={mapping.amountColumn}
                onChange={(v) => updateMapping({ amountColumn: v })}
              />
              <div>
                <p className="mb-2 text-sm text-muted">{t.mapping.signQuestion}</p>
                <div className="flex flex-wrap gap-2">
                  <ToggleButton
                    active={mapping.expenseSign === 'negative'}
                    onClick={() => updateMapping({ expenseSign: 'negative' as ExpenseSign })}
                  >
                    {t.mapping.negativeOption}
                  </ToggleButton>
                  <ToggleButton
                    active={mapping.expenseSign === 'positive'}
                    onClick={() => updateMapping({ expenseSign: 'positive' as ExpenseSign })}
                  >
                    {t.mapping.positiveOption}
                  </ToggleButton>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <ColumnSelect
                label={t.mapping.debitColumn}
                headers={parsedFile.headers}
                value={mapping.debitColumn}
                onChange={(v) => updateMapping({ debitColumn: v })}
              />
              <ColumnSelect
                label={t.mapping.creditColumn}
                headers={parsedFile.headers}
                value={mapping.creditColumn}
                onChange={(v) => updateMapping({ creditColumn: v })}
                allowNone
                noneLabel={t.mapping.noneOption}
              />
            </div>
          )}

          <div className="border-t border-overlay/10 pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-ink">
                <span className="font-semibold text-success">{selectedCount}</span> {t.mapping.selectedLabel(selectedCount)} · {formatMoney(selectedTotal)}
                {duplicateCount > 0 && (
                  <span className="text-muted"> · {t.mapping.duplicatesSummary(duplicateCount)}</span>
                )}
                {skippedCount > 0 && (
                  <span className="text-muted"> · {t.mapping.skippedSummary(skippedCount)}</span>
                )}
              </p>
              {dedupLoading && <span className="text-xs text-muted">{t.mapping.checkingDuplicates}</span>}
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelected(new Set(importRows.filter((r) => !r.skipReason).map((r) => r.index)))}
                  className="text-accent hover:text-accent/80"
                >
                  {t.mapping.selectAll}
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="text-accent hover:text-accent/80"
                >
                  {t.mapping.deselectAll}
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-auto rounded-xl border border-overlay/10">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="sticky top-0 bg-surface text-xs text-muted">
                  <tr className="border-b border-overlay/10">
                    <th className="w-10 px-3 py-2"></th>
                    <th className="px-3 py-2 font-medium">{t.mapping.tableDate}</th>
                    <th className="px-3 py-2 font-medium">{t.mapping.tableDescription}</th>
                    <th className="px-3 py-2 font-medium">{t.mapping.tableCategory}</th>
                    <th className="px-3 py-2 text-right font-medium">{t.mapping.tableAmount}</th>
                    <th className="px-3 py-2 font-medium">{t.mapping.tableStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  {importRows.slice(0, PREVIEW_LIMIT).map((row) => (
                    <tr key={row.index} className="border-b border-overlay/5 last:border-b-0">
                      <td className="px-3 py-2">
                        {!row.skipReason && (
                          <input
                            type="checkbox"
                            checked={selected.has(row.index)}
                            onChange={() => toggleRow(row.index)}
                            className="h-4 w-4 accent-primary"
                          />
                        )}
                      </td>
                      <td className={`px-3 py-2 ${row.skipReason ? 'text-muted' : 'text-ink'}`}>
                        {row.spentAt ?? row.raw[mapping.dateColumn ?? 0] ?? '—'}
                      </td>
                      <td className={`px-3 py-2 ${row.skipReason ? 'text-muted' : 'text-ink'}`}>
                        {row.description}
                      </td>
                      <td className="px-3 py-2">
                        {!row.skipReason && (
                          <span className="text-ink">
                            {translateCategoryLabel(row.category, lang)}
                            {row.categoryGuessed && (
                              <span className="ml-1.5 text-xs text-accent">{t.mapping.suggestedBadge}</span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className={`px-3 py-2 text-right ${row.skipReason ? 'text-muted' : 'text-ink'}`}>
                        {row.amount !== null ? formatMoney(row.amount) : '—'}
                      </td>
                      <td className="px-3 py-2">
                        {row.skipReason ? (
                          <span className="text-xs text-muted">{SKIP_LABELS[row.skipReason]}</span>
                        ) : row.isDuplicate ? (
                          <span className="text-xs text-accent">{t.mapping.duplicateBadge}</span>
                        ) : (
                          <span className="text-xs text-success">{t.mapping.readyBadge}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {importRows.length > PREVIEW_LIMIT && (
              <p className="mt-2 text-xs text-muted">
                {t.mapping.previewLimited(PREVIEW_LIMIT, importRows.length - PREVIEW_LIMIT)}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="rounded-lg border border-overlay/10 px-4 py-2 text-sm text-muted hover:text-ink"
            >
              {t.mapping.restart}
            </button>
            <button
              type="button"
              disabled={!isMappingValid || selectedCount === 0 || importing}
              onClick={handleImport}
              className="ml-auto rounded-lg bg-primary-strong px-5 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
            >
              {importing ? t.mapping.importing : t.mapping.importButton(selectedCount)}
            </button>
          </div>
          {!isMappingValid && <p className="text-xs text-accent">{t.mapping.invalidHint}</p>}
        </div>
      )}

      {step === 'result' && result && (
        <div className="flex flex-col gap-4">
          {result.error ? (
            <>
              <p className="text-sm text-red-300">
                {result.imported > 0 ? t.result.partialError(result.imported) : t.result.failed}
              </p>
              <p className="rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
                {result.error}
              </p>
            </>
          ) : result.imported === 0 ? (
            <p className="rounded-lg border border-red-900/50 bg-red-950/50 px-3 py-2 text-sm text-red-300">
              {t.result.zeroImported}
            </p>
          ) : (
            <p className="text-sm text-ink">
              <span className="text-success">✓</span> {t.result.success(result.imported)}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="rounded-lg border border-overlay/10 px-4 py-2 text-sm text-muted hover:text-ink"
            >
              {t.result.importAnother}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg bg-primary-strong px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
            >
              {COMMON[lang].app.close}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
