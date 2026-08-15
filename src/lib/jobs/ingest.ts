import type { IngestReport, Job, RawJobPosting, SourceRunResult } from '../../types'
import { dedupeJobs } from './dedupe'
import { normalizeRawJob } from './normalize'
import { fetchSeedJobs } from './sources/seed'
import { fetchRemotiveJobs } from './sources/remotive'
import { fetchArbeitnowJobs } from './sources/arbeitnow'
import { fetchAdzunaJobs, isAdzunaConfigured } from './sources/adzuna'

export type IngestOptions = {
  includeSeed?: boolean
  includeRemotive?: boolean
  includeArbeitnow?: boolean
  includeAdzuna?: boolean
  extraRaw?: RawJobPosting[]
  signal?: AbortSignal
}

async function runSource(
  sourceId: SourceRunResult['sourceId'],
  sourceLabel: string,
  fn: () => Promise<RawJobPosting[]>,
): Promise<{ result: SourceRunResult; raw: RawJobPosting[] }> {
  const t0 = performance.now()
  try {
    const raw = await fn()
    return {
      raw,
      result: {
        sourceId,
        sourceLabel,
        ok: true,
        fetched: raw.length,
        kept: raw.length,
        durationMs: Math.round(performance.now() - t0),
      },
    }
  } catch (e) {
    return {
      raw: [],
      result: {
        sourceId,
        sourceLabel,
        ok: false,
        fetched: 0,
        kept: 0,
        error: e instanceof Error ? e.message : String(e),
        durationMs: Math.round(performance.now() - t0),
      },
    }
  }
}

/**
 * Free-first multi-source ingest.
 * Always can fall back to seed catalog. Live APIs are best-effort (network/CORS).
 */
export async function ingestJobs(
  previous: Job[],
  options: IngestOptions = {},
): Promise<{ jobs: Job[]; report: IngestReport }> {
  const {
    includeSeed = true,
    includeRemotive = true,
    includeArbeitnow = true,
    includeAdzuna = true,
    extraRaw = [],
    signal,
  } = options

  const now = new Date().toISOString()
  const sourceResults: SourceRunResult[] = []
  const collected: Job[] = []

  if (includeSeed) {
    const t0 = performance.now()
    try {
      const { jobs } = await fetchSeedJobs()
      collected.push(...jobs)
      sourceResults.push({
        sourceId: 'seed',
        sourceLabel: 'CareerOS seed catalog',
        ok: true,
        fetched: jobs.length,
        kept: jobs.length,
        durationMs: Math.round(performance.now() - t0),
      })
    } catch (e) {
      sourceResults.push({
        sourceId: 'seed',
        sourceLabel: 'CareerOS seed catalog',
        ok: false,
        fetched: 0,
        kept: 0,
        error: e instanceof Error ? e.message : String(e),
        durationMs: Math.round(performance.now() - t0),
      })
    }
  }

  if (includeRemotive) {
    const { result, raw } = await runSource('remotive', 'Remotive (public API)', () =>
      fetchRemotiveJobs(signal),
    )
    sourceResults.push(result)
    collected.push(...raw.map((r) => normalizeRawJob(r, now)))
  }

  if (includeArbeitnow) {
    const { result, raw } = await runSource('arbeitnow', 'Arbeitnow (public API)', () =>
      fetchArbeitnowJobs(signal),
    )
    sourceResults.push(result)
    collected.push(...raw.map((r) => normalizeRawJob(r, now)))
  }

  if (includeAdzuna && isAdzunaConfigured()) {
    const { result, raw } = await runSource('adzuna', 'Adzuna (API key)', () =>
      fetchAdzunaJobs(signal),
    )
    sourceResults.push(result)
    collected.push(...raw.map((r) => normalizeRawJob(r, now)))
  } else if (includeAdzuna) {
    sourceResults.push({
      sourceId: 'adzuna',
      sourceLabel: 'Adzuna (API key)',
      ok: false,
      fetched: 0,
      kept: 0,
      error: 'Not configured — add VITE_ADZUNA_APP_ID / VITE_ADZUNA_APP_KEY',
      durationMs: 0,
    })
  }

  if (extraRaw.length) {
    collected.push(...extraRaw.map((r) => normalizeRawJob(r, now)))
    sourceResults.push({
      sourceId: 'import',
      sourceLabel: 'JSON import',
      ok: true,
      fetched: extraRaw.length,
      kept: extraRaw.length,
      durationMs: 0,
    })
  }

  // Merge with previous inventory (preserve firstSeen, applications-friendly ids when fingerprint matches)
  const prevByFp = new Map(previous.map((j) => [j.fingerprint, j]))
  const mergedIncoming = collected.map((j) => {
    const prev = prevByFp.get(j.fingerprint)
    if (!prev) return j
    return {
      ...j,
      id: prev.id,
      firstSeen: prev.firstSeen,
      matchScore: j.matchScoreKind === 'seed' ? j.matchScore : prev.matchScore,
      matchScoreKind: j.matchScoreKind === 'seed' ? j.matchScoreKind : prev.matchScoreKind,
      matchedSkills: j.matchedSkills.length ? j.matchedSkills : prev.matchedSkills,
      missingSkills: j.missingSkills.length ? j.missingSkills : prev.missingSkills,
    }
  })

  // Include previous jobs not in this wave (keep inventory), update lastSeen only for seen
  const seenFp = new Set(mergedIncoming.map((j) => j.fingerprint))
  const carry = previous.filter((j) => !seenFp.has(j.fingerprint))
  const combined = dedupeJobs([...mergedIncoming, ...carry], now)

  // Soft-stale: not refreshed and older than 45 days on lastSeen
  let staleMarked = 0
  const jobs = combined.map((j) => {
    if (seenFp.has(j.fingerprint)) return { ...j, stale: false, lastSeen: now }
    const ageDays = (Date.now() - new Date(j.lastSeen).getTime()) / (1000 * 60 * 60 * 24)
    if (ageDays > 45) {
      if (!j.stale) staleMarked++
      return { ...j, stale: true }
    }
    return j
  })

  const prevFp = new Set(previous.map((j) => j.fingerprint))
  const newJobs = jobs.filter((j) => !prevFp.has(j.fingerprint)).length
  const updatedJobs = jobs.filter((j) => prevFp.has(j.fingerprint) && seenFp.has(j.fingerprint)).length

  const report: IngestReport = {
    at: now,
    sources: sourceResults,
    totalRaw: collected.length,
    afterDedupe: jobs.length,
    newJobs,
    updatedJobs,
    staleMarked,
  }

  return { jobs, report }
}
