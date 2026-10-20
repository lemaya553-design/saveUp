import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useGuestMode } from '../hooks/useGuestMode'
import { PageSkeleton } from './PageSkeleton'

// Gate for every app page (Dashboard, Budget, etc.): while the session is
// still being resolved we show a skeleton rather than flashing the login
// page, then either render the protected route or bounce to /connexion,
// remembering where the user was headed so they land back there after login.
// "Essayer sans compte" (Connexion.tsx) is a second, independent way in —
// guest.active lets someone through with no real Supabase session at all;
// every data hook used by the pages behind this gate already knows to read
// lib/guestStore.ts instead of Supabase in that case.
export function RequireAuth() {
  const { user, loading } = useAuth()
  const guest = useGuestMode()
  const location = useLocation()

  if (loading) {
    return <PageSkeleton cards={3} />
  }

  if (!user && !guest.active) {
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
