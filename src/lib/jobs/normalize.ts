import type { Job, JobCity, RawJobPosting, WorkMode } from '../../types'
import { SKILL_LEXICON } from '../resume/skillLexicon'

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeLocation(raw: string): { location: string; city: JobCity } {
  const t = (raw || '').trim()
  const lower = t.toLowerCase()

  if (
    !t ||
    lower === 'remote' ||
    lower.includes('worldwide') ||
    lower.includes('anywhere') ||
    (lower.includes('remote') && !lower.includes('india'))
  ) {
    // Prefer India Remote only when India is mentioned; else still map remote-friendly
    if (lower.includes('india') || lower.includes('bengaluru') || lower.includes('bangalore') || lower.includes('hyderabad')) {
      return { location: 'India Remote', city: 'India Remote' }
    }
    // Keep remote jobs that may hire in India — label as India Remote for product focus
    if (lower.includes('remote') || !t) {
      return { location: t || 'Remote', city: 'India Remote' }
    }
  }

  if (
    lower.includes('bangalore') ||
    lower.includes('bengaluru') ||
    lower.includes('blr') ||
    lower.includes('karnataka')
  ) {
    return {
      location: /bangalore|bengaluru/i.test(t) ? t : 'Bangalore, Karnataka',
      city: 'Bangalore',
    }
  }

  if (
    lower.includes('hyderabad') ||
    lower.includes('secunderabad') ||
    lower.includes('telangana') ||
    lower.includes('hyd')
  ) {
    return {
      location: /hyderabad|secunderabad/i.test(t) ? t : 'Hyderabad, Telangana',
      city: 'Hyderabad',
    }
  }

  if (
    lower.includes('india') ||
    lower.includes('mumbai') ||
    lower.includes('pune') ||
    lower.includes('chennai') ||
    lower.includes('delhi') ||
    lower.includes('gurgaon') ||
    lower.includes('gurugram') ||
    lower.includes('noida') ||
    lower.includes('ncr')
  ) {
    return { location: t || 'India', city: 'Other India' }
  }

  if (lower.includes('remote')) {
    return { location: t, city: 'India Remote' }
  }

  return { location: t || 'Unknown', city: 'Other India' }
}

export function normalizeWorkMode(
  hint: string | undefined,
  locationRaw: string,
  description: string,
): WorkMode {
  const hay = `${hint ?? ''} ${locationRaw} ${description}`.toLowerCase()
  if (/\bhybrid\b/.test(hay)) return 'hybrid'
  if (/\bremote\b|work from home|\bwfh\b|distributed/.test(hay)) return 'remote'
  if (/\bonsite\b|on-site|in-office|office-based/.test(hay)) return 'onsite'
  if (normalizeLocation(locationRaw).city === 'India Remote') return 'remote'
  return 'hybrid'
}

export function fingerprintOf(parts: {
  title: string
  company: string
  location: string
  applyUrl?: string
}): string {
  const urlKey = (parts.applyUrl || '')
    .toLowerCase()
    .replace(/https?:\/\//, '')
    .replace(/\/$/, '')
    .split('?')[0]
  const base = [parts.title, parts.company, parts.location]
    .map((s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim())
    .join('|')
  // Prefer URL when present and not a bare hash
  if (urlKey && urlKey !== '#' && urlKey.length > 8) {
    return `url:${urlKey}`
  }
  return `tc:${base}`
}

function extractSkillsFromText(text: string): string[] {
  const found: string[] = []
  for (const entry of SKILL_LEXICON) {
    if (entry.patterns.some((p) => p.test(text))) found.push(entry.name)
  }
  return found
}

function summarize(description: string, title: string): string {
  if (!description) return title
  const clean = stripHtml(description)
  if (clean.length <= 220) return clean
  return `${clean.slice(0, 217).trim()}…`
}

function extractMustHave(text: string, tags: string[]): string[] {
  const fromText = extractSkillsFromText(text).slice(0, 8)
  const fromTags = tags
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && t.length < 30)
    .slice(0, 6)
  return [...new Set([...fromText, ...fromTags])].slice(0, 10)
}

function stableId(sourceId: string, externalId: string, fingerprint: string): string {
  const raw = `${sourceId}:${externalId}:${fingerprint}`
  let h = 0
  for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0
  return `job_${(h >>> 0).toString(36)}`
}

export function normalizeRawJob(
  raw: RawJobPosting,
  nowIso = new Date().toISOString(),
): Job {
  const description = raw.description ? stripHtml(raw.description) : ''
  const { location, city } = normalizeLocation(raw.locationRaw)
  const workMode = normalizeWorkMode(
    typeof raw.workModeHint === 'string' ? raw.workModeHint : undefined,
    raw.locationRaw,
    description,
  )
  const tags = raw.tags ?? []
  const mustHave = extractMustHave(`${raw.title} ${description} ${tags.join(' ')}`, tags)
  const fingerprint = fingerprintOf({
    title: raw.title,
    company: raw.company,
    location,
    applyUrl: raw.applyUrl,
  })
  const postedAt = raw.postedAt
    ? raw.postedAt.slice(0, 10)
    : nowIso.slice(0, 10)

  return {
    id: stableId(raw.sourceId, raw.externalId, fingerprint),
    title: raw.title.trim() || 'Untitled role',
    company: raw.company.trim() || 'Unknown company',
    location,
    city,
    workMode,
    salary: raw.salary?.trim() || undefined,
    postedAt,
    source: raw.sourceLabel,
    sourceId: raw.sourceId,
    externalId: raw.externalId,
    applyUrl: raw.applyUrl || '#',
    fingerprint,
    firstSeen: nowIso,
    lastSeen: nowIso,
    stale: false,
    description: description || undefined,
    matchScore: 0,
    matchScoreKind: 'none',
    summary: summarize(description, raw.title),
    mustHave,
    niceToHave: [],
    matchedSkills: [],
    missingSkills: [],
    tags,
  }
}

/** Prefer Bangalore / Hyderabad / India Remote in ranking. */
export function cityPriority(city: JobCity): number {
  switch (city) {
    case 'Bangalore':
      return 0
    case 'Hyderabad':
      return 1
    case 'India Remote':
      return 2
    default:
      return 3
  }
}
