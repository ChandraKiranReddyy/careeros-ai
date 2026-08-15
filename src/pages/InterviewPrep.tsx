import { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Mic2, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useJobs } from '../context/JobContext'
import { useResume } from '../context/ResumeContext'
import { useApplications } from '../context/ApplicationContext'
import {
  generateInterviewPack,
  questionTypeLabel,
} from '../lib/interview/generate'
import type { InterviewQuestionType } from '../types'
import { cn } from '../lib/cn'

const filters: Array<'all' | InterviewQuestionType> = [
  'all',
  'company',
  'technical',
  'behavioral',
  'resume',
  'job',
]

export function InterviewPrep() {
  const [params, setParams] = useSearchParams()
  const jobIdParam = params.get('jobId')
  const { rankedJobs } = useJobs()
  const { active } = useResume()
  const { applications } = useApplications()

  const jobOptions = useMemo(() => {
    const fromApps = applications
      .filter((a) => ['interview', 'screening', 'applied', 'offer'].includes(a.stage))
      .map((a) => a.jobId)
    const preferred = new Set(fromApps)
    return rankedJobs
      .filter((j) => !j.stale)
      .sort((a, b) => {
        const pa = preferred.has(a.id) ? 0 : 1
        const pb = preferred.has(b.id) ? 0 : 1
        if (pa !== pb) return pa - pb
        return b.matchScore - a.matchScore
      })
  }, [rankedJobs, applications])

  const [jobId, setJobId] = useState(jobIdParam || jobOptions[0]?.id || '')
  const [typeFilter, setTypeFilter] = useState<(typeof filters)[number]>('all')
  const [mockMode, setMockMode] = useState(false)
  const [mockIndex, setMockIndex] = useState(0)
  const [showFramework, setShowFramework] = useState(false)

  const job = rankedJobs.find((j) => j.id === jobId) ?? jobOptions[0]
  const pack = useMemo(() => {
    if (!job || !active) return null
    return generateInterviewPack(job, active.profile)
  }, [job, active])

  const questions = useMemo(() => {
    if (!pack) return []
    if (typeFilter === 'all') return pack.questions
    return pack.questions.filter((q) => q.type === typeFilter)
  }, [pack, typeFilter])

  if (!active) {
    return (
      <div>
        <PageHeader title="Interview Prep" description="Load a master resume first." />
        <Link to="/resume" className="text-sm text-accent-soft hover:underline">
          Resume Center →
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Interview Prep"
        description="Questions and frameworks grounded in the selected job description and your resume facts only."
        actions={
          <button
            type="button"
            onClick={() => {
              setMockMode((m) => !m)
              setMockIndex(0)
              setShowFramework(false)
            }}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium',
              mockMode
                ? 'border border-border-subtle text-text-secondary'
                : 'bg-accent text-void',
            )}
          >
            <Mic2 className="h-3.5 w-3.5" />
            {mockMode ? 'Exit mock interview' : 'Mock interview mode'}
          </button>
        }
      />

      <Card className="mb-6 p-4">
        <label className="block text-xs text-text-muted">Target role</label>
        <select
          value={job?.id ?? ''}
          onChange={(e) => {
            setJobId(e.target.value)
            setParams({ jobId: e.target.value })
            setMockIndex(0)
          }}
          className="mt-1 h-10 w-full max-w-xl rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm"
        >
          {jobOptions.map((j) => (
            <option key={j.id} value={j.id}>
              {j.company} — {j.title} ({j.matchScore}%)
            </option>
          ))}
        </select>
        {job ? (
          <p className="mt-2 text-xs text-text-muted">
            {job.city} · {job.workMode} ·{' '}
            <Link to={`/jobs/${job.id}`} className="text-accent-soft hover:underline">
              Job detail
            </Link>
          </p>
        ) : null}
      </Card>

      {!pack || !job ? (
        <Card className="p-8 text-center text-sm text-text-muted">
          No jobs available. Refresh inventory on Discover Jobs.
        </Card>
      ) : mockMode ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <Badge tone="accent">
              Mock {mockIndex + 1} / {questions.length}
            </Badge>
            <button
              type="button"
              onClick={() => {
                setMockIndex(0)
                setShowFramework(false)
              }}
              className="inline-flex items-center gap-1 text-xs text-text-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restart
            </button>
          </div>
          {questions[mockIndex] ? (
            <>
              <Badge>{questionTypeLabel(questions[mockIndex].type)}</Badge>
              <p className="mt-4 font-display text-lg font-semibold leading-snug text-text-primary">
                {questions[mockIndex].question}
              </p>
              <p className="mt-2 text-xs text-text-muted">
                Based on: {questions[mockIndex].basedOn}
              </p>
              {showFramework ? (
                <div className="mt-4 rounded-xl border border-border-subtle bg-surface-1 p-4 text-sm text-text-secondary">
                  <p className="text-[11px] uppercase tracking-wider text-text-muted">
                    Answer framework
                  </p>
                  <p className="mt-2 leading-relaxed">{questions[mockIndex].framework}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFramework(true)}
                  className="mt-4 text-sm text-accent-soft hover:underline"
                >
                  Reveal answer framework
                </button>
              )}
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  disabled={mockIndex === 0}
                  onClick={() => {
                    setMockIndex((i) => Math.max(0, i - 1))
                    setShowFramework(false)
                  }}
                  className="inline-flex h-9 items-center gap-1 rounded-xl border border-border-subtle px-3 text-sm text-text-secondary disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  type="button"
                  disabled={mockIndex >= questions.length - 1}
                  onClick={() => {
                    setMockIndex((i) => Math.min(questions.length - 1, i + 1))
                    setShowFramework(false)
                  }}
                  className="inline-flex h-9 items-center gap-1 rounded-xl bg-accent px-3 text-sm font-medium text-void disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-text-muted">No questions for this filter.</p>
          )}
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setTypeFilter(f)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium capitalize',
                  typeFilter === f
                    ? 'border-accent/30 bg-accent-dim text-accent-soft'
                    : 'border-border-subtle text-text-secondary',
                )}
              >
                {f === 'all' ? 'All' : questionTypeLabel(f)}
              </button>
            ))}
          </div>

          <div className="mb-4 grid gap-3 lg:grid-cols-3">
            <Card className="p-4 lg:col-span-1">
              <CardHeader title="Prep tips" />
              <ul className="space-y-2">
                {pack.tips.map((tip) => (
                  <li key={tip} className="text-xs leading-relaxed text-text-secondary">
                    · {tip}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[10px] text-text-muted">{pack.disclaimer}</p>
            </Card>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
              {questions.map((q) => (
                <Card key={q.id} className="p-4">
                  <Badge tone="accent">{questionTypeLabel(q.type)}</Badge>
                  <p className="mt-3 text-sm leading-relaxed text-text-primary">{q.question}</p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-accent-soft">
                      Answer framework
                    </summary>
                    <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                      {q.framework}
                    </p>
                    <p className="mt-1 text-[10px] text-text-muted">Based on: {q.basedOn}</p>
                  </details>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
