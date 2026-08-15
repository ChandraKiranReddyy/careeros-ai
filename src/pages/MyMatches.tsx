import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ExternalLink, MapPin, RefreshCw } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { MatchScore } from '../components/ui/MatchScore'
import { MatchBreakdown } from '../components/match/MatchBreakdown'
import { useJobs } from '../context/JobContext'
import { useResume } from '../context/ResumeContext'
import { ProfileSyncBanner } from '../components/resume/ProfileSyncBanner'
import { ResumifyButton } from '../components/resume/ResumifyButton'
import { cn } from '../lib/cn'

export function MyMatches() {
  const { rankedJobs, loading, refresh, stats } = useJobs()
  const { profile, isUserResume } = useResume()
  const ranked = rankedJobs.filter((j) => !j.stale)
  const [openId, setOpenId] = useState<string | null>(ranked[0]?.id ?? null)

  return (
    <div>
      <PageHeader
        title="My Matches"
        description={
          isUserResume
            ? `Ranked for ${profile.name} using your master resume. Scores are AI estimates — not guarantees.`
            : 'Currently ranked for the demo sample profile. Upload your resume so rankings realign to you.'
        }
        actions={
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Refresh jobs
          </button>
        }
      />
      <ProfileSyncBanner showUpload={!isUserResume} />
      <p className="mb-4 text-xs text-text-muted">
        {stats.strongMatches} strong matches (≥80) · {ranked.length} active roles · 7 weighted
        dimensions · profile: {profile.name}
      </p>
      <div className="space-y-3">
        {ranked.map((job, i) => {
          const open = openId === job.id
          return (
            <Card key={job.id} className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : job.id)}
                className="flex w-full flex-col gap-4 p-5 text-left sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-sm font-semibold text-text-muted">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{job.title}</p>
                    <p className="flex flex-wrap items-center gap-x-2 text-sm text-text-secondary">
                      <span>
                        {job.company} · {job.city}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-xs text-text-muted">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      <Badge>{job.sourceId}</Badge>
                      {job.match ? (
                        <Badge
                          tone={
                            job.match.label === 'strong'
                              ? 'positive'
                              : job.match.label === 'good'
                                ? 'accent'
                                : job.match.label === 'fair'
                                  ? 'warning'
                                  : 'default'
                          }
                        >
                          {job.match.label}
                        </Badge>
                      ) : null}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.matchedSkills.slice(0, 5).map((s) => (
                        <Badge key={s} tone="positive">
                          {s}
                        </Badge>
                      ))}
                      {job.missingSkills.slice(0, 3).map((s) => (
                        <Badge key={s} tone="warning">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-start">
                  <MatchScore score={job.matchScore} size="lg" />
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-text-muted transition-transform',
                      open && 'rotate-180',
                    )}
                  />
                </div>
              </button>

              {open && job.match ? (
                <div className="border-t border-border-subtle bg-surface-0/40 px-5 py-4">
                  <MatchBreakdown match={job.match} />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <ResumifyButton job={job} variant="primary" size="sm" />
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-xs font-medium text-accent-soft hover:underline"
                    >
                      Job detail →
                    </Link>
                    {job.applyUrl && job.applyUrl !== '#' ? (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary"
                      >
                        Source listing <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
