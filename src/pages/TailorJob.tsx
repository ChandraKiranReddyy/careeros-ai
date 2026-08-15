import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Wand2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { MatchScore } from '../components/ui/MatchScore'
import { TailoredResumeView } from '../components/resume/TailoredResumeView'
import { useJobs } from '../context/JobContext'
import { useResume } from '../context/ResumeContext'
import { useTailor } from '../context/TailorContext'
import { useEffect, useRef, useState } from 'react'
import type { TailoredResume } from '../types'
import { Link as RouterLink } from 'react-router-dom'

/**
 * Resumify page — builds a role-specific resume from master + job description.
 */
export function TailorJob() {
  const { jobId } = useParams()
  const [searchParams] = useSearchParams()
  const auto = searchParams.get('auto') === '1'
  const navigate = useNavigate()
  const { rankedJobs } = useJobs()
  const { active, isUserResume } = useResume()
  const { tailorForJob, getForJob, tailoring, error, clearError } = useTailor()
  const job = rankedJobs.find((j) => j.id === jobId)
  const [result, setResult] = useState<TailoredResume | null>(null)
  const autoRan = useRef(false)

  useEffect(() => {
    if (!jobId) return
    const existing = getForJob(jobId)
    if (existing) setResult(existing)
  }, [jobId, getForJob])

  // Auto-Resumify when arriving from tile button (?auto=1)
  useEffect(() => {
    if (!auto || autoRan.current || !job || !active) return
    autoRan.current = true
    const t = tailorForJob(job)
    if (t) setResult(t)
  }, [auto, job, active, tailorForJob])

  if (!job) {
    return (
      <div>
        <PageHeader title="Job not found" />
        <Link to="/discover" className="text-sm text-accent-soft hover:underline">
          ← Discover jobs
        </Link>
      </div>
    )
  }

  function runResumify() {
    const t = tailorForJob(job!)
    if (t) setResult(t)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <PageHeader
        title="Resumify"
        description={`Update your master resume for “${job.title}” at ${job.company} using this role’s description. Only facts already on your master — gaps listed, never invented.`}
        actions={
          <button
            type="button"
            onClick={runResumify}
            disabled={tailoring || !active}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-sm font-medium text-void disabled:opacity-60"
          >
            <Wand2 className="h-3.5 w-3.5" />
            {tailoring ? 'Resumifying…' : result ? 'Resumify again' : 'Resumify now'}
          </button>
        }
      />

      <Card className="mb-4 border border-accent/20 bg-accent-dim/20 p-4 text-sm text-text-secondary">
        <p className="font-medium text-text-primary">What Resumify does</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li>· Reorders skills &amp; experience toward this JD’s keywords</li>
          <li>· Rewrites the summary for this title using only master-resume facts</li>
          <li>· Surfaces skill gaps instead of inventing experience</li>
          <li>· Shows ATS before → after for this posting · export TXT / HTML / PDF</li>
        </ul>
      </Card>

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-dim px-4 py-3 text-sm text-warning">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>{error}</p>
            <button type="button" onClick={clearError} className="mt-1 text-xs underline">
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {!active ? (
        <Card className="mb-4 p-4 text-sm text-warning">
          Upload a master resume first.{' '}
          <RouterLink to="/resume" className="text-accent-soft underline">
            Resume Center
          </RouterLink>
        </Card>
      ) : null}

      <Card className="mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-text-primary">{job.title}</p>
            <Badge tone="accent">Target role</Badge>
          </div>
          <p className="text-sm text-text-secondary">
            {job.company} · {job.city} · {job.workMode}
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-text-muted line-clamp-3">
            {job.summary}
            {job.description ? ` ${job.description.slice(0, 280)}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.mustHave.slice(0, 8).map((s) => (
              <Badge key={s} tone="accent">
                {s}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Master: {active ? active.label : 'None'}
            {isUserResume ? ' · your upload' : ' · sample / demo'}
          </p>
        </div>
        <MatchScore score={job.matchScore} size="lg" />
      </Card>

      {tailoring ? (
        <Card className="mb-4 flex items-center gap-3 p-5 text-sm text-text-secondary">
          <Wand2 className="h-5 w-5 animate-pulse text-accent-soft" />
          Resumifying against role + description…
        </Card>
      ) : null}

      {result ? (
        <>
          <div className="mb-3 flex items-center gap-2 text-sm text-positive">
            <CheckCircle2 className="h-4 w-4" />
            Resume updated for this role · ATS {result.atsBefore.score}% → {result.atsAfter.score}% (
            {result.atsDelta >= 0 ? '+' : ''}
            {result.atsDelta})
          </div>
          <TailoredResumeView tailored={result} />
        </>
      ) : (
        <Card className="p-8 text-center">
          <Wand2 className="mx-auto h-8 w-8 text-accent-soft" />
          <p className="mt-3 text-sm text-text-secondary">
            Click <strong className="text-text-primary">Resumify now</strong> to generate a
            role-specific version of your master resume from this job description.
          </p>
          <button
            type="button"
            onClick={runResumify}
            disabled={tailoring || !active}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-void disabled:opacity-60"
          >
            <Wand2 className="h-4 w-4" />
            {tailoring ? 'Working…' : 'Resumify now'}
          </button>
        </Card>
      )}
    </div>
  )
}
