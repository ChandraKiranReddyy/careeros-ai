import type { Application, Job } from '../../types'
import type { CandidateProfile } from '../../types'

export type CopilotDeps = {
  profile: CandidateProfile
  rankedJobs: Job[]
  applications: Application[]
  skillGaps: Array<{ skill: string; count: number }>
}

/**
 * Free local NL command router — no paid API.
 * Answers from live inventory, resume profile, and applications.
 */
export function routeCopilot(input: string, deps: CopilotDeps): string {
  const t = input.toLowerCase().trim()
  const active = deps.rankedJobs.filter((j) => !j.stale)
  const top = [...active].sort((a, b) => b.matchScore - a.matchScore)

  if (/best|today|top match|recommend/.test(t)) {
    const list = top.slice(0, 5)
    if (!list.length) return 'No jobs in inventory yet. Refresh feeds on Discover Jobs.'
    return [
      `Best opportunities for ${deps.profile.name} (engine estimates):`,
      ...list.map(
        (j, i) =>
          `${i + 1}. ${j.title} @ ${j.company} — ${j.matchScore}% (${j.city}, ${j.workMode})`,
      ),
      'Scores are AI estimates, not guarantees.',
    ].join('\n')
  }

  if (/bangalore|bengaluru|blr/.test(t)) {
    const min = /9\d|90|above 90|over 90/.test(t) ? 90 : /8\d|80/.test(t) ? 80 : 0
    const list = top.filter((j) => j.city === 'Bangalore' && j.matchScore >= min)
    if (!list.length) return `No Bangalore roles${min ? ` ≥ ${min}%` : ''} in current inventory.`
    return [
      `Bangalore roles${min ? ` ≥ ${min}% match` : ''}:`,
      ...list.slice(0, 8).map((j) => `• ${j.title} @ ${j.company} — ${j.matchScore}%`),
    ].join('\n')
  }

  if (/hyderabad|secunderabad|hyd/.test(t)) {
    const list = top.filter((j) => j.city === 'Hyderabad')
    if (!list.length) return 'No Hyderabad roles in current inventory.'
    return [
      'Hyderabad roles:',
      ...list.slice(0, 8).map((j) => `• ${j.title} @ ${j.company} — ${j.matchScore}%`),
    ].join('\n')
  }

  if (/aws|network|kubernetes|terraform|python/.test(t) && /hyderabad|bangalore|job/.test(t)) {
    const skill = t.match(/aws|kubernetes|terraform|python|network(?:ing)?/i)?.[0] ?? ''
    const city = /hyderabad/.test(t) ? 'Hyderabad' : /bangalore|bengaluru/.test(t) ? 'Bangalore' : null
    const list = top.filter((j) => {
      const hay = `${j.title} ${j.summary} ${j.mustHave.join(' ')}`.toLowerCase()
      const skillOk = hay.includes(skill.toLowerCase().replace(/ing$/, ''))
      const cityOk = !city || j.city === city
      return skillOk && cityOk
    })
    return list.length
      ? [`Jobs matching “${skill}”${city ? ` in ${city}` : ''}:`, ...list.slice(0, 8).map((j) => `• ${j.title} @ ${j.company} — ${j.matchScore}%`)].join('\n')
      : `No inventory hits for ${skill}${city ? ` in ${city}` : ''}.`
  }

  if (/apply|first|priorit|pipeline/.test(t)) {
    const apps = deps.applications
    const lines = [
      'Suggested apply order (estimate from match + pipeline):',
      ...top.slice(0, 5).map((j, i) => {
        const app = apps.find((a) => a.jobId === j.id)
        return `${i + 1}. ${j.company} — ${j.title} (${j.matchScore}%)${app ? ` [${app.stage}]` : ' [not tracked]'}`
      }),
      apps.filter((a) => a.stage === 'interview').length
        ? `You have ${apps.filter((a) => a.stage === 'interview').length} interview(s) — prep those first.`
        : 'Tip: track roles on Applications after you apply.',
    ]
    return lines.join('\n')
  }

  if (/weak|why.*match|gap|missing/.test(t)) {
    const weak = top.filter((j) => j.matchScore < 70).slice(0, 3)
    const strongGaps = top[0]?.missingSkills ?? []
    return [
      top[0]
        ? `Top role ${top[0].title} @ ${top[0].company} scores ${top[0].matchScore}% (${top[0].match?.label ?? 'n/a'}).`
        : 'No ranked jobs yet.',
      strongGaps.length
        ? `Gaps on top match: ${strongGaps.join(', ')}.`
        : 'Few skill gaps on the top match.',
      weak.length
        ? `Weaker fits: ${weak.map((j) => `${j.company} ${j.matchScore}%`).join('; ')}.`
        : '',
      'Open Job Detail for full dimension breakdown.',
    ]
      .filter(Boolean)
      .join('\n')
  }

  if (/skill|learn|upskill|qualif/.test(t)) {
    if (!deps.skillGaps.length) {
      return 'No skill gaps detected against current inventory vs your resume.'
    }
    return [
      'Skills to learn for more coverage (from inventory gaps — estimates):',
      ...deps.skillGaps.slice(0, 8).map((g) => `• ${g.skill} — appears in ${g.count} role(s)`),
      'See Skill Gaps and Market Intelligence for lift estimates. Never invent these as experience on tailored resumes.',
    ].join('\n')
  }

  if (/interview|prep/.test(t)) {
    const interviews = deps.applications.filter((a) => a.stage === 'interview')
    if (interviews.length) {
      return [
        'Interview-stage applications:',
        ...interviews.map((a) => `• ${a.title} @ ${a.company}`),
        'Open Interview Prep and select the company/role for a grounded question pack.',
      ].join('\n')
    }
    return 'No applications in Interview stage. Move a card there on Applications, then open Interview Prep.'
  }

  if (/tailor|resume/.test(t)) {
    return top[0]
      ? `To tailor for ${top[0].title} @ ${top[0].company}, open Job Detail or go to /resume/tailor/${top[0].id}. Only master resume facts are used.`
      : 'Load jobs and open Resume Center → Tailored, or Job Detail → Tailor resume.'
  }

  if (/application|kanban|pipeline status/.test(t)) {
    const by = deps.applications.reduce(
      (acc, a) => {
        acc[a.stage] = (acc[a.stage] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return [
      `Pipeline: ${deps.applications.length} applications.`,
      ...Object.entries(by).map(([s, n]) => `• ${s}: ${n}`),
    ].join('\n')
  }

  return [
    `Hi ${deps.profile.name.split(' ')[0] || 'there'} — I'm the free local CareerOS Copilot.`,
    `Inventory: ${active.length} active jobs · ${deps.applications.length} applications · ${deps.profile.skills.length} resume skills.`,
    'Try: best jobs today · Bangalore above 90 · apply order · skill gaps · interview prep · tailor resume.',
    'No paid AI required. Optional provider adapters can be plugged in later.',
  ].join('\n')
}
