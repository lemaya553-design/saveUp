import { Outlet, useLocation } from 'react-router-dom'
import { Nav } from './Nav'
import { QuickAddFab } from './QuickAddFab'
import { useLoginStreak } from '../hooks/useLoginStreak'
import { useAuth } from '../hooks/useAuth'

export function Layout() {
  const location = useLocation()
  const { user } = useAuth()
  // /tarifs is the one route that's genuinely both: a public marketing page
  // for logged-out visitors (own LandingHeader, no app chrome) AND a normal
  // in-app page for signed-in users (reachable from Nav, so it should use
  // the app's own header instead of stacking a second one) — everything
  // else here is marketing-only regardless of auth state.
  const isMarketingPage =
    location.pathname === '/' ||
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

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {!isMarketingPage && <Nav />}
      <Outlet />
      {!isMarketingPage && <QuickAddFab />}
    </div>
  )
}
