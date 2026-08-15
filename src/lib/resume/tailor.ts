import type {
  AtsAnalysis,
  Job,
  StructuredResumeProfile,
  TailoredExperience,
  TailoredResume,
  TailoredResumeContent,
  WorkExperience,
} from '../../types'
import { analyzeAts } from './parseResume'
import { SKILL_LEXICON } from './skillLexicon'

function uid() {
  return `tr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function jobCorpus(job: Job): string {
  return [
    job.title,
    job.summary,
    job.description ?? '',
    job.mustHave.join(' '),
    job.niceToHave.join(' '),
    job.tags.join(' '),
  ]
    .join(' ')
    .toLowerCase()
}

function extractJdKeywords(job: Job): string[] {
  const corpus = jobCorpus(job)
  const fromLexicon = SKILL_LEXICON.filter((e) =>
    e.patterns.some((p) => p.test(corpus)),
  ).map((e) => e.name)
  const fromLists = [...job.mustHave, ...job.niceToHave, ...job.tags]
  const titleBits = job.title
    .split(/[^A-Za-z0-9+.#/]+/)
    .filter((t) => t.length > 2 && t.length < 30)
  const all = [...fromLists, ...fromLexicon, ...titleBits]
  const seen = new Set<string>()
  const out: string[] = []
  for (const s of all) {
    const k = s.toLowerCase()
    if (!seen.has(k) && s.trim()) {
      seen.add(k)
      out.push(s.trim())
    }
  }
  return out
}

function scoreTextRelevance(text: string, keywords: string[]): number {
  const lower = text.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) score += 1
  }
  return score
}

/**
 * Reorder / lightly rephrase a bullet using only words already present.
 * Never adds employers, metrics, or skills not in the original bullet or master skills list.
 */
function rewriteBullet(
  bullet: string,
  supportedKeywords: string[],
  masterSkills: Set<string>,
): string {
  let text = bullet.replace(/^[•\-\u2022*]\s*/, '').trim()
  if (!text) return text

  // Prefer bullets that already hit keywords — prepend a relevance-leading clause
  // only by reordering existing clauses, not inventing new claims.
  const clauses = text.split(/;\s+|,\s+(?=[A-Z])/).map((c) => c.trim()).filter(Boolean)
  if (clauses.length > 1) {
    clauses.sort((a, b) => {
      const sa = scoreTextRelevance(a, supportedKeywords)
      const sb = scoreTextRelevance(b, supportedKeywords)
      return sb - sa
    })
    text = clauses.join('; ')
  }

  // If bullet mentions a master skill that JD cares about, ensure natural casing of known skills
  for (const skill of supportedKeywords) {
    if (!masterSkills.has(skill.toLowerCase())) continue
    const re = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (re.test(text)) {
      text = text.replace(re, skill)
    }
  }

  // Ensure starts with capital
  if (text[0]) text = text[0].toUpperCase() + text.slice(1)
  return text
}

function reorderSkills(masterSkills: string[], keywords: string[]): string[] {
  const kw = keywords.map((k) => k.toLowerCase())
  const scored = masterSkills.map((s) => {
    const lower = s.toLowerCase()
    let score = 0
    for (const k of kw) {
      if (lower === k || lower.includes(k) || k.includes(lower)) score += 3
      else if (k.length > 3 && lower.includes(k.slice(0, 4))) score += 1
    }
    return { s, score }
  })
  scored.sort((a, b) => b.score - a.score || a.s.localeCompare(b.s))
  return scored.map((x) => x.s)
}

function tailorSummary(
  profile: StructuredResumeProfile,
  job: Job,
  emphasized: string[],
): string {
  const base =
    profile.summary ||
    `${profile.title} with ${profile.yearsExperience || 'several'} years of experience.`

  // Lead with target role from JD (not inventing new employers — title targeting only)
  const bits: string[] = [
    `Target role: ${job.title} at ${job.company} (${job.city}, ${job.workMode}).`,
    base.replace(/\s+/g, ' ').trim(),
  ]

  // Pull 1 short phrase from JD summary if it overlaps master skills (no new claims)
  const jdSnippet = (job.summary || '').replace(/\s+/g, ' ').trim().slice(0, 160)
  if (jdSnippet && emphasized.some((k) => jdSnippet.toLowerCase().includes(k.toLowerCase()))) {
    bits.push(
      `Relevant to this posting’s focus (“${jdSnippet}${job.summary.length > 160 ? '…' : ''}”) using capabilities already on the master resume.`,
    )
  }

  const masterBlob = `${profile.summary} ${profile.skills.join(' ')} ${profile.experience.map((e) => e.bullets.join(' ')).join(' ')}`
  const supportedInSummary = emphasized.filter((k) =>
    new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(masterBlob),
  )

  if (supportedInSummary.length) {
    const top = supportedInSummary.slice(0, 6).join(', ')
    bits.push(
      `Evidence for this role emphasizes: ${top} — only skills and experience already present on the master resume.`,
    )
  }

  if (
    profile.targetRoles.some((r) =>
      job.title.toLowerCase().includes(r.toLowerCase().slice(0, 10)),
    )
  ) {
    bits.push(`Consistent with stated target direction: ${job.title}.`)
  }

  return bits.join(' ').slice(0, 900)
}

function tailorExperience(
  experience: WorkExperience[],
  keywords: string[],
  supportedKeywords: string[],
  masterSkills: Set<string>,
): TailoredExperience[] {
  const scored = experience.map((exp) => {
    const blob = `${exp.title} ${exp.company} ${exp.bullets.join(' ')}`
    const relevance = scoreTextRelevance(blob, keywords)
    const bullets = [...exp.bullets]
      .map((b) => ({
        b,
        r: scoreTextRelevance(b, keywords),
      }))
      .sort((a, b) => b.r - a.r)
      .map((x) => rewriteBullet(x.b, supportedKeywords, masterSkills))
      .filter(Boolean)
      .slice(0, 6)

    return {
      title: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      bullets,
      relevance,
    }
  })

  scored.sort((a, b) => b.relevance - a.relevance)
  return scored
}

function renderPlainText(content: TailoredResumeContent): string {
  const lines: string[] = []
  lines.push(content.name)
  lines.push(content.title)
  if (content.contactLine) lines.push(content.contactLine)
  lines.push('')
  lines.push('PROFESSIONAL SUMMARY')
  lines.push(content.summary)
  lines.push('')
  lines.push('SKILLS')
  lines.push(content.skills.join(', '))
  lines.push('')
  if (content.certifications.length) {
    lines.push('CERTIFICATIONS')
    content.certifications.forEach((c) => lines.push(`• ${c}`))
    lines.push('')
  }
  lines.push('EXPERIENCE')
  for (const exp of content.experience) {
    const dates =
      exp.startDate || exp.endDate
        ? ` | ${exp.startDate ?? ''}${exp.startDate || exp.endDate ? ' – ' : ''}${exp.current ? 'Present' : (exp.endDate ?? '')}`
        : ''
    lines.push(`${exp.title} – ${exp.company}${exp.location ? ` | ${exp.location}` : ''}${dates}`)
    for (const b of exp.bullets) lines.push(`• ${b}`)
    lines.push('')
  }
  if (content.projects.length) {
    lines.push('PROJECTS')
    for (const p of content.projects) {
      lines.push(p.name)
      lines.push(p.description)
      if (p.technologies.length) lines.push(`Tech: ${p.technologies.join(', ')}`)
      lines.push('')
    }
  }
  if (content.education.length) {
    lines.push('EDUCATION')
    for (const e of content.education) {
      lines.push([e.degree, e.school, e.year].filter(Boolean).join(' | '))
    }
    lines.push('')
  }
  if (content.achievements.length) {
    lines.push('ACHIEVEMENTS')
    content.achievements.forEach((a) => lines.push(`• ${a}`))
    lines.push('')
  }
  if (content.skillGaps.length) {
    lines.push('---')
    lines.push('SKILL GAPS (not added to resume — unsupported by master)')
    content.skillGaps.forEach((g) => lines.push(`• ${g}`))
  }
  return lines.join('\n').trim() + '\n'
}

function analyzeJobAts(
  skills: string[],
  text: string,
  jobKeywords: string[],
): AtsAnalysis {
  // Prefer JD keyword checklist; fall back to generic analyzeAts
  if (jobKeywords.length >= 4) {
    const lowerSkills = new Set(skills.map((s) => s.toLowerCase()))
    const lowerText = text.toLowerCase()
    const found: string[] = []
    const missing: string[] = []
    for (const kw of jobKeywords) {
      const k = kw.toLowerCase()
      if (
        lowerSkills.has(k) ||
        [...lowerSkills].some((s) => s.includes(k) || k.includes(s)) ||
        lowerText.includes(k)
      ) {
        found.push(kw)
      } else {
        missing.push(kw)
      }
    }
    const score = Math.round((found.length / jobKeywords.length) * 100)
    return {
      score,
      found,
      missing,
      totalChecked: jobKeywords.length,
      label: 'ATS coverage vs this job description (estimate)',
    }
  }
  const base = analyzeAts(skills, text)
  return { ...base, label: 'ATS keyword coverage (estimate · Solutions Engineer lexicon)' }
}

/**
 * Build a job-specific tailored resume from master profile only.
 * Unsupported JD requirements become skill gaps — never invented experience.
 */
export function tailorResumeForJob(
  master: StructuredResumeProfile,
  masterRawText: string,
  masterVersionId: string,
  job: Job,
): TailoredResume {
  const jdKeywords = extractJdKeywords(job)
  const masterSkillSet = new Set(master.skills.map((s) => s.toLowerCase()))
  const masterBlob = [
    masterRawText,
    master.summary,
    master.skills.join(' '),
    master.certifications.join(' '),
    ...master.experience.flatMap((e) => [e.title, ...e.bullets]),
    ...master.projects.map((p) => p.description),
  ]
    .join(' ')
    .toLowerCase()

  const supportedKeywords = jdKeywords.filter((kw) => {
    const k = kw.toLowerCase()
    return (
      masterSkillSet.has(k) ||
      [...masterSkillSet].some((s) => s.includes(k) || k.includes(s)) ||
      masterBlob.includes(k)
    )
  })

  const skillGaps = jdKeywords.filter((kw) => !supportedKeywords.some((s) => s.toLowerCase() === kw.toLowerCase()))
  // Prefer must-have gaps first
  const mustGaps = job.mustHave.filter(
    (m) => !supportedKeywords.some((s) => s.toLowerCase() === m.toLowerCase()),
  )
  const gaps = [...new Set([...mustGaps, ...skillGaps])].slice(0, 12)

  const skills = reorderSkills(master.skills, jdKeywords)
  const experience = tailorExperience(
    master.experience,
    jdKeywords,
    supportedKeywords,
    masterSkillSet,
  )

  // Projects: rank by JD relevance, keep as-is (no invention)
  const projects = [...master.projects]
    .map((p) => ({
      ...p,
      r: scoreTextRelevance(`${p.name} ${p.description} ${p.technologies.join(' ')}`, jdKeywords),
    }))
    .sort((a, b) => b.r - a.r)
    .map(({ r: _r, ...p }) => p)

  const summary = tailorSummary(master, job, supportedKeywords)
  const contactLine = [master.email, master.phone, master.location].filter(Boolean).join(' | ')

  const content: TailoredResumeContent = {
    name: master.name,
    title: master.title,
    contactLine,
    summary,
    skills,
    certifications: master.certifications,
    experience,
    education: master.education,
    projects,
    achievements: master.achievements.map((a) => a.text),
    skillGaps: gaps,
    emphasizedKeywords: supportedKeywords.slice(0, 16),
    notes: [
      'Generated by local free tailor — no paid AI.',
      'Only facts from the master resume were used.',
      'Unsupported JD requirements listed as skill gaps, not invented.',
      'Bullets reordered for relevance; skills reordered toward JD keywords.',
    ],
  }

  const plainText = renderPlainText(content)
  const atsBefore = analyzeJobAts(master.skills, masterRawText, jdKeywords)
  const atsAfter = analyzeJobAts(skills, plainText, jdKeywords)

  return {
    id: uid(),
    masterVersionId,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    createdAt: new Date().toISOString(),
    label: `${job.company} — ${job.title}`,
    content,
    plainText,
    atsBefore,
    atsAfter,
    atsDelta: atsAfter.score - atsBefore.score,
  }
}

export function tailoredToHtml(t: TailoredResume): string {
  const c = t.content
  const esc = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')

  const expHtml = c.experience
    .map(
      (e) => `
      <section class="job">
        <h3>${esc(e.title)} — ${esc(e.company)}</h3>
        <p class="meta">${esc([e.location, e.startDate && `${e.startDate} – ${e.current ? 'Present' : e.endDate ?? ''}`].filter(Boolean).join(' · '))}</p>
        <ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      </section>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${esc(c.name)} — ${esc(t.jobTitle)}</title>
<style>
  body { font-family: Inter, system-ui, sans-serif; max-width: 720px; margin: 2rem auto; color: #111; line-height: 1.45; padding: 0 1rem; }
  h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
  h2 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; margin-top: 1.25rem; }
  h3 { font-size: 1rem; margin: 0.75rem 0 0.15rem; }
  .sub { color: #444; margin: 0; }
  .meta { color: #666; font-size: 0.85rem; margin: 0 0 0.35rem; }
  ul { margin: 0.25rem 0 0.5rem 1.1rem; padding: 0; }
  li { margin: 0.2rem 0; }
  .skills { line-height: 1.6; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <h1>${esc(c.name)}</h1>
  <p class="sub">${esc(c.title)}</p>
  <p class="meta">${esc(c.contactLine)}</p>
  <h2>Professional summary</h2>
  <p>${esc(c.summary)}</p>
  <h2>Skills</h2>
  <p class="skills">${esc(c.skills.join(' · '))}</p>
  ${c.certifications.length ? `<h2>Certifications</h2><ul>${c.certifications.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
  <h2>Experience</h2>
  ${expHtml}
  ${c.projects.length ? `<h2>Projects</h2>${c.projects.map((p) => `<section><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p></section>`).join('')}` : ''}
  ${c.education.length ? `<h2>Education</h2><ul>${c.education.map((e) => `<li>${esc([e.degree, e.school, e.year].filter(Boolean).join(' — '))}</li>`).join('')}</ul>` : ''}
  ${c.achievements.length ? `<h2>Achievements</h2><ul>${c.achievements.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
  <p class="meta" style="margin-top:2rem">Tailored for ${esc(t.company)} — ${esc(t.jobTitle)}. Generated by CareerOS (local). No invented experience.</p>
</body>
</html>`
}

export function downloadText(filename: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function openPrintableHtml(html: string) {
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.write(html)
  w.document.close()
  // Give styles a tick then print
  setTimeout(() => {
    w.focus()
    w.print()
  }, 300)
  return true
}
