import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Search,
  RefreshCw,
  ExternalLink,
  Upload,
  AlertCircle,
  Filter,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { MatchScore } from '../components/ui/MatchScore'
import { ResumifyButton } from '../components/resume/ResumifyButton'
import { useJobs } from '../context/JobContext'
import type { JobCity, JobSourceId, WorkMode } from '../types'
import { cn } from '../lib/cn'

const cities: Array<'All' | JobCity> = [
  'All',
  'Bangalore',
  'Hyderabad',
  'India Remote',
  'Other India',
]
const modes: Array<'All' | WorkMode> = ['All', 'hybrid', 'remote', 'onsite']
const sortOpts = [
  { id: 'relevance', label: 'Relevance (match)' },
  { id: 'newest', label: 'Newest' },
  { id: 'company', label: 'Company' },
] as const

export function DiscoverJobs() {
  const { rankedJobs, loading, refresh, lastReport, error, clearError, importJsonFile, stats } =
    useJobs()
  const fileRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [city, setCity] = useState<(typeof cities)[number]>('All')
  const [mode, setMode] = useState<(typeof modes)[number]>('All')
  const [sourceId, setSourceId] = useState<'All' | JobSourceId>('All')
  const [hideStale, setHideStale] = useState(true)
  const [sort, setSort] = useState<(typeof sortOpts)[number]['id']>('relevance')
  const [minMatch, setMinMatch] = useState(0)

  const sources = useMemo(() => {
    const s = new Set(rankedJobs.map((j) => j.sourceId))
    return ['All', ...s] as Array<'All' | JobSourceId>
  }, [rankedJobs])

  const filtered = useMemo(() => {
    let list = rankedJobs.filter((j) => {
      if (hideStale && j.stale) return false
      const q = query.toLowerCase()
      const matchQ =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.summary.toLowerCase().includes(q) ||
        j.tags.some((t) => t.toLowerCase().includes(q))
      const matchCity = city === 'All' || j.city === city
      const matchMode = mode === 'All' || j.workMode === mode
      const matchSource = sourceId === 'All' || j.sourceId === sourceId
      const matchScore = j.matchScore >= minMatch
      return matchQ && matchCity && matchMode && matchSource && matchScore
    })

    if (sort === 'newest') {
      list = [...list].sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    } else if (sort === 'company') {
      list = [...list].sort((a, b) => a.company.localeCompare(b.company))
    } else {
      list = [...list].sort((a, b) => b.matchScore - a.matchScore)
    }
    return list
  }, [rankedJobs, query, city, mode, sourceId, hideStale, sort, minMatch])

  return (
    <div>
      <PageHeader
        title="Discover Jobs"
        description="Ingested inventory with explainable match scores vs your resume. Bangalore & Hyderabad prioritized; duplicates merged by fingerprint."
        actions={
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary hover:text-text-primary"
            >
              <Upload className="h-3.5 w-3.5" />
              Import JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void importJsonFile(f)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-sm font-medium text-void disabled:opacity-60"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              {loading ? 'Syncing…' : 'Refresh feeds'}
            </button>
          </>
        }
      />

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

      {/* Ingest strip */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Inventory', stats.total],
          ['Bangalore', stats.bangalore],
          ['Hyderabad', stats.hyderabad],
          ['India Remote', stats.remote],
        ].map(([label, value]) => (
          <Card key={label as string} className="px-4 py-3">
            <p className="text-[11px] text-text-muted">{label}</p>
            <p className="font-display text-xl font-semibold tabular-nums">{value}</p>
          </Card>
        ))}
      </div>

      {lastReport ? (
        <Card className="mb-4 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <Filter className="h-3.5 w-3.5 text-text-muted" />
            <span>
              Last ingest {new Date(lastReport.at).toLocaleString()} · {lastReport.afterDedupe}{' '}
              after dedupe · +{lastReport.newJobs} new
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {lastReport.sources.map((s) => (
              <Badge key={s.sourceId + s.sourceLabel} tone={s.ok ? 'positive' : 'warning'}>
                {s.sourceLabel}: {s.ok ? s.fetched : s.error?.slice(0, 40)}
              </Badge>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, company, keywords…"
                className="h-10 w-full rounded-xl border border-border-subtle bg-surface-1 py-2 pl-10 pr-3 text-sm focus:border-accent/40 focus:outline-none"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-10 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary"
            >
              {sortOpts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              Min match
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={minMatch}
                onChange={(e) => setMinMatch(Number(e.target.value))}
                className="w-24"
              />
              <span className="tabular-nums w-8">{minMatch}</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={hideStale}
                onChange={(e) => setHideStale(e.target.checked)}
              />
              Hide stale
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {cities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  city === c
                    ? 'border-accent/30 bg-accent-dim text-accent-soft'
                    : 'border-border-subtle text-text-secondary hover:text-text-primary',
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {modes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  mode === m
                    ? 'border-positive/30 bg-positive-dim text-positive'
                    : 'border-border-subtle text-text-secondary hover:text-text-primary',
                )}
              >
                {m}
              </button>
            ))}
            {sources.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSourceId(s)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  sourceId === s
                    ? 'border-warning/30 bg-warning-dim text-warning'
                    : 'border-border-subtle text-text-secondary hover:text-text-primary',
                )}
              >
                {s === 'All' ? 'All sources' : s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <p className="mb-3 text-xs text-text-muted">
        Showing {filtered.length} of {rankedJobs.length} roles
        {loading ? ' · syncing…' : ''}
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((job) => (
          <Card key={job.id} hover className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-text-primary">{job.title}</p>
                  {job.stale ? <Badge tone="warning">stale</Badge> : null}
                </div>
                <p className="mt-0.5 text-sm text-text-secondary">{job.company}</p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <Badge>{job.workMode}</Badge>
                  <Badge tone="accent">{job.city}</Badge>
                  {job.salary ? <Badge tone="accent">{job.salary}</Badge> : null}
                  <Badge tone="default">{job.source}</Badge>
                </p>
              </div>
              <div className="text-right">
                <MatchScore score={job.matchScore} size="md" />
                {job.match ? (
                  <p className="mt-1 text-[10px] capitalize text-text-muted">
                    {job.match.label} · engine
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-secondary">
              {job.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.matchedSkills.slice(0, 4).map((s) => (
                <Badge key={s} tone="positive">
                  {s}
                </Badge>
              ))}
              {job.missingSkills.slice(0, 2).map((s) => (
                <Badge key={s} tone="warning">
                  gap: {s}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-text-muted">
                Posted {job.postedAt} · first seen {job.firstSeen.slice(0, 10)}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <ResumifyButton job={job} variant="primary" size="sm" />
                <Link
                  to={`/jobs/${job.id}`}
                  className="text-xs text-accent-soft hover:underline"
                >
                  Match detail
                </Link>
                {job.applyUrl && job.applyUrl !== '#' ? (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
                  >
                    Apply <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!filtered.length && !loading ? (
        <Card className="mt-4 p-8 text-center text-sm text-text-muted">
          No jobs match these filters. Try Refresh feeds or clear filters.
        </Card>
      ) : null}
    </div>
  )
}
