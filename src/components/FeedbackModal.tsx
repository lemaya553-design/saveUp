import { useState } from 'react'
import { Modal } from './Modal'
import { useFeedback } from '../hooks/useFeedback'
import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'

const MAX_LENGTH = 2000

export function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = COMMON[lang].feedback
  const { submitting, error, submitFeedback } = useFeedback()
  const [message, setMessage] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function reset() {
    setMessage('')
    setLocalError(null)
    setSent(false)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) {
      setLocalError(t.emptyError)
      return
    }
    setLocalError(null)
    const ok = await submitFeedback(trimmed)
    if (ok) setSent(true)
  }

  return (
    <Modal open={open} onClose={handleClose} title={t.modalTitle}>
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
            style={{ color: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.14)' }}
            aria-hidden="true"
          >
            ✓
          </span>
          <p className="text-sm font-medium text-ink">{t.success}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <p className="-mt-2 mb-1 text-xs text-muted">{t.modalHint}</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.placeholder}
            maxLength={MAX_LENGTH}
            rows={5}
            autoFocus
            className="budget-field w-full resize-none rounded-lg px-3 py-2.5 text-ink placeholder-muted"
          />
          {(localError || error) && <p className="text-sm text-red-400">{localError ?? error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="budget-btn-primary mt-1 w-full rounded-lg px-4 py-2.5 font-medium transition-all disabled:opacity-60"
          >
            {submitting ? t.submitting : t.submit}
          </button>
        </form>
      )}
    </Modal>
  )
}
