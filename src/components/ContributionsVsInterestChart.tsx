import { useLanguage } from '../hooks/useLanguage'
import { useMoneyFormat } from '../hooks/useMoneyFormat'
import { EPARGNE } from '../lib/i18n/epargne'

export function ContributionsVsInterestChart({
  totalContributions,
  interestEarned,
  finalValue,
}: {
  totalContributions: number
  interestEarned: number
  finalValue: number
}) {
  const { lang } = useLanguage()
  const t = EPARGNE[lang].contributionsVsInterestChart
  const formatMoney = useMoneyFormat()

  if (finalValue <= 0) {
    return <p className="text-sm text-muted">{t.empty}</p>
  }

  const contribPct = Math.min(100, (totalContributions / finalValue) * 100)
  const interestPct = Math.max(0, 100 - contribPct)

  return (
    <div>
      <div
        className="flex h-4 w-full overflow-hidden rounded-full bg-overlay/10"
        role="img"
        aria-label={t.ariaLabel(Math.round(contribPct), Math.round(interestPct))}
      >
        <div className="h-full bg-primary transition-all" style={{ width: `${contribPct}%` }} />
        <div className="h-full bg-success transition-all" style={{ width: `${interestPct}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <span className="text-ink">{t.contributionsLabel}</span>
          <span className="text-muted">
            {formatMoney(totalContributions)} · {Math.round(contribPct)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
          <span className="text-ink">{t.interestLabel}</span>
          <span className="text-muted">
            {formatMoney(interestEarned)} · {Math.round(interestPct)}%
          </span>
        </div>
      </div>
    </div>
  )
}
