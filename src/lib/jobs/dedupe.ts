import type { Job } from '../../types'
import { cityPriority } from './normalize'

function sourceRank(sourceId: string): number {
  // Prefer original company / curated seed over aggregators when merging
  const order = ['seed', 'import', 'manual', 'adzuna', 'arbeitnow', 'remotive']
  const i = order.indexOf(sourceId)
  return i === -1 ? 50 : i
}

/**
 * Merge jobs by fingerprint. Keeps richer record; updates lastSeen.
 * firstSeen is the earliest sighting.
 */
export function dedupeJobs(jobs: Job[], nowIso = new Date().toISOString()): Job[] {
  const map = new Map<string, Job>()

  for (const job of jobs) {
    const existing = map.get(job.fingerprint)
    if (!existing) {
      map.set(job.fingerprint, { ...job, lastSeen: nowIso })
      continue
    }

    const preferNew =
      sourceRank(job.sourceId) < sourceRank(existing.sourceId) ||
      (job.description?.length ?? 0) > (existing.description?.length ?? 0) ||
      (job.applyUrl !== '#' && existing.applyUrl === '#')

    const base = preferNew ? job : existing
    const other = preferNew ? existing : job

    map.set(job.fingerprint, {
      ...base,
      firstSeen: [existing.firstSeen, job.firstSeen].sort()[0],
      lastSeen: nowIso,
      stale: false,
      // Preserve better match metadata if any
      matchScore: Math.max(base.matchScore, other.matchScore),
      matchScoreKind:
        base.matchScore >= other.matchScore ? base.matchScoreKind : other.matchScoreKind,
      matchedSkills:
        base.matchedSkills.length >= other.matchedSkills.length
          ? base.matchedSkills
          : other.matchedSkills,
      mustHave:
        base.mustHave.length >= other.mustHave.length ? base.mustHave : other.mustHave,
      salary: base.salary || other.salary,
      description: base.description || other.description,
    })
  }

  return [...map.values()].sort((a, b) => {
    const c = cityPriority(a.city) - cityPriority(b.city)
    if (c !== 0) return c
    return b.postedAt.localeCompare(a.postedAt)
  })
}

/** Mark jobs not seen in this ingest wave as stale (soft). */
export function markStale(
  existing: Job[],
  seenFingerprints: Set<string>,
  nowIso: string,
  maxAgeDays = 45,
): { jobs: Job[]; staleMarked: number } {
  let staleMarked = 0
  const jobs = existing.map((j) => {
    if (seenFingerprints.has(j.fingerprint)) {
      return { ...j, lastSeen: nowIso, stale: false }
    }
    const ageMs = Date.now() - new Date(j.lastSeen).getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    if (ageDays > maxAgeDays || !seenFingerprints.has(j.fingerprint)) {
      // Soft-stale if not in latest successful multi-source refresh after max age
      if (ageDays > maxAgeDays && !j.stale) {
        staleMarked++
        return { ...j, stale: true }
      }
    }
    return j
  })
  return { jobs, staleMarked }
}
