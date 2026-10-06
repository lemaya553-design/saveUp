export function AvatarCircle({
  emoji,
  size = 'md',
}: {
  emoji: string | null
  size?: 'sm' | 'md'
}) {
  const dimensions = size === 'sm' ? 'h-8 w-8 text-base' : 'h-12 w-12 text-2xl'
  return (
    <span
      className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full bg-[#FF7A00]/15 ring-1 ring-inset ring-[#FF7A00]/30`}
      aria-hidden={!emoji}
    >
      {emoji ?? '🙂'}
    </span>
  )
}
