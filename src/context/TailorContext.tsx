import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Job, TailoredResume } from '../types'
import { tailorResumeForJob } from '../lib/resume/tailor'
import { useResume } from './ResumeContext'

const STORAGE_KEY = 'careeros.tailored.v1'

type TailorContextValue = {
  tailored: TailoredResume[]
  tailoring: boolean
  error: string | null
  tailorForJob: (job: Job) => TailoredResume | null
  getForJob: (jobId: string) => TailoredResume | undefined
  remove: (id: string) => void
  clearError: () => void
}

const TailorContext = createContext<TailorContextValue | null>(null)

export function TailorProvider({ children }: { children: ReactNode }) {
  const { active } = useResume()
  const [tailored, setTailored] = useState<TailoredResume[]>([])
  const [tailoring, setTailoring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setTailored(JSON.parse(raw) as TailoredResume[])
    } catch {
      /* ignore */
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tailored.slice(0, 40)))
    } catch {
      /* ignore */
    }
  }, [tailored, hydrated])

  const tailorForJob = useCallback(
    (job: Job) => {
      if (!active) {
        setError('Upload or load a master resume first.')
        return null
      }
      setTailoring(true)
      setError(null)
      try {
        const result = tailorResumeForJob(
          active.profile,
          active.rawText,
          active.id,
          job,
        )
        setTailored((prev) => {
          // Replace prior version for same job+master
          const rest = prev.filter(
            (t) => !(t.jobId === job.id && t.masterVersionId === active.id),
          )
          return [result, ...rest]
        })
        return result
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Tailoring failed')
        return null
      } finally {
        setTailoring(false)
      }
    },
    [active],
  )

  const getForJob = useCallback(
    (jobId: string) => {
      const masterId = active?.id
      return tailored.find(
        (t) => t.jobId === jobId && (!masterId || t.masterVersionId === masterId),
      )
    },
    [tailored, active],
  )

  const remove = useCallback((id: string) => {
    setTailored((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <TailorContext.Provider
      value={{
        tailored,
        tailoring,
        error,
        tailorForJob,
        getForJob,
        remove,
        clearError: () => setError(null),
      }}
    >
      {children}
    </TailorContext.Provider>
  )
}

export function useTailor() {
  const ctx = useContext(TailorContext)
  if (!ctx) throw new Error('useTailor must be used within TailorProvider')
  return ctx
}
