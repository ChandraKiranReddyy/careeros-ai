import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AppStage, Application, Job } from '../types'
import { applications as seedApps } from '../data/mock'
import { useJobs } from './JobContext'

const STORAGE_KEY = 'careeros.applications.v2'

const STAGES: AppStage[] = [
  'new',
  'interested',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
]

function uid(prefix = 'app') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function normalizeApp(a: Partial<Application> & Pick<Application, 'id' | 'jobId' | 'stage' | 'company' | 'title' | 'updatedAt'>): Application {
  return {
    id: a.id,
    jobId: a.jobId,
    stage: a.stage,
    company: a.company,
    title: a.title,
    city: a.city,
    createdAt: a.createdAt ?? a.updatedAt,
    updatedAt: a.updatedAt,
    notes: a.notes,
    noteLog: a.noteLog ?? (a.notes
      ? [{ id: uid('note'), text: a.notes, createdAt: a.updatedAt }]
      : []),
    history: a.history ?? [
      { at: a.createdAt ?? a.updatedAt, to: a.stage, note: 'Created' },
    ],
    tailoredResumeId: a.tailoredResumeId,
    applyUrl: a.applyUrl,
  }
}

function seedApplications(): Application[] {
  return seedApps.map((a) =>
    normalizeApp({
      ...a,
      createdAt: a.updatedAt,
      history: [{ at: a.updatedAt, to: a.stage, note: 'Seeded pipeline' }],
      noteLog: a.notes
        ? [{ id: uid('note'), text: a.notes, createdAt: a.updatedAt }]
        : [],
    }),
  )
}

type ApplicationContextValue = {
  applications: Application[]
  stages: AppStage[]
  byStage: Record<AppStage, Application[]>
  stats: {
    total: number
    active: number
    interviews: number
    offers: number
    applied: number
  }
  addFromJob: (job: Job, stage?: AppStage) => Application
  moveToStage: (id: string, stage: AppStage) => void
  updateNotes: (id: string, notes: string) => void
  addNote: (id: string, text: string) => void
  remove: (id: string) => void
  linkTailored: (id: string, tailoredResumeId: string) => void
  getByJobId: (jobId: string) => Application | undefined
  getById: (id: string) => Application | undefined
}

const ApplicationContext = createContext<ApplicationContextValue | null>(null)

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { jobs } = useJobs()
  const [applications, setApplications] = useState<Application[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [relinked, setRelinked] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Application[]
        setApplications(parsed.map((a) => normalizeApp(a)))
      } else {
        setApplications(seedApplications())
      }
    } catch {
      setApplications(seedApplications())
    }
    setHydrated(true)
  }, [])

  // Map seed company+title rows onto real inventory job ids when available
  useEffect(() => {
    if (!hydrated || !jobs.length || relinked) return
    setApplications((prev) =>
      prev.map((a) => {
        const hit = jobs.find(
          (j) =>
            j.id === a.jobId ||
            (j.company.toLowerCase() === a.company.toLowerCase() &&
              j.title.toLowerCase() === a.title.toLowerCase()),
        )
        return hit ? { ...a, jobId: hit.id, applyUrl: hit.applyUrl !== '#' ? hit.applyUrl : a.applyUrl, city: hit.city } : a
      }),
    )
    setRelinked(true)
  }, [jobs, hydrated, relinked])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
    } catch {
      /* ignore */
    }
  }, [applications, hydrated])

  const byStage = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s, [] as Application[]])) as Record<
      AppStage,
      Application[]
    >
    for (const a of applications) {
      map[a.stage].push(a)
    }
    return map
  }, [applications])

  const stats = useMemo(() => {
    const terminal: AppStage[] = ['rejected', 'withdrawn']
    return {
      total: applications.length,
      active: applications.filter((a) => !terminal.includes(a.stage)).length,
      interviews: applications.filter((a) => a.stage === 'interview').length,
      offers: applications.filter((a) => a.stage === 'offer').length,
      applied: applications.filter((a) =>
        ['applied', 'screening', 'interview', 'offer'].includes(a.stage),
      ).length,
    }
  }, [applications])

  const addFromJob = useCallback((job: Job, stage: AppStage = 'interested') => {
    const now = new Date().toISOString()
    let result: Application | undefined
    setApplications((prev) => {
      const existing = prev.find((a) => a.jobId === job.id)
      if (existing) {
        result = existing
        return prev
      }
      const app: Application = {
        id: uid('app'),
        jobId: job.id,
        stage,
        company: job.company,
        title: job.title,
        city: job.city,
        createdAt: now,
        updatedAt: now.slice(0, 10),
        notes: '',
        noteLog: [],
        history: [{ at: now, to: stage, note: 'Added from job inventory' }],
        applyUrl: job.applyUrl !== '#' ? job.applyUrl : undefined,
      }
      result = app
      return [app, ...prev]
    })
    // Synchronous path: if React batches, rebuild from known fields
    if (!result) {
      result = {
        id: uid('app'),
        jobId: job.id,
        stage,
        company: job.company,
        title: job.title,
        city: job.city,
        createdAt: now,
        updatedAt: now.slice(0, 10),
        notes: '',
        noteLog: [],
        history: [{ at: now, to: stage, note: 'Added from job inventory' }],
        applyUrl: job.applyUrl !== '#' ? job.applyUrl : undefined,
      }
    }
    return result
  }, [])

  const moveToStage = useCallback((id: string, stage: AppStage) => {
    const now = new Date().toISOString()
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id || a.stage === stage) return a
        return {
          ...a,
          stage,
          updatedAt: now.slice(0, 10),
          history: [
            ...a.history,
            { at: now, from: a.stage, to: stage },
          ],
        }
      }),
    )
  }, [])

  const updateNotes = useCallback((id: string, notes: string) => {
    const now = new Date().toISOString()
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, notes, updatedAt: now.slice(0, 10) }
          : a,
      ),
    )
  }, [])

  const addNote = useCallback((id: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const now = new Date().toISOString()
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        const entry = { id: uid('note'), text: trimmed, createdAt: now }
        return {
          ...a,
          notes: trimmed,
          noteLog: [entry, ...a.noteLog],
          updatedAt: now.slice(0, 10),
        }
      }),
    )
  }, [])

  const remove = useCallback((id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const linkTailored = useCallback((id: string, tailoredResumeId: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, tailoredResumeId } : a)),
    )
  }, [])

  const getByJobId = useCallback(
    (jobId: string) => applications.find((a) => a.jobId === jobId),
    [applications],
  )

  const getById = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications],
  )

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        stages: STAGES,
        byStage,
        stats,
        addFromJob,
        moveToStage,
        updateNotes,
        addNote,
        remove,
        linkTailored,
        getByJobId,
        getById,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  )
}

export function useApplications() {
  const ctx = useContext(ApplicationContext)
  if (!ctx) throw new Error('useApplications must be used within ApplicationProvider')
  return ctx
}
