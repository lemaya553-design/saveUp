import { useEffect, useId, useState } from 'react'
import { Modal } from './Modal'
import { useLanguage } from '../hooks/useLanguage'
import { PREMIUM } from '../lib/i18n/premium'
import type { ReviewDetails, ReviewReason } from '../lib/subscriptionReview'

const REASONS: ReviewReason[] = ['dont_recognize', 'want_to_cancel', 'rarely_use', 'one_time_purchase', 'other']
const USAGE_SCALE = [1, 2, 3, 4, 5]
const NOTE_MAX_LENGTH = 200

export function SubscriptionReviewModal({
  open,
  onClose,
  subscriptionName,
  initial,
  onSave,
}: {
  open: boolean
  onClose: () => void
  subscriptionName: string
  // null the first time this item is reviewed; the previous answers when
  // reopened to edit (see Premium.tsx's "Modifier" action on an already
  // "à vérifier" item).
  initial: ReviewDetails | null
  onSave: (review: ReviewDetails) => void
}) {
  const { lang } = useLanguage()
  const t = PREMIUM[lang].reviewModal
  const reasonLabels = PREMIUM[lang].reasonLabels
  const fieldsetId = useId()
  const [reason, setReason] = useState<ReviewReason | null>(null)
  const [usageScale, setUsageScale] = useState<number | null>(null)
  const [note, setNote] = useState('')

  // Re-sync from `initial` every time the modal opens — editing an existing
  // review should show its saved answers, not whatever was left over from
  // a previous open/close of this same modal instance.
  useEffect(() => {
    if (!open) return
    setReason(initial?.reason ?? null)
    setUsageScale(initial?.usageScale ?? null)
    setNote(initial?.note ?? '')
  }, [open, initial])

  const canSave = reason !== null && usageScale !== null

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    onSave({ reason, usageScale, note: note.trim() })
  }

  return (
    <Modal open={open} onClose={onClose} title={t.title(subscriptionName)}>
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">{t.questionReason}</legend>
          <div className="flex flex-col gap-2">
            {REASONS.map((value) => (
              <label
                key={value}
                className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm text-ink transition-colors hover:bg-overlay/5"
                style={{
                  borderColor:
                    reason === value ? '#FF7A00' : 'color-mix(in srgb, var(--color-overlay) 10%, transparent)',
                }}
              >
                <input
                  type="radio"
                  name={`${fieldsetId}-reason`}
                  checked={reason === value}
                  onChange={() => setReason(value)}
                  className="h-4 w-4 shrink-0 accent-[#FF7A00]"
                />
                {reasonLabels[value]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">{t.questionUsage}</legend>
          <div className="grid grid-cols-5 gap-2">
            {USAGE_SCALE.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setUsageScale(value)}
                aria-pressed={usageScale === value}
                className={`flex min-h-[44px] items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                  usageScale === value ? 'text-white' : 'text-muted hover:text-ink'
                }`}
                style={{
                  borderColor:
                    usageScale === value ? '#FF7A00' : 'color-mix(in srgb, var(--color-overlay) 10%, transparent)',
                  backgroundColor: usageScale === value ? '#FF7A00' : undefined,
                }}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted">
            <span>{t.usageLow}</span>
            <span>{t.usageHigh}</span>
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5 text-sm text-ink">
          {t.questionNote}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX_LENGTH))}
            placeholder={t.notePlaceholder}
            rows={3}
            maxLength={NOTE_MAX_LENGTH}
            className="budget-field w-full resize-none rounded-lg px-3 py-2.5 text-ink placeholder-muted"
          />
          <span className="self-end text-xs text-muted">{t.noteCounter(note.length, NOTE_MAX_LENGTH)}</span>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-overlay/10 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-overlay/5"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: '#FF7A00' }}
          >
            {t.save}
          </button>
        </div>
      </form>
    </Modal>
  )
}
