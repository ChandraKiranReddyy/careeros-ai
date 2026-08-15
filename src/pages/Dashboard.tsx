import { Link } from 'react-router-dom'
import {
  Briefcase,
  Sparkles,
  Send,
  Mic2,
  Gift,
  ArrowUpRight,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { MatchScore } from '../components/ui/MatchScore'
import { activity, insights, weeklyDiscoveries } from '../data/mock'
import { useResume } from '../context/ResumeContext'
import { useJobs } from '../context/JobContext'
import { useApplications } from '../context/ApplicationContext'
import { ProfileSyncBanner } from '../components/resume/ProfileSyncBanner'
import { ResumifyButton } from '../components/resume/ResumifyButton'
import { cn } from '../lib/cn'

const toneDot = {
  default: 'bg-text-muted',
  positive: 'bg-positive',
  warning: 'bg-warning',
  accent: 'bg-accent',
} as const

const CITY_COLORS: Record<string, string> = {
  Bangalore: '#5b8cff',
  Hyderabad: '#3ddc97',
  'India Remote': '#8aafff',
  'Other India': '#6b7a8c',
}

export function Dashboard() {
  const { profile, isUserResume, lastAlignedAt } = useResume()
  const { rankedJobs, stats, loading, refresh, lastReport } = useJobs()
  const { stats: appStats } = useApplications()
  const firstName = profile.name.split(' ')[0] || 'there'
  const topJobs = rankedJobs.filter((j) => !j.stale).slice(0, 5)

  const cityDistribution = [
    { city: 'Bangalore', jobs: stats.bangalore, fill: CITY_COLORS.Bangalore },
    { city: 'Hyderabad', jobs: stats.hyderabad, fill: CITY_COLORS.Hyderabad },
    { city: 'India Remote', jobs: stats.remote, fill: CITY_COLORS['India Remote'] },
  ].filter((c) => c.jobs > 0)

  const interviews = appStats.interviews
  const offers = appStats.offers

  return (
    <div>
      <PageHeader
        title={isUserResume ? `Welcome back, ${firstName}` : `Hi — upload your resume to personalize`}
        description={
          isUserResume
            ? `Everything below is scored against your master resume${lastAlignedAt ? ` (updated ${new Date(lastAlignedAt).toLocaleString()})` : ''}.`
            : 'Upload PDF/DOCX/TXT once — matches, skill gaps, tailoring, interview prep, and Copilot all realign to your profile.'
        }
        actions={
          <>
            <Link
              to="/resume"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Resume Center
            </Link>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Sync jobs
            </button>
            <Link
              to="/discover"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Explore jobs
            </Link>
            <Link
              to="/copilot"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-sm font-medium text-void transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask Copilot
            </Link>
          </>
        }
      />

      <ProfileSyncBanner />

      {lastReport ? (
        <p className="mb-4 text-xs text-text-muted">
          Last ingest {new Date(lastReport.at).toLocaleString()} · {lastReport.afterDedupe} jobs ·{' '}
          {lastReport.sources.filter((s) => s.ok).length}/{lastReport.sources.length} sources OK
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Jobs discovered"
          value={stats.total}
          hint={`${stats.active} active · ${stats.stale} stale`}
          icon={Briefcase}
          tone="default"
        />
        <StatCard
          label="New today"
          value={stats.newToday}
          hint="Posted or first seen today"
          icon={ArrowUpRight}
          tone="accent"
        />
        <StatCard
          label="Strong matches"
          value={stats.strongMatches}
          hint="Score ≥ 80 (estimate)"
          icon={Sparkles}
          tone="positive"
        />
        <StatCard
          label="Applications"
          value={appStats.total}
          hint={`${appStats.active} active in pipeline`}
          icon={Send}
        />
        <StatCard
          label="Interviews"
          value={interviews}
          hint="Scheduled / open"
          icon={Mic2}
          tone="warning"
        />
        <StatCard
          label="Offers"
          value={offers}
          hint="Pending decision"
          icon={Gift}
          tone="positive"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader
            title="Jobs discovered this week"
            subtitle="Demo weekly volume (illustrative)"
          />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyDiscoveries} barCategoryGap="28%">
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7a8c', fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7a8c', fontSize: 11 }}
                  width={28}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{
                    background: '#111821',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#5b8cff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="City distribution" subtitle="From live inventory" />
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cityDistribution}
                  dataKey="jobs"
                  nameKey="city"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  stroke="none"
                >
                  {cityDistribution.map((entry) => (
                    <Cell key={entry.city} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#111821',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {cityDistribution.map((c) => (
              <li key={c.city} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-text-secondary">
                  <span className="h-2 w-2 rounded-full" style={{ background: c.fill }} />
                  {c.city}
                </span>
                <span className="tabular-nums text-text-primary">{c.jobs}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <CardHeader
            title="Best opportunities"
            subtitle="Top engine matches · estimate"
            action={
              <Link to="/matches" className="text-xs font-medium text-accent-soft hover:underline">
                View all
              </Link>
            }
          />
          <ul className="divide-y divide-border-subtle">
            {topJobs.map((job) => (
              <li key={job.id} className="flex flex-col gap-2 border-b border-border-subtle py-3 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-xs font-semibold text-text-secondary">
                    {job.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-sm font-medium text-text-primary hover:text-accent-soft"
                    >
                      {job.title}
                    </Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                      <span>{job.company}</span>
                      <span className="inline-flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />
                        {job.city}
                      </span>
                      <Badge
                        tone={
                          job.workMode === 'remote'
                            ? 'positive'
                            : job.workMode === 'hybrid'
                              ? 'accent'
                              : 'default'
                        }
                      >
                        {job.workMode}
                      </Badge>
                      {job.match ? <Badge tone="accent">{job.match.label}</Badge> : null}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                      {job.summary}
                    </p>
                    <div className="mt-2">
                      <ResumifyButton job={job} variant="ghost" size="sm" />
                    </div>
                  </div>
                </div>
                <MatchScore score={job.matchScore} size="sm" />
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="flex-1 p-5">
            <CardHeader title="AI insights" subtitle="Suggestions from mock + inventory" />
            <ul className="space-y-3">
              {insights.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-border-subtle bg-surface-1/60 p-3"
                >
                  <p className="text-sm font-medium text-text-primary">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">{item.body}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <CardHeader title="Recent activity" />
            <ul className="space-y-3">
              {activity.slice(0, 5).map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span
                    className={cn(
                      'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                      toneDot[item.tone ?? 'default'],
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs leading-relaxed text-text-secondary">{item.text}</p>
                    <p className="mt-0.5 text-[10px] text-text-muted">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
