import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { ToastProvider } from './components/ToastProvider'
import { PageSkeleton } from './components/PageSkeleton'
import { AuthProvider } from './hooks/useAuth'
import { PreferencesProvider } from './hooks/usePreferences'
import { PwaInstallProvider } from './hooks/usePwaInstall'
import { Home } from './pages/Home'
import { Tarifs } from './pages/Tarifs'
import { Connexion } from './pages/Connexion'
import { Confidentialite } from './pages/Confidentialite'
import { Conditions } from './pages/Conditions'
import { Dashboard } from './pages/Dashboard'
import { Budget } from './pages/Budget'
import { Epargne } from './pages/Epargne'
import { Parametres } from './pages/Parametres'
import { Onboarding } from './pages/Onboarding'
import { DuelAccept } from './pages/DuelAccept'

// Recharts is sizeable and used across every chart on this page — loaded on
// demand so no other route pays for it in the initial bundle.
const Statistiques = lazy(() =>
  import('./pages/Statistiques').then((m) => ({ default: m.Statistiques })),
)

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <PwaInstallProvider>
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

                    <Route path="budget" element={<Navigate to="/budget/depenses" replace />} />
                    <Route path="budget/:tab" element={<Budget />} />

                    <Route path="epargne" element={<Navigate to="/epargne/objectifs" replace />} />
                    <Route path="epargne/:tab" element={<Epargne />} />
                    {/* Simulateur, Duels and Investissement merged into Épargne as tabs — keep old links/bookmarks working. */}
                    <Route path="simulateur" element={<Navigate to="/epargne/simulateur" replace />} />
                    <Route path="investissement" element={<Navigate to="/epargne/investissement" replace />} />
                    <Route path="duels" element={<Navigate to="/epargne/duels" replace />} />
                    <Route path="duels/rejoindre/:token" element={<DuelAccept />} />

                    <Route path="statistiques" element={<Navigate to="/statistiques/apercu" replace />} />
                    <Route
                      path="statistiques/:tab"
                      element={
                        <Suspense fallback={<PageSkeleton cards={4} />}>
                          <Statistiques />
                        </Suspense>
                      }
                    />
                    {/* Récompenses merged into Statistiques as a tab — keep old links/bookmarks working. */}
                    <Route path="recompenses" element={<Navigate to="/statistiques/recompenses" replace />} />

                    <Route path="parametres" element={<Navigate to="/parametres/compte" replace />} />
                    <Route path="parametres/:tab" element={<Parametres />} />

                    <Route path="onboarding" element={<Onboarding />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </PwaInstallProvider>
      </PreferencesProvider>
    </AuthProvider>
  )
}

export default App
