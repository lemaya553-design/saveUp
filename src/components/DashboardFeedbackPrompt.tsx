import { useState } from 'react'
import { Modal } from './Modal'
import { useToast } from './ToastProvider'
import { useFeedback } from '../hooks/useFeedback'
import { useLanguage } from '../hooks/useLanguage'
import { DASHBOARD } from '../lib/i18n/dashboard'

// Dashboard's own "Donner mon avis" entry point — deliberately separate
// from Sidebar's FeedbackModal (different question, different placement),
// but writes through the exact same backend (useFeedback.ts → the
// `feedback` table already created for that first entry point). Works
// identically whether DashboardGoalCard is showing real or demo goals —
// this component has no idea demo mode exists, it just submits real
// feedback for the real signed-in user either way.
export function DashboardFeedbackPrompt() {
  const { lang } = useLanguage()
  const t = DASHBOARD[lang].feedbackPrompt
  const { showToast } = useToast()
  const { submitting, error, submitFeedback } = useFeedback()
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  const [comment, setComment] = useState('')

  function reset() {
    setAnswer('')
    setComment('')
  }

  function handleClose() {
    if (submitting) return
    reset()
    setOpen(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || submitting) return
    const message = comment.trim()
      ? `${t.question} ${answer.trim()}\n\n${comment.trim()}`
      : `${t.question} ${answer.trim()}`
    const ok = await submitFeedback(message)
    if (ok) {
      reset()
      setOpen(false)
      showToast(t.successMessage)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ml-auto min-h-[36px] shrink-0 rounded-lg border border-overlay/10 px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-overlay/5"
      >
        {t.buttonLabel}
      </button>

      <Modal open={open} onClose={handleClose} title={t.modalTitle}>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm text-ink">
            {t.question}
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t.questionPlaceholder}
              rows={3}
              autoFocus
              className="budget-field w-full resize-none rounded-lg px-3 py-2.5 text-ink placeholder-muted"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-muted">
            {t.optionalLabel}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.optionalPlaceholder}
              rows={2}
              className="budget-field w-full resize-none rounded-lg px-3 py-2.5 text-ink placeholder-muted"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={!answer.trim() || submitting}
            className="budget-btn-primary mt-1 w-full rounded-lg px-4 py-2.5 font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? t.sending : t.send}
          </button>
        </form>
      </Modal>
    </>
  )
}
