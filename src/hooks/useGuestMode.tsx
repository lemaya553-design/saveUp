import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { activateGuestMode, deactivateGuestMode, isGuestModeActive } from '../lib/guestStore'

interface GuestModeContextValue {
  active: boolean
  // "Essayer sans compte" (Connexion.tsx) — seeds fresh sample data and
  // flips the flag; callers navigate to /dashboard right after.
  activate: () => void
  // Leaving guest mode. `keepPendingGoal`: true when this exit is "the
  // guest is signing up right now" (queues the sample goal — possibly
  // edited — for Dashboard.tsx to adopt into the new real account), false
  // for "deliberately quitting guest mode" (nothing carried over).
  exit: (keepPendingGoal: boolean) => void
}

const GuestModeContext = createContext<GuestModeContextValue | null>(null)

// Mounted once in App.tsx, alongside AuthProvider — a parallel, independent
// "am I signed in" signal that RequireAuth also accepts, and that every
// guest-aware data hook (useIncome, useExpenses, etc.) checks to decide
// whether to read/write lib/guestStore.ts instead of Supabase.
export function GuestModeProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(isGuestModeActive)

  const activate = useCallback(() => {
    activateGuestMode()
    setActive(true)
  }, [])

  const exit = useCallback((keepPendingGoal: boolean) => {
    deactivateGuestMode(keepPendingGoal)
    setActive(false)
  }, [])

  return <GuestModeContext.Provider value={{ active, activate, exit }}>{children}</GuestModeContext.Provider>
}

export function useGuestMode(): GuestModeContextValue {
  const ctx = useContext(GuestModeContext)
  if (!ctx) throw new Error('useGuestMode must be used within GuestModeProvider')
  return ctx
}
