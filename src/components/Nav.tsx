import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { useAuth } from '../hooks/useAuth'
import { REWARD_TIERS, getUnlockedTiers } from '../lib/rewards'
import { LogoMark } from './Logo'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/budget', label: 'Budget' },
  { to: '/epargne', label: 'Épargne' },
  { to: '/statistiques', label: 'Statistiques' },
  { to: '/recompenses', label: 'Récompenses' },
  { to: '/parametres', label: 'Paramètres' },
]

function MenuIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CloseIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function Nav() {
  const goals = useSavingsGoals()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const totalCurrentAmount = goals.goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const unlockedCount = goals.loading ? null : getUnlockedTiers(totalCurrentAmount, goals.goals).length

  function renderBadge(to: string) {
    if (to !== '/recompenses' || unlockedCount === null) return null
    return (
      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold">
        {unlockedCount}/{REWARD_TIERS.length}
      </span>
    )
  }

  async function handleSignOut() {
    setOpen(false)
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-surface/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 lg:justify-center">
        <Link to="/dashboard" className="flex items-center gap-1.5 lg:hidden">
          <LogoMark className="h-6 w-6" />
          <span className="text-lg font-bold">
            <span className="text-ink">save</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Up</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-strong text-white'
                    : 'text-muted hover:bg-white/5 hover:text-accent'
                }`
              }
            >
              {link.label}
              {renderBadge(link.to)}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            className="ml-1 rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-red-400"
          >
            Déconnexion
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-white/5 lg:hidden"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 pb-3 lg:hidden">
          <ul className="flex flex-col gap-1 pt-2">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-strong text-white'
                        : 'text-muted hover:bg-white/5 hover:text-accent'
                    }`
                  }
                >
                  <span>{link.label}</span>
                  {renderBadge(link.to)}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-red-400"
              >
                Déconnexion
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
