import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useJobs } from '../context/JobContext'
import { useResume } from '../context/ResumeContext'
import {
  cityBreakdown,
  computeSkillDemand,
  estimateSkillLifts,
  topHiringCompanies,
  topRoles,
} from '../lib/market/analytics'

const CITY_FILL: Record<string, string> = {
  Bangalore: '#5b8cff',
  Hyderabad: '#3ddc97',
  'India Remote': '#8aafff',
  'Other India': '#6b7a8c',
}

export function MarketIntelligence() {
  const { jobs, stats } = useJobs()
  const { profile, active } = useResume()

  const marketSkills = useMemo(() => computeSkillDemand(jobs).slice(0, 10), [jobs])
  const cities = useMemo(() => cityBreakdown(jobs), [jobs])
  const companies = useMemo(() => topHiringCompanies(jobs, 8), [jobs])
  const roles = useMemo(() => topRoles(jobs, 6), [jobs])
  const lifts = useMemo(
    () => estimateSkillLifts(jobs, profile, active?.profile ?? null, 8),
    [jobs, profile, active],
  )

  const totalCity = Math.max(1, cities.reduce((s, c) => s + c.count, 0))

  return (
    <div>
      <PageHeader
        title="Market Intelligence"
        description="Demand and opportunity signals from your ingested inventory. All figures are estimates — not salary guarantees."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone="warning">Estimates only</Badge>
        <Badge tone="accent">{stats.active} active jobs</Badge>
        <Badge>
          {stats.bangalore} BLR · {stats.hyderabad} HYD · {stats.remote} remote
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader
            title="Top skills requested"
            subtitle="Relative frequency in inventory (0–100)"
          />
          <div className="h-72">
            {marketSkills.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketSkills} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis
                    type="category"
                    dataKey="skill"
                    width={120}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9aa8b8', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#111821',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(value, _n, item) => {
                      const count = (item?.payload as { count?: number })?.count
                      return [`${value} (n=${count ?? '?'})`, 'Demand index']
                    }}
                  />
                  <Bar dataKey="demand" fill="#3ddc97" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-text-muted">No skill signals yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Geo demand" subtitle="Jobs by city (inventory)" />
          <ul className="mt-2 space-y-4">
            {cities.map((c) => {
              const pct = Math.round((c.count / totalCity) * 100)
              return (
                <li key={c.city}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-text-primary">{c.city}</span>
                    <span className="tabular-nums text-text-secondary">
                      {c.count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: CITY_FILL[c.city] ?? '#6b7a8c',
                      }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="p-5">
          <CardHeader
            title="Opportunity lift from learning a skill"
            subtitle="Simulated match improvement — estimate only"
          />
          {lifts.length === 0 ? (
            <p className="text-sm text-text-muted">
              No gap-based lift estimates (few missing must-haves vs inventory).
            </p>
          ) : (
            <ul className="space-y-2">
              {lifts.map((l) => (
                <li
                  key={l.skill}
                  className="rounded-xl border border-border-subtle bg-surface-1/50 px-3 py-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text-primary">{l.skill}</span>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone="warning">{l.jobsNeeding} jobs need it</Badge>
                      <Badge tone="positive">
                        ~{l.estimatedExtraMatches} extra ≥80 matches
                      </Badge>
                      <Badge tone="accent">~+{l.estimatedLiftPts} pts avg</Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-text-muted">{l.label}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <CardHeader title="Companies hiring" subtitle="From inventory counts" />
            <ul className="space-y-2">
              {companies.map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-text-primary">{c.name}</span>
                  <span className="text-xs text-text-muted">
                    {c.openRoles} · {c.cities.join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <CardHeader title="Common roles" />
            <ul className="space-y-2">
              {roles.map((r) => (
                <li key={r.title} className="flex justify-between gap-3 text-sm">
                  <span className="truncate text-text-secondary">{r.title}</span>
                  <span className="tabular-nums text-text-muted">{r.count}</span>
                </li>
              ))}
            </ul>
          </Card>
          <p className="text-xs leading-relaxed text-text-muted">
            Sources: {Object.entries(stats.bySource).map(([k, v]) => `${k} (${v})`).join(' · ') || '—'}
            . Salary trends need denser live data and are not fabricated.
          </p>
        </div>
      </div>
    </div>
  )
}
