import { cn } from '../../lib/cn'

const tones = {
  default: 'bg-surface-3 text-text-secondary border-border-subtle',
  accent: 'bg-accent-dim text-accent-soft border-accent/20',
  positive: 'bg-positive-dim text-positive border-positive/20',
  warning: 'bg-warning-dim text-warning border-warning/20',
  danger: 'bg-danger-dim text-danger border-danger/20',
} as const

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: React.ReactNode
  tone?: keyof typeof tones
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
