import type {
  CandidateProfile,
  Job,
  JobMatchResult,
  MatchDimension,
  MatchDimensionId,
  StructuredResumeProfile,
} from '../../types'
import { matchesP1Role, ROLE_KEYWORDS, ROLE_KEYWORDS_P1 } from '../jobs/roles'
import { ATS_KEYWORDS, INDUSTRY_PATTERNS, SKILL_LEXICON } from '../resume/skillLexicon'

const DISCLAIMER =
  'AI estimate only — not a scientific guarantee. Based on your resume facts vs this posting; no experience is invented.'

/** Dimension weights sum to 100 */
export const MATCH_WEIGHTS: Record<MatchDimensionId, number> = {
  experience: 18,
  skills: 28,
  role: 18,
  industry: 8,
  location: 10,
  certs: 8,
  ats: 10,
}

export type MatchInputProfile = CandidateProfile & {
  /** Optional richer fields from structured resume parse */
  experienceTitles?: string[]
  industries?: string[]
  seniorityHints?: string[]
  rawTextHints?: string
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)))
}

function jobCorpus(job: Job): string {
  return [
    job.title,
    job.summary,
    job.description ?? '',
    job.mustHave.join(' '),
    job.niceToHave.join(' '),
    job.tags.join(' '),
    job.company,
  ]
    .join(' ')
    .toLowerCase()
}

function extractJdSkills(job: Job, corpus: string): string[] {
  const fromMust = job.mustHave
  const fromNice = job.niceToHave
  const fromLexicon = SKILL_LEXICON.filter((e) =>
    e.patterns.some((p) => p.test(corpus)),
  ).map((e) => e.name)
  const fromTags = job.tags.filter((t) => t.length > 1 && t.length < 40)
  const all = [...fromMust, ...fromNice, ...fromLexicon, ...fromTags]
  const seen = new Set<string>()
  const out: string[] = []
  for (const s of all) {
    const k = s.toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      out.push(s)
    }
  }
  return out
}

function profileSkillSet(profile: MatchInputProfile): Set<string> {
  return new Set(profile.skills.map((s) => s.toLowerCase()))
}

function skillInProfile(skill: string, skills: Set<string>, profileText: string): boolean {
  const k = skill.toLowerCase()
  if (skills.has(k)) return true
  // partial / alias
  for (const s of skills) {
    if (s.includes(k) || k.includes(s)) return true
  }
  if (k.length >= 3 && profileText.includes(k)) return true
  return false
}

function scoreExperience(job: Job, profile: MatchInputProfile, corpus: string): MatchDimension {
  const weight = MATCH_WEIGHTS.experience
  const details: string[] = []
  let score = 50

  const years = profile.yearsExperience || 0
  // Parse required years from JD if present
  const yrReq = corpus.match(/(\d+)\+?\s*(?:years?|yrs?)/i)
  const required = yrReq ? parseInt(yrReq[1], 10) : null

  if (required != null) {
    if (years >= required) {
      score = 92
      details.push(`Your ${years} years meets stated ~${required}+ requirement.`)
    } else if (years >= required - 1) {
      score = 72
      details.push(`Your ${years} years is close to ~${required}+ stated in the posting.`)
    } else if (years > 0) {
      score = 45
      details.push(`Posting hints ~${required}+ years; profile shows ${years}.`)
    } else {
      score = 40
      details.push(`Posting hints ~${required}+ years; years not clearly on resume.`)
    }
  } else if (years >= 8) {
    score = 85
    details.push(`${years} years experience — solid for senior solutions roles.`)
  } else if (years >= 5) {
    score = 75
    details.push(`${years} years experience.`)
  } else if (years >= 2) {
    score = 60
    details.push(`${years} years experience — mid-level band.`)
  } else {
    score = 45
    details.push('Years of experience not clearly detected on resume.')
  }

  // Seniority alignment
  const title = job.title.toLowerCase()
  const seniorJob = /\b(senior|sr\.?|lead|principal|staff)\b/.test(title)
  const juniorJob = /\b(junior|jr\.?|associate|intern)\b/.test(title)
  const seniorProfile =
    years >= 7 ||
    (profile.seniorityHints ?? []).some((s) => /senior|lead|principal|staff/i.test(s)) ||
    /senior|lead|principal/i.test(profile.title)

  if (seniorJob && seniorProfile) {
    score = clamp(score + 8)
    details.push('Seniority language aligns (senior/lead role vs profile).')
  } else if (seniorJob && years > 0 && years < 5) {
    score = clamp(score - 12)
    details.push('Senior role title vs fewer years on profile — may be a stretch.')
  } else if (juniorJob && seniorProfile) {
    score = clamp(score - 5)
    details.push('Role looks more junior than your profile seniority.')
  }

  // Past titles overlap
  const expTitles = (profile.experienceTitles ?? []).map((t) => t.toLowerCase())
  if (expTitles.some((t) => ROLE_KEYWORDS.some((k) => t.includes(k)))) {
    score = clamp(score + 5)
    details.push('Prior role titles include solutions / pre-sales style positions.')
  }

  return {
    id: 'experience',
    label: 'Experience match',
    weight,
    score: clamp(score),
    weighted: 0,
    summary:
      required != null
        ? `Experience vs ~${required}+ yrs signal`
        : `Experience depth (${years || '?'} yrs)`,
    details,
  }
}

function scoreSkills(
  job: Job,
  profile: MatchInputProfile,
  corpus: string,
  profileText: string,
): { dim: MatchDimension; matched: string[]; missing: string[] } {
  const weight = MATCH_WEIGHTS.skills
  const skills = profileSkillSet(profile)
  const jdSkills = extractJdSkills(job, corpus)
  const must = job.mustHave.length ? job.mustHave : jdSkills.slice(0, 8)

  const matched: string[] = []
  const missing: string[] = []
  for (const s of must) {
    if (skillInProfile(s, skills, profileText)) matched.push(s)
    else missing.push(s)
  }

  // Profile skills that appear in JD even if not in mustHave
  for (const s of profile.skills) {
    if (corpus.includes(s.toLowerCase()) && !matched.some((m) => m.toLowerCase() === s.toLowerCase())) {
      matched.push(s)
    }
  }

  const mustCoverage = must.length ? matched.filter((m) =>
    must.some((x) => x.toLowerCase() === m.toLowerCase()),
  ).length / must.length : 0.5

  // Nice-to-have bonus
  let niceHits = 0
  for (const n of job.niceToHave) {
    if (skillInProfile(n, skills, profileText)) niceHits++
  }
  const niceBonus = job.niceToHave.length
    ? (niceHits / job.niceToHave.length) * 10
    : 0

  const score = clamp(mustCoverage * 88 + niceBonus + (matched.length > must.length ? 4 : 0))

  const details = [
    `Must-have / extracted skills covered: ${Math.round(mustCoverage * 100)}% (${matched.filter((m) => must.some((x) => x.toLowerCase() === m.toLowerCase())).length}/${must.length || 0}).`,
  ]
  if (matched.length) details.push(`Matched: ${matched.slice(0, 8).join(', ')}.`)
  if (missing.length) details.push(`Missing: ${missing.slice(0, 6).join(', ')}.`)
  if (niceHits) details.push(`Nice-to-have hits: ${niceHits}.`)

  return {
    matched: [...new Set(matched)].slice(0, 12),
    missing: [...new Set(missing)].slice(0, 10),
    dim: {
      id: 'skills',
      label: 'Technical skill match',
      weight,
      score,
      weighted: 0,
      summary: `${Math.round(mustCoverage * 100)}% of key skills covered`,
      details,
    },
  }
}

function scoreRole(job: Job, profile: MatchInputProfile): MatchDimension {
  const weight = MATCH_WEIGHTS.role
  const title = job.title.toLowerCase()
  const corpus = `${job.title} ${job.summary} ${job.description ?? ''}`.toLowerCase()
  const details: string[] = []
  let score = 40

  // P1 boost: AI Ops / Agentic Ops (Fabrix domain)
  if (matchesP1Role(job.title, job.summary + ' ' + (job.description ?? ''))) {
    score = 92
    details.push('P1 domain match: AI Ops / Agentic Ops / LLM / agent platform vocabulary.')
  } else {
    const roleInTitle = ROLE_KEYWORDS.filter((k) => title.includes(k))
    if (roleInTitle.length) {
      score = 78
      details.push(`Title matches career vocabulary: “${roleInTitle[0]}” (P2 if solutions/cloud).`)
    }
  }

  // Extra P1 skill signals in JD even if title is generic
  const p1SkillHits = ROLE_KEYWORDS_P1.filter((k) => corpus.includes(k)).length
  if (p1SkillHits >= 2 && score < 90) {
    score = clamp(score + 12)
    details.push('JD emphasizes AI/agent/LLM ops themes aligned to P1 Fabrix domain.')
  }

  const targetHits = profile.targetRoles.filter(
    (r) => title.includes(r.toLowerCase()) || r.toLowerCase().includes(title.slice(0, 12)),
  )
  if (targetHits.length) {
    score = clamp(score + 12)
    details.push(`Aligns with your target role: ${targetHits[0]}.`)
  }

  const profileTitle = profile.title.toLowerCase()
  const jobTokens = title.split(/[^a-z0-9]+/).filter((t) => t.length > 2)
  const profTokens = new Set(profileTitle.split(/[^a-z0-9]+/).filter((t) => t.length > 2))
  const overlap = jobTokens.filter((t) => profTokens.has(t)).length
  if (overlap >= 2) {
    score = clamp(score + 10)
    details.push(`Title token overlap with your headline (${overlap} tokens).`)
  } else if (overlap === 1) {
    score = clamp(score + 4)
  }

  // Profile headline already AI Ops / Agentic
  if (/ai\s*ops|agentic|llm\s*ops/i.test(profileTitle) && matchesP1Role(job.title, corpus)) {
    score = clamp(score + 6)
    details.push('Your headline and role both sit in AI Ops / Agentic Ops (P1).')
  }

  if (score < 50) {
    details.push('Limited alignment to P1 AI Ops or P2 solutions vocabulary.')
  }

  return {
    id: 'role',
    label: 'Role / title match',
    weight,
    score: clamp(score),
    weighted: 0,
    summary:
      score >= 85
        ? 'Strong P1 / target-role alignment'
        : score >= 70
          ? 'Good title alignment'
          : 'Partial title alignment',
    details: details.length ? details : ['Limited title signals.'],
  }
}

function scoreIndustry(_job: Job, profile: MatchInputProfile, corpus: string): MatchDimension {
  const weight = MATCH_WEIGHTS.industry
  const details: string[] = []
  let score = 55

  const jdIndustries = INDUSTRY_PATTERNS.filter((i) => i.re.test(corpus)).map((i) => i.name)
  const profileIndustries = profile.industries ?? []
  const profileText = `${profile.summary} ${profile.skills.join(' ')} ${profileIndustries.join(' ')}`.toLowerCase()

  const hits = jdIndustries.filter((ind) =>
    profileIndustries.some((p) => p.toLowerCase() === ind.toLowerCase()) ||
    profileText.includes(ind.toLowerCase().slice(0, 8)),
  )

  if (jdIndustries.length === 0) {
    score = 60
    details.push('No strong industry signals in posting — neutral score.')
  } else if (hits.length) {
    score = 88
    details.push(`Domain overlap: ${hits.join(', ')}.`)
  } else {
    score = 48
    details.push(`Posting domains (${jdIndustries.join(', ')}) not clearly on resume.`)
  }

  // Cloud / SaaS / networking soft boosts if skills imply domain
  if (/\b(cloud|saas|network|telecom|security)\b/i.test(corpus)) {
    const skillHit = profile.skills.some((s) =>
      /aws|azure|network|security|kubernetes|pre-sales/i.test(s),
    )
    if (skillHit) {
      score = clamp(score + 8)
      details.push('Cloud/networking domain skills support this posting.')
    }
  }

  return {
    id: 'industry',
    label: 'Industry / domain match',
    weight,
    score: clamp(score),
    weighted: 0,
    summary: hits.length ? 'Domain overlap found' : 'Limited domain signals',
    details,
  }
}

function scoreLocation(job: Job, profile: MatchInputProfile): MatchDimension {
  const weight = MATCH_WEIGHTS.location
  const details: string[] = []
  const loc = (profile.location || '').toLowerCase()
  const inBlr = /bangalore|bengaluru|blr/.test(loc)
  const inHyd = /hyderabad|secunderabad|hyd/.test(loc)
  const inIndia = /india/.test(loc) || inBlr || inHyd

  let score = 50

  switch (job.city) {
    case 'Bangalore':
      if (inBlr) {
        score = 96
        details.push('You are based in Bangalore — excellent geo fit.')
      } else if (inHyd) {
        score = 62
        details.push('Hyderabad-based vs Bangalore role — relocation or hybrid may be needed.')
      } else if (inIndia) {
        score = 70
        details.push('India-based vs Bangalore role — feasible with relocation/hybrid.')
      } else {
        score = 45
        details.push('Profile location unclear vs Bangalore role.')
      }
      break
    case 'Hyderabad':
      if (inHyd) {
        score = 96
        details.push('You are based in Hyderabad — excellent geo fit.')
      } else if (inBlr) {
        score = 62
        details.push('Bangalore-based vs Hyderabad role — relocation or hybrid may be needed.')
      } else if (inIndia) {
        score = 70
        details.push('India-based vs Hyderabad role.')
      } else {
        score = 45
        details.push('Profile location unclear vs Hyderabad role.')
      }
      break
    case 'India Remote':
      score = inIndia || job.workMode === 'remote' ? 90 : 75
      details.push(
        job.workMode === 'remote'
          ? 'Remote / India-remote role — strong flexibility.'
          : 'India Remote label — good if you can work remotely.',
      )
      break
    default:
      score = inIndia ? 55 : 40
      details.push(`Other India / ${job.location} — secondary to BLR/HYD focus.`)
  }

  if (job.workMode === 'remote') {
    score = clamp(Math.max(score, 82))
    details.push('Work mode: remote.')
  } else if (job.workMode === 'hybrid') {
    details.push('Work mode: hybrid.')
  } else {
    details.push('Work mode: onsite.')
    if ((job.city === 'Bangalore' && !inBlr) || (job.city === 'Hyderabad' && !inHyd)) {
      score = clamp(score - 8)
    }
  }

  return {
    id: 'location',
    label: 'Location match',
    weight,
    score: clamp(score),
    weighted: 0,
    summary: `${job.city} · ${job.workMode}`,
    details,
  }
}

function scoreCerts(_job: Job, profile: MatchInputProfile, corpus: string): MatchDimension {
  const weight = MATCH_WEIGHTS.certs
  const details: string[] = []
  const certs = profile.certifications ?? []
  let score = 50

  if (!certs.length) {
    score = 45
    details.push('No certifications detected on resume.')
  } else {
    const hits = certs.filter((c) => {
      const key = c.toLowerCase().replace(/certified|–|-/g, ' ').trim()
      const short = key.slice(0, 16)
      return corpus.includes(short) || corpus.includes(c.toLowerCase().slice(0, 10))
    })
    // Also check if cert family is valued (AWS, CCNA) even if not named in JD
    const valued = certs.filter((c) => /aws|azure|ccna|ccnp|cka|togaf|pmp/i.test(c))
    if (hits.length) {
      score = 92
      details.push(`Certifications mentioned or relevant to JD: ${hits.join(', ')}.`)
    } else if (valued.length && /aws|azure|cloud|network|architect/i.test(corpus)) {
      score = 78
      details.push(`Relevant certs on profile (${valued.join(', ')}) for this domain.`)
    } else {
      score = 58
      details.push(`Certs on profile: ${certs.join(', ')} — not explicitly required in JD.`)
    }
  }

  return {
    id: 'certs',
    label: 'Education / certification match',
    weight,
    score: clamp(score),
    weighted: 0,
    summary: certs.length ? `${certs.length} cert(s) on profile` : 'No certs detected',
    details,
  }
}

function scoreAts(
  profile: MatchInputProfile,
  corpus: string,
  profileText: string,
): { dim: MatchDimension; found: string[]; missing: string[]; percent: number } {
  const weight = MATCH_WEIGHTS.ats
  const skills = profileSkillSet(profile)
  // Keywords that matter for THIS job: intersection of ATS lexicon and JD corpus, else full ATS set filtered by JD
  const jdRelevant = ATS_KEYWORDS.filter((kw) => {
    const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'), 'i')
    return re.test(corpus)
  })
  const checklist = jdRelevant.length >= 4 ? jdRelevant : ATS_KEYWORDS

  const found: string[] = []
  const missing: string[] = []
  for (const kw of checklist) {
    if (skillInProfile(kw, skills, profileText)) found.push(kw)
    else missing.push(kw)
  }

  const percent = checklist.length ? Math.round((found.length / checklist.length) * 100) : 50
  const score = clamp(percent)

  return {
    found,
    missing,
    percent,
    dim: {
      id: 'ats',
      label: 'Keyword / ATS coverage',
      weight,
      score,
      weighted: 0,
      summary: `${found.length}/${checklist.length} keywords (${percent}%)`,
      details: [
        `Checklist: ${jdRelevant.length >= 4 ? 'JD-weighted ATS terms' : 'Solutions Engineer ATS lexicon'}.`,
        found.length ? `Present: ${found.slice(0, 8).join(', ')}.` : 'Few ATS keywords from checklist on resume.',
        missing.length ? `Absent: ${missing.slice(0, 6).join(', ')}.` : 'Strong keyword coverage.',
      ],
    },
  }
}

function labelFor(score: number): JobMatchResult['label'] {
  if (score >= 85) return 'strong'
  if (score >= 70) return 'good'
  if (score >= 55) return 'fair'
  return 'weak'
}

export function buildMatchProfile(
  candidate: CandidateProfile,
  structured?: StructuredResumeProfile | null,
): MatchInputProfile {
  if (!structured) return { ...candidate }
  return {
    ...candidate,
    name: structured.name || candidate.name,
    title: structured.title || candidate.title,
    location: structured.location || candidate.location,
    yearsExperience: structured.yearsExperience || candidate.yearsExperience,
    summary: structured.summary || candidate.summary,
    skills: structured.skills.length ? structured.skills : candidate.skills,
    certifications: structured.certifications.length
      ? structured.certifications
      : candidate.certifications,
    targetRoles: structured.targetRoles.length ? structured.targetRoles : candidate.targetRoles,
    experienceTitles: structured.experience.map((e) => e.title),
    industries: structured.industries,
    seniorityHints: structured.seniorityHints,
    rawTextHints: [
      structured.summary,
      ...structured.experience.flatMap((e) => e.bullets),
      ...structured.projects.map((p) => p.description),
    ].join(' '),
  }
}

/**
 * Explainable 0–100 match. Free local rules — no paid AI.
 * Does not invent candidate experience; only compares stated profile facts to JD text.
 */
export function matchJob(job: Job, profile: MatchInputProfile): JobMatchResult {
  const corpus = jobCorpus(job)
  const profileText = [
    profile.summary,
    profile.skills.join(' '),
    profile.certifications.join(' '),
    profile.title,
    profile.targetRoles.join(' '),
    profile.rawTextHints ?? '',
    (profile.experienceTitles ?? []).join(' '),
  ]
    .join(' ')
    .toLowerCase()

  const experience = scoreExperience(job, profile, corpus)
  const skillsPack = scoreSkills(job, profile, corpus, profileText)
  const role = scoreRole(job, profile)
  const industry = scoreIndustry(job, profile, corpus)
  const location = scoreLocation(job, profile)
  const certs = scoreCerts(job, profile, corpus)
  const atsPack = scoreAts(profile, corpus, profileText)

  const dimensions: MatchDimension[] = [
    experience,
    skillsPack.dim,
    role,
    industry,
    location,
    certs,
    atsPack.dim,
  ].map((d) => ({
    ...d,
    weighted: Math.round((d.weight * d.score) / 1000) * 10 / 10, // one decimal via weight*score/100
  }))

  // Fix weighted properly
  for (const d of dimensions) {
    d.weighted = Math.round(((d.weight * d.score) / 100) * 10) / 10
  }

  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0)
  const raw =
    dimensions.reduce((s, d) => s + d.weight * d.score, 0) / (totalWeight || 100)
  const score = clamp(raw)

  const strengths: string[] = []
  const gaps: string[] = []
  for (const d of dimensions) {
    if (d.score >= 75) strengths.push(`${d.label}: ${d.summary}`)
    if (d.score < 55) gaps.push(`${d.label}: ${d.summary}`)
  }
  for (const m of skillsPack.matched.slice(0, 5)) {
    strengths.push(`Skill: ${m}`)
  }
  for (const m of skillsPack.missing.slice(0, 5)) {
    gaps.push(`Missing skill: ${m}`)
  }

  return {
    jobId: job.id,
    score,
    label: labelFor(score),
    disclaimer: DISCLAIMER,
    dimensions,
    strengths: [...new Set(strengths)].slice(0, 8),
    gaps: [...new Set(gaps)].slice(0, 8),
    matchedSkills: skillsPack.matched,
    missingSkills: skillsPack.missing,
    keywordCoverage: {
      found: atsPack.found,
      missing: atsPack.missing,
      percent: atsPack.percent,
    },
    computedAt: new Date().toISOString(),
  }
}

export function applyMatchEngine(jobs: Job[], profile: MatchInputProfile): Job[] {
  return jobs.map((job) => {
    const result = matchJob(job, profile)
    return {
      ...job,
      matchScore: result.score,
      matchScoreKind: 'engine',
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      match: result,
    }
  })
}

export function rankJobs(jobs: Job[], profile: MatchInputProfile): Job[] {
  return applyMatchEngine(jobs, profile).sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
    // Prefer BLR/HYD
    const cityRank = (c: string) =>
      c === 'Bangalore' ? 0 : c === 'Hyderabad' ? 1 : c === 'India Remote' ? 2 : 3
    const cr = cityRank(a.city) - cityRank(b.city)
    if (cr !== 0) return cr
    return b.postedAt.localeCompare(a.postedAt)
  })
}
