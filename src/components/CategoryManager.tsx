import { useState } from 'react'
import { Card } from './Card'
import { useCategories, type Category } from '../hooks/useCategories'
import { FALLBACK_CATEGORY } from '../lib/categories'

function CategoryRow({
  category,
  onRename,
  onRequestDelete,
  checking,
}: {
  category: Category
  onRename: (id: string, newName: string) => void
  onRequestDelete: (id: string) => void
  checking: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const isFallback = category.name === FALLBACK_CATEGORY

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed && trimmed !== category.name) onRename(category.id, trimmed)
    setEditing(false)
  }

  if (editing) {
    return (
      <form onSubmit={submit} className="flex items-center gap-2 py-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary-strong px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={() => {
            setName(category.name)
            setEditing(false)
          }}
          className="text-sm text-muted hover:text-ink"
        >
          Annuler
        </button>
      </form>
    )
  }

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-ink">{category.name}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-accent hover:text-accent/80"
        >
          Renommer
        </button>
        {!isFallback && (
          <button
            type="button"
            onClick={() => onRequestDelete(category.id)}
            disabled={checking}
            className="text-sm text-red-400 hover:text-red-300 disabled:opacity-60"
          >
            {checking ? 'Vérification...' : 'Supprimer'}
          </button>
        )}
      </div>
    </div>
  )
}

export function CategoryManager() {
  const { categories, error, addCategory, renameCategory, removeCategory, getUsageCount } = useCategories()
  const [newName, setNewName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string; usageCount: number } | null>(
    null,
  )

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
    setPendingDelete({ id, name: category.name, usageCount })
  }

  function confirmDelete() {
    if (!pendingDelete) return
    removeCategory(pendingDelete.id, { reassignTo: FALLBACK_CATEGORY })
    setPendingDelete(null)
  }

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed || addingCategory) return
    setAddingCategory(true)
    await addCategory(trimmed)
    setAddingCategory(false)
    setNewName('')
  }

  return (
    <Card title="Catégories" hint="Crée, renomme ou supprime tes catégories de dépenses.">
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <ul className="divide-y divide-white/10">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryRow
              category={category}
              onRename={renameCategory}
              onRequestDelete={requestDelete}
              checking={checkingId === category.id}
            />
          </li>
        ))}
      </ul>

      {pendingDelete && (
        <div className="mt-3 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm">
          <p className="text-ink">
            « {pendingDelete.name} » est utilisée par {pendingDelete.usageCount} dépense
            {pendingDelete.usageCount > 1 ? 's' : ''}. Les réassigner à « {FALLBACK_CATEGORY} » et
            supprimer la catégorie ?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg border border-red-400/40 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/30"
            >
              Réassigner et supprimer
            </button>
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-muted hover:text-ink"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <form onSubmit={submitAdd} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nouvelle catégorie"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={addingCategory}
          className="rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
        >
          {addingCategory ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>
    </Card>
  )
}
