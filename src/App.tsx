import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { ToastProvider } from './components/ToastProvider'
import { PageSkeleton } from './components/PageSkeleton'
import { AuthProvider } from './hooks/useAuth'
import { Home } from './pages/Home'
import { Tarifs } from './pages/Tarifs'
import { Connexion } from './pages/Connexion'
import { Confidentialite } from './pages/Confidentialite'
import { Conditions } from './pages/Conditions'
import { Dashboard } from './pages/Dashboard'
import { Budget } from './pages/Budget'
import { Epargne } from './pages/Epargne'
import { Investissement } from './pages/Investissement'
import { Recompenses } from './pages/Recompenses'
import { Parametres } from './pages/Parametres'
import { Onboarding } from './pages/Onboarding'

// Recharts is sizeable and used across every chart on this page — loaded on
// demand so no other route pays for it in the initial bundle.
const Statistiques = lazy(() =>
  import('./pages/Statistiques').then((m) => ({ default: m.Statistiques })),
)

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="tarifs" element={<Tarifs />} />
              <Route path="connexion" element={<Connexion />} />
              <Route path="confidentialite" element={<Confidentialite />} />
              <Route path="conditions" element={<Conditions />} />
              <Route element={<RequireAuth />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="budget" element={<Budget />} />
                <Route path="epargne" element={<Epargne />} />
                {/* Simulateur merged into Épargne as a tab — keep old links/bookmarks working. */}
                <Route path="simulateur" element={<Navigate to="/epargne" replace />} />
                <Route path="investissement" element={<Investissement />} />
                <Route
                  path="statistiques"
                  element={
                    <Suspense fallback={<PageSkeleton cards={4} />}>
                      <Statistiques />
                    </Suspense>
                  }
                />
                <Route path="recompenses" element={<Recompenses />} />
                <Route path="parametres" element={<Parametres />} />
                <Route path="onboarding" element={<Onboarding />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
