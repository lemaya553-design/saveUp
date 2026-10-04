import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useLanguage } from '../hooks/useLanguage'
import { useToast } from './ToastProvider'
import { PLAN_LIMITS, PLAN_ORDER, TRIAL_DAYS, type Plan } from '../lib/plans'
import { formatBillingAmount } from '../lib/format'
import { TARIFS } from '../lib/i18n/tarifs'
import { HOOK_ERRORS } from '../lib/i18n/hookErrors'

// The 3-card plan grid, extracted out of Tarifs.tsx so the landing page's
// pricing section and the standalone /tarifs page render from the exact
// same real data and the exact same checkout logic — never two copies that
// can quietly drift apart on price, features, or trial terms.
export function PricingCards() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const subscription = useSubscription()
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null)
  const { lang } = useLanguage()
  const { showToast } = useToast()
  const t = TARIFS[lang]
  const fmt = (amount: number) => formatBillingAmount(amount, lang)

  // Both handlers below used to leave a click looking like it did nothing
  // whenever startCheckout/openBillingPortal resolved to null without
  // throwing (every real failure path already sets subscription.error,
  // rendered in the banner above, but a banner above the fold is easy to
  // miss when the only visible change was a button going back to its
  // normal label) — the toast is a second, harder-to-miss signal, and the
  // console.error gives an exact reason to check without needing to
  // reproduce it live.
  async function handleChoose(planId: Exclude<Plan, 'free'>) {
    if (!user) {
      navigate('/connexion', { state: { from: '/tarifs' } })
      return
    }
    setPendingPlan(planId)
    try {
      const url = await subscription.startCheckout(planId)
      if (url) {
        window.location.href = url
      } else {
        console.error('startCheckout returned no url', { planId, error: subscription.error })
        showToast(subscription.error ?? HOOK_ERRORS[lang].subscription.genericError)
      }
    } finally {
      setPendingPlan(null)
    }
  }

  async function handleManage() {
    setPendingPlan(subscription.plan)
    try {
      const url = await subscription.openBillingPortal()
      if (url) {
        window.location.href = url
      } else {
        console.error('openBillingPortal returned no url', { error: subscription.error })
        showToast(subscription.error ?? HOOK_ERRORS[lang].subscription.genericError)
      }
    } finally {
      setPendingPlan(null)
    }
  }

  return (
    <div>
      {subscription.error && (
        <p className="mx-auto mb-6 max-w-md rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-center text-sm text-red-300">
          {subscription.error}
        </p>
      )}

      <div className="mx-auto grid max-w-5xl gap-6 text-left sm:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = t.plans[planId]
          const highlight = planId === 'standard'
          const isCurrent = user && !subscription.loading && subscription.plan === planId
          const hasOtherPaidPlan =
            user && !subscription.loading && subscription.plan !== 'free' && subscription.plan !== planId
          const isLoadingThis = pendingPlan === planId

          return (
            <div
              key={planId}
              className={`glass relative rounded-3xl p-6 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
                highlight ? 'border-accent/40' : ''
              }`}
            >
              {highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                  {t.popular}
                </span>
              )}

              <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.description}</p>

              {planId !== 'free' && (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                  {t.trialBadge(TRIAL_DAYS)}
                </span>
              )}

              <p className="mt-3 text-3xl font-bold text-ink">
                {fmt(PLAN_LIMITS[planId].monthlyPrice)}
                {planId !== 'free' && <span className="text-base font-normal text-muted">{t.perMonth}</span>}
              </p>

              <ul className="mt-6 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <span className="mt-0.5 text-success">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {planId === 'free' ? (
                <>
                  <Link
                    to={user ? '/dashboard' : '/connexion'}
                    className="mt-8 block rounded-xl bg-primary-strong px-4 py-2 text-center font-medium text-white transition-all hover:-translate-y-0.5 hover:brightness-110"
                  >
                    {user ? t.cta.goToDashboard : t.cta.startFree}
                  </Link>
                  {!user && <p className="mt-2 text-center text-xs text-muted">{t.cta.startFreeCaption}</p>}
                </>
              ) : isCurrent ? (
                <button
                  type="button"
                  disabled
                  className="mt-8 w-full cursor-not-allowed rounded-xl border border-overlay/10 px-4 py-2 font-medium text-muted"
                >
                  {t.cta.currentPlan}
                </button>
              ) : hasOtherPaidPlan ? (
                <button
                  type="button"
                  onClick={handleManage}
                  disabled={isLoadingThis}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-overlay/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
                >
                  {isLoadingThis && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
                  )}
                  {isLoadingThis ? t.cta.redirecting : t.cta.manageSubscription}
                </button>
              ) : (
                <>
                  <p className="mt-8 text-center text-xs text-muted">{t.cta.trialTerms(TRIAL_DAYS)}</p>
                  <button
                    type="button"
                    onClick={() => handleChoose(planId as Exclude<Plan, 'free'>)}
                    disabled={isLoadingThis}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60"
                  >
                    {isLoadingThis && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    )}
                    {isLoadingThis ? t.cta.redirecting : t.cta.tryFree(plan.name)}
                  </button>
                  <p className="mt-2 text-center text-xs text-muted">{t.cta.cardRequired}</p>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
