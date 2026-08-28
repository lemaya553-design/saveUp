import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Appears once the visitor has scrolled past the hero's own CTA (showing it
// immediately would just duplicate that button at the top of the page) and
// hides again near the bottom (the "CTA final" section already has its own
// large button + trust badges — a floating bar on top of that, or the
// footer's links, would just get in the way instead of helping).
export function StickyCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY
      const pastHero = scrollY > window.innerHeight * 0.7
      const distanceFromBottom = document.documentElement.scrollHeight - (scrollY + window.innerHeight)
      const nearFooter = distanceFromBottom < 700
      setVisible(pastHero && !nearFooter)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 transition-all duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      aria-hidden={!visible}
    >
      <div className="glass pointer-events-auto relative flex flex-col items-center gap-2 rounded-2xl border-t border-t-overlay/20 px-6 py-4 shadow-2xl shadow-black/50 sm:flex-row sm:gap-5 sm:py-3.5">
        <div className="relative">
          <div className="glow-pulse absolute inset-0 -z-10 rounded-xl bg-primary/50 blur-xl" aria-hidden="true" />
          <Link
            to="/dashboard"
            tabIndex={visible ? 0 : -1}
            className="btn-sheen block rounded-xl bg-primary-strong px-8 py-4 text-center text-lg font-bold text-white shadow-[0_0_30px_rgba(74,108,247,0.45)] transition-all hover:brightness-110"
          >
            Commencer gratuitement
          </Link>
        </div>
        <p className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted">
          <span aria-hidden="true">🔒</span>
          Aucune carte de crédit requise
        </p>
      </div>
    </div>
  )
}
