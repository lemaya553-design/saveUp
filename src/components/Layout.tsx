import { Outlet, useLocation } from 'react-router-dom'
import { Nav } from './Nav'
import { QuickAddFab } from './QuickAddFab'

export function Layout() {
  const location = useLocation()
  const isMarketingPage =
    location.pathname === '/' ||
    location.pathname === '/tarifs' ||
    location.pathname === '/onboarding' ||
    location.pathname === '/connexion' ||
    location.pathname === '/confidentialite' ||
    location.pathname === '/conditions'

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {!isMarketingPage && <Nav />}
      <Outlet />
      {!isMarketingPage && <QuickAddFab />}
    </div>
  )
}
