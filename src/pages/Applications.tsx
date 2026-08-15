import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  StickyNote,
  Trash2,
  ExternalLink,
  FileEdit,
  Mic2,
  Plus,
  GripVertical,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useApplications } from '../context/ApplicationContext'
import { useJobs } from '../context/JobContext'
import { ResumifyButton } from '../components/resume/ResumifyButton'
import type { AppStage, Application } from '../types'
import { cn } from '../lib/cn'

const stageTone: Record<AppStage, 'default' | 'accent' | 'positive' | 'warning' | 'danger'> = {
  new: 'default',
  interested: 'accent',
  applied: 'accent',
  screening: 'warning',
  interview: 'warning',
  offer: 'positive',
  rejected: 'danger',
  withdrawn: 'default',
}

export function Applications() {
  const {
    stages,
    byStage,
    stats,
    moveToStage,
    addNote,
    remove,
    addFromJob,
    applications,
  } = useApplications()
  const { rankedJobs } = useJobs()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const selected = applications.find((a) => a.id === selectedId) ?? null
  const selectedJob = selected
    ? rankedJobs.find((j) => j.id === selected.jobId)
    : undefined

  function onDropStage(stage: AppStage) {
    if (dragId) {
      moveToStage(dragId, stage)
      setDragId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Kanban pipeline with drag-and-drop, notes, and links to jobs, tailored resumes, and interview prep. Persisted locally."
        actions={
          <button
            type="button"
            onClick={() => setAddOpen((v) => !v)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-sm font-medium text-void"
          >
            <Plus className="h-3.5 w-3.5" />
            Track a job
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-text-muted">
        <Badge tone="accent">{stats.total} total</Badge>
        <Badge>{stats.active} active</Badge>
        <Badge tone="warning">{stats.interviews} interviews</Badge>
        <Badge tone="positive">{stats.offers} offers</Badge>
        <span className="self-center">Drag cards between columns to change stage</span>
      </div>

      {addOpen ? (
        <Card className="mb-4 max-h-56 scroll-thin overflow-y-auto p-3">
          <p className="mb-2 text-xs text-text-muted">Add from inventory (skips duplicates)</p>
          <div className="space-y-1">
            {rankedJobs
              .filter((j) => !j.stale && !applications.some((a) => a.jobId === j.id))
              .slice(0, 20)
              .map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => {
                    const app = addFromJob(j, 'interested')
                    setSelectedId(app.id)
                    setAddOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-surface-2"
                >
                  <span className="truncate text-text-primary">
                    {j.title} · {j.company}
                  </span>
                  <Badge tone="accent">{j.matchScore}%</Badge>
                </button>
              ))}
          </div>
        </Card>
      ) : null}

      <div className="scroll-thin -mx-1 flex gap-3 overflow-x-auto pb-2">
        {stages.map((stage) => {
          const items = byStage[stage]
          return (
            <div
              key={stage}
              className="w-72 shrink-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropStage(stage)}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-xs font-medium capitalize text-text-secondary">{stage}</p>
                <span className="text-[11px] tabular-nums text-text-muted">{items.length}</span>
              </div>
              <div
                className={cn(
                  'min-h-[140px] space-y-2 rounded-2xl border border-border-subtle bg-surface-0/50 p-2',
                  dragId && 'border-accent/20',
                )}
              >
                {items.length === 0 ? (
                  <p className="px-2 py-8 text-center text-[11px] text-text-muted">Drop here</p>
                ) : (
                  items.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      selected={selectedId === app.id}
                      onSelect={() => {
                        setSelectedId(app.id)
                        setNoteDraft('')
                      }}
                      onDragStart={() => setDragId(app.id)}
                      onDragEnd={() => setDragId(null)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selected ? (
        <Card className="mt-6 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
            <div>
              <p className="font-medium text-text-primary">{selected.title}</p>
              <p className="text-sm text-text-secondary">
                {selected.company}
                {selected.city ? ` · ${selected.city}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone={stageTone[selected.stage]}>{selected.stage}</Badge>
                <select
                  value={selected.stage}
                  onChange={(e) => moveToStage(selected.id, e.target.value as AppStage)}
                  className="rounded-lg border border-border-subtle bg-surface-1 px-2 py-1 text-xs text-text-secondary"
                >
                  {stages.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                {selectedJob ? (
                  <ResumifyButton job={selectedJob} variant="primary" size="sm" />
                ) : (
                  <Link
                    to={`/resume/tailor/${selected.jobId}?auto=1`}
                    className="inline-flex items-center gap-1 text-positive hover:underline"
                  >
                    <FileEdit className="h-3 w-3" /> Resumify
                  </Link>
                )}
                <Link
                  to={`/jobs/${selected.jobId}`}
                  className="text-accent-soft hover:underline"
                >
                  Job detail
                </Link>
                <Link
                  to={`/interview?jobId=${selected.jobId}`}
                  className="inline-flex items-center gap-1 text-text-secondary hover:underline"
                >
                  <Mic2 className="h-3 w-3" /> Interview prep
                </Link>
                {selected.applyUrl ? (
                  <a
                    href={selected.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-text-secondary hover:underline"
                  >
                    Apply URL <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                remove(selected.id)
                setSelectedId(null)
              }}
              className="inline-flex h-9 items-center gap-1 self-start rounded-xl border border-border-subtle px-3 text-xs text-text-muted hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                <StickyNote className="h-3.5 w-3.5" /> Add note
              </p>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                placeholder="Interview times, follow-ups, recruiter names…"
                className="w-full rounded-xl border border-border-subtle bg-surface-1 px-3 py-2 text-sm focus:border-accent/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  addNote(selected.id, noteDraft)
                  setNoteDraft('')
                }}
                className="mt-2 rounded-xl bg-surface-2 px-3 py-1.5 text-xs text-text-primary"
              >
                Save note
              </button>
              <ul className="mt-3 max-h-40 scroll-thin space-y-2 overflow-y-auto">
                {selected.noteLog.map((n) => (
                  <li
                    key={n.id}
                    className="rounded-lg border border-border-subtle px-2.5 py-2 text-xs text-text-secondary"
                  >
                    <p>{n.text}</p>
                    <p className="mt-1 text-[10px] text-text-muted">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-text-secondary">Stage history</p>
              <ul className="max-h-56 scroll-thin space-y-2 overflow-y-auto">
                {[...selected.history].reverse().map((h, i) => (
                  <li key={`${h.at}-${i}`} className="text-xs text-text-muted">
                    <span className="text-text-secondary">
                      {h.from ? `${h.from} → ${h.to}` : h.to}
                    </span>
                    {h.note ? ` · ${h.note}` : ''}
                    <span className="ml-1 text-[10px]">
                      {new Date(h.at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function AppCard({
  app,
  selected,
  onSelect,
  onDragStart,
  onDragEnd,
}: {
  app: Application
  selected: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragEnd: () => void
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={cn(
        'cursor-grab rounded-xl border border-border-subtle bg-surface-1 p-3 active:cursor-grabbing',
        selected && 'ring-1 ring-accent/40',
      )}
    >
      <div className="flex gap-2">
        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" />
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-text-primary">{app.title}</p>
          <p className="mt-0.5 text-xs text-text-muted">{app.company}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Badge tone={stageTone[app.stage]}>{app.stage}</Badge>
            <span className="text-[10px] text-text-muted">{app.updatedAt}</span>
          </div>
          {app.notes ? (
            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-text-secondary">
              {app.notes}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
