import { Outlet, useLocation } from 'react-router-dom'
import { Nav } from './Nav'
import { QuickAddFab } from './QuickAddFab'
import { useLoginStreak } from '../hooks/useLoginStreak'

export function Layout() {
  const location = useLocation()
  const isMarketingPage =
    location.pathname === '/' ||
    location.pathname === '/tarifs' ||
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
