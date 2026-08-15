import type {
  AtsAnalysis,
  EducationItem,
  ProjectItem,
  SkillBucket,
  SkillCategory,
  StructuredResumeProfile,
  WorkExperience,
} from '../../types'
import {
  ATS_KEYWORDS,
  CERT_PATTERNS,
  INDUSTRY_PATTERNS,
  ROLE_PATTERNS,
  SENIORITY_PATTERNS,
  SKILL_LEXICON,
} from './skillLexicon'

function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function linesOf(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function extractEmail(text: string): string | undefined {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return m?.[0]
}

function extractPhone(text: string): string | undefined {
  const m = text.match(
    /(?:\+91[\s-]?)?(?:\d{5}[\s-]?\d{5}|\d{3}[\s-]?\d{3}[\s-]?\d{4}|\d{10})\b/,
  )
  return m?.[0]?.trim()
}

function extractLocation(text: string, lines: string[]): string {
  const cityRe =
    /\b(Bangalore|Bengaluru|Hyderabad|Secunderabad|Mumbai|Pune|Chennai|Delhi|NCR|Gurgaon|Gurugram|Noida)\b/i
  for (const line of lines.slice(0, 8)) {
    const m = line.match(cityRe)
    if (m) {
      if (/india/i.test(line)) return line.length < 80 ? line : `${m[0]}, India`
      return `${m[0]}, India`
    }
  }
  const m = text.match(cityRe)
  return m ? `${m[0]}, India` : 'India'
}

function extractName(lines: string[], email?: string): string {
  for (const line of lines.slice(0, 6)) {
    if (email && line.includes(email)) continue
    if (/@/.test(line)) continue
    if (/https?:\/\//i.test(line)) continue
    if (/linkedin|github|portfolio/i.test(line)) continue
    if (line.length < 3 || line.length > 48) continue
    if (/^(summary|experience|education|skills|projects|certifications)/i.test(line)) continue
    // Prefer lines that look like a person name (2–4 words, mostly letters)
    if (/^[A-Za-z][A-Za-z.'\-\s]{1,46}$/.test(line) && line.split(/\s+/).length <= 4) {
      return line
    }
  }
  return 'Unknown Candidate'
}

function extractTitle(lines: string[], text: string): string {
  for (const role of ROLE_PATTERNS) {
    const re = new RegExp(role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    if (re.test(text)) {
      // Prefer exact casing from ROLE_PATTERNS for consistency
      return role
    }
  }
  // Second line often has title
  for (const line of lines.slice(1, 6)) {
    if (/engineer|architect|consultant|manager|specialist/i.test(line) && line.length < 60) {
      return line
    }
  }
  return 'Professional'
}

function extractSummary(text: string, lines: string[]): string {
  const section = text.match(
    /(?:professional\s+summary|summary|profile|about\s+me)\s*[:\n]+([\s\S]{20,600}?)(?=\n\s*(?:experience|work history|employment|skills|education|certifications|projects)\b)/i,
  )
  if (section?.[1]) {
    return section[1].replace(/\n+/g, ' ').trim().slice(0, 600)
  }
  // Fallback: first long prose-ish line block
  const prose = lines.find((l) => l.length > 80 && !/@/.test(l))
  return prose?.slice(0, 400) ?? ''
}

function extractSkills(text: string): { skills: string[]; buckets: SkillBucket[] } {
  const found = new Map<string, SkillCategory>()
  for (const entry of SKILL_LEXICON) {
    if (entry.patterns.some((p) => p.test(text))) {
      found.set(entry.name, entry.category)
    }
  }

  // Skills section free-form tokens
  const skillsSection = text.match(
    /(?:technical\s+skills|core\s+skills|skills)\s*[:\n]+([\s\S]{10,800}?)(?=\n\s*(?:experience|education|certifications|projects|work history)\b)/i,
  )
  if (skillsSection?.[1]) {
    const tokens = skillsSection[1]
      .split(/[,|•·\n/]/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && t.length <= 40)
    for (const token of tokens) {
      const hit = SKILL_LEXICON.find((e) =>
        e.patterns.some((p) => p.test(token)) || e.name.toLowerCase() === token.toLowerCase(),
      )
      if (hit && !found.has(hit.name)) found.set(hit.name, hit.category)
    }
  }

  const skills = [...found.keys()].sort((a, b) => a.localeCompare(b))
  const labels: Record<SkillCategory, string> = {
    technical: 'Technical',
    cloud: 'Cloud',
    networking: 'Networking / data center',
    programming: 'Programming / automation',
    presales: 'Pre-sales / solutions',
    other: 'Other',
  }
  const byCat = new Map<SkillCategory, string[]>()
  for (const [name, cat] of found) {
    const list = byCat.get(cat) ?? []
    list.push(name)
    byCat.set(cat, list)
  }
  const buckets: SkillBucket[] = [...byCat.entries()].map(([category, list]) => ({
    category,
    label: labels[category],
    skills: list.sort((a, b) => a.localeCompare(b)),
  }))

  return { skills, buckets }
}

function extractCertifications(text: string): string[] {
  const certs = new Set<string>()
  for (const c of CERT_PATTERNS) {
    if (c.pattern.test(text)) certs.add(c.name)
  }
  const section = text.match(
    /(?:certifications?|licenses?)\s*[:\n]+([\s\S]{5,500}?)(?=\n\s*(?:experience|education|skills|projects|work history)\b)/i,
  )
  if (section?.[1]) {
    for (const line of section[1].split(/\n|•|,/).map((l) => l.trim()).filter(Boolean)) {
      if (line.length > 3 && line.length < 80) {
        // Only keep if looks like a cert (or already matched)
        if (/certified|aws|azure|ccn|cka|pmp|togaf|associate|professional/i.test(line)) {
          const known = CERT_PATTERNS.find((c) => c.pattern.test(line))
          certs.add(known?.name ?? line)
        }
      }
    }
  }
  return [...certs]
}

function extractYears(text: string): number {
  const explicit = text.match(
    /(\d{1,2})\+?\s*(?:\+)?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/i,
  )
  if (explicit) return Math.min(40, parseInt(explicit[1], 10))

  // Infer from date ranges like 2016 – 2020
  const ranges = [...text.matchAll(/\b(20\d{2}|19\d{2})\s*[-–—to]+\s*(20\d{2}|Present|Current|Now)\b/gi)]
  if (ranges.length) {
    let total = 0
    for (const r of ranges) {
      const start = parseInt(r[1], 10)
      const end = /present|current|now/i.test(r[2]) ? new Date().getFullYear() : parseInt(r[2], 10)
      if (end >= start) total += end - start
    }
    // Rough de-dupe for overlapping jobs — cap
    return Math.min(40, Math.max(1, Math.round(total * 0.7)))
  }
  return 0
}

function extractTargetRoles(text: string, title: string): string[] {
  const roles = new Set<string>()
  if (title && title !== 'Professional' && title !== 'Unknown Candidate') roles.add(title)
  for (const role of ROLE_PATTERNS) {
    const re = new RegExp(role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    if (re.test(text)) roles.add(role)
  }
  return [...roles].slice(0, 8)
}

function extractSeniority(text: string): string[] {
  return SENIORITY_PATTERNS.filter((s) => s.re.test(text)).map((s) => s.label)
}

function extractIndustries(text: string): string[] {
  return INDUSTRY_PATTERNS.filter((i) => i.re.test(text)).map((i) => i.name)
}

function extractExperience(text: string): WorkExperience[] {
  const section = text.match(
    /(?:work\s+experience|professional\s+experience|experience|employment\s+history)\s*[:\n]+([\s\S]+?)(?=\n\s*(?:education|certifications?|skills|projects|awards)\b|$)/i,
  )
  const block = section?.[1] ?? ''
  if (!block.trim()) return []

  const chunks = block.split(
    /\n(?=(?:[A-Z][A-Za-z0-9 /&+.,-]{2,60})\s*(?:[-–—@|]\s*)?(?:[A-Z][A-Za-z0-9 &.,-]{2,40})?\s*(?:\n|\s+)(?:20\d{2}|19\d{2}))/,
  )

  const experiences: WorkExperience[] = []
  const jobHeader =
    /^(.+?)\s*(?:[-–—@|]|at)\s*(.+?)(?:\s*[|,·]\s*(.+))?$/i
  const dateLine =
    /\b((?:20\d{2}|19\d{2})(?:\s*[-–—to]+\s*(?:20\d{2}|Present|Current|Now))?)\b/i

  for (const chunk of chunks) {
    const ls = linesOf(chunk)
    if (ls.length === 0) continue
    const header = ls[0]
    let title = ''
    let company = ''
    let location: string | undefined
    let startDate: string | undefined
    let endDate: string | undefined
    let current = false

    // Pattern: Title – Company | Location
    const hm = header.match(
      /^(.{3,50}?)\s*[-–—|@]\s*(.{2,50}?)(?:\s*[|,·]\s*(.+))?$/,
    )
    if (hm) {
      title = hm[1].trim()
      company = hm[2].trim()
      location = hm[3]?.trim()
    } else if (jobHeader.test(header)) {
      const m = header.match(jobHeader)
      if (m) {
        title = m[1].trim()
        company = m[2].trim()
      }
    } else if (/engineer|architect|consultant|manager/i.test(header)) {
      title = header
      if (ls[1] && !dateLine.test(ls[1]) && ls[1].length < 60) company = ls[1]
    } else {
      continue
    }

    const dateMatch = chunk.match(
      /\b(20\d{2}|19\d{2})\s*[-–—to]+\s*(20\d{2}|Present|Current|Now)\b/i,
    )
    if (dateMatch) {
      startDate = dateMatch[1]
      endDate = dateMatch[2]
      current = /present|current|now/i.test(dateMatch[2])
    }

    const bullets = ls
      .slice(1)
      .filter((l) => /^[•\-\u2022*]|\b(led|built|designed|owned|delivered|drove|partnered)/i.test(l) || l.length > 40)
      .map((l) => l.replace(/^[•\-\u2022*]\s*/, '').trim())
      .filter((l) => l.length > 15 && !dateLine.test(l))
      .slice(0, 8)

    if (title) {
      experiences.push({
        title,
        company: company || '—',
        location,
        startDate,
        endDate,
        current,
        bullets,
      })
    }
  }

  return experiences.slice(0, 8)
}

function extractEducation(text: string): EducationItem[] {
  const section = text.match(
    /(?:education|academic)\s*[:\n]+([\s\S]{5,600}?)(?=\n\s*(?:experience|certifications?|skills|projects|work history)\b|$)/i,
  )
  if (!section?.[1]) {
    // Inline degree mentions
    const m = text.match(
      /\b(B\.?Tech|B\.?E\.?|M\.?Tech|M\.?S\.?|MBA|Bachelor|Master)[^.\n]{0,80}/i,
    )
    if (m) return [{ degree: m[0].trim(), school: '' }]
    return []
  }
  const items: EducationItem[] = []
  for (const line of linesOf(section[1]).slice(0, 6)) {
    const year = line.match(/\b(19|20)\d{2}\b/)?.[0]
    const degreeMatch = line.match(
      /\b(B\.?Tech|B\.?E\.?|M\.?Tech|M\.?S\.?|MBA|Bachelor(?:'s)?|Master(?:'s)?)[^,|]*/i,
    )
    const parts = line.split(/[-–—,|@]/).map((p) => p.trim())
    items.push({
      degree: degreeMatch?.[0]?.trim() || parts[0] || line,
      school: parts.find((p) => /university|college|institute|iit|nit|bits/i.test(p)) ?? parts[1] ?? '',
      year,
    })
  }
  return items.slice(0, 4)
}

function extractProjects(text: string): ProjectItem[] {
  const section = text.match(
    /(?:projects?|key projects)\s*[:\n]+([\s\S]{10,800}?)(?=\n\s*(?:experience|education|certifications?|skills|awards)\b|$)/i,
  )
  if (!section?.[1]) return []
  const items: ProjectItem[] = []
  for (const chunk of section[1].split(/\n(?=[A-Z])/).slice(0, 5)) {
    const ls = linesOf(chunk)
    if (!ls[0]) continue
    const name = ls[0].replace(/^[-•*]\s*/, '').slice(0, 80)
    const description = ls.slice(1).join(' ').slice(0, 300) || ls[0]
    const technologies = SKILL_LEXICON.filter((e) =>
      e.patterns.some((p) => p.test(chunk)),
    ).map((e) => e.name)
    items.push({ name, description, technologies })
  }
  return items
}

function extractAchievements(text: string, experience: WorkExperience[]): { text: string }[] {
  const fromSection = text.match(
    /(?:achievements?|awards?|highlights?)\s*[:\n]+([\s\S]{10,500}?)(?=\n\s*(?:experience|education|skills|projects)\b|$)/i,
  )
  const items: string[] = []
  if (fromSection?.[1]) {
    for (const line of linesOf(fromSection[1]).slice(0, 6)) {
      items.push(line.replace(/^[-•*]\s*/, ''))
    }
  }
  // Metric-like bullets from experience
  for (const exp of experience) {
    for (const b of exp.bullets) {
      if (/\d+%|\$|₹|pipeline|quota|won|closed|reduced|increased/i.test(b)) {
        items.push(b)
      }
    }
  }
  return [...new Set(items)].slice(0, 8).map((text) => ({ text }))
}

function sectionHits(text: string): string[] {
  const names = [
    'summary',
    'experience',
    'skills',
    'education',
    'certifications',
    'projects',
    'achievements',
  ]
  return names.filter((n) => new RegExp(`\\b${n}\\b`, 'i').test(text))
}

export function analyzeAts(skills: string[], text: string): AtsAnalysis {
  const lowerSkills = new Set(skills.map((s) => s.toLowerCase()))
  const found: string[] = []
  const missing: string[] = []
  for (const kw of ATS_KEYWORDS) {
    const inSkills = lowerSkills.has(kw.toLowerCase())
    const inText = new RegExp(
      kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'),
      'i',
    ).test(text)
    if (inSkills || inText) found.push(kw)
    else missing.push(kw)
  }
  const score = Math.round((found.length / ATS_KEYWORDS.length) * 100)
  return {
    score,
    found,
    missing,
    totalChecked: ATS_KEYWORDS.length,
    label: 'ATS keyword coverage (estimate · Solutions Engineer lexicon)',
  }
}

export function parseResumeText(raw: string): StructuredResumeProfile {
  const text = normalizeText(raw)
  const lines = linesOf(text)
  const parseNotes: string[] = []

  if (text.length < 40) {
    parseNotes.push('Resume text is very short — extraction may be incomplete.')
  }

  const email = extractEmail(text)
  const phone = extractPhone(text)
  const name = extractName(lines, email)
  const title = extractTitle(lines, text)
  const location = extractLocation(text, lines)
  const summary = extractSummary(text, lines)
  const { skills, buckets } = extractSkills(text)
  const certifications = extractCertifications(text)
  const yearsExperience = extractYears(text)
  const targetRoles = extractTargetRoles(text, title)
  const seniorityHints = extractSeniority(text)
  const industries = extractIndustries(text)
  const experience = extractExperience(text)
  const education = extractEducation(text)
  const projects = extractProjects(text)
  const achievements = extractAchievements(text, experience)
  const rawSectionHits = sectionHits(text)

  if (!summary) parseNotes.push('No summary section detected.')
  if (experience.length === 0) {
    parseNotes.push(
      'Could not parse structured work history — only skills/certs from free text were extracted. Reformat with clear Experience headers for better results.',
    )
  }
  if (skills.length === 0) parseNotes.push('No known skills matched the lexicon.')
  parseNotes.push(
    'Rule-based local parser only — no facts invented. Unsupported claims are omitted, not guessed.',
  )

  return {
    name,
    title,
    email,
    phone,
    location,
    yearsExperience,
    summary,
    targetRoles,
    seniorityHints,
    skills,
    skillBuckets: buckets,
    certifications,
    education,
    experience,
    projects,
    achievements,
    industries,
    rawSectionHits,
    parseNotes,
  }
}

export function profileToCandidate(profile: StructuredResumeProfile) {
  return {
    name: profile.name,
    title: profile.title,
    location: profile.location,
    yearsExperience: profile.yearsExperience,
    summary: profile.summary,
    skills: profile.skills,
    certifications: profile.certifications,
    targetRoles: profile.targetRoles,
  }
}
