import type { RawJobPosting } from '../../../types'

/**
 * Import a JSON array of jobs (user-provided export / public feed dump).
 * Supported shapes:
 *  - Array of { title, company, location, url?, description?, salary?, postedAt?, tags? }
 *  - { jobs: [...] } or { data: [...] }
 */
type LooseJob = Record<string, unknown>

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : v != null ? String(v) : fallback
}

function pick(obj: LooseJob, keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] != null && obj[k] !== '') return obj[k]
  }
  return undefined
}

function toRaw(item: LooseJob, index: number): RawJobPosting | null {
  const title = asString(pick(item, ['title', 'job_title', 'name']))
  const company = asString(pick(item, ['company', 'company_name', 'organization']))
  if (!title || !company) return null

  const locationRaw = asString(
    pick(item, ['location', 'locationRaw', 'candidate_required_location', 'city']),
    'India',
  )
  const applyUrl = asString(
    pick(item, ['applyUrl', 'url', 'redirect_url', 'link', 'application_url']),
    '#',
  )
  const description = asString(pick(item, ['description', 'summary', 'body']))
  const salary = asString(pick(item, ['salary', 'salary_text'])) || undefined
  const postedAt = asString(pick(item, ['postedAt', 'publication_date', 'created', 'date'])) || undefined
  const externalId = asString(
    pick(item, ['id', 'externalId', 'slug']),
    `import-${index}-${title.slice(0, 20)}`,
  )
  const tagsRaw = pick(item, ['tags', 'skills'])
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.map((t) => String(t))
    : typeof tagsRaw === 'string'
      ? tagsRaw.split(',').map((t) => t.trim())
      : []

  return {
    externalId,
    title,
    company,
    locationRaw,
    description: description || undefined,
    salary,
    postedAt: postedAt?.slice(0, 10),
    applyUrl,
    workModeHint: asString(pick(item, ['workMode', 'job_type', 'contract_time'])) || undefined,
    sourceId: 'import',
    sourceLabel: 'JSON import',
    tags,
  }
}

export function parseJobImportJson(text: string): RawJobPosting[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Invalid JSON — expected an array or { jobs: [] } object.')
  }

  let list: unknown[] = []
  if (Array.isArray(parsed)) list = parsed
  else if (parsed && typeof parsed === 'object') {
    const o = parsed as Record<string, unknown>
    if (Array.isArray(o.jobs)) list = o.jobs
    else if (Array.isArray(o.data)) list = o.data
    else if (Array.isArray(o.results)) list = o.results
    else throw new Error('JSON must be an array or contain jobs/data/results array.')
  } else {
    throw new Error('Unsupported JSON shape.')
  }

  const raw: RawJobPosting[] = []
  list.forEach((item, i) => {
    if (item && typeof item === 'object') {
      const r = toRaw(item as LooseJob, i)
      if (r) raw.push(r)
    }
  })
  if (!raw.length) throw new Error('No valid job objects found in JSON.')
  return raw
}

export async function parseJobImportFile(file: File): Promise<RawJobPosting[]> {
  const text = await file.text()
  return parseJobImportJson(text)
}
