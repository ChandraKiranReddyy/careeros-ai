import { cn } from '../../lib/cn'

export function MatchScore({
  score,
  size = 'md',
  showLabel = true,
}: {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}) {
  const tone =
    score >= 90
      ? 'text-positive'
      : score >= 80
        ? 'text-accent-soft'
        : score >= 70
          ? 'text-warning'
          : 'text-text-secondary'

  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <div className="flex flex-col items-end leading-none">
      <span className={cn('font-display font-semibold tabular-nums', sizes[size], tone)}>
        {score}
        <span className="text-[0.65em] opacity-70">%</span>
      </span>
      {showLabel ? (
        <span className="mt-1 text-[10px] uppercase tracking-wider text-text-muted">
          AI estimate
        </span>
      ) : null}
    </div>
  )
}
