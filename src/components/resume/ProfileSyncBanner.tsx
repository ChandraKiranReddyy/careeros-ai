import { Link } from 'react-router-dom'
import { UserCheck, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { useResume } from '../../context/ResumeContext'
import { useJobs } from '../../context/JobContext'
import { ResumeUploadZone } from './ResumeUploadZone'

/**
 * Shows whether the app is driven by the user's resume or the demo sample,
 * plus live alignment stats (matches / skills) that update after upload.
 */
export function ProfileSyncBanner({ showUpload = true }: { showUpload?: boolean }) {
  const { profile, active, isUserResume } = useResume()
  const { stats } = useJobs()

  if (!active) return null

  if (!isUserResume) {
    return (
      <Card className="mb-6 border border-warning/25 bg-warning-dim/30 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-3">
            <div className="rounded-xl bg-warning-dim p-2.5 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Using demo profile (sample resume)</p>
              <p className="mt-1 max-w-xl text-sm text-text-secondary">
                Matches, skill gaps, tailoring, and interview prep are currently aligned to{' '}
                <strong className="text-text-primary">{profile.name}</strong> (sample). Upload{' '}
                <strong className="text-text-primary">your</strong> resume so the whole app
                re-scores jobs for you.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="warning">Sample master</Badge>
                <Badge>{profile.skills.length} demo skills</Badge>
              </div>
            </div>
          </div>
          {showUpload ? (
            <div className="w-full max-w-sm shrink-0">
              <ResumeUploadZone variant="hero" />
            </div>
          ) : null}
        </div>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border border-positive/20 bg-positive-dim/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="rounded-xl bg-positive-dim p-2.5 text-positive">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              App aligned to your resume · {profile.name}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {profile.title} · {profile.yearsExperience || '?'} yrs · {profile.skills.length}{' '}
              skills · {stats.strongMatches} strong matches (≥80, estimate)
            </p>
            <p className="mt-1 text-[11px] text-text-muted">
              Source: {active.label}
              {active.fileName ? ` · ${active.fileName}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/matches"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-xs text-text-secondary hover:text-text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            My Matches
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            to="/skill-gaps"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-xs text-text-secondary hover:text-text-primary"
          >
            Skill gaps
          </Link>
          <ResumeUploadZone variant="inline" />
        </div>
      </div>
    </Card>
  )
}
