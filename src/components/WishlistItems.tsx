import { useState } from 'react'
import { Card } from './Card'
import { ProgressBar } from './ProgressBar'
import { formatCurrency } from '../lib/format'
import type { WishlistItem } from '../hooks/useWishlist'
import type { SavingsGoal } from '../hooks/useSavingsGoals'

const NO_GOAL = ''

function GoalSelect({
  goals,
  value,
  onChange,
}: {
  goals: SavingsGoal[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
    >
      <option value={NO_GOAL} className="bg-surface">
        Aucun objectif lié
      </option>
      {goals.map((goal) => (
        <option key={goal.id} value={goal.id} className="bg-surface">
          {goal.name}
        </option>
      ))}
    </select>
  )
}

function EditRow({
  item,
  goals,
  onSave,
  onCancel,
}: {
  item: WishlistItem
  goals: SavingsGoal[]
  onSave: (name: string, price: number, goalId: string | null) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item.name)
  const [price, setPrice] = useState(String(item.price))
  const [goalId, setGoalId] = useState(item.goalId ?? NO_GOAL)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(price)
    if (!name.trim() || !parsed || parsed <= 0) return
    onSave(name.trim(), parsed, goalId || null)
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2 py-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-w-[120px] flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
      />
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-24 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
      />
      <GoalSelect goals={goals} value={goalId} onChange={setGoalId} />
      <button
        type="submit"
        className="rounded-lg bg-primary-strong px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
      >
        Enregistrer
      </button>
      <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-ink">
        Annuler
      </button>
    </form>
  )
}

export function WishlistItems({
  items,
  total,
  goals,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: WishlistItem[]
  total: number
  goals: SavingsGoal[]
  onAdd: (name: string, price: number, goalId: string | null) => Promise<void>
  onUpdate: (id: string, name: string, price: number, goalId: string | null) => void
  onRemove: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [goalId, setGoalId] = useState(NO_GOAL)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const goalsById = new Map(goals.map((goal) => [goal.id, goal]))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(price)
    if (!name.trim() || !parsed || parsed <= 0 || submitting) return
    setSubmitting(true)
    await onAdd(name.trim(), parsed, goalId || null)
    setSubmitting(false)
    setName('')
    setPrice('')
    setGoalId(NO_GOAL)
  }

  return (
    <Card title="Ta liste" hint="Ce que tu aimerais t'offrir.">
      <p className="mb-4 text-3xl font-bold text-ink sm:text-4xl">{formatCurrency(total)}</p>

      <ul className="mb-4 divide-y divide-overlay/10">
        {items.length === 0 && (
          <li className="py-2 text-sm text-muted">
            Ta liste est vide pour l'instant — ajoute quelque chose que tu aimerais t'offrir ci-dessous.
          </li>
        )}
        {items.map((item) => {
          const linkedGoal = item.goalId ? goalsById.get(item.goalId) : undefined
          return editingId === item.id ? (
            <li key={item.id}>
              <EditRow
                item={item}
                goals={goals}
                onCancel={() => setEditingId(null)}
                onSave={(newName, newPrice, newGoalId) => {
                  onUpdate(item.id, newName, newPrice, newGoalId)
                  setEditingId(null)
                }}
              />
            </li>
          ) : (
            <li key={item.id} className="py-2">
              <div className="flex flex-wrap items-center justify-between gap-y-1">
                <div className="min-w-0">
                  <span className="text-ink">{item.name}</span>
                  {linkedGoal && (
                    <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                      {linkedGoal.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="mr-2 font-medium text-ink">{formatCurrency(item.price)}</span>
                  <button
                    type="button"
                    onClick={() => setEditingId(item.id)}
                    className="rounded-md px-2 py-1.5 text-sm text-accent hover:bg-accent/10 hover:text-accent/80"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="rounded-md px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Supprimer ${item.name}`}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              {linkedGoal && item.price > 0 && (
                <div className="mt-2">
                  <ProgressBar value={(linkedGoal.currentAmount / item.price) * 100} colorClass="bg-accent" />
                  <p className="mt-1 text-xs text-muted">
                    {Math.min(100, Math.round((linkedGoal.currentAmount / item.price) * 100))}% du prix déjà
                    épargné via « {linkedGoal.name} » ({formatCurrency(linkedGoal.currentAmount)} sur{' '}
                    {formatCurrency(item.price)})
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom (ex: MacBook)"
          className="min-w-[140px] flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
        />
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Prix"
          className="w-28 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
        />
        {goals.length > 0 && <GoalSelect goals={goals} value={goalId} onChange={setGoalId} />}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>
    </Card>
  )
}
