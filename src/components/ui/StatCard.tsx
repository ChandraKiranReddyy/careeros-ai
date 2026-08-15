import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { cn } from '../../lib/cn'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone?: 'default' | 'accent' | 'positive' | 'warning'
}) {
  const iconTone = {
    default: 'bg-surface-3 text-text-secondary',
    accent: 'bg-accent-dim text-accent-soft',
    positive: 'bg-positive-dim text-positive',
    warning: 'bg-warning-dim text-warning',
  }[tone]

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-text-muted">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
          {hint ? <p className="mt-1 text-[11px] text-text-muted">{hint}</p> : null}
        </div>
        <div className={cn('rounded-xl p-2.5', iconTone)}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>
    </Card>
  )
}
