import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Building2,
  Clock,
  Tag,
  FileEdit,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { MatchScore } from '../components/ui/MatchScore'
import { MatchBreakdown } from '../components/match/MatchBreakdown'
import { useJobs } from '../context/JobContext'
import { useTailor } from '../context/TailorContext'
import { useApplications } from '../context/ApplicationContext'
import { useNavigate } from 'react-router-dom'
import { ResumifyButton } from '../components/resume/ResumifyButton'

export function JobDetail() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { rankedJobs } = useJobs()
  const { getForJob } = useTailor()
  const { getByJobId, addFromJob } = useApplications()
  const job = rankedJobs.find((j) => j.id === jobId)
  const existingTailor = jobId ? getForJob(jobId) : undefined
  const tracked = jobId ? getByJobId(jobId) : undefined

  if (!job) {
    return (
      <div>
        <PageHeader title="Job not found" description="This role is not in the current inventory." />
        <Link to="/discover" className="text-sm text-accent-soft hover:underline">
          ← Back to Discover
        </Link>
      </div>
    )
  }

  const match = job.match

  return (
    <div>
      <Link
        to="/matches"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to matches
      </Link>

      <PageHeader
        title={job.title}
        description={`${job.company} · ${job.location}`}
        actions={
          <>
            <ResumifyButton job={job} variant="primary" size="md" />
            <button
              type="button"
              onClick={() => {
                const app = tracked ?? addFromJob(job, 'interested')
                navigate('/applications')
                void app
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary"
            >
              {tracked ? `Tracked · ${tracked.stage}` : 'Track application'}
            </button>
            {existingTailor ? (
              <Link
                to={`/resume/tailor/${job.id}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary"
              >
                <FileEdit className="h-3.5 w-3.5" />
                View last Resumify
              </Link>
            ) : null}
            <Link
              to={`/interview?jobId=${job.id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary"
            >
              Interview prep
            </Link>
            {job.applyUrl && job.applyUrl !== '#' ? (
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary"
              >
                Apply / source <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge tone="accent">{job.city}</Badge>
        <Badge>{job.workMode}</Badge>
        <Badge>{job.source}</Badge>
        {job.salary ? <Badge tone="positive">{job.salary}</Badge> : null}
        {job.stale ? <Badge tone="warning">stale</Badge> : null}
        {match ? <Badge tone="accent">{match.label} fit · estimate</Badge> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Card className="p-5">
            <CardHeader title="Overview" />
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="flex gap-2">
                <Building2 className="mt-0.5 h-4 w-4 text-text-muted" />
                <div>
                  <dt className="text-xs text-text-muted">Company</dt>
                  <dd>{job.company}</dd>
                </div>
              </div>
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-text-muted" />
                <div>
                  <dt className="text-xs text-text-muted">Location</dt>
                  <dd>{job.location}</dd>
                </div>
              </div>
              <div className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-text-muted" />
                <div>
                  <dt className="text-xs text-text-muted">Posted / first seen</dt>
                  <dd>
                    {job.postedAt} · {job.firstSeen.slice(0, 10)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-2">
                <Tag className="mt-0.5 h-4 w-4 text-text-muted" />
                <div>
                  <dt className="text-xs text-text-muted">Source provenance</dt>
                  <dd>
                    {job.source} ({job.sourceId})
                  </dd>
                </div>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <CardHeader title="Summary" subtitle="From posting text — not invented" />
            <p className="text-sm leading-relaxed text-text-secondary">{job.summary}</p>
            {job.description && job.description !== job.summary ? (
              <div className="scroll-thin mt-4 max-h-72 overflow-y-auto rounded-xl bg-surface-1 p-3 text-xs leading-relaxed text-text-muted whitespace-pre-wrap">
                {job.description.slice(0, 4000)}
                {job.description.length > 4000 ? '…' : ''}
              </div>
            ) : null}
          </Card>

          <Card className="p-5">
            <CardHeader title="Requirements" />
            <div className="mb-3">
              <p className="mb-1.5 text-[11px] uppercase tracking-wider text-text-muted">
                Must-have / extracted
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.mustHave.length ? (
                  job.mustHave.map((s) => (
                    <Badge key={s} tone="accent">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-text-muted">None extracted</span>
                )}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] uppercase tracking-wider text-text-muted">
                Matched vs missing (engine)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.matchedSkills.map((s) => (
                  <Badge key={`m-${s}`} tone="positive">
                    {s}
                  </Badge>
                ))}
                {job.missingSkills.map((s) => (
                  <Badge key={`g-${s}`} tone="warning">
                    gap: {s}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-display text-sm font-semibold">Match score</h3>
                <p className="text-xs text-text-muted">Explainable engine · Phase 4</p>
              </div>
              <MatchScore score={job.matchScore} size="lg" />
            </div>
            {match ? <MatchBreakdown match={match} /> : (
              <p className="text-sm text-text-muted">No match breakdown available.</p>
            )}
          </Card>

          {match ? (
            <Card className="p-5">
              <CardHeader title="ATS keywords for this role" />
              <div className="mb-2 text-xs text-text-muted">
                {match.keywordCoverage.percent}% of checklist terms on your resume
              </div>
              <div className="mb-2 flex flex-wrap gap-1">
                {match.keywordCoverage.found.map((k) => (
                  <Badge key={k} tone="positive">
                    {k}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {match.keywordCoverage.missing.map((k) => (
                  <Badge key={k} tone="warning">
                    {k}
                  </Badge>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
