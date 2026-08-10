import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { ToastProvider } from './components/ToastProvider'
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
import { Simulateur } from './pages/Simulateur'
import { Recompenses } from './pages/Recompenses'
import { Parametres } from './pages/Parametres'
import { Onboarding } from './pages/Onboarding'

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
                <Route path="investissement" element={<Investissement />} />
                <Route path="simulateur" element={<Simulateur />} />
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
