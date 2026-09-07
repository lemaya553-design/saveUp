import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LandingHeader } from '../components/LandingHeader'
import { HelpButton } from '../components/HelpButton'
import { TrialBadge } from '../components/TrialBadge'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useLanguage } from '../hooks/useLanguage'
import { PLAN_LIMITS, PLAN_ORDER, TRIAL_DAYS, type Plan } from '../lib/plans'
import { formatCurrency, formatCurrencyEN } from '../lib/format'
import { TARIFS } from '../lib/i18n/tarifs'

export function Tarifs() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const subscription = useSubscription()
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null)
  // The signed-in app stays French regardless of the stored marketing-page
  // language — only a logged-out visitor (or the language switcher, which
  // only ever shows on the logged-out header) can move this off 'fr'.
  const { lang: storedLang } = useLanguage()
  const lang = user ? 'fr' : storedLang
  const t = TARIFS[lang]
  const fmt = lang === 'fr' ? formatCurrency : formatCurrencyEN

  async function handleChoose(planId: Exclude<Plan, 'free'>) {
    if (!user) {
      navigate('/connexion', { state: { from: '/tarifs' } })
      return
    }
    setPendingPlan(planId)
    try {
      const url = await subscription.startCheckout(planId)
      if (url) window.location.href = url
    } finally {
      setPendingPlan(null)
    }
  }

  async function handleManage() {
    setPendingPlan(subscription.plan)
    try {
      const url = await subscription.openBillingPortal()
      if (url) window.location.href = url
    } finally {
      setPendingPlan(null)
    }
  }

  return (
    <div>
      {/* Logged-in visitors get here via the app's own Nav (Layout renders
          it for /tarifs once a user session exists) — showing this too
          would stack two header bars. */}
      {!user && <LandingHeader />}

      <section className="hero-gradient relative px-4 pb-24 pt-10 text-center sm:px-6">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <HelpButton title={t.help.title} purpose={t.help.purpose} actions={t.help.actions(TRIAL_DAYS)} />
        </div>

        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
          {t.hero.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">{t.hero.subtitle}</p>

        <TrialBadge className="mx-auto mt-6 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-4 py-2 text-sm font-semibold text-accent" />

        {subscription.error && (
          <p className="mx-auto mt-6 max-w-md rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            {subscription.error}
          </p>
        )}

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 text-left sm:grid-cols-3">
          {PLAN_ORDER.map((planId) => {
            const plan = t.plans[planId]
            const highlight = planId === 'standard'
            const isCurrent = user && !subscription.loading && subscription.plan === planId
            // Checkout only ever starts a brand-new subscription — a user
            // who already has ANY paid plan (moving up OR down) manages that
            // through the Stripe portal instead, so they never end up with
            // two overlapping subscriptions.
            const hasOtherPaidPlan =
              user && !subscription.loading && subscription.plan !== 'free' && subscription.plan !== planId
            const isLoadingThis = pendingPlan === planId

            return (
              <div
                key={planId}
                className={`glass relative rounded-2xl p-6 shadow-lg shadow-black/30 ${
                  highlight ? 'border-accent/40' : ''
                }`}
              >
                {highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                    {t.popular}
                  </span>
                )}

                <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted">{plan.description}</p>

                {planId !== 'free' && (
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                    {t.trialBadge(TRIAL_DAYS)}
                  </span>
                )}

                {planId !== 'free' && (
                  <TrialBadge className="mt-2 flex items-center gap-1.5 text-xs text-muted" />
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
                  <Link
                    to={user ? '/dashboard' : '/connexion'}
                    className="mt-8 block rounded-lg bg-primary-strong px-4 py-2 text-center font-medium text-white transition-all hover:brightness-110"
                  >
                    {user ? t.cta.goToDashboard : t.cta.startFree}
                  </Link>
                ) : isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="mt-8 w-full cursor-not-allowed rounded-lg border border-overlay/10 px-4 py-2 font-medium text-muted"
                  >
                    {t.cta.currentPlan}
                  </button>
                ) : hasOtherPaidPlan ? (
                  <button
                    type="button"
                    onClick={handleManage}
                    disabled={isLoadingThis}
                    className="mt-8 w-full rounded-lg border border-overlay/10 px-4 py-2 font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
                  >
                    {isLoadingThis ? t.cta.redirecting : t.cta.manageSubscription}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleChoose(planId as Exclude<Plan, 'free'>)}
                      disabled={isLoadingThis}
                      className="mt-8 w-full rounded-lg bg-primary-strong px-4 py-2 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
                    >
                      {isLoadingThis ? t.cta.redirecting : t.cta.tryFree(plan.name)}
                    </button>
                    <p className="mt-2 text-center text-xs text-muted">{t.cta.cardRequired}</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
