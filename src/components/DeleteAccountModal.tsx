import { useState } from 'react'
import { Modal } from './Modal'
import { useDeleteAccount } from '../hooks/useDeleteAccount'
import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'
import { PARAMETRES } from '../lib/i18n/parametres'

export function DeleteAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLanguage()
  const t = PARAMETRES[lang].compte.dangerZone
  const { deleting, error, deleteAccount } = useDeleteAccount()
  const [confirmText, setConfirmText] = useState('')

  // Exact match, not a case-insensitive/trimmed compare — typing the word
  // correctly is the whole point of this gate (it's there to slow down an
  // accidental click, not to be guessed around).
  const canConfirm = confirmText === t.confirmWord

  function reset() {
    setConfirmText('')
  }

  function handleClose() {
    if (deleting) return
    reset()
    onClose()
  }

  async function handleConfirm() {
    if (!canConfirm || deleting) return
    const ok = await deleteAccount()
    if (ok) {
      // Full reload (not client-side navigate) — same reasoning as
      // supabase.ts's own forced-signout path: every hook holding this
      // now-deleted account's data needs to be torn down, not just routed
      // away from.
      window.location.href = '/?compte-supprime=1'
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={t.modalTitle}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink">{t.warningIntro}</p>
        <ul className="ml-5 list-disc space-y-1 text-sm text-muted">
          {t.warningItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-sm font-medium text-red-400">{t.warningIrreversible}</p>

        <label className="mt-2 flex flex-col gap-1.5 text-sm text-muted">
          {t.confirmInstructions(t.confirmWord)}
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t.confirmPlaceholder}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="budget-field w-full rounded-lg px-3 py-2.5 text-ink placeholder-muted"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleting}
            className="flex-1 rounded-lg border border-overlay/10 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
          >
            {COMMON[lang].app.cancel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || deleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? t.deleting : t.confirmButton}
          </button>
        </div>
      </div>
    </Modal>
  )
}
