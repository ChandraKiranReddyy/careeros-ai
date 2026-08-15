import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  ClipboardPaste,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Award,
  FolderKanban,
  Target,
  } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { TailoredResumeView } from '../components/resume/TailoredResumeView'
import { ResumeUploadZone } from '../components/resume/ResumeUploadZone'
import { ProfileSyncBanner } from '../components/resume/ProfileSyncBanner'
import { useResume } from '../context/ResumeContext'
import { useTailor } from '../context/TailorContext'
import { useJobs } from '../context/JobContext'
import { PROFILE_PRIORITIES } from '../data/sampleResume'
import { ResumifyButton } from '../components/resume/ResumifyButton'
import { cn } from '../lib/cn'

function ScoreRing({ score }: { score: number }) {
  const tone =
    score >= 75 ? 'text-positive' : score >= 50 ? 'text-accent-soft' : 'text-warning'
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface-3 bg-surface-1 font-display text-2xl font-semibold tabular-nums',
          tone,
        )}
        style={{
          borderColor:
            score >= 75
              ? 'rgb(61 220 151 / 0.45)'
              : score >= 50
                ? 'rgb(91 140 255 / 0.45)'
                : 'rgb(245 193 92 / 0.45)',
        }}
      >
        {score}
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-text-muted">ATS estimate</p>
    </div>
  )
}

export function ResumeCenter() {
  const {
    versions,
    active,
    profile,
    isUserResume,
    loading,
    error,
    setActive,
    pasteText,
    loadSample,
    removeVersion,
    clearError,
  } = useResume()
  const { tailored, remove: removeTailored } = useTailor()
  const { rankedJobs, stats } = useJobs()

  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteValue, setPasteValue] = useState('')
  const [tab, setTab] = useState<'profile' | 'raw' | 'versions' | 'tailored'>('profile')
  const [viewTailoredId, setViewTailoredId] = useState<string | null>(null)

  const topJobs = rankedJobs.filter((j) => !j.stale).slice(0, 6)
  const viewing = viewTailoredId
    ? tailored.find((t) => t.id === viewTailoredId)
    : null

  if (!active) {
    return (
      <div className="py-20 text-center text-sm text-text-muted">Loading resume intelligence…</div>
    )
  }

  const p = active.profile

  return (
    <div>
      <PageHeader
        title="Resume Center"
        description="Upload your master resume once. Matches, skill gaps, tailoring, interview prep, and Copilot all realign to that profile — nothing invented."
        actions={
          <>
            <button
              type="button"
              onClick={() => loadSample()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary hover:text-text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Load sample
            </button>
            <button
              type="button"
              onClick={() => setPasteOpen((v) => !v)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary hover:text-text-primary"
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              Paste text
            </button>
          </>
        }
      />

      <ProfileSyncBanner showUpload={false} />

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-dim px-4 py-3 text-sm text-warning">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
            <button type="button" onClick={clearError} className="mt-1 text-xs underline">
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <div className="mb-6">
        <ResumeUploadZone
          variant="hero"
          onUploaded={() => setTab('profile')}
        />
        <p className="mt-2 text-center text-[11px] text-text-muted">
          After upload: Dashboard, My Matches, Skill Gaps, Tailoring, Interview Prep &amp; Copilot
          use <strong className="text-text-secondary">your</strong> parsed profile
          {isUserResume
            ? ` · now ${profile.name} · ${profile.skills.length} skills · ${stats.strongMatches} strong matches`
            : ''}
          {loading ? ' · parsing…' : ''}
        </p>
      </div>

      {pasteOpen ? (
        <Card className="mb-4 p-4">
          <CardHeader title="Paste resume text" subtitle="Plain text works best" />
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            rows={8}
            placeholder="Paste the full resume text here…"
            className="w-full resize-y rounded-xl border border-border-subtle bg-surface-1 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  pasteText(pasteValue)
                  setPasteValue('')
                  setPasteOpen(false)
                  setTab('profile')
                } catch {
                  /* handled */
                }
              }}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-void"
            >
              Parse pasted text
            </button>
            <button
              type="button"
              onClick={() => setPasteOpen(false)}
              className="rounded-xl border border-border-subtle px-4 py-2 text-sm text-text-secondary"
            >
              Cancel
            </button>
          </div>
        </Card>
      ) : null}

      {/* Active resume strip */}
      <Card className="mb-6 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-accent-dim p-3 text-accent-soft">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-text-primary">{active.label}</p>
                <Badge tone="accent">{active.source}</Badge>
                <Badge tone="positive">Active master</Badge>
                <Badge tone="positive">P1 · Fabrix AI Ops</Badge>
                <Badge>P2 · Solutions / cloud</Badge>
              </div>
              <p className="mt-1 text-sm text-text-secondary">
                {p.name} · {p.title} · {p.location}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">
                {active.fileName ?? '—'} · parsed{' '}
                {new Date(active.createdAt).toLocaleString()} · {p.skills.length} skills ·{' '}
                {p.experience.length} roles extracted
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-positive/20 bg-positive-dim/30 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-positive">
                    {PROFILE_PRIORITIES.p1.label}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {PROFILE_PRIORITIES.p1.company} ·{' '}
                    {PROFILE_PRIORITIES.p1.domains.join(' · ')}
                  </p>
                </div>
                <div className="rounded-xl border border-border-subtle bg-surface-1/60 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-text-muted">
                    {PROFILE_PRIORITIES.p2.label}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {PROFILE_PRIORITIES.p2.domains.join(' · ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <ScoreRing score={active.ats.score} />
        </div>
      </Card>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['profile', 'Structured profile'],
            ['raw', 'Raw text'],
            ['versions', `Master versions (${versions.length})`],
            ['tailored', `Tailored (${tailored.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id)
              if (id !== 'tailored') setViewTailoredId(null)
            }}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              tab === id
                ? 'border-accent/30 bg-accent-dim text-accent-soft'
                : 'border-border-subtle text-text-secondary hover:text-text-primary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card className="p-5">
              <CardHeader
                title="Identity"
                action={
                  <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                    <User className="h-3.5 w-3.5" /> From resume only
                  </span>
                }
              />
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                {[
                  ['Name', p.name],
                  ['Title', p.title],
                  ['Location', p.location],
                  ['Experience', p.yearsExperience ? `${p.yearsExperience} years` : 'Not detected'],
                  ['Email', p.email ?? '—'],
                  ['Phone', p.phone ?? '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-text-muted">{k}</dt>
                    <dd className="mt-0.5 text-text-primary">{v}</dd>
                  </div>
                ))}
              </dl>
              {p.summary ? (
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">{p.summary}</p>
              ) : null}
              {p.seniorityHints.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.seniorityHints.map((s) => (
                    <Badge key={s} tone="accent">
                      {s}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </Card>

            <Card className="p-5">
              <CardHeader
                title="Experience"
                subtitle="Parsed from headers & bullets — not invented"
                action={<Briefcase className="h-4 w-4 text-text-muted" />}
              />
              {p.experience.length === 0 ? (
                <p className="text-sm text-text-muted">No structured roles extracted.</p>
              ) : (
                <ul className="space-y-4">
                  {p.experience.map((exp, i) => (
                    <li
                      key={`${exp.company}-${exp.title}-${i}`}
                      className="border-b border-border-subtle pb-4 last:border-0 last:pb-0"
                    >
                      <p className="text-sm font-medium text-text-primary">{exp.title}</p>
                      <p className="text-xs text-text-secondary">
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ''}
                        {exp.startDate
                          ? ` · ${exp.startDate} – ${exp.current ? 'Present' : exp.endDate ?? ''}`
                          : ''}
                      </p>
                      {exp.bullets.length ? (
                        <ul className="mt-2 space-y-1">
                          {exp.bullets.map((b) => (
                            <li
                              key={b}
                              className="text-xs leading-relaxed text-text-secondary before:mr-2 before:text-text-muted before:content-['•']"
                            >
                              {b}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5">
                <CardHeader title="Education" action={<GraduationCap className="h-4 w-4 text-text-muted" />} />
                {p.education.length === 0 ? (
                  <p className="text-sm text-text-muted">None detected</p>
                ) : (
                  <ul className="space-y-2">
                    {p.education.map((ed, i) => (
                      <li key={i} className="text-sm">
                        <p className="text-text-primary">{ed.degree}</p>
                        <p className="text-xs text-text-muted">
                          {[ed.school, ed.year].filter(Boolean).join(' · ')}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card className="p-5">
                <CardHeader title="Projects" action={<FolderKanban className="h-4 w-4 text-text-muted" />} />
                {p.projects.length === 0 ? (
                  <p className="text-sm text-text-muted">None detected</p>
                ) : (
                  <ul className="space-y-3">
                    {p.projects.map((pr) => (
                      <li key={pr.name}>
                        <p className="text-sm font-medium text-text-primary">{pr.name}</p>
                        <p className="mt-0.5 text-xs text-text-secondary">{pr.description}</p>
                        {pr.technologies.length ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {pr.technologies.map((t) => (
                              <Badge key={t}>{t}</Badge>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <CardHeader title="Skills by category" />
              {p.skillBuckets.length === 0 ? (
                <p className="text-sm text-text-muted">No lexicon matches</p>
              ) : (
                <div className="space-y-3">
                  {p.skillBuckets.map((b) => (
                    <div key={b.category}>
                      <p className="mb-1.5 text-[11px] uppercase tracking-wider text-text-muted">
                        {b.label}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {b.skills.map((s) => (
                          <Badge key={s} tone="positive">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <CardHeader title="Certifications" action={<Award className="h-4 w-4 text-text-muted" />} />
              <div className="flex flex-wrap gap-1.5">
                {p.certifications.length ? (
                  p.certifications.map((c) => (
                    <Badge key={c} tone="accent">
                      {c}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-text-muted">None detected</p>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <CardHeader title="Target roles" action={<Target className="h-4 w-4 text-text-muted" />} />
              <div className="flex flex-wrap gap-1.5">
                {p.targetRoles.map((r) => (
                  <Badge key={r}>{r}</Badge>
                ))}
              </div>
              {p.industries.length ? (
                <p className="mt-3 text-xs text-text-muted">
                  Industries: {p.industries.join(' · ')}
                </p>
              ) : null}
            </Card>

            <Card className="p-5">
              <CardHeader
                title="ATS keyword coverage"
                subtitle={active.ats.label}
              />
              <div className="mb-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-text-muted">
                    {active.ats.found.length}/{active.ats.totalChecked} keywords
                  </span>
                  <span className="tabular-nums text-text-primary">{active.ats.score}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${active.ats.score}%` }}
                  />
                </div>
              </div>
              <p className="mb-1.5 text-[11px] uppercase tracking-wider text-text-muted">Found</p>
              <div className="mb-3 flex flex-wrap gap-1">
                {active.ats.found.map((k) => (
                  <Badge key={k} tone="positive">
                    {k}
                  </Badge>
                ))}
              </div>
              <p className="mb-1.5 text-[11px] uppercase tracking-wider text-text-muted">
                Not in resume
              </p>
              <div className="flex flex-wrap gap-1">
                {active.ats.missing.map((k) => (
                  <Badge key={k} tone="warning">
                    {k}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
                Missing keywords are skill gaps for targeting — we do not add them to your profile.
              </p>
            </Card>

            <Card className="p-5">
              <CardHeader title="Parse notes" />
              <ul className="space-y-2">
                {p.parseNotes.map((n) => (
                  <li key={n} className="flex gap-2 text-xs text-text-secondary">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-soft" />
                    {n}
                  </li>
                ))}
                {p.rawSectionHits.length ? (
                  <li className="text-xs text-text-muted">
                    Sections detected: {p.rawSectionHits.join(', ')}
                  </li>
                ) : null}
              </ul>
            </Card>

            {p.achievements.length ? (
              <Card className="p-5">
                <CardHeader title="Achievements" />
                <ul className="space-y-2">
                  {p.achievements.map((a) => (
                    <li key={a.text} className="text-xs leading-relaxed text-text-secondary">
                      • {a.text}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === 'raw' ? (
        <Card className="p-5">
          <CardHeader title="Extracted raw text" subtitle="Source of truth for parsing" />
          <pre className="scroll-thin max-h-[560px] overflow-auto whitespace-pre-wrap rounded-xl bg-surface-1 p-4 text-xs leading-relaxed text-text-secondary">
            {active.rawText}
          </pre>
        </Card>
      ) : null}

      {tab === 'versions' ? (
        <div className="space-y-2">
          {versions.map((v) => (
            <Card
              key={v.id}
              hover
              className={cn(
                'flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between',
                v.id === active.id && 'ring-1 ring-accent/30',
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-text-primary">{v.label}</p>
                  {v.id === active.id ? <Badge tone="positive">Active</Badge> : null}
                  <Badge>{v.source}</Badge>
                  <Badge tone="accent">{v.ats.score}% ATS</Badge>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {v.profile.name} · {v.profile.skills.length} skills ·{' '}
                  {new Date(v.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {v.id !== active.id ? (
                  <button
                    type="button"
                    onClick={() => setActive(v.id)}
                    className="rounded-xl bg-surface-2 px-3 py-1.5 text-xs text-text-primary hover:bg-surface-3"
                  >
                    Set active
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeVersion(v.id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-border-subtle px-3 py-1.5 text-xs text-text-muted hover:text-danger"
                  aria-label="Remove version"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {tab === 'tailored' ? (
        <div className="space-y-4">
          {viewing ? (
            <TailoredResumeView
              tailored={viewing}
              onClose={() => setViewTailoredId(null)}
            />
          ) : (
            <>
              <Card className="p-5">
                <CardHeader
                  title="Tailor for a job"
                  subtitle="Pick a strong match — only master resume facts are used"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  {topJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-1/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {job.title}
                        </p>
                        <p className="line-clamp-2 text-xs text-text-muted">
                          {job.company} · {job.matchScore}% · {job.summary}
                        </p>
                      </div>
                      <ResumifyButton job={job} variant="primary" size="sm" />
                    </div>
                  ))}
                </div>
                {!topJobs.length ? (
                  <p className="text-sm text-text-muted">
                    No jobs in inventory — refresh feeds on Discover first.
                  </p>
                ) : null}
              </Card>

              <div className="space-y-2">
                <p className="text-xs text-text-muted">
                  Saved tailored versions ({tailored.length})
                </p>
                {tailored.length === 0 ? (
                  <Card className="p-6 text-center text-sm text-text-muted">
                    No tailored resumes yet. Generate one from a job above or from Job Detail.
                  </Card>
                ) : (
                  tailored.map((t) => (
                    <Card
                      key={t.id}
                      hover
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {t.label}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          ATS {t.atsBefore.score}% → {t.atsAfter.score}% (
                          {t.atsDelta >= 0 ? '+' : ''}
                          {t.atsDelta}) · {new Date(t.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setViewTailoredId(t.id)}
                          className="rounded-xl bg-surface-2 px-3 py-1.5 text-xs text-text-primary"
                        >
                          Open
                        </button>
                        <Link
                          to={`/resume/tailor/${t.jobId}`}
                          className="rounded-xl border border-border-subtle px-3 py-1.5 text-xs text-text-secondary"
                        >
                          Re-tailor
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeTailored(t.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-border-subtle px-3 py-1.5 text-xs text-text-muted hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
