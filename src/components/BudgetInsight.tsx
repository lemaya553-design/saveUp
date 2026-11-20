export function BudgetInsight({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-ink">
      <span aria-hidden="true" className="text-primary">
        💡
      </span>
      <p>{text}</p>
    </div>
  )
}
