import type { ReactNode } from 'react'

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-white/10 py-8 first:border-t-0 first:pt-0">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink/90">{children}</div>
    </section>
  )
}
