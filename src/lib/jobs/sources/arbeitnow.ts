import type { RawJobPosting } from '../../../types'
import { isRelevantPosting } from '../roles'

/**
 * Arbeitnow public job board API — free, no key.
 * May be blocked by CORS in pure browser; Vite dev proxy available at /api/arbeitnow.
 * https://www.arbeitnow.com/api/job-board-api
 */
type ArbeitnowJob = {
  slug: string
  company_name: string
  title: string
  description: string
  remote: boolean
  url: string
  tags: string[]
  job_types: string[]
  location: string
  created_at: number
}

type ArbeitnowResponse = { data?: ArbeitnowJob[] }

function endpoint(): string {
  // Prefer same-origin proxy in dev to avoid CORS
  if (import.meta.env.DEV) return '/api/arbeitnow'
  return 'https://www.arbeitnow.com/api/job-board-api'
}

export async function fetchArbeitnowJobs(signal?: AbortSignal): Promise<RawJobPosting[]> {
  const res = await fetch(endpoint(), {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Arbeitnow HTTP ${res.status}`)
  const data = (await res.json()) as ArbeitnowResponse
  const jobs = data.data ?? []

  return jobs
    .filter((j) => isRelevantPosting(j.title, j.description ?? '', j.tags ?? []))
    .slice(0, 40)
    .map(
      (j): RawJobPosting => ({
        externalId: j.slug,
        title: j.title,
        company: j.company_name,
        locationRaw: j.remote ? `${j.location || 'Remote'} (Remote)` : j.location || 'Unknown',
        description: j.description,
        postedAt: j.created_at
          ? new Date(j.created_at * 1000).toISOString().slice(0, 10)
          : undefined,
        applyUrl: j.url,
        workModeHint: j.remote ? 'remote' : 'onsite',
        sourceId: 'arbeitnow',
        sourceLabel: 'Arbeitnow (public API)',
        tags: j.tags ?? [],
      }),
    )
}
