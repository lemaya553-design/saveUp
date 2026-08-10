export function BudgetInsight({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-ink">
      <span aria-hidden="true" className="text-accent">
        💡
      </span>
      <p>{text}</p>
    </div>
  )
}
