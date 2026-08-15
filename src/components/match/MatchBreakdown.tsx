import type { JobMatchResult } from '../../types'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/cn'

function barColor(score: number) {
  if (score >= 85) return 'bg-positive'
  if (score >= 70) return 'bg-accent'
  if (score >= 55) return 'bg-warning'
  return 'bg-text-muted'
}

const labelTone = {
  strong: 'positive' as const,
  good: 'accent' as const,
  fair: 'warning' as const,
  weak: 'default' as const,
}

export function MatchBreakdown({
  match,
  compact = false,
}: {
  match: JobMatchResult
  compact?: boolean
}) {
  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={labelTone[match.label]}>{match.label} fit</Badge>
        <span className="text-[11px] text-text-muted">
          {match.score}% overall · weighted dimensions
        </span>
      </div>

      <ul className="space-y-2.5">
        {match.dimensions.map((d) => (
          <li key={d.id}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="text-text-secondary">
                {d.label}
                <span className="ml-1.5 text-text-muted">w{d.weight}</span>
              </span>
              <span className="tabular-nums text-text-primary">
                {d.score}
                <span className="text-text-muted"> → {d.weighted}pts</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn('h-full rounded-full transition-all', barColor(d.score))}
                style={{ width: `${d.score}%` }}
              />
            </div>
            {!compact ? (
              <p className="mt-1 text-[11px] leading-relaxed text-text-muted">{d.summary}</p>
            ) : null}
            {!compact && d.details[0] ? (
              <p className="text-[11px] leading-relaxed text-text-muted/90">{d.details[0]}</p>
            ) : null}
          </li>
        ))}
      </ul>

      {!compact ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-wider text-text-muted">
              Strengths
            </p>
            <ul className="space-y-1">
              {match.strengths.slice(0, 5).map((s) => (
                <li key={s} className="text-xs text-positive">
                  · {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-wider text-text-muted">Gaps</p>
            <ul className="space-y-1">
              {match.gaps.slice(0, 5).map((g) => (
                <li key={g} className="text-xs text-warning">
                  · {g}
                </li>
              ))}
              {!match.gaps.length ? (
                <li className="text-xs text-text-muted">No major gaps flagged</li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}

      <p className="text-[10px] leading-relaxed text-text-muted">{match.disclaimer}</p>
    </div>
  )
}
