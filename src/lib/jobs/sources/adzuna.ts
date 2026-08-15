import type { RawJobPosting } from '../../../types'
import { isRelevantPosting } from '../roles'

/**
 * Optional Adzuna Jobs API (free tier requires app_id + app_key).
 * Set VITE_ADZUNA_APP_ID and VITE_ADZUNA_APP_KEY in .env.local
 * Docs: https://developer.adzuna.com/
 *
 * Country: in (India). Queries Solutions Engineer in Bangalore & Hyderabad.
 */
type AdzunaJob = {
  id: string
  title: string
  description: string
  created: string
  redirect_url: string
  company?: { display_name?: string }
  location?: { display_name?: string; area?: string[] }
  salary_min?: number
  salary_max?: number
  contract_time?: string
}

type AdzunaResponse = { results?: AdzunaJob[] }

function envKeys() {
  const appId = import.meta.env.VITE_ADZUNA_APP_ID as string | undefined
  const appKey = import.meta.env.VITE_ADZUNA_APP_KEY as string | undefined
  return { appId, appKey }
}

export function isAdzunaConfigured(): boolean {
  const { appId, appKey } = envKeys()
  return Boolean(appId && appKey)
}

function formatSalary(min?: number, max?: number): string | undefined {
  if (!min && !max) return undefined
  const fmt = (n: number) =>
    n >= 100000 ? `₹${Math.round(n / 100000)} LPA` : `₹${Math.round(n).toLocaleString('en-IN')}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return max ? `Up to ${fmt(max)}` : undefined
}

async function queryAdzuna(
  what: string,
  where: string,
  appId: string,
  appKey: string,
  signal?: AbortSignal,
): Promise<RawJobPosting[]> {
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '20',
    what,
    where,
    'content-type': 'application/json',
  })
  // Adzuna often blocks browser CORS — use dev proxy when available
  const base = import.meta.env.DEV
    ? `/api/adzuna/v1/api/jobs/in/search/1?${params}`
    : `https://api.adzuna.com/v1/api/jobs/in/search/1?${params}`

  const res = await fetch(base, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Adzuna HTTP ${res.status}`)
  const data = (await res.json()) as AdzunaResponse

  return (data.results ?? [])
    .filter((j) => isRelevantPosting(j.title, j.description ?? ''))
    .map(
      (j): RawJobPosting => ({
        externalId: String(j.id),
        title: j.title,
        company: j.company?.display_name || 'Unknown',
        locationRaw: j.location?.display_name || where,
        description: j.description,
        salary: formatSalary(j.salary_min, j.salary_max),
        postedAt: j.created?.slice(0, 10),
        applyUrl: j.redirect_url,
        workModeHint: j.contract_time,
        sourceId: 'adzuna',
        sourceLabel: 'Adzuna (API key)',
        tags: [],
      }),
    )
}

export async function fetchAdzunaJobs(signal?: AbortSignal): Promise<RawJobPosting[]> {
  const { appId, appKey } = envKeys()
  if (!appId || !appKey) {
    throw new Error('Adzuna not configured (set VITE_ADZUNA_APP_ID / VITE_ADZUNA_APP_KEY)')
  }

  const queries = [
    { what: 'Solutions Engineer', where: 'Bangalore' },
    { what: 'Solutions Architect', where: 'Hyderabad' },
    { what: 'Sales Engineer', where: 'Bengaluru' },
    { what: 'Pre-Sales Engineer', where: 'Hyderabad' },
  ]

  const batches = await Promise.allSettled(
    queries.map((q) => queryAdzuna(q.what, q.where, appId, appKey, signal)),
  )

  const out: RawJobPosting[] = []
  let anyOk = false
  let lastErr = ''
  for (const b of batches) {
    if (b.status === 'fulfilled') {
      anyOk = true
      out.push(...b.value)
    } else {
      lastErr = b.reason instanceof Error ? b.reason.message : String(b.reason)
    }
  }
  if (!anyOk) throw new Error(lastErr || 'Adzuna failed')
  return out
}
