import { useState } from 'react'
import { Card } from './Card'
import { UpgradePrompt } from './UpgradePrompt'
import { useCategories, findDuplicateCategory, type Category } from '../hooks/useCategories'
import { useSubscription } from '../hooks/useSubscription'
import { useLanguage } from '../hooks/useLanguage'
import { FALLBACK_CATEGORY } from '../lib/categories'
import { translateCategoryLabel } from '../lib/i18n/categoryLabels'
import { BUDGET } from '../lib/i18n/budget'
import { COMMON } from '../lib/i18n/common'
import type { Lang } from '../lib/i18n/language'

function CategoryRow({
  category,
  categories,
  lang,
  onRename,
  onRequestDelete,
  checking,
}: {
  category: Category
  categories: Category[]
  lang: Lang
  onRename: (id: string, newName: string) => void
  onRequestDelete: (id: string) => void
  checking: boolean
}) {
  const t = BUDGET[lang].categoryManager
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [renameError, setRenameError] = useState<string | null>(null)
  const isFallback = category.name === FALLBACK_CATEGORY

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === category.name) {
      setEditing(false)
      return
    }
    if (findDuplicateCategory(categories, trimmed, category.id)) {
      setRenameError(t.duplicateName)
      return
    }
    onRename(category.id, trimmed)
    setEditing(false)
  }

  if (editing) {
    return (
      <form onSubmit={submit} className="flex flex-col gap-2 py-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setRenameError(null)
            }}
            autoFocus
            className="flex-1 rounded-lg budget-field px-3 py-1.5 text-sm text-ink"
          />
          <button
            type="submit"
            className="rounded-lg budget-btn-primary px-3 py-1.5 text-sm font-medium"
          >
            {COMMON[lang].app.save}
          </button>
          <button
            type="button"
            onClick={() => {
              setName(category.name)
              setRenameError(null)
              setEditing(false)
            }}
            className="text-sm text-muted hover:text-ink"
          >
            {COMMON[lang].app.cancel}
          </button>
        </div>
        {renameError && <p className="text-xs text-red-400">{renameError}</p>}
      </form>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2">
      <span className="text-ink">{translateCategoryLabel(category.name, lang)}</span>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md px-2 py-1.5 text-sm budget-action-link"
        >
          {t.rename}
        </button>
        {!isFallback && (
          <button
            type="button"
            onClick={() => onRequestDelete(category.id)}
            disabled={checking}
            className="rounded-md px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60"
          >
            {checking ? t.checking : COMMON[lang].app.delete}
          </button>
        )}
      </div>
    </div>
  )
}

export function CategoryManager() {
  const { lang } = useLanguage()
  const t = BUDGET[lang].categoryManager
  const { categories, loading, error, addCategory, renameCategory, removeCategory, getUsageCount } =
    useCategories()
  const { limits } = useSubscription()
  const atCategoryLimit = limits.maxCategories !== null && categories.length >= limits.maxCategories
  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [addingCategory, setAddingCategory] = useState(false)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string; usageCount: number } | null>(
    null,
  )
  const [reassignTo, setReassignTo] = useState<string>('')

  async function requestDelete(id: string) {
    const category = categories.find((c) => c.id === id)
    if (!category) return
    setCheckingId(id)
    const usageCount = await getUsageCount(category.name)
    setCheckingId(null)
    if (usageCount === 0) {
      removeCategory(id)
      return
    }
    // Default to the first other category (alphabetical, same order the
    // list already renders in) rather than silently assuming "Autre" — the
    // picker below lets the user change it before confirming either way.
    const firstOther = categories.find((c) => c.id !== id)
    setReassignTo(firstOther?.name ?? FALLBACK_CATEGORY)
    setPendingDelete({ id, name: category.name, usageCount })
  }

  function confirmDelete() {
    if (!pendingDelete) return
    removeCategory(pendingDelete.id, { reassignTo })
    setPendingDelete(null)
  }

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed || addingCategory || atCategoryLimit) return
    if (findDuplicateCategory(categories, trimmed)) {
      setAddError(t.duplicateName)
      return
    }
    setAddError(null)
    setAddingCategory(true)
    await addCategory(trimmed)
    setAddingCategory(false)
    setNewName('')
  }

  return (
    <Card title={t.cardTitle} hint={t.cardHint}>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="py-2 text-sm text-muted">{t.loading}</p>
      ) : (
        <ul className="divide-y divide-overlay/10">
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryRow
                category={category}
                categories={categories}
                lang={lang}
                onRename={renameCategory}
                onRequestDelete={requestDelete}
                checking={checkingId === category.id}
              />
            </li>
          ))}
        </ul>
      )}

      {pendingDelete && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
          <p className="text-ink">
            {t.confirmDelete(translateCategoryLabel(pendingDelete.name, lang), pendingDelete.usageCount)}
          </p>
          <label className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink">
            {t.moveTo}
            <select
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
              className="rounded-lg budget-field px-2 py-1 text-sm text-ink"
            >
              {categories
                .filter((c) => c.id !== pendingDelete.id)
                .map((c) => (
                  <option key={c.id} value={c.name} className="bg-surface">
                    {translateCategoryLabel(c.name, lang)}
                  </option>
                ))}
            </select>
          </label>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg border border-red-400/40 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/30"
            >
              {t.reassignAndDelete}
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              className="rounded-lg border border-overlay/10 px-3 py-1.5 text-sm text-muted hover:text-ink"
            >
              {COMMON[lang].app.cancel}
            </button>
          </div>
        </div>
      )}

      {atCategoryLimit ? (
        <div className="mt-4">
          <UpgradePrompt
            title={t.limitReached(limits.maxCategories ?? 0)}
            description={t.limitDescription}
            variantClassName="border-primary/30 bg-primary/10"
            linkClassName="text-primary hover:opacity-80"
            minPlan="standard"
          />
        </div>
      ) : (
        <div className="mt-4">
          <form onSubmit={submitAdd} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value)
                setAddError(null)
              }}
              placeholder={t.newCategoryPlaceholder}
              className="flex-1 rounded-lg budget-field px-3 py-2 text-ink placeholder-muted"
            />
            <button
              type="submit"
              disabled={addingCategory}
              className="rounded-lg budget-btn-primary px-4 py-2 font-medium disabled:opacity-60"
            >
              {addingCategory ? t.adding : COMMON[lang].app.add}
            </button>
          </form>
          {addError && <p className="mt-2 text-sm text-red-400">{addError}</p>}
        </div>
      )}
    </Card>
  )
}
