import { Card } from './Card'
import type { Tip } from '../lib/tips'

const TONE_STYLES: Record<Tip['tone'], { border: string; bg: string; text: string; icon: string }> = {
  warning: { border: 'border-red-900/40', bg: 'bg-red-950/30', text: 'text-red-200', icon: '⚠' },
  positive: { border: 'border-success/30', bg: 'bg-success/10', text: 'text-ink', icon: '✓' },
  neutral: { border: 'border-accent/30', bg: 'bg-accent/10', text: 'text-ink', icon: '💡' },
}

export function PersonalizedTips({ tips }: { tips: Tip[] }) {
  return (
    <Card title="Conseils personnalisés" hint="Basés sur tes vraies dépenses, tendances et objectifs.">
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
    </Card>
  )
}
