import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { useLanguage } from '../hooks/useLanguage'
import { CALENDRIER } from '../lib/i18n/calendrier'
import { COMMON } from '../lib/i18n/common'
import { ratingBlendPct } from '../lib/calendarGrid'
import type { CalendarNote } from '../hooks/useCalendarNotes'

const DESCRIPTION_MAX_LENGTH = 280
const DEFAULT_RATING = 5

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
  dateLabel: string
  // null for a day with no saved note yet — editing an existing day
  // pre-fills from its saved rating/description instead.
  initial: CalendarNote | null
  onSave: (dateStr: string, rating: number, description: string) => void
  onClear: (dateStr: string) => void
}) {
  const { lang } = useLanguage()
  const t = CALENDRIER[lang].modal
  const tApp = COMMON[lang].app
  const [rating, setRating] = useState(DEFAULT_RATING)
  const [description, setDescription] = useState('')
  const [confirmingClear, setConfirmingClear] = useState(false)

  // Re-sync every time the modal opens — editing a different day (or
  // reopening the same one after a save) should always reflect what's
  // actually saved, not leftover state from a previous open/close.
  useEffect(() => {
    if (!open) return
    setRating(initial?.rating ?? DEFAULT_RATING)
    setDescription(initial?.description ?? '')
    setConfirmingClear(false)
  }, [open, initial])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    onSave(dateStr, rating, description.trim())
  }

  function handleClear() {
    onClear(dateStr)
    setConfirmingClear(false)
  }

  const blendPct = ratingBlendPct(rating)

  return (
    <Modal open={open} onClose={onClose} title={t.title(dateLabel)}>
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-medium text-ink">{t.ratingLabel}</label>
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
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label={t.ratingLabel}
            />
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-ink">
          {t.descriptionLabel}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
            placeholder={t.descriptionPlaceholder}
            rows={3}
            maxLength={DESCRIPTION_MAX_LENGTH}
            className="budget-field w-full resize-none rounded-lg px-3 py-2.5 text-ink placeholder-muted"
          />
          <span className="self-end text-xs text-muted">
            {t.descriptionCounter(description.length, DESCRIPTION_MAX_LENGTH)}
          </span>
        </label>

        {confirmingClear ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">
            <p className="text-sm text-ink">{t.clearConfirmQuestion}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleClear}
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
          <div className="flex gap-2">
            {initial && (
              <button
                type="button"
                onClick={() => setConfirmingClear(true)}
                className="min-h-[44px] flex-1 rounded-lg border border-overlay/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/20"
              >
                {t.clear}
              </button>
            )}
            <button
              type="submit"
              className="min-h-[44px] flex-1 rounded-lg budget-btn-primary px-4 py-2.5 text-sm font-medium text-white"
            >
              {t.save}
            </button>
          </div>
        )}
      </form>
    </Modal>
  )
}
