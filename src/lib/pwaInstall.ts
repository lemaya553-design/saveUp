// Detection + dismissal-state helpers for the PWA install prompt. Pure
// functions (no React) so both the context provider and any one-off check
// can use them without a hook.

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  // iOS Safari never matches the (display-mode: standalone) media query —
  // it exposes its own navigator.standalone boolean instead.
  return Boolean(window.matchMedia?.('(display-mode: standalone)').matches) || nav.standalone === true
}

export function isIOSDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPhone|iPod/.test(ua)) return true
  // iPadOS 13+ identifies as "Macintosh" in its UA string — multi-touch is
  // the only reliable way left to tell a real Mac apart from an iPad.
  return /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function isSafariBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  // Chrome/Firefox/Edge/Opera on iOS are all WebKit under the hood and all
  // include "Safari" in their UA string too — their own token excludes them.
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
}

const DISMISS_KEY = 'saveup-pwa-install-dismissed-at'
const DISMISS_SNOOZE_DAYS = 21

export function getInstallDismissedAt(): number | null {
  const raw = localStorage.getItem(DISMISS_KEY)
  const parsed = raw ? Number(raw) : NaN
  return Number.isFinite(parsed) ? parsed : null
}

export function dismissInstallPrompt(): void {
  localStorage.setItem(DISMISS_KEY, String(Date.now()))
}

export function clearInstallDismissal(): void {
  localStorage.removeItem(DISMISS_KEY)
}

export function isInstallSnoozed(now = Date.now()): boolean {
  const dismissedAt = getInstallDismissedAt()
  if (dismissedAt === null) return false
  return now - dismissedAt < DISMISS_SNOOZE_DAYS * 24 * 60 * 60 * 1000
}
