import { useMemo, useState } from 'react'
import { HelpButton } from '../components/HelpButton'
import { PageSkeleton } from '../components/PageSkeleton'
import { CalendarNoteModal } from '../components/CalendarNoteModal'
import { useCalendarNotes } from '../hooks/useCalendarNotes'
import { useMonthSavingsContributions } from '../hooks/useMonthSavingsContributions'
import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { getMonthRange } from '../lib/format'
import { buildMonthGrid, computeMonthNoteStats, ratingBlendPct, type CalendarCell } from '../lib/calendarGrid'
import { CALENDRIER } from '../lib/i18n/calendrier'

function dayCellStyle(rating: number | undefined): React.CSSProperties {
  if (rating === undefined) return {}
  const pct = ratingBlendPct(rating)
  return { backgroundColor: `color-mix(in srgb, var(--color-primary) ${pct}%, var(--color-surface))` }
}

function SavingsDot({ label }: { label: string }) {
  return (
    <span
      className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-canvas"
      title={label}
      aria-hidden="true"
    />
  )
}

export function Calendrier() {
  const { lang } = useLanguage()
  const t = CALENDRIER[lang]
  const formatMoney = useMoneyFormat()
  const locale = lang === 'fr' ? 'fr-CA' : 'en-CA'

  const [monthOffset, setMonthOffset] = useState(0)
  const selectedMonth = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
  }, [monthOffset])
  const { start: monthStart, end: monthEnd } = useMemo(() => getMonthRange(selectedMonth), [selectedMonth])

  const notesData = useCalendarNotes(monthStart, monthEnd)
  const savingsData = useMonthSavingsContributions(monthStart, monthEnd)

  const weeks = useMemo(() => buildMonthGrid(selectedMonth), [selectedMonth])

  const monthStats = useMemo(
    () => computeMonthNoteStats([...notesData.notes.values()].map((n) => n.rating)),
    [notesData.notes],
  )

  const [activeCell, setActiveCell] = useState<CalendarCell | null>(null)

  const monthLabel = selectedMonth.toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  function dayLabel(dateStr: string): string {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  function shortDayLabel(dateStr: string): string {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })
  }

  const loading = notesData.loading || savingsData.loading

  if (loading) {
    return <PageSkeleton cards={1} />
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mb-1 flex items-center gap-2 pt-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">{t.pageHeader.title}</h1>
        <HelpButton title={t.help.title} purpose={t.help.purpose} actions={t.help.actions} />
      </div>
      <p className="mb-6 max-w-xl text-sm text-muted">{t.pageHeader.subtitle}</p>

      {(notesData.error || savingsData.error) && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {notesData.error ?? savingsData.error}
        </div>
      )}

      <div className="glass w-full min-w-0 rounded-2xl p-4 shadow-lg shadow-black/30 sm:p-6">
        {/* Month nav + stats header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setMonthOffset((o) => o - 1)}
              aria-label={t.monthNav.prev}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-overlay/5"
            >
              ‹
            </button>
            <span className="min-w-[10rem] text-center text-lg font-semibold capitalize text-ink">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
              disabled={monthOffset >= 0}
              aria-label={t.monthNav.next}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-overlay/5 disabled:opacity-30"
            >
              ›
            </button>
            {monthOffset !== 0 && (
              <button
                type="button"
                onClick={() => setMonthOffset(0)}
                className="ml-1 rounded-full border border-overlay/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                {t.monthNav.today}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center sm:justify-end sm:text-right">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">{t.stats.average}</p>
              <p className="text-xl font-bold text-ink">
                {monthStats.average === null ? t.stats.noAverage : `${monthStats.average.toFixed(1)} / 10`}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">&nbsp;</p>
              <p className="text-sm font-medium text-muted">{t.stats.notedDays(monthStats.notedDaysCount)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">{t.stats.savedThisMonth}</p>
              <p className="text-xl font-bold text-ink">{formatMoney(savingsData.total)}</p>
            </div>
          </div>
        </div>

        {/* Desktop/tablet: full 7-column month grid. motion-safe entrance
            replays per month change via the key below, matching
            "transitions douces entre les mois" — already reduced-motion-safe
            (see .budget-card-in's own @media block in index.css). */}
        <div key={monthLabel} className="budget-card-in mt-6 hidden sm:block">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted">
            {t.weekdaysShort.map((d) => (
              <div key={d} className="pb-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weeks.flat().map((cell) => {
              const note = notesData.notes.get(cell.dateStr)
              const hasSavings = savingsData.contributionDays.has(cell.dateStr)
              const clickable = cell.inCurrentMonth && !cell.isFuture
              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  disabled={!clickable}
                  onClick={() => setActiveCell(cell)}
                  aria-label={t.dayAriaLabel(dayLabel(cell.dateStr), note?.rating ?? null)}
                  className={`relative flex min-h-[96px] flex-col items-start rounded-xl border p-2 text-left transition-colors motion-reduce:transition-none ${
                    clickable ? 'cursor-pointer hover:border-overlay/25' : 'cursor-default'
                  } ${cell.isToday ? 'border-primary/60' : 'border-overlay/10'} ${
                    !cell.inCurrentMonth ? 'opacity-35' : ''
                  }`}
                  style={dayCellStyle(note?.rating)}
                >
                  {hasSavings && <SavingsDot label={t.savingsIndicatorLabel(dayLabel(cell.dateStr))} />}
                  <span className={`text-xs font-medium ${cell.isToday ? 'text-primary' : 'text-muted'}`}>
                    {cell.date.getDate()}
                  </span>
                  {note && (
                    <>
                      <span className="mt-1 text-2xl font-extrabold leading-none text-ink">{note.rating}</span>
                      {note.description && (
                        <span className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink/80">
                          {note.description}
                        </span>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile: week-by-week list — no 7-column grid, so nothing can ever
            force horizontal scroll. */}
        <div key={`${monthLabel}-mobile`} className="budget-card-in mt-6 flex flex-col gap-5 sm:hidden">
          {weeks.map((week) => {
            const inMonthDays = week.filter((c) => c.inCurrentMonth)
            if (inMonthDays.length === 0) return null
            return (
              <div key={week[0].dateStr}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {t.mobile.weekLabel(shortDayLabel(inMonthDays[0].dateStr), shortDayLabel(inMonthDays[inMonthDays.length - 1].dateStr))}
                </p>
                <div className="flex flex-col gap-2">
                  {inMonthDays.map((cell) => {
                    const note = notesData.notes.get(cell.dateStr)
                    const hasSavings = savingsData.contributionDays.has(cell.dateStr)
                    const clickable = !cell.isFuture
                    return (
                      <button
                        key={cell.dateStr}
                        type="button"
                        disabled={!clickable}
                        onClick={() => setActiveCell(cell)}
                        aria-label={t.dayAriaLabel(dayLabel(cell.dateStr), note?.rating ?? null)}
                        className={`relative flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left ${
                          clickable ? 'cursor-pointer hover:border-overlay/25' : 'cursor-default opacity-60'
                        } ${cell.isToday ? 'border-primary/60' : 'border-overlay/10'}`}
                      >
                        {hasSavings && <SavingsDot label={t.savingsIndicatorLabel(dayLabel(cell.dateStr))} />}
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-ink"
                          style={dayCellStyle(note?.rating)}
                        >
                          {note ? note.rating : cell.date.getDate()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium capitalize ${cell.isToday ? 'text-primary' : 'text-ink'}`}>
                            {shortDayLabel(cell.dateStr)}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {note?.description || (note ? '' : t.mobile.noNote)}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <CalendarNoteModal
        open={activeCell !== null}
        onClose={() => setActiveCell(null)}
        dateStr={activeCell?.dateStr ?? ''}
        dateLabel={activeCell ? dayLabel(activeCell.dateStr) : ''}
        initial={activeCell ? (notesData.notes.get(activeCell.dateStr) ?? null) : null}
        onSave={(dateStr, rating, description) => {
          notesData.saveNote(dateStr, rating, description)
          setActiveCell(null)
        }}
        onClear={(dateStr) => {
          notesData.deleteNote(dateStr)
          setActiveCell(null)
        }}
      />
    </div>
  )
}
