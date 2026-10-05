import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { QuickAddFab } from './QuickAddFab'
import { PwaInstallBanner } from './PwaInstallBanner'
import { useLoginStreak } from '../hooks/useLoginStreak'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { COMMON } from '../lib/i18n/common'

export function Layout() {
  const location = useLocation()
  const { user } = useAuth()
  const { lang } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // /tarifs is the one route that's genuinely both: a public marketing page
  // for logged-out visitors (own LandingHeader, no app chrome) AND a normal
  // in-app page for signed-in users (reachable from the sidebar, so it
  // should use the app's own shell instead of stacking a second header) —
  // everything else here is marketing-only regardless of auth state.
  const isMarketingPage =
    location.pathname === '/' ||
    location.pathname === '/calculateur' ||
    (location.pathname === '/tarifs' && !user) ||
    location.pathname === '/onboarding' ||
    location.pathname === '/connexion' ||
    location.pathname === '/confidentialite' ||
    location.pathname === '/conditions'

  // Records today as a visit regardless of which page is loaded, so the
  // Récompenses page's streak reflects real app usage — not just visits to
  // that one page. Return value unused here; Récompenses reads its own
  // instance to display it.
  useLoginStreak()

  // A route change (including the drawer's own nav links) always means the
  // drawer should close, even on a route the back/forward buttons landed on.
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const navT = COMMON[lang].nav
  const pageTitle =
    [
      ['/dashboard', navT.dashboard],
      ['/budget', navT.budget],
      ['/epargne', navT.epargne],
      ['/statistiques', navT.statistiques],
      ['/tarifs', navT.tarifs],
      ['/parametres', navT.parametres],
    ].find(([to]) => location.pathname === to || location.pathname.startsWith(`${to}/`))?.[1] ?? ''

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {isMarketingPage ? (
        <Outlet />
      ) : (
        <>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex min-h-screen flex-col lg:pl-60">
            <TopBar title={pageTitle} onOpenMenu={() => setSidebarOpen(true)} />
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        </>
      )}
      {!isMarketingPage && <QuickAddFab />}
      {!isMarketingPage && <PwaInstallBanner />}
    </div>
  )
}
