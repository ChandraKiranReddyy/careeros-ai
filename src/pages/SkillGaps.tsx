import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useResume } from '../context/ResumeContext'
import { useJobs } from '../context/JobContext'
import { estimateSkillLifts } from '../lib/market/analytics'
import { ProfileSyncBanner } from '../components/resume/ProfileSyncBanner'

export function SkillGaps() {
  const { profile, active, isUserResume } = useResume()
  const { rankedJobs, jobs } = useJobs()
  const skillSet = useMemo(
    () => new Set(profile.skills.map((s) => s.toLowerCase())),
    [profile.skills],
  )

  const gaps = useMemo(() => {
    const gapCounts = new Map<string, number>()
    for (const job of rankedJobs.filter((j) => !j.stale)) {
      for (const req of [...job.mustHave, ...job.missingSkills]) {
        if (!skillSet.has(req.toLowerCase())) {
          gapCounts.set(req, (gapCounts.get(req) ?? 0) + 1)
        }
      }
    }
    return [...gapCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)
  }, [rankedJobs, skillSet])

  const lifts = useMemo(
    () => estimateSkillLifts(jobs, profile, active?.profile ?? null, 6),
    [jobs, profile, active],
  )

  return (
    <div>
      <PageHeader
        title="Skill Gaps"
        description={
          isUserResume
            ? `Gaps vs ${profile.name}'s master resume across job inventory. Never auto-added as experience.`
            : 'Gaps currently use the demo sample resume. Upload yours to realign.'
        }
      />
      <ProfileSyncBanner showUpload={!isUserResume} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader
            title="Your skills (from resume)"
            subtitle={active ? active.label : undefined}
          />
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <Badge key={s} tone="positive">
                {s}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-xs text-text-muted">
            Certifications:{' '}
            {profile.certifications.length
              ? profile.certifications.join(' · ')
              : 'None detected'}
          </p>
        </Card>
        <Card className="p-5">
          <CardHeader
            title="Gaps across inventory"
            subtitle="Must-haves not in your resume"
          />
          {gaps.length === 0 ? (
            <p className="text-sm text-text-muted">No gaps detected against current inventory.</p>
          ) : (
            <ul className="space-y-2">
              {gaps.map(([skill, count]) => (
                <li
                  key={skill}
                  className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-1/50 px-3 py-2"
                >
                  <span className="text-sm text-text-primary">{skill}</span>
                  <Badge tone="warning">
                    {count} role{count === 1 ? '' : 's'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5 lg:col-span-2">
          <CardHeader
            title="Estimated opportunity improvement"
            subtitle="If you learned the skill (simulated match scores) — not a guarantee"
            action={
              <Link to="/market" className="text-xs text-accent-soft hover:underline">
                Market intel →
              </Link>
            }
          />
          {lifts.length === 0 ? (
            <p className="text-sm text-text-muted">Not enough gap data for lift estimates.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {lifts.map((l) => (
                <div
                  key={l.skill}
                  className="rounded-xl border border-border-subtle bg-surface-1/40 p-3"
                >
                  <p className="text-sm font-medium text-text-primary">{l.skill}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    In {l.jobsNeeding} jobs · ~{l.estimatedExtraMatches} extra strong matches · ~
                    +{l.estimatedLiftPts} pts avg
                  </p>
                  <p className="mt-1 text-[10px] text-text-muted">{l.label}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
