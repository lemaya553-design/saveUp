import { useEffect, useRef, useState } from 'react'
import {
  BADGES,
  getBadgeResultLabel,
  getBadgeUnlockMessage,
  getUserStatus,
  isBadgeUnlocked,
  type BadgeDef,
} from '../lib/badges'
import { isAtLeast } from '../lib/plans'
import { useBadgeProgress } from '../hooks/useBadgeProgress'
import { useClaimedBadges } from '../hooks/useClaimedBadges'
import { usePreferences } from '../hooks/usePreferences'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { useGuestMode } from '../hooks/useGuestMode'
import { BadgeUnlockOverlay, type UnlockScreen } from './BadgeUnlockOverlay'

// Mounted once in Layout.tsx, above every authenticated page — detects
// badges that just became earned but aren't claimed yet (claimed_badges has
// no row for them), auto-claims them (no more manual "Réclamer" button —
// see RecompensesTab), and celebrates each one full-screen, one at a time,
// wherever in the app the user happens to be when it happens. A badge that
// also crosses a new status threshold (lib/badges.ts STATUS_LEVELS) gets a
// second "new status" screen queued right after it.
export function BadgeUnlockWatcher() {
  const guest = useGuestMode()
  const { lang } = useLanguage()
  const formatMoney = useMoneyFormat()
  const preferences = usePreferences()
  const { loading, ctx, plan } = useBadgeProgress()
  const claimedBadges = useClaimedBadges()
  const [queue, setQueue] = useState<UnlockScreen[]>([])
  const claimingRef = useRef(false)

  useEffect(() => {
    if (guest.active || loading || claimedBadges.loading || claimingRef.current) return

    const newlyUnlocked = BADGES.filter(
      (def: BadgeDef) =>
        !claimedBadges.claimedIds.has(def.id) &&
        (!def.minPlan || isAtLeast(plan, def.minPlan)) &&
        isBadgeUnlocked(def, ctx),
    )
    if (newlyUnlocked.length === 0) return

    claimingRef.current = true

    async function claimAll() {
      let claimedCount = claimedBadges.claimedIds.size
      const newScreens: UnlockScreen[] = []

      for (const def of newlyUnlocked) {
        const ok = await claimedBadges.claim(def.id)
        if (!ok) continue
        const statusBefore = getUserStatus(claimedCount)
        claimedCount += 1
        const statusAfter = getUserStatus(claimedCount)

        const resultLabel = getBadgeResultLabel(def, lang, formatMoney)
        const message = getBadgeUnlockMessage(def, lang, preferences.firstName ?? '', resultLabel)
        newScreens.push({ kind: 'badge', def, resultLabel, message })

        if (statusAfter.id !== statusBefore.id) {
          newScreens.push({ kind: 'status', status: statusAfter })
        }
      }

      setQueue((prev) => [...prev, ...newScreens])
      claimingRef.current = false
    }

    claimAll()
    // claimedBadges/preferences/formatMoney are fresh objects/callbacks every
    // render — depending on their primitive/stable parts only (ids, loading,
    // firstName) avoids re-running this on every unrelated re-render while
    // still reacting to every real change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    guest.active,
    loading,
    claimedBadges.loading,
    claimedBadges.claimedIds,
    ctx,
    plan,
    lang,
    preferences.firstName,
  ])

  if (guest.active || queue.length === 0) return null

  return (
    <BadgeUnlockOverlay
      screen={queue[0]}
      lang={lang}
      onDismiss={() => setQueue((prev) => prev.slice(1))}
    />
  )
}
