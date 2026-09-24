import { useEffect, useState } from 'react'
import { Reveal } from './Reveal'
import { ProgressBar } from './ProgressBar'
import { useLanguage } from '../hooks/useLanguage'
import { HOME } from '../lib/i18n/home'

// "10 customers by Christmas 2026" — a real, currently-active goal, so this
// is a plain constant, not something derived. The count itself is never
// hardcoded — see api/customer-count.ts, which counts real active
// (non-trial) Stripe subscriptions server-side and returns only the total.
const TARGET = 10

// Fails silently (renders nothing) rather than showing a broken/zero state
// on a section whose whole point is trustworthiness — an error here should
// never look like "0 customers," which would read as the opposite of honest.
export function ProgressCounter() {
  const { lang } = useLanguage()
  const t = HOME[lang].progressCounter
  const [count, setCount] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/customer-count')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('bad response'))))
      .then((data: { count?: number }) => {
        if (!cancelled && typeof data.count === 'number') setCount(data.count)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (failed) return null

  return (
    <section className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <Reveal>
        <div className="glass rounded-2xl p-6 text-center shadow-lg shadow-black/30">
          <p className="text-sm text-muted">{t.context}</p>
          {count === null ? (
            <div className="mx-auto mt-4 h-8 w-40 animate-pulse rounded-lg bg-overlay/10" aria-hidden="true" />
          ) : (
            <>
              <p className="mt-4 text-2xl font-bold text-ink">{t.progress(count, TARGET)}</p>
              <div className="mt-4">
                <ProgressBar value={(count / TARGET) * 100} colorClass="bg-accent" />
              </div>
            </>
          )}
        </div>
      </Reveal>
    </section>
  )
}
