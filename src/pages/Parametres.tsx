import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { HelpButton } from '../components/HelpButton'
import { TabBar, type TabDef } from '../components/TabBar'
import { PersonalizationSettings } from '../components/PersonalizationSettings'
import { WorkHoursSettings } from '../components/WorkHoursSettings'
import { IncomeInput } from '../components/IncomeInput'
import { PageSkeleton } from '../components/PageSkeleton'
import { useIncome } from '../hooks/useIncome'
import { useSubscription } from '../hooks/useSubscription'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { useToast } from '../components/ToastProvider'
import { useLanguage } from '../hooks/useLanguage'
import { formatBillingAmount } from '../lib/format'
import { PLAN_LIMITS } from '../lib/plans'
import { PARAMETRES } from '../lib/i18n/parametres'
import { TARIFS } from '../lib/i18n/tarifs'
import { COMMON } from '../lib/i18n/common'

const CARD_BORDER = 'color-mix(in srgb, var(--color-overlay) 10%, transparent)'

type Tab = 'compte' | 'abonnement' | 'preferences'
const TABS: Tab[] = ['compte', 'abonnement', 'preferences']

function ParametresCard({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: CARD_BORDER }}
    >
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{hint}</p>
      {children}
    </section>
  )
}

export function Parametres() {
  const { tab: tabParam } = useParams<{ tab: string }>()
  const navigate = useNavigate()
  const income = useIncome()
  const subscription = useSubscription()
  const pwaInstall = usePwaInstall()
  const { showToast } = useToast()
  const { lang } = useLanguage()
  const t = PARAMETRES[lang]
  const tarifsT = TARIFS[lang]
  const [searchParams, setSearchParams] = useSearchParams()
  const [managingBilling, setManagingBilling] = useState(false)

  const TAB_DEFS: TabDef<Tab>[] = [
    { key: 'compte', label: t.tabs.compte },
    { key: 'abonnement', label: t.tabs.abonnement },
    { key: 'preferences', label: t.tabs.preferences },
  ]

  const HELP_BY_TAB: Record<Tab, { title: string; purpose: string; actions: string[] }> = {
    compte: t.help.compte,
    abonnement: t.help.abonnement,
    preferences: t.help.preferences,
  }

  // Webhook usually beats the redirect back from Stripe Checkout, but not
  // always — force a fresh read instead of waiting for the next natural
  // reload, and clear the query param so this doesn't refire on revisit.
  useEffect(() => {
    if (searchParams.get('checkout') !== 'success') return
    subscription.refresh()
    showToast(t.toasts.subscriptionActivated)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('checkout')
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function handleManageBilling() {
    setManagingBilling(true)
    const url = await subscription.openBillingPortal()
    if (url) window.location.href = url
    setManagingBilling(false)
  }

  if (!tabParam || !TABS.includes(tabParam as Tab)) {
    return <Navigate to="/parametres/compte" replace />
  }
  const tab = tabParam as Tab

  if (income.loading) {
    return <PageSkeleton cards={3} />
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 pt-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">{t.pageHeader.title}</h1>
        <HelpButton title={HELP_BY_TAB[tab].title ?? t.pageHeader.title} purpose={HELP_BY_TAB[tab].purpose} actions={HELP_BY_TAB[tab].actions} />
      </div>

      <div className="mb-6">
        <TabBar
          tabs={TAB_DEFS}
          active={tab}
          onChange={(next) => navigate(`/parametres/${next}`)}
          activeClassName="bg-[#FF7A00] text-white shadow-md"
        />
      </div>

      {tab === 'compte' && income.error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {income.error}
        </div>
      )}

      {tab === 'compte' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <IncomeInput monthlyIncome={income.monthlyIncome} onChange={income.setMonthlyIncome} />
          </div>

          <ParametresCard title={t.compte.legal.title} hint={t.compte.legal.hint}>
            <div className="flex flex-col gap-2">
              <Link to="/confidentialite" className="budget-action-link w-fit text-sm font-medium">
                {t.compte.legal.privacyLink}
              </Link>
              <Link to="/conditions" className="budget-action-link w-fit text-sm font-medium">
                {t.compte.legal.termsLink}
              </Link>
            </div>
          </ParametresCard>

          <ParametresCard title={t.compte.app.title} hint={t.compte.app.hint}>
            {pwaInstall.standalone ? (
              <p className="text-sm text-muted">{t.compte.app.installed}</p>
            ) : pwaInstall.platform === 'unsupported' ? (
              <p className="text-sm text-muted">{t.compte.app.unsupported}</p>
            ) : (
              <button
                type="button"
                onClick={pwaInstall.reopen}
                className="rounded-lg border border-overlay/10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-overlay/5"
              >
                {t.compte.app.reopenPrompt}
              </button>
            )}
          </ParametresCard>
        </div>
      )}

      {tab === 'abonnement' && (
        <div className="grid gap-6">
          <ParametresCard title={t.abonnement.cardTitle} hint={t.abonnement.cardHint}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#FF7A00]/15 px-3 py-1 text-sm font-semibold text-[#FF7A00]">
                  {tarifsT.plans[subscription.plan].name}
                </span>
                {subscription.isTrialing && (
                  <span className="rounded-full bg-[#FFB347]/20 px-3 py-1 text-xs font-semibold text-[#CC5F00]">
                    {t.abonnement.trialBadge}
                  </span>
                )}
                {subscription.loading && (
                  <span className="text-xs text-muted">{COMMON[lang].app.loading}</span>
                )}
              </div>
              {subscription.plan === 'free' ? (
                <Link to="/tarifs" className="budget-btn-primary rounded-lg px-4 py-2 text-sm font-medium transition-all">
                  {t.abonnement.seePlans}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleManageBilling}
                  disabled={managingBilling}
                  className="rounded-lg border border-overlay/10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-overlay/5 disabled:opacity-60"
                >
                  {managingBilling ? tarifsT.cta.redirecting : tarifsT.cta.manageSubscription}
                </button>
              )}
            </div>
            {subscription.isTrialing && subscription.currentPeriodEnd && (
              <p className="mt-3 text-sm text-muted">
                {t.abonnement.trialEndsSentence(
                  new Date(subscription.currentPeriodEnd).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }),
                  `${formatBillingAmount(PLAN_LIMITS[subscription.plan].monthlyPrice, lang)}`,
                  tarifsT.cta.manageSubscription,
                )}
              </p>
            )}
            {subscription.error && <p className="mt-3 text-sm text-red-400">{subscription.error}</p>}
          </ParametresCard>
        </div>
      )}

      {tab === 'preferences' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <PersonalizationSettings />
          <WorkHoursSettings />
        </div>
      )}
    </div>
  )
}
