import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PageSkeleton } from './PageSkeleton'

// Gate for every app page (Dashboard, Budget, etc.): while the session is
// still being resolved we show a skeleton rather than flashing the login
// page, then either render the protected route or bounce to /connexion,
// remembering where the user was headed so they land back there after login.
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageSkeleton cards={3} />
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
