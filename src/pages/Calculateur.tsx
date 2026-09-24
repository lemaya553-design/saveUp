import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogoMark } from '../components/Logo'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useLanguage } from '../hooks/useLanguage'
import { formatMoney } from '../lib/format'
import { computeWorkHours } from '../lib/workHours'
import { CALCULATEUR } from '../lib/i18n/calculateur'
import { COMMON } from '../lib/i18n/common'

// Public, unauthenticated, standalone — no Supabase read or write anywhere
// on this page, not even for the language preference (useLanguage's
// localStorage-only persistence still works fine logged out). Every number
// typed here lives in local component state only and is never sent
// anywhere; the "Partager" flow renders an image entirely client-side
// (html2canvas) and never touches a server either.
export function Calculateur() {
  const { lang } = useLanguage()
  const t = CALCULATEUR[lang]
  const wt = COMMON[lang].workHours

  useEffect(() => {
    document.title = t.meta.title
  }, [t.meta.title])

  const [amount, setAmount] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'downloaded' | 'error'>('idle')
  const cardRef = useRef<HTMLDivElement>(null)

  const parsedAmount = Number(amount) || 0
  const parsedRate = Number(hourlyRate) || 0
  const breakdown = computeWorkHours(parsedAmount, parsedRate)
  const resultLabel = !breakdown
    ? null
    : breakdown.unit === 'minutes'
      ? wt.minutes(breakdown.minutes)
      : breakdown.unit === 'hours'
        ? wt.hours(breakdown.hours)
        : wt.hoursAndDays(breakdown.hours, breakdown.days)
  const formattedAmount = formatMoney(parsedAmount, lang, 'CAD')

  async function handleShare() {
    if (!resultLabel || !cardRef.current) return
    setSharing(true)
    setShareState('idle')
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 3 })
      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('canvas produced no blob')
      const file = new File([blob], 'saveup-heures-de-travail.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'SaveUp' })
        setShareState('idle')
      } else if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setShareState('copied')
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'saveup-heures-de-travail.png'
        a.click()
        URL.revokeObjectURL(url)
        setShareState('downloaded')
      }
    } catch {
      // A user cancelling the native share sheet also lands here (AbortError)
      // — indistinguishable from a real failure without over-parsing every
      // browser's own error shape, so this stays a quiet no-op rather than a
      // scary red message for a plain "changed my mind" cancel.
      setShareState('idle')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="hero-gradient min-h-screen px-4 py-10 sm:px-6">
      <header className="mx-auto flex max-w-lg items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark className="h-7 w-7" />
          <span className="text-xl font-bold">
            <span className="text-ink">save</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Up</span>
          </span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="mx-auto mt-10 max-w-lg">
        <h1 className="text-balance text-center text-3xl font-bold text-ink sm:text-4xl">{t.heading}</h1>
        <p className="mt-3 text-center text-muted">{t.subtitle}</p>

        <div className="glass mt-8 rounded-2xl p-6 shadow-lg shadow-black/30">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm text-muted">
              {t.amountLabel}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.amountPlaceholder}
                autoFocus
                className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-lg text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-muted">
              {t.hourlyRateLabel}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder={t.hourlyRatePlaceholder}
                className="rounded-lg border border-overlay/10 bg-overlay/5 px-3 py-2 text-lg text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-overlay/10 bg-overlay/5 p-5 text-center">
            {resultLabel ? (
              <>
                <p className="text-3xl font-bold text-ink">{formattedAmount}</p>
                <p className="mt-1 text-sm text-muted">{resultLabel}</p>
              </>
            ) : (
              <p className="text-sm text-muted">{t.resultEmpty}</p>
            )}
          </div>

          {resultLabel && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                disabled={sharing}
                className="w-full rounded-lg bg-primary-strong px-5 py-3 font-medium text-white transition-all hover:brightness-110 disabled:opacity-60"
              >
                {sharing ? t.shareGenerating : t.shareButton}
              </button>
              {shareState === 'copied' && <p className="text-xs text-success">{t.copiedConfirmation}</p>}
              {shareState === 'downloaded' && <p className="text-xs text-success">{t.downloadButton}</p>}
              {shareState === 'error' && <p className="text-xs text-red-400">{t.shareError}</p>}
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          {t.ctaPrefix}
          <Link to="/connexion" className="font-medium text-accent hover:text-accent/80">
            {t.ctaLink}
          </Link>
        </p>
      </main>

      {/* Off-screen share card — html2canvas renders this exact node into the
          shared/downloaded image; visually identical to the result above but
          laid out as a fixed 1080×1080 square (Instagram/TikTok) and never
          shown to the visitor directly. Kept in-flow at the viewport origin
          rather than pushed far off-screen — some browsers skip layout for
          extremely offset elements, which would capture a blank image. */}
      <div className="pointer-events-none fixed left-0 top-0 -z-50 opacity-0" aria-hidden="true">
        <div
          ref={cardRef}
          className="flex h-[1080px] w-[1080px] flex-col items-center justify-center gap-8 bg-canvas p-20"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74, 108, 247, 0.22), transparent 70%), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(139, 92, 246, 0.16), transparent 70%)',
          }}
        >
          <LogoMark className="h-24 w-24" />
          <p className="text-4xl font-medium text-[#9ca3af]">{t.shareCard.tagline}</p>
          <p className="text-8xl font-black text-[#f5f5f7]">{formattedAmount}</p>
          <p className="text-6xl font-bold text-[#8b5cf6]">{resultLabel}</p>
          <p className="mt-8 text-3xl text-[#9ca3af]">saveup.store</p>
        </div>
      </div>
    </div>
  )
}
