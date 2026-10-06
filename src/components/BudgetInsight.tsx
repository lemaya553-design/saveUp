export function BudgetInsight({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-4 py-3 text-sm text-ink">
      <span aria-hidden="true" className="text-[#FF7A00]">
        💡
      </span>
      <p>{text}</p>
    </div>
  )
}
