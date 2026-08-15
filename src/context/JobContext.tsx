import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { IngestReport, Job, JobMatchResult, RawJobPosting } from '../types'
import { ingestJobs } from '../lib/jobs/ingest'
import { rankJobs, buildMatchProfile, matchJob } from '../lib/matching/engine'
import { parseJobImportFile, parseJobImportJson } from '../lib/jobs/sources/importJson'
import { isAdzunaConfigured } from '../lib/jobs/sources/adzuna'
import { useResume } from './ResumeContext'

/** Bumped when seed catalog adds P1 AI Ops / Agentic Ops roles. */
const STORAGE_KEY = 'careeros.jobs.v2'

type Stored = {
  jobs: Job[]
  lastReport: IngestReport | null
}

type JobContextValue = {
  jobs: Job[]
  /** Jobs ranked by explainable match engine vs active resume */
  rankedJobs: Job[]
  loading: boolean
  lastReport: IngestReport | null
  error: string | null
  adzunaConfigured: boolean
  getMatch: (jobId: string) => JobMatchResult | undefined
  stats: {
    total: number
    active: number
    stale: number
    bangalore: number
    hyderabad: number
    remote: number
    newToday: number
    strongMatches: number
    bySource: Record<string, number>
  }
  refresh: () => Promise<void>
  importJsonText: (text: string) => Promise<void>
  importJsonFile: (file: File) => Promise<void>
  clearError: () => void
}

const JobContext = createContext<JobContextValue | null>(null)

function loadStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Stored
  } catch {
    return null
  }
}

export function JobProvider({ children }: { children: ReactNode }) {
  const { profile, active } = useResume()
  const [jobs, setJobs] = useState<Job[]>([])
  const [lastReport, setLastReport] = useState<IngestReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const matchProfile = useMemo(
    () => buildMatchProfile(profile, active?.profile ?? null),
    [profile, active],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const stored = loadStored()
      if (stored?.jobs?.length) {
        if (!cancelled) {
          setJobs(stored.jobs)
          setLastReport(stored.lastReport)
          setHydrated(true)
        }
        return
      }
      setLoading(true)
      try {
        const { jobs: initial, report } = await ingestJobs([])
        if (!cancelled) {
          setJobs(initial)
          setLastReport(report)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load jobs')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setHydrated(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      // Persist base jobs without bulky per-user match blobs (recomputed live)
      const slim = jobs.map(({ match: _m, ...rest }) => ({
        ...rest,
        matchScoreKind: rest.matchScoreKind === 'engine' ? ('none' as const) : rest.matchScoreKind,
      }))
      const payload: Stored = { jobs: slim as Job[], lastReport }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore */
    }
  }, [jobs, lastReport, hydrated])

  const rankedJobs = useMemo(
    () => rankJobs(jobs, matchProfile),
    [jobs, matchProfile],
  )

  const matchById = useMemo(() => {
    const m = new Map<string, JobMatchResult>()
    for (const j of rankedJobs) {
      if (j.match) m.set(j.id, j.match)
    }
    return m
  }, [rankedJobs])

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const activeJobs = jobs.filter((j) => !j.stale)
    const bySource: Record<string, number> = {}
    for (const j of jobs) {
      bySource[j.source] = (bySource[j.source] ?? 0) + 1
    }
    const rankedActive = rankedJobs.filter((j) => !j.stale)
    return {
      total: jobs.length,
      active: activeJobs.length,
      stale: jobs.filter((j) => j.stale).length,
      bangalore: activeJobs.filter((j) => j.city === 'Bangalore').length,
      hyderabad: activeJobs.filter((j) => j.city === 'Hyderabad').length,
      remote: activeJobs.filter((j) => j.city === 'India Remote').length,
      newToday: activeJobs.filter(
        (j) => j.postedAt === today || j.firstSeen.slice(0, 10) === today,
      ).length,
      strongMatches: rankedActive.filter((j) => j.matchScore >= 80).length,
      bySource,
    }
  }, [jobs, rankedJobs])

  const mergeIngest = useCallback(async (extraRaw?: RawJobPosting[]) => {
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    setLoading(true)
    setError(null)
    try {
      const { jobs: next, report } = await ingestJobs(jobs, {
        extraRaw,
        signal: ac.signal,
      })
      setJobs(next)
      setLastReport(report)
      const hardFails = report.sources.filter(
        (s) => !s.ok && s.sourceId !== 'adzuna' && s.sourceId !== 'seed',
      )
      if (hardFails.length) {
        setError(
          `Some sources failed: ${hardFails.map((s) => `${s.sourceLabel} (${s.error})`).join('; ')}. Seed catalog still available.`,
        )
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
      setError(e instanceof Error ? e.message : 'Ingest failed')
    } finally {
      setLoading(false)
    }
  }, [jobs])

  const refresh = useCallback(async () => {
    await mergeIngest()
  }, [mergeIngest])

  const importJsonText = useCallback(
    async (text: string) => {
      const raw = parseJobImportJson(text)
      await mergeIngest(raw)
    },
    [mergeIngest],
  )

  const importJsonFile = useCallback(
    async (file: File) => {
      const raw = await parseJobImportFile(file)
      await mergeIngest(raw)
    },
    [mergeIngest],
  )

  const getMatch = useCallback(
    (jobId: string) => {
      const cached = matchById.get(jobId)
      if (cached) return cached
      const job = jobs.find((j) => j.id === jobId)
      if (!job) return undefined
      return matchJob(job, matchProfile)
    },
    [matchById, jobs, matchProfile],
  )

  const value: JobContextValue = {
    jobs,
    rankedJobs,
    loading,
    lastReport,
    error,
    adzunaConfigured: isAdzunaConfigured(),
    getMatch,
    stats,
    refresh,
    importJsonText,
    importJsonFile,
    clearError: () => setError(null),
  }

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>
}

export function useJobs() {
  const ctx = useContext(JobContext)
  if (!ctx) throw new Error('useJobs must be used within JobProvider')
  return ctx
}
