import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProgressBar } from '../components/ProgressBar'
import { ImportTransactionsModal } from '../components/ImportTransactionsModal'
import { UpgradePrompt } from '../components/UpgradePrompt'
import { getFarFutureDateString, getTodayDateString, getCurrencySymbol } from '../lib/format'
import { useIncome } from '../hooks/useIncome'
import { useFixedExpenses } from '../hooks/useFixedExpenses'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useSubscription } from '../hooks/useSubscription'
import { usePreferences } from '../hooks/usePreferences'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { COMMON } from '../lib/i18n/common'
import { ONBOARDING } from '../lib/i18n/onboarding'
import { canImportCsv, FREE_CSV_IMPORT_LIMIT } from '../lib/plans'
import {
  getMainGoalOptions,
  getFrequencyOptions,
  computeOnboardingProfile,
  type MainGoal,
  type TrackingFrequency,
} from '../lib/onboardingProfile'

export function Onboarding() {
  const navigate = useNavigate()
  const { lang } = useLanguage()
  const t = ONBOARDING[lang]
  const common = COMMON[lang]
  const income = useIncome()
  const fixed = useFixedExpenses()
  const goals = useSavingsGoals()
  const subscription = useSubscription()
  const preferences = usePreferences()
  const mainGoalOptions = getMainGoalOptions(lang)
  const frequencyOptions = getFrequencyOptions(lang)
  const formatMoney = useMoneyFormat()

  const [step, setStep] = useState(0)
  const [importOpen, setImportOpen] = useState(false)
  const [incomeDraft, setIncomeDraft] = useState('')
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [goalName, setGoalName] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [goalDate, setGoalDate] = useState('')
  const [mainGoal, setMainGoal] = useState<MainGoal | null>(null)
  const [triedOtherApp, setTriedOtherApp] = useState<boolean | null>(null)
  const [frequency, setFrequency] = useState<TrackingFrequency | null>(null)

  // Whether "fresh account" is decided by real data now (see Dashboard's
  // isFreshUser), not a flag. Leaving onboarding via skip means no
  // budget_settings row exists yet, which would look identical to "never
  // seen onboarding" and bounce them right back here — so explicitly
  // persist the (possibly still-0) income value on every path that actually
  // leaves onboarding, to create that row and mark the account as touched.
  async function finish() {
    await income.setMonthlyIncome(income.monthlyIncome)
    navigate('/dashboard')
  }

  // "Configurer plus tard" abandons the whole flow in one click, from any
  // step — it used to only advance one step at a time, which meant
  // skipping everything took up to 7 clicks. Every step already has its
  // own way to move forward without this (a form to fill, a choice to
  // tap, or step 0's own "Continuer sans importer"), so this link only
  // needs to cover "I don't want to do any of this right now."
  async function skipAll() {
    await finish()
  }

  async function handleIncomeSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = Math.max(0, Number(incomeDraft) || 0)
    await income.setMonthlyIncome(value)
    setStep(2)
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Number(expenseAmount)
    if (!expenseName.trim() || !parsed || parsed <= 0) return
    await fixed.addFixedExpense(expenseName.trim(), parsed)
    setExpenseName('')
    setExpenseAmount('')
  }

  async function handleGoalSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = Math.max(0, Number(goalAmount) || 0)
    if (!goalName.trim() || parsed <= 0) return
    await goals.addGoal(goalName.trim(), parsed, goalDate || null)
    setStep(4)
  }

  async function handleFinishProfile() {
    if (mainGoal && frequency && triedOtherApp !== null) {
      preferences.setOnboardingProfile(mainGoal, triedOtherApp, frequency)
    }
    await finish()
  }

  return (
    <div className="hero-gradient flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass w-full max-w-lg rounded-2xl p-8 shadow-2xl shadow-black/40">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>{t.stepIndicator(step + 1, t.steps.length, t.steps[step])}</span>
            <button type="button" onClick={skipAll} className="text-muted hover:text-ink">
              {t.skipLater}
            </button>
          </div>
          <ProgressBar value={((step + 1) / t.steps.length) * 100} colorClass="bg-primary" />
        </div>

        {step === 0 && (
          <div>
            <h1 className="text-2xl font-bold text-ink">{t.step0.title}</h1>

            <div className="mt-6 grid gap-3">
              {canImportCsv(subscription.plan, preferences.csvImportCount) ? (
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className="glass flex flex-col items-stretch justify-start rounded-2xl p-4 text-left transition-colors hover:bg-overlay/5"
                >
                  <p className="font-semibold text-ink">{t.step0.importCardTitle}</p>
                  <p className="mt-1 text-sm text-muted">
                    {t.step0.importCardDesc}
                    {subscription.plan === 'free' &&
                      t.step0.importsRemaining(FREE_CSV_IMPORT_LIMIT - preferences.csvImportCount)}
                  </p>
                </button>
              ) : (
                <UpgradePrompt
                  title={t.step0.upgradeTitle}
                  description={
                    subscription.plan === 'free'
                      ? t.step0.upgradeDescUsedLimit(FREE_CSV_IMPORT_LIMIT)
                      : t.step0.upgradeDescFreePlan
                  }
                  minPlan="standard"
                />
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-overlay/10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-overlay/5"
              >
                {t.step0.continueWithoutImport}
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleIncomeSubmit}>
            <h1 className="text-2xl font-bold text-ink">{t.step1.title}</h1>
            <p className="mt-2 text-sm text-muted">{t.step1.subtitle}</p>
            <label className="mt-6 flex items-center gap-2">
              <span className="text-muted">{getCurrencySymbol(preferences.currency, lang)}</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                autoFocus
                value={incomeDraft}
                onChange={(e) => setIncomeDraft(e.target.value)}
                placeholder={t.step1.amountPlaceholder}
                className="w-full rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-lg text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110"
            >
              {common.app.continueAction}
            </button>
          </form>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-ink">{t.step2.title}</h1>
            <p className="mt-2 text-sm text-muted">{t.step2.subtitle}</p>

            <form onSubmit={handleAddExpense} className="mt-6 flex flex-wrap gap-2">
              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder={t.step2.namePlaceholder}
                className="min-w-[140px] flex-1 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder={t.step2.amountPlaceholder}
                className="w-28 rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110"
              >
                {common.app.add}
              </button>
            </form>

            {fixed.fixedExpenses.length > 0 && (
              <ul className="mt-4 divide-y divide-overlay/10">
                {fixed.fixedExpenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-ink">{expense.name}</span>
                    <span className="text-muted">{formatMoney(expense.amount)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-lg border border-overlay/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-overlay/5"
              >
                {common.app.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 rounded-lg bg-primary-strong px-5 py-2 font-medium text-white transition-all hover:brightness-110"
              >
                {common.app.continueAction}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleGoalSubmit}>
            <h1 className="text-2xl font-bold text-ink">{t.step3.title}</h1>
            <p className="mt-2 text-sm text-muted">{t.step3.subtitle}</p>

            <div className="mt-6 flex flex-col gap-3">
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder={t.step3.namePlaceholder}
                className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder={t.step3.amountPlaceholder}
                className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
              <label className="flex flex-col gap-1 text-xs text-muted">
                {t.step3.dueDateLabel}
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  min={getTodayDateString()}
                  max={getFarFutureDateString()}
                  className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-lg border border-overlay/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-overlay/5"
              >
                {common.app.back}
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-primary-strong px-5 py-2 font-medium text-white transition-all hover:brightness-110"
              >
                {common.app.continueAction}
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-2xl font-bold text-ink">{t.step4.title}</h1>
            <p className="mt-2 text-sm text-muted">{t.step4.subtitle}</p>

            <div className="mt-6 grid gap-3">
              {mainGoalOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setMainGoal(option.value)
                    setStep(5)
                  }}
                  className={`glass rounded-2xl p-4 text-left font-medium text-ink transition-colors hover:bg-overlay/5 ${
                    mainGoal === option.value ? 'border border-primary' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-start">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-lg border border-overlay/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-overlay/5"
              >
                {common.app.back}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-2xl font-bold text-ink">{t.step5.title}</h1>
            <p className="mt-2 text-sm text-muted">{t.step5.subtitle}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { value: true, label: t.step5.yes },
                { value: false, label: t.step5.no },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    setTriedOtherApp(option.value)
                    setStep(6)
                  }}
                  className={`glass rounded-2xl p-4 text-center font-medium text-ink transition-colors hover:bg-overlay/5 ${
                    triedOtherApp === option.value ? 'border border-primary' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-start">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="rounded-lg border border-overlay/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-overlay/5"
              >
                {common.app.back}
              </button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h1 className="text-2xl font-bold text-ink">{t.step6.title}</h1>
            <p className="mt-2 text-sm text-muted">{t.step6.subtitle}</p>

            <div className="mt-6 grid gap-3">
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFrequency(option.value)
                    setStep(7)
                  }}
                  className={`glass rounded-2xl p-4 text-left font-medium text-ink transition-colors hover:bg-overlay/5 ${
                    frequency === option.value ? 'border border-primary' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-start">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="rounded-lg border border-overlay/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-overlay/5"
              >
                {common.app.back}
              </button>
            </div>
          </div>
        )}

        {step === 7 &&
          (() => {
            const profile = computeOnboardingProfile(
              mainGoal ?? 'autre',
              triedOtherApp ?? false,
              frequency ?? 'hebdomadaire',
              lang,
            )
            return (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t.step7.badge}</p>
                <h1 className="mt-1 text-2xl font-bold text-ink">{profile.name}</h1>
                <p className="mt-3 text-sm text-muted">{profile.description}</p>

                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    {t.step7.previewTitle}
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {profile.previewPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-ink">
                        <span aria-hidden="true" className="mt-0.5 text-success">
                          ✓
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(6)}
                    className="rounded-lg border border-overlay/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-overlay/5"
                  >
                    {common.app.back}
                  </button>
                  <button
                    type="button"
                    onClick={handleFinishProfile}
                    className="flex-1 rounded-lg bg-success px-5 py-2 font-semibold text-canvas transition-all hover:brightness-110"
                  >
                    {t.step7.dashboardCta}
                  </button>
                </div>
              </div>
            )
          })()}
      </div>

      <ImportTransactionsModal
        open={importOpen}
        onClose={() => {
          setImportOpen(false)
          setStep(1)
        }}
      />
    </div>
  )
}
