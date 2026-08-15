import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CandidateProfile, ResumeSource, ResumeVersion } from '../types'
import { analyzeAts, parseResumeText, profileToCandidate } from '../lib/resume/parseResume'
import { extractTextFromFile, extractTextFromPaste } from '../lib/resume/extractText'
import { SAMPLE_RESUME_TEXT } from '../data/sampleResume'
import { candidate as seedCandidate } from '../data/mock'

/** Bumped when default master resume / domain priorities change (Fabrix AI Ops P1). */
const STORAGE_KEY = 'careeros.resume.v2'

type StoredState = {
  versions: ResumeVersion[]
  activeId: string | null
}

type ResumeContextValue = {
  versions: ResumeVersion[]
  active: ResumeVersion | null
  profile: CandidateProfile
  /** True when active master is an upload or paste (not demo sample) */
  isUserResume: boolean
  /** Structured skills/certs/exp from active parse — used across the app */
  structuredProfile: ResumeVersion['profile'] | null
  loading: boolean
  error: string | null
  lastAlignedAt: string | null
  setActive: (id: string) => void
  ingestText: (raw: string, meta: { source: ResumeSource; fileName?: string; mimeType?: string; label?: string }) => ResumeVersion
  uploadFile: (file: File) => Promise<ResumeVersion>
  pasteText: (text: string) => ResumeVersion
  loadSample: () => ResumeVersion
  removeVersion: (id: string) => void
  clearError: () => void
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

function uid() {
  return `rv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function buildVersion(
  raw: string,
  meta: { source: ResumeSource; fileName?: string; mimeType?: string; label?: string },
): ResumeVersion {
  const profile = parseResumeText(raw)
  const ats = analyzeAts(profile.skills, raw)
  return {
    id: uid(),
    label:
      meta.label ??
      (meta.source === 'seed'
        ? 'Master (sample)'
        : meta.fileName ?? (meta.source === 'paste' ? 'Pasted resume' : 'Uploaded resume')),
    source: meta.source,
    fileName: meta.fileName,
    mimeType: meta.mimeType,
    createdAt: new Date().toISOString(),
    rawText: raw,
    profile,
    ats,
  }
}

function loadStored(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredState
  } catch {
    return null
  }
}

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [versions, setVersions] = useState<ResumeVersion[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [lastAlignedAt, setLastAlignedAt] = useState<string | null>(null)

  // Hydrate from localStorage or seed sample
  useEffect(() => {
    const stored = loadStored()
    if (stored?.versions?.length) {
      setVersions(stored.versions)
      setActiveId(stored.activeId ?? stored.versions[0].id)
    } else {
      const seed = buildVersion(SAMPLE_RESUME_TEXT, {
        source: 'seed',
        fileName: 'sample-arjun-mehta.txt',
        mimeType: 'text/plain',
        label: 'Master (sample)',
      })
      setVersions([seed])
      setActiveId(seed.id)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const payload: StoredState = { versions, activeId }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // quota / private mode — ignore
    }
  }, [versions, activeId, hydrated])

  const active = useMemo(
    () => versions.find((v) => v.id === activeId) ?? versions[0] ?? null,
    [versions, activeId],
  )

  const profile: CandidateProfile = useMemo(() => {
    if (!active) return seedCandidate
    return profileToCandidate(active.profile)
  }, [active])

  const isUserResume = Boolean(active && active.source !== 'seed')
  const structuredProfile = active?.profile ?? null

  const ingestText = useCallback(
    (
      raw: string,
      meta: { source: ResumeSource; fileName?: string; mimeType?: string; label?: string },
    ) => {
      if (!raw.trim()) {
        setError('Resume text is empty — could not extract text from this file.')
        throw new Error('empty')
      }
      if (raw.trim().length < 40) {
        setError(
          'Very little text was extracted. If this is a scanned PDF, use a text-based PDF, DOCX, or paste the text.',
        )
      }
      const version = buildVersion(raw, meta)
      if (version.profile.skills.length === 0 && meta.source !== 'seed') {
        setError(
          'Parsed the file but found few known skills. Check the Structured profile tab — you can still use matches; try a clearer text resume if needed.',
        )
      } else if (meta.source !== 'seed') {
        setError(null)
      }
      setVersions((prev) => [version, ...prev])
      setActiveId(version.id)
      setLastAlignedAt(new Date().toISOString())
      // Notify other layers (tailor versions stay; matches recompute via profile dependency)
      try {
        window.dispatchEvent(
          new CustomEvent('careeros:resume-aligned', {
            detail: {
              name: version.profile.name,
              skills: version.profile.skills.length,
              source: version.source,
            },
          }),
        )
      } catch {
        /* ignore */
      }
      return version
    },
    [],
  )

  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true)
      setError(null)
      try {
        const extracted = await extractTextFromFile(file)
        if (extracted.warning) setError(extracted.warning)
        return ingestText(extracted.text, {
          source: 'upload',
          fileName: extracted.fileName,
          mimeType: extracted.mimeType,
          label: extracted.fileName,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to read resume file.'
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [ingestText],
  )

  const pasteText = useCallback(
    (text: string) => {
      const extracted = extractTextFromPaste(text)
      return ingestText(extracted.text, {
        source: 'paste',
        fileName: extracted.fileName,
        mimeType: extracted.mimeType,
        label: 'Pasted resume',
      })
    },
    [ingestText],
  )

  const loadSample = useCallback(() => {
    return ingestText(SAMPLE_RESUME_TEXT, {
      source: 'seed',
      fileName: 'sample-arjun-mehta.txt',
      mimeType: 'text/plain',
      label: 'Master (sample)',
    })
  }, [ingestText])

  const removeVersion = useCallback(
    (id: string) => {
      setVersions((prev) => {
        const next = prev.filter((v) => v.id !== id)
        if (next.length === 0) {
          const seed = buildVersion(SAMPLE_RESUME_TEXT, {
            source: 'seed',
            label: 'Master (sample)',
            fileName: 'sample-arjun-mehta.txt',
            mimeType: 'text/plain',
          })
          setActiveId(seed.id)
          return [seed]
        }
        if (activeId === id) setActiveId(next[0].id)
        return next
      })
    },
    [activeId],
  )

  const setActive = useCallback((id: string) => {
    setActiveId(id)
    setLastAlignedAt(new Date().toISOString())
  }, [])

  const value: ResumeContextValue = {
    versions,
    active,
    profile,
    isUserResume,
    structuredProfile,
    loading,
    error,
    lastAlignedAt,
    setActive,
    ingestText,
    uploadFile,
    pasteText,
    loadSample,
    removeVersion,
    clearError: () => setError(null),
  }

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
}

export function useResume() {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used within ResumeProvider')
  return ctx
}
