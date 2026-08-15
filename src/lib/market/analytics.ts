import type { CandidateProfile, Job, SkillLiftEstimate } from '../../types'
import { SKILL_LEXICON } from '../resume/skillLexicon'
import { matchJob, buildMatchProfile } from '../matching/engine'
import type { StructuredResumeProfile } from '../../types'

export function computeSkillDemand(jobs: Job[]) {
  const active = jobs.filter((j) => !j.stale)
  const counts = new Map<string, number>()
  for (const job of active) {
    const hay = `${job.title} ${job.summary} ${job.description ?? ''} ${job.mustHave.join(' ')}`
    for (const entry of SKILL_LEXICON) {
      if (entry.patterns.some((p) => p.test(hay))) {
        counts.set(entry.name, (counts.get(entry.name) ?? 0) + 1)
      }
    }
  }
  const max = Math.max(1, ...counts.values())
  return [...counts.entries()]
    .map(([skill, n]) => ({
      skill,
      count: n,
      demand: Math.round((n / max) * 100),
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Estimate opportunity lift from learning a missing skill.
 * Clearly an estimate: compares jobs needing the skill where candidate is currently weak.
 */
export function estimateSkillLifts(
  jobs: Job[],
  profile: CandidateProfile,
  structured?: StructuredResumeProfile | null,
  limit = 8,
): SkillLiftEstimate[] {
  const active = jobs.filter((j) => !j.stale)
  const matchProfile = buildMatchProfile(profile, structured ?? null)
  const skillSet = new Set(profile.skills.map((s) => s.toLowerCase()))

  const gapSkills = new Map<string, Job[]>()
  for (const job of active) {
    const needs = [...job.mustHave, ...job.missingSkills]
    for (const s of needs) {
      if (skillSet.has(s.toLowerCase())) continue
      const list = gapSkills.get(s) ?? []
      list.push(job)
      gapSkills.set(s, list)
    }
  }

  const lifts: SkillLiftEstimate[] = []

  for (const [skill, needing] of gapSkills) {
    if (needing.length < 1) continue
    let liftSum = 0
    let wouldCross80 = 0
    for (const job of needing.slice(0, 25)) {
      const before = matchJob(job, matchProfile).score
      // Simulate having the skill: temporary profile
      const boosted = {
        ...matchProfile,
        skills: [...matchProfile.skills, skill],
      }
      const after = matchJob(job, boosted).score
      const delta = Math.max(0, after - before)
      liftSum += delta
      if (before < 80 && after >= 80) wouldCross80++
    }
    const n = Math.min(needing.length, 25)
    const avgLift = Math.round(liftSum / n)
    lifts.push({
      skill,
      jobsNeeding: needing.length,
      estimatedExtraMatches: wouldCross80,
      estimatedLiftPts: avgLift,
      label: 'Estimate only — simulated by adding the skill to profile for scoring',
    })
  }

  return lifts
    .sort(
      (a, b) =>
        b.estimatedExtraMatches - a.estimatedExtraMatches ||
        b.jobsNeeding - a.jobsNeeding ||
        b.estimatedLiftPts - a.estimatedLiftPts,
    )
    .slice(0, limit)
}

export function cityBreakdown(jobs: Job[]) {
  const active = jobs.filter((j) => !j.stale)
  const map = new Map<string, number>()
  for (const j of active) {
    map.set(j.city, (map.get(j.city) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
}

export function topHiringCompanies(jobs: Job[], limit = 10) {
  const active = jobs.filter((j) => !j.stale)
  const map = new Map<string, { name: string; count: number; cities: Set<string> }>()
  for (const j of active) {
    const key = j.company.toLowerCase()
    const cur = map.get(key) ?? { name: j.company, count: 0, cities: new Set() }
    cur.count++
    cur.cities.add(j.city)
    map.set(key, cur)
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((c) => ({
      name: c.name,
      openRoles: c.count,
      cities: [...c.cities],
    }))
}

export function topRoles(jobs: Job[], limit = 8) {
  const active = jobs.filter((j) => !j.stale)
  const map = new Map<string, number>()
  for (const j of active) {
    const key = j.title.replace(/\s+/g, ' ').trim()
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
