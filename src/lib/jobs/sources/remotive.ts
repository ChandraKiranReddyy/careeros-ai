import type { RawJobPosting } from '../../../types'
import { isRelevantPosting } from '../roles'

/**
 * Remotive public API — free, no key, CORS-friendly.
 * https://remotive.com/api/remote-jobs
 * We filter client-side for solutions / cloud / pre-sales relevance.
 */
type RemotiveJob = {
  id: number
  url: string
  title: string
  company_name: string
  company_logo?: string
  category: string
  tags: string[]
  job_type: string
  publication_date: string
  candidate_required_location: string
  salary: string
  description: string
}

type RemotiveResponse = { jobs?: RemotiveJob[] }

const ENDPOINT = 'https://remotive.com/api/remote-jobs?limit=50'

export async function fetchRemotiveJobs(signal?: AbortSignal): Promise<RawJobPosting[]> {
  const res = await fetch(ENDPOINT, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`)
  const data = (await res.json()) as RemotiveResponse
  const jobs = data.jobs ?? []

  return jobs
    .filter((j) =>
      isRelevantPosting(j.title, j.description ?? '', j.tags ?? []),
    )
    .map(
      (j): RawJobPosting => ({
        externalId: String(j.id),
        title: j.title,
        company: j.company_name,
        locationRaw: j.candidate_required_location || 'Remote',
        description: j.description,
        salary: j.salary || undefined,
        postedAt: j.publication_date?.slice(0, 10),
        applyUrl: j.url,
        workModeHint: 'remote',
        sourceId: 'remotive',
        sourceLabel: 'Remotive (public API)',
        tags: j.tags ?? [],
      }),
    )
}
