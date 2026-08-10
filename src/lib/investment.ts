export interface ProjectionInput {
  initialAmount: number
  annualRatePercent: number
  monthlyContribution: number
}

// Future value with monthly compounding and end-of-month contributions.
export function projectValue({ initialAmount, annualRatePercent, monthlyContribution }: ProjectionInput, years: number): number {
  const monthlyRate = annualRatePercent / 100 / 12
  const months = years * 12

  if (monthlyRate === 0) {
    return initialAmount + monthlyContribution * months
  }

  const growth = Math.pow(1 + monthlyRate, months)
  const fromInitial = initialAmount * growth
  const fromContributions = monthlyContribution * ((growth - 1) / monthlyRate)
  return fromInitial + fromContributions
}

export const PROJECTION_HORIZONS_YEARS = [1, 2, 5, 10]

export interface ProjectionPoint {
  month: number
  value: number
}

// Monthly-resolution growth curve from month 0 to `years` years, for
// plotting the full curve rather than just the fixed-horizon endpoints.
export function projectSeries(input: ProjectionInput, years: number): ProjectionPoint[] {
  const totalMonths = Math.max(1, Math.round(years * 12))
  const points: ProjectionPoint[] = []
  for (let month = 0; month <= totalMonths; month++) {
    points.push({ month, value: projectValue(input, month / 12) })
  }
  return points
}

export interface ContributionsBreakdown {
  totalContributions: number
  interestEarned: number
  finalValue: number
}

// Splits the projected value at `years` into what came from money actually
// put in (initial + monthly contributions) vs. what compound interest added.
export function computeContributionsBreakdown(
  input: ProjectionInput,
  years: number,
): ContributionsBreakdown {
  const months = Math.max(0, Math.round(years * 12))
  const totalContributions = input.initialAmount + input.monthlyContribution * months
  const finalValue = projectValue(input, years)
  const interestEarned = Math.max(0, finalValue - totalContributions)
  return { totalContributions, interestEarned, finalValue }
}

// Months needed to reach `targetAmount` at the given pace, or null when
// that's unreachable (no contribution pace at all) or would take longer
// than `maxMonths` — a precise-looking number that far out isn't useful.
export function estimateMonthsToReachAmount(
  input: ProjectionInput,
  targetAmount: number,
  maxMonths = 600,
): number | null {
  if (targetAmount <= input.initialAmount) return 0

  const monthlyRate = input.annualRatePercent / 100 / 12
  const { initialAmount, monthlyContribution } = input

  if (monthlyRate === 0) {
    if (monthlyContribution <= 0) return null
    const months = Math.ceil((targetAmount - initialAmount) / monthlyContribution)
    return months <= maxMonths ? months : null
  }

  if (initialAmount <= 0 && monthlyContribution <= 0) return null
  if (1 + monthlyRate <= 0) return null

  const k = initialAmount + monthlyContribution / monthlyRate
  const x = (targetAmount + monthlyContribution / monthlyRate) / k
  if (x <= 1) return 0

  // Subtract a tiny epsilon before ceiling: floating-point error in log()
  // can push an exact N-month answer to N + 1e-12, which would otherwise
  // round up to N+1.
  const rawMonths = Math.log(x) / Math.log(1 + monthlyRate)
  const months = Math.ceil(rawMonths - 1e-6)
  if (!Number.isFinite(months) || months < 0) return null
  return months <= maxMonths ? months : null
}

// The "rule of 72": a quick mental-math estimate for how long money takes
// to double at a given annual rate — years ≈ 72 / rate. Returns null when
// the rate can't meaningfully double anything (zero or negative).
export function getRuleOf72Years(annualRatePercent: number): number | null {
  if (annualRatePercent <= 0) return null
  return 72 / annualRatePercent
}

export function formatMonthsAsDuration(months: number): string {
  if (months <= 0) return 'moins d’un mois'
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  const yearLabel = years === 1 ? 'an' : 'ans'

  if (years > 0 && remainingMonths > 0) return `${years} ${yearLabel} ${remainingMonths} mois`
  if (years > 0) return `${years} ${yearLabel}`
  return `${remainingMonths} mois`
}
