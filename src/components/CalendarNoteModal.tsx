import { useEffect, useRef, useState } from 'react'
import { Modal } from './Modal'
import { useLanguage } from '../hooks/useLanguage'
import { CALENDRIER } from '../lib/i18n/calendrier'
import { COMMON } from '../lib/i18n/common'
import { ratingBlendPct } from '../lib/calendarGrid'
import type { CalendarNote } from '../hooks/useCalendarNotes'

const DESCRIPTION_MAX_LENGTH = 280
const DEFAULT_RATING = 5
// Short enough to feel instant, long enough that dragging the slider or
// typing a sentence doesn't fire a write per keystroke/step.
const AUTOSAVE_DEBOUNCE_MS = 600

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function CalendarNoteModal({
  open,
  onClose,
  dateStr,
  dateLabel,
  initial,
  onSave,
  onClear,
}: {
  open: boolean
  onClose: () => void
  dateStr: string
  // null for a day with no saved note yet — editing an existing day
  // pre-fills from its saved rating/description instead.
  initial: CalendarNote | null
  dateLabel: string
  onSave: (dateStr: string, rating: number, description: string) => Promise<boolean>
  onClear: (dateStr: string) => Promise<boolean>
}) {
  const { lang } = useLanguage()
  const t = CALENDRIER[lang].modal
  const tApp = COMMON[lang].app
  const [rating, setRating] = useState(DEFAULT_RATING)
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [confirmingClear, setConfirmingClear] = useState(false)

  // Always-current values for the debounced save to read, without needing
  // rating/description themselves in its dependency array.
  const latestRef = useRef({ rating, description })
  latestRef.current = { rating, description }
  const dirtyRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Re-sync when the modal opens, or when it's asked to show a different
  // day while already open — editing a different day (or reopening the
  // same one after a save) should always reflect what's actually saved,
  // not leftover state from a previous open/close. Opening itself is never
  // a "change" — dirtyRef stays false until the user actually touches the
  // slider or the textarea.
  //
  // Deliberately keyed on `dateStr`, NOT `initial` — the parent recomputes
  // `initial` fresh (a new object reference) on every one of its own
  // re-renders, including the one right after THIS modal's own autosave
  // succeeds. If this effect also depended on `initial`, that re-render
  // would immediately re-fire it and flip the just-shown "Enregistré"
  // status straight back to "idle". Keying on `dateStr` instead means
  // `initial` is only ever read at the moment a given day's panel opens.
  useEffect(() => {
    if (!open) return
    setRating(initial?.rating ?? DEFAULT_RATING)
    setDescription(initial?.description ?? '')
    setStatus('idle')
    setConfirmingClear(false)
    dirtyRef.current = false
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dateStr])

  // The actual write — used both by the debounced autosave and by the
  // "Réessayer" button, which must always re-attempt regardless of
  // dirtyRef (that flag only gates the autosave *trigger*, not a retry the
  // user explicitly asked for).
  async function attemptSave() {
    setStatus('saving')
    const ok = await onSave(dateStr, latestRef.current.rating, latestRef.current.description.trim())
    setStatus(ok ? 'saved' : 'error')
  }

  function scheduleSave() {
    dirtyRef.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      dirtyRef.current = false
      void attemptSave()
    }, AUTOSAVE_DEBOUNCE_MS)
  }

  // Flushes any pending debounced save immediately — used when the modal is
  // about to close, so a change made just before closing isn't lost to the
  // debounce window never firing.
  function flush() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (dirtyRef.current) {
      dirtyRef.current = false
      void attemptSave()
    }
  }

  function handleClose() {
    flush()
    onClose()
  }

  function handleRatingChange(value: number) {
    setRating(value)
    scheduleSave()
  }

  function handleDescriptionChange(value: string) {
    setDescription(value.slice(0, DESCRIPTION_MAX_LENGTH))
    scheduleSave()
  }

  async function handleClear() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    dirtyRef.current = false
    const ok = await onClear(dateStr)
    if (ok) {
      setConfirmingClear(false)
      handleClose()
    } else {
      setStatus('error')
    }
  }

  const blendPct = ratingBlendPct(rating)

  return (
    <Modal open={open} onClose={handleClose} title={t.title(dateLabel)}>
      <div className="flex flex-col gap-5">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-ink">{t.ratingLabel}</label>
            {status !== 'idle' && status !== 'error' && (
              <span className="text-xs text-muted">{status === 'saving' ? t.saving : t.saved}</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-4">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold text-ink"
              style={{
                backgroundColor: `color-mix(in srgb, var(--color-primary) ${blendPct}%, var(--color-surface))`,
              }}
            >
              {rating}
            </span>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={rating}
              onChange={(e) => handleRatingChange(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label={t.ratingLabel}
            />
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-ink">
          {t.descriptionLabel}
          <textarea
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            rows={3}
            maxLength={DESCRIPTION_MAX_LENGTH}
            className="budget-field w-full resize-none rounded-lg px-3 py-2.5 text-ink placeholder-muted"
          />
          <span className="self-end text-xs text-muted">
            {t.descriptionCounter(description.length, DESCRIPTION_MAX_LENGTH)}
          </span>
        </label>

        {status === 'error' && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">
            <p className="text-sm text-red-300">{t.saveError}</p>
            <button
              type="button"
              onClick={() => void attemptSave()}
              className="shrink-0 rounded-lg border border-red-400/40 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/40"
            >
              {t.retry}
            </button>
          </div>
        )}

        {confirmingClear ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">
            <p className="text-sm text-ink">{t.clearConfirmQuestion}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void handleClear()}
                className="min-h-[40px] rounded-lg border border-red-400/40 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/40"
              >
                {t.clearConfirmYes}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                className="min-h-[40px] rounded-lg border border-overlay/10 px-4 py-2 text-sm text-muted hover:text-ink"
              >
                {tApp.cancel}
              </button>
            </div>
          </div>
        ) : (
          initial && (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="min-h-[44px] rounded-lg border border-overlay/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/20"
            >
              {t.clear}
            </button>
          )
        )}
      </div>
    </Modal>
  )
}
