import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { useCountUp } from '../hooks/useCountUp'
import { markWelcomeTutorialSeen } from '../lib/welcomeTutorial'
import { DASHBOARD } from '../lib/i18n/dashboard'

// Illustrative only — the demo bar always previews filling to this %, it
// isn't tied to any real contribution. The goal itself is created at 0 $
// (same as a normal goal), per previewNote.
const DEMO_PCT = 35

type PresetId = 'urgence' | 'vacances' | 'achat' | 'autre'

// Demo progress bar for step 3 — same visual (classes, gradient, aria
// attributes) as DashboardGoalCard's real bar. Keyed by `amount` from the
// parent so going back to step 2 and changing the amount replays the
// animation with the new number (useCountUp only animates once per mount).
function DemoBar({ amount }: { amount: number }) {
  const { lang } = useLanguage()
  const t = DASHBOARD[lang].welcomeTutorial
  const formatMoney = useMoneyFormat()
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(true)
  }, [])

  const demoPct = useCountUp(DEMO_PCT, active)
  const demoAmount = useCountUp(Math.round(amount * (DEMO_PCT / 100)), active)

  return (
    <>
      <div className="mt-4 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold text-ink">{formatMoney(demoAmount)}</p>
        <p className="text-sm text-muted">{t.demoOutOf(formatMoney(amount))}</p>
      </div>
      <div
        className="mt-2 h-3.5 w-full overflow-hidden rounded-full bg-overlay/10"
        role="progressbar"
        aria-valuenow={Math.round(demoPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.barAriaLabel}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${demoPct}%`, backgroundImage: 'linear-gradient(90deg, #FFB347, #FF7A00)' }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">{Math.round(demoPct)}%</p>
    </>
  )
}

export function WelcomeTutorial({
  open,
  userId,
  onClose,
  onCreateGoal,
}: {
  open: boolean
  userId: string
  onClose: () => void
  onCreateGoal: (name: string, targetAmount: number) => Promise<unknown>
}) {
  const { lang } = useLanguage()
  const t = DASHBOARD[lang].welcomeTutorial
  const formatMoney = useMoneyFormat()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [presetId, setPresetId] = useState<PresetId | null>(null)
  const [customName, setCustomName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [amountStr, setAmountStr] = useState('')
  const [amountError, setAmountError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const selectedPreset = t.presets.find((p) => p.id === presetId) ?? null
  const goalName = presetId === 'autre' ? customName.trim() : selectedPreset?.name ?? ''
  const amount = Number(amountStr)

  function reset() {
    setStep(1)
    setPresetId(null)
    setCustomName('')
    setNameError(null)
    setAmountStr('')
    setAmountError(null)
    setCreating(false)
    setCreateError(null)
  }

  function finish() {
    markWelcomeTutorialSeen(userId)
    reset()
    onClose()
  }

  function skip() {
    finish()
  }

  function goToStep2() {
    if (!presetId) return
    if (presetId === 'autre' && !customName.trim()) {
      setNameError(t.customNameEmptyError)
      return
    }
    setNameError(null)
    setStep(2)
  }

  function goToStep3() {
    if (!amount || amount <= 0) {
      setAmountError(t.amountEmptyError)
      return
    }
    setAmountError(null)
    setStep(3)
  }

  async function createGoal() {
    setCreating(true)
    setCreateError(null)
    try {
      await onCreateGoal(goalName, amount)
      finish()
    } catch {
      setCreateError(t.createError)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Modal open={open} onClose={skip} title={t.modalTitle}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted">{t.stepLabel(step)}</p>
          <button
            type="button"
            onClick={skip}
            className="flex min-h-[44px] items-center px-2 text-sm font-medium text-muted hover:text-ink"
          >
            {t.skip}
          </button>
        </div>

        {step === 1 && (
          <div>
            <h3 className="text-base font-semibold text-ink">{t.step1Title}</h3>
            <p className="mt-1 text-sm text-muted">{t.step1Hint}</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {t.presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPresetId(preset.id)}
                  aria-pressed={presetId === preset.id}
                  className={`min-h-[44px] rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                    presetId === preset.id
                      ? 'border-[#FF7A00] bg-[#FF7A00]/15 text-ink'
                      : 'border-overlay/10 bg-surface text-ink hover:bg-overlay/5'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {presetId === 'autre' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value)
                    setNameError(null)
                  }}
                  placeholder={t.customNamePlaceholder}
                  autoFocus
                  className="budget-field min-h-[44px] w-full rounded-lg px-3 py-2.5 text-ink placeholder-muted"
                />
                {nameError && <p className="mt-1.5 text-sm text-red-400">{nameError}</p>}
              </div>
            )}
            <button
              type="button"
              onClick={goToStep2}
              disabled={!presetId}
              className="budget-btn-primary mt-4 min-h-[44px] w-full rounded-lg px-4 py-2.5 font-medium transition-all disabled:opacity-50"
            >
              {t.next}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-base font-semibold text-ink">{t.step2Title}</h3>
            <p className="mt-1 text-sm text-muted">{t.step2Hint}</p>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value)
                setAmountError(null)
              }}
              placeholder={t.amountPlaceholder}
              aria-label={t.amountAriaLabel}
              autoFocus
              className="budget-field mt-4 min-h-[44px] w-full rounded-lg px-3 py-2.5 text-ink placeholder-muted"
            />
            {amountError && <p className="mt-1.5 text-sm text-red-400">{amountError}</p>}
            {amount > 0 && <p className="mt-1.5 text-sm text-muted">{formatMoney(amount)}</p>}
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[44px] flex-1 rounded-lg border border-overlay/10 px-4 py-2.5 font-medium text-ink hover:bg-overlay/5"
              >
                {t.back}
              </button>
              <button
                type="button"
                onClick={goToStep3}
                className="budget-btn-primary min-h-[44px] flex-1 rounded-lg px-4 py-2.5 font-medium transition-all"
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-base font-semibold text-ink">{t.step3Title}</h3>
            <p className="mt-1 text-sm text-muted">{t.step3Hint}</p>
            <div className="mt-4 rounded-xl border border-overlay/10 bg-surface p-4">
              <span
                className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ color: '#FF7A00', backgroundColor: 'rgba(255, 122, 0, 0.14)' }}
              >
                {t.previewBadge}
              </span>
              <DemoBar amount={amount} />
            </div>
            <p className="mt-3 text-xs text-muted">{t.previewNote}</p>
            {createError && <p className="mt-2 text-sm text-red-400">{createError}</p>}
            <div className="mt-4 flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={creating}
                className="min-h-[44px] flex-1 rounded-lg border border-overlay/10 px-4 py-2.5 font-medium text-ink hover:bg-overlay/5 disabled:opacity-50"
              >
                {t.back}
              </button>
              <button
                type="button"
                onClick={createGoal}
                disabled={creating}
                className="budget-btn-primary min-h-[44px] flex-1 rounded-lg px-4 py-2.5 font-medium transition-all disabled:opacity-60"
              >
                {creating ? t.creating : t.create}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
