import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  clearInstallDismissal,
  dismissInstallPrompt,
  isInstallSnoozed,
  isIOSDevice,
  isSafariBrowser,
  isStandaloneDisplay,
} from '../lib/pwaInstall'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type PwaInstallPlatform = 'ios-safari' | 'installable' | 'unsupported'

interface PwaInstallContextValue {
  platform: PwaInstallPlatform
  standalone: boolean
  snoozed: boolean
  forceOpen: boolean
  install: () => Promise<void>
  dismiss: () => void
  // Bypasses the snooze/activity gate — used by the Paramètres → Compte
  // entry so "revoir l'invite" always works regardless of when it was last
  // dismissed.
  reopen: () => void
}

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null)

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [standalone, setStandalone] = useState(isStandaloneDisplay)
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [snoozed, setSnoozed] = useState(isInstallSnoozed)
  const [forceOpen, setForceOpen] = useState(false)

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      // Suppresses the browser's own mini-infobar so our banner is the only
      // install nudge the user sees; the captured event stays valid and
      // callable later, whenever the user actually clicks "Installer".
      e.preventDefault()
      setDeferredEvent(e as BeforeInstallPromptEvent)
    }
    function onAppInstalled() {
      setStandalone(true)
      setDeferredEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const platform: PwaInstallPlatform = useMemo(() => {
    if (isIOSDevice() && isSafariBrowser()) return 'ios-safari'
    if (deferredEvent) return 'installable'
    return 'unsupported'
  }, [deferredEvent])

  const install = useCallback(async () => {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    const choice = await deferredEvent.userChoice
    setDeferredEvent(null)
    setForceOpen(false)
    // Accepting fires "appinstalled" on its own (handled above); only a
    // decline needs the same snooze as an explicit dismiss.
    if (choice.outcome === 'dismissed') {
      dismissInstallPrompt()
      setSnoozed(true)
    }
  }, [deferredEvent])

  const dismiss = useCallback(() => {
    dismissInstallPrompt()
    setSnoozed(true)
    setForceOpen(false)
  }, [])

  const reopen = useCallback(() => {
    clearInstallDismissal()
    setSnoozed(false)
    setForceOpen(true)
  }, [])

  const value = useMemo(
    () => ({ platform, standalone, snoozed, forceOpen, install, dismiss, reopen }),
    [platform, standalone, snoozed, forceOpen, install, dismiss, reopen],
  )

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>
}

export function usePwaInstall(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext)
  if (!ctx) throw new Error('usePwaInstall must be used within PwaInstallProvider')
  return ctx
}
