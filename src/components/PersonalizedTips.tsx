import { Link } from 'react-router-dom'
import { Card } from './Card'
import { useLanguage } from '../hooks/useLanguage'
import { STATISTIQUES } from '../lib/i18n/statistiques'
import type { Tip } from '../lib/tips'

const TONE_STYLES: Record<Tip['tone'], { border: string; bg: string; text: string; icon: string }> = {
  warning: { border: 'border-red-900/40', bg: 'bg-red-950/30', text: 'text-red-200', icon: '⚠' },
  positive: { border: 'border-success/30', bg: 'bg-success/10', text: 'text-ink', icon: '✓' },
  neutral: { border: 'border-accent/30', bg: 'bg-accent/10', text: 'text-ink', icon: '💡' },
}

export function PersonalizedTips({ tips }: { tips: Tip[] }) {
  const { lang } = useLanguage()
  const t = STATISTIQUES[lang].personalizedTips
  return (
    <Card title={t.title} hint={t.hint}>
      {tips.length === 0 ? (
        // Every tip in lib/tips.ts requires real spending/contribution/goal
        // history — a blank <ul> here used to render as a titled card with
        // nothing inside it, reading as broken rather than "not yet." This
        // points at the two fastest ways to get a first real tip.
        <p className="text-sm text-muted">
          {t.emptyPre}
          <Link to="/budget/depenses" className="text-accent hover:text-accent/80">
            {t.emptyExpenseLink}
          </Link>
          {t.emptyAnd}
          <Link to="/epargne/objectifs" className="text-accent hover:text-accent/80">
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
    </Card>
  )
}
