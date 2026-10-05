import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { useSubscription } from '../hooks/useSubscription'
import { REWARD_TIERS, getUnlockedTiers } from '../lib/rewards'
import { COMMON } from '../lib/i18n/common'
import { TARIFS } from '../lib/i18n/tarifs'
import { LogoMark } from './Logo'

// Fixed regardless of the user's accent preset (Paramètres > Personnalisation
// can be bleu/vert/violet/orange) — the active nav item should always read as
// orange, by explicit design decision, so it's hardcoded here rather than
// pulled from --color-primary/--color-accent like the rest of the app.
const ACTIVE_ORANGE = '#FF7A00'

function IconHome({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 10.5 12 4l8.5 6.5M5.5 9.5V19a1 1 0 0 0 1 1h3.25v-5.25a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1V20H17.5a1 1 0 0 0 1-1V9.5"
      />
    </svg>
  )
}

function IconCard({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path strokeLinecap="round" d="M3 10h18" />
    </svg>
  )
}

function IconTarget({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconChart({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5h16M7 19.5v-6M12 19.5v-10M17 19.5v-4" />
    </svg>
  )
}

function IconTag({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4h6.5a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-6.5 6.5a1 1 0 0 1-1.4 0l-8-8A1 1 0 0 1 3 11.5V5a1 1 0 0 1 1-1Z"
      />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconGear({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 3.75h3l.4 2.3c.63.24 1.22.58 1.74 1l2.2-.87 1.5 2.6-1.83 1.5c.1.38.16.78.16 1.2s-.06.82-.16 1.2l1.83 1.5-1.5 2.6-2.2-.87c-.52.42-1.1.76-1.74 1l-.4 2.3h-3l-.4-2.3a6.2 6.2 0 0 1-1.74-1l-2.2.87-1.5-2.6 1.83-1.5A5.6 5.6 0 0 1 6.3 12c0-.42.06-.82.16-1.2L4.63 9.3l1.5-2.6 2.2.87c.52-.42 1.1-.76 1.74-1z"
      />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function IconLogout({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h10m0 0-3-3m3 3-3 3" />
    </svg>
  )
}

function getInitials(email: string | null | undefined): string {
  if (!email) return '?'
  const local = email.split('@')[0]
  return local.slice(0, 2).toUpperCase()
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const goals = useSavingsGoals()
  const { user, signOut } = useAuth()
  const { lang } = useLanguage()
  const subscription = useSubscription()
  const navigate = useNavigate()
  const t = COMMON[lang].nav
  const totalCurrentAmount = goals.goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const unlockedCount = goals.loading ? null : getUnlockedTiers(totalCurrentAmount, goals.goals).length
  const planName = TARIFS[lang].plans[subscription.plan].name

  const links = [
    { to: '/dashboard', label: t.dashboard, Icon: IconHome },
    { to: '/budget', label: t.budget, Icon: IconCard },
    { to: '/epargne', label: t.epargne, Icon: IconTarget },
    { to: '/statistiques', label: t.statistiques, Icon: IconChart },
    { to: '/tarifs', label: t.tarifs, Icon: IconTag },
    { to: '/parametres', label: t.parametres, Icon: IconGear },
  ]

  function renderBadge(to: string) {
    if (to !== '/statistiques' || unlockedCount === null) return null
    return (
      <span className="ml-auto rounded-full bg-overlay/10 px-1.5 py-0.5 text-[10px] font-semibold">
        {unlockedCount}/{REWARD_TIERS.length}
      </span>
    )
  }

  async function handleSignOut() {
    onClose()
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <>
      {/* Backdrop — mobile drawer only, dismisses on outside click. */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-overlay/10 bg-surface transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2 border-b border-overlay/10 px-5 py-5">
          <LogoMark className="h-7 w-7" />
          <span className="text-lg font-bold">
            <span className="text-ink">save</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Up</span>
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? '' : 'text-muted hover:bg-overlay/5 hover:text-ink'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive ? { color: ACTIVE_ORANGE, backgroundColor: `${ACTIVE_ORANGE}1A` } : undefined
                  }
                >
                  <link.Icon className="h-5 w-5 shrink-0" />
                  <span>{link.label}</span>
                  {renderBadge(link.to)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-overlay/10 p-3">
          <Link
            to="/parametres"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-overlay/5"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ color: ACTIVE_ORANGE, backgroundColor: `${ACTIVE_ORANGE}26` }}
            >
              {getInitials(user?.email)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{user?.email ?? ''}</span>
              <span className="block truncate text-xs text-muted">{planName}</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-overlay/5 hover:text-red-400"
          >
            <IconLogout className="h-5 w-5 shrink-0" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
