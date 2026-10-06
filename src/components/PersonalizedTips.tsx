import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { Tip } from '../lib/tips'

// positive/neutral both map to the page's fixed orange rather than
// green/violet — warning keeps red, consistent with "red only for a real
// problem" elsewhere in this redesign.
const TONE_STYLES: Record<Tip['tone'], { border: string; bg: string; text: string; icon: string }> = {
  warning: { border: 'border-red-900/40', bg: 'bg-red-950/30', text: 'text-red-200', icon: '⚠' },
  positive: { border: 'border-[#FF7A00]/30', bg: 'bg-[#FF7A00]/10', text: 'text-ink', icon: '✓' },
  neutral: { border: 'border-[#FF7A00]/30', bg: 'bg-[#FF7A00]/10', text: 'text-ink', icon: '💡' },
}

export function PersonalizedTips({ tips }: { tips: Tip[] }) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].personalizedTips
  return (
    <section
      className="hover-lift min-w-0 rounded-2xl border bg-surface p-5 shadow-sm sm:p-6"
      style={{ borderColor: 'color-mix(in srgb, var(--color-overlay) 10%, transparent)' }}
    >
      <h2 className="text-base font-semibold text-ink">{t.title}</h2>
      <p className="mb-4 mt-1 text-xs text-muted">{t.hint}</p>
      {tips.length === 0 ? (
        // Every tip in lib/tips.ts requires real spending/contribution/goal
        // history — a blank <ul> here used to render as a titled card with
        // nothing inside it, reading as broken rather than "not yet." This
        // points at the two fastest ways to get a first real tip.
        <p className="text-sm text-muted">
          {t.emptyPre}
          <Link to="/budget/depenses" className="budget-action-link">
            {t.emptyExpenseLink}
          </Link>
          {t.emptyAnd}
          <Link to="/epargne/objectifs" className="budget-action-link">
            {t.emptyGoalLink}
          </Link>
          {t.emptyPost}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tips.map((tip) => {
            const style = TONE_STYLES[tip.tone]
            return (
              <li
                key={tip.id}
                className={`flex items-start gap-3 rounded-xl border ${style.border} ${style.bg} px-4 py-3 text-sm ${style.text}`}
              >
                <span aria-hidden="true" className="mt-0.5">
                  {style.icon}
                </span>
                <p>{tip.message}</p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
