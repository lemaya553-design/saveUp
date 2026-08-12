import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../lib/format'
import type { CategorySpendingEntry, CategoryTransaction } from '../lib/categorySpending'

// Blue / mauve — the app's palette — at three lightnesses each, so there's
// enough spread for more than 3-4 categories without leaving that family.
// Green is deliberately excluded here and reserved for the Épargne bar
// below (SAVINGS_COLOR), so no spending category can ever hash to the same
// hue as "money saved". Picked by hand rather than run through the
// categorical-palette validator: this is a small, low-stakes internal list,
// not a new standalone dataviz surface.
const CATEGORY_COLORS = [
  '#4a6cf7', // primary blue
  '#8b5cf6', // accent mauve
  '#3e5fe0', // deep blue (primary-strong)
  '#7c3aed', // deep mauve
  '#93c5fd', // light blue
  '#c4b5fd', // light mauve
]

// Reserved, not drawn from the hash palette above — matches the
// 'Épargne' → success-green convention already established on the Budget
// page (lib/budgetInsights.ts computeCategoryBreakdown), so it's always
// visually distinct from any spending category, never a coincidental hash
// collision.
const SAVINGS_COLOR = '#22c55e'
const SAVINGS_CATEGORY = 'Épargne'

// Deterministic hash of the category NAME string — not its position in the
// entries array — so a category keeps the same color from one month to the
// next even though array order shifts as spending amounts change.
function colorForCategory(category: string): string {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

function barColor(entry: CategorySpendingEntry): string {
  return entry.category === SAVINGS_CATEGORY ? SAVINGS_COLOR : colorForCategory(entry.category)
}

const MIN_BAR_WIDTH = 76
const CHART_HEIGHT = 220
const DROPDOWN_WIDTH = 256 // matches w-64
const DROPDOWN_MARGIN = 8

function BarTopLabel({
  x,
  y,
  width,
  index,
  entries,
}: {
  x?: number | string
  y?: number | string
  width?: number | string
  index?: number
  entries: CategorySpendingEntry[]
}) {
  if (x === undefined || y === undefined || width === undefined || index === undefined) return null
  const entry = entries[index]
  if (!entry) return null

  const numX = Number(x)
  const numY = Number(y)
  const numWidth = Number(width)

  return (
    <text x={numX + numWidth / 2} y={numY - 8} textAnchor="middle" fill="#f5f5f7" fontSize={12} fontWeight={600}>
      {formatCurrency(entry.total)}
    </text>
  )
}

// Renders the category name under each bar as a clickable label (real
// categories only — the synthetic "Épargne" bar has no backing row, so it's
// rendered as plain, non-interactive text). Editing swaps the label for an
// actual <input>, embedded via <foreignObject> since XAxis ticks are drawn
// in SVG space — this is the standard way to mix regular HTML into an SVG
// subtree.
function CategoryTick({
  x,
  y,
  payload,
  categories,
  editingCategory,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
}: {
  x?: number | string
  y?: number | string
  payload?: { value: string }
  categories: { id: string; name: string }[]
  editingCategory: string | null
  onStartEdit: (name: string) => void
  onCommitEdit: (id: string, newName: string) => void
  onCancelEdit: () => void
}) {
  if (x === undefined || y === undefined || !payload) return null
  const numX = Number(x)
  const numY = Number(y)
  const name = payload.value
  const category = categories.find((c) => c.name === name)
  const isEditable = name !== SAVINGS_CATEGORY && !!category
  const isEditing = editingCategory === name

  if (isEditing && category) {
    return (
      <foreignObject x={numX - 45} y={numY} width={90} height={24}>
        <input
          type="text"
          defaultValue={name}
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => onCommitEdit(category.id, e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') {
              e.currentTarget.value = name
              onCancelEdit()
            }
          }}
          className="w-full rounded border border-primary bg-[#15151f] px-1 py-0.5 text-center text-xs text-ink focus:outline-none"
        />
      </foreignObject>
    )
  }

  return (
    <g
      transform={`translate(${numX},${numY})`}
      onClick={() => isEditable && onStartEdit(name)}
      style={{ cursor: isEditable ? 'pointer' : 'default' }}
    >
      <text x={0} y={12} textAnchor="middle" fill="#f5f5f7" fontSize={12}>
        {name}
        {isEditable ? <tspan fill="#9ca3af" dx={3} fontSize={10}>✎</tspan> : null}
      </text>
    </g>
  )
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: CategorySpendingEntry }[]
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  const isSavings = entry.category === SAVINGS_CATEGORY
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/40">
      <p className="font-semibold text-ink">{entry.category}</p>
      {isSavings ? (
        <p className="mt-1 text-ink">Mis de côté ce mois-là</p>
      ) : (
        <p className="mt-1 text-ink">
          {entry.pctOfIncome !== null
            ? `${entry.pctOfIncome.toFixed(0)}% de ton revenu`
            : 'Revenu mensuel non défini'}
        </p>
      )}
      <p className="text-muted">{formatCurrency(entry.total)}</p>
      <p className="mt-1 text-accent">Clique pour voir le détail</p>
    </div>
  )
}

interface DropdownAnchor {
  top: number
  centerX: number
}

// The bar rect's own bounding box, clamped so the fixed-width dropdown never
// overflows the viewport's left/right edge.
function anchorFromRect(rect: DOMRect): DropdownAnchor {
  const half = DROPDOWN_WIDTH / 2
  const desiredCenterX = rect.left + rect.width / 2
  const minCenterX = half + DROPDOWN_MARGIN
  const maxCenterX = window.innerWidth - half - DROPDOWN_MARGIN
  const centerX = Math.min(Math.max(desiredCenterX, minCenterX), maxCenterX)
  return { top: rect.bottom + DROPDOWN_MARGIN, centerX }
}

export function CategorySpendingChart({
  entries,
  savingsTotal = 0,
  savingsTransactions = [],
  categories = [],
  onRenameCategory,
  onReclassify,
}: {
  entries: CategorySpendingEntry[]
  savingsTotal?: number
  savingsTransactions?: CategoryTransaction[]
  categories?: { id: string; name: string }[]
  onRenameCategory?: (id: string, newName: string) => void | Promise<void>
  onReclassify?: (transaction: CategoryTransaction, newCategory: string) => void | Promise<void>
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [anchor, setAnchor] = useState<DropdownAnchor | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ transaction: CategoryTransaction; fromCategory: string } | null>(null)
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function commitRename(id: string, newName: string) {
    setEditingCategory(null)
    const trimmed = newName.trim()
    if (trimmed) onRenameCategory?.(id, trimmed)
  }

  function endDrag() {
    setDragging(null)
    setDragOverCategory(null)
  }

  function handleDrop(targetCategory: string) {
    if (dragging && targetCategory !== SAVINGS_CATEGORY && dragging.fromCategory !== targetCategory) {
      onReclassify?.(dragging.transaction, targetCategory)
    }
    endDrag()
  }

  const displayEntries = useMemo(() => {
    if (savingsTotal <= 0) return entries
    const savingsEntry: CategorySpendingEntry = {
      category: SAVINGS_CATEGORY,
      total: savingsTotal,
      pctOfIncome: null,
      transactions: savingsTransactions,
    }
    return [...entries, savingsEntry]
  }, [entries, savingsTotal, savingsTransactions])

  function closeDropdown() {
    setExpandedCategory(null)
    setAnchor(null)
  }

  // Rendered via a portal straight into document.body (see below), so
  // clicking a bar elsewhere on the page, scrolling, or resizing must close
  // it explicitly — position:fixed coordinates are computed once, at open
  // time, and would otherwise drift away from the bar they're anchored to.
  useEffect(() => {
    if (!expandedCategory) return
    function handlePointerDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown()
      }
    }
    function handleScrollOrResize() {
      closeDropdown()
    }
    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedCategory])

  if (displayEntries.length === 0) {
    return (
      <p className="text-sm text-muted">
        Aucune dépense ponctuelle enregistrée ce mois-ci pour l'instant.
      </p>
    )
  }

  const expanded = displayEntries.find((e) => e.category === expandedCategory) ?? null
  // Below this width, columns and their category labels get cramped rather
  // than legible — a horizontal-scroll container (not shrinking text) keeps
  // every label readable regardless of how many categories there are.
  const chartWidth = Math.max(280, displayEntries.length * MIN_BAR_WIDTH)

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <div className="relative" style={{ minWidth: chartWidth }}>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={displayEntries} margin={{ top: 24, right: 8, left: 8, bottom: 4 }} barCategoryGap={16}>
              <YAxis hide domain={[0, (dataMax: number) => dataMax * 1.15]} />
              <XAxis
                dataKey="category"
                tick={(props) => (
                  <CategoryTick
                    {...props}
                    categories={categories}
                    editingCategory={editingCategory}
                    onStartEdit={setEditingCategory}
                    onCommitEdit={commitRename}
                    onCancelEdit={() => setEditingCategory(null)}
                  />
                )}
                tickLine={false}
                axisLine={false}
                interval={0}
                height={28}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar
                dataKey="total"
                radius={[6, 6, 0, 0]}
                cursor="pointer"
                onClick={(_data: unknown, index: number, event: React.MouseEvent) => {
                  const clicked = displayEntries[index]?.category
                  if (!clicked) return
                  if (expandedCategory === clicked) {
                    closeDropdown()
                    return
                  }
                  const rect = (event.target as Element).getBoundingClientRect()
                  setAnchor(anchorFromRect(rect))
                  setExpandedCategory(clicked)
                }}
                label={(props) => <BarTopLabel {...props} entries={displayEntries} />}
              >
                {displayEntries.map((entry) => {
                  const isActive = entry.category === expandedCategory
                  const isDropTarget = dragOverCategory === entry.category
                  return (
                    <Cell
                      key={entry.category}
                      fill={barColor(entry)}
                      fillOpacity={expandedCategory && !isActive ? 0.45 : 1}
                      stroke={isDropTarget ? '#f5f5f7' : isActive ? '#f5f5f7' : undefined}
                      strokeWidth={isDropTarget ? 3 : isActive ? 2 : 0}
                      strokeDasharray={isDropTarget ? '4 3' : undefined}
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Invisible drop-target grid, one column per bar. Only accepts
              pointer events while a transaction is actively being dragged —
              pointer-events:none the rest of the time so it never blocks the
              chart's own clicks/hover underneath it. Column widths are an
              approximation (even split of the plotting area) rather than
              reading Recharts' internal per-band coordinates — close enough
              since the highlighted column itself is the user's confirmation
              of where a drop will land. */}
          <div
            className="absolute inset-0 flex"
            style={{ pointerEvents: dragging ? 'auto' : 'none' }}
          >
            {displayEntries.map((entry) => (
              <div
                key={entry.category}
                className="h-full flex-1"
                onDragOver={(e) => {
                  if (entry.category === SAVINGS_CATEGORY) return
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                }}
                onDragEnter={() => {
                  if (entry.category !== SAVINGS_CATEGORY) setDragOverCategory(entry.category)
                }}
                onDragLeave={() => setDragOverCategory((prev) => (prev === entry.category ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault()
                  handleDrop(entry.category)
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {dragging && (
        <p className="mt-1 text-center text-xs text-muted">
          Dépose sur une catégorie pour y déplacer « {dragging.transaction.description} ».
        </p>
      )}

      {expanded &&
        anchor &&
        createPortal(
          <div
            ref={dropdownRef}
            className="glass fixed z-50 w-64 max-w-[85vw] rounded-xl p-3 shadow-2xl shadow-black/50"
            style={{ top: anchor.top, left: anchor.centerX, transform: 'translateX(-50%)' }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                {expanded.category}
              </p>
              <button
                type="button"
                onClick={closeDropdown}
                className="text-xs text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>
            <p className="mb-2 text-xs text-muted">
              {expanded.transactions.length} transaction{expanded.transactions.length > 1 ? 's' : ''}
              {expanded.category !== SAVINGS_CATEGORY && onReclassify && ' — glisse une ligne sur une autre colonne pour la reclasser'}
            </p>
            <ul className="max-h-48 divide-y divide-white/10 overflow-y-auto">
              {expanded.transactions.map((t) => {
                const draggableItem = expanded.category !== SAVINGS_CATEGORY && !!onReclassify
                return (
                  <li
                    key={t.id}
                    draggable={draggableItem}
                    onDragStart={(e) => {
                      if (!draggableItem) return
                      setDragging({ transaction: t, fromCategory: expanded.category })
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', t.id)
                    }}
                    onDragEnd={endDrag}
                    className={`flex items-center justify-between gap-2 py-1.5 text-xs ${
                      draggableItem ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${dragging?.transaction.id === t.id ? 'opacity-40' : ''}`}
                  >
                    <span className="min-w-0 flex-1 truncate text-ink">{t.description}</span>
                    <span className="whitespace-nowrap text-muted">
                      {new Date(t.spent_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="whitespace-nowrap font-medium text-ink">{formatCurrency(t.amount)}</span>
                  </li>
                )
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  )
}
