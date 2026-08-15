import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useResume } from '../context/ResumeContext'
import { useJobs } from '../context/JobContext'

export function Settings() {
  const { profile, active } = useResume()
  const { lastReport, adzunaConfigured, stats, loading, refresh } = useJobs()

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Preferences, AI providers, and job data sources. Free-first defaults — optional keys via env only."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader
            title="Profile (from resume)"
            subtitle={active ? `Source: ${active.label}` : undefined}
          />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Name</dt>
              <dd className="text-text-primary">{profile.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Title</dt>
              <dd className="text-right text-text-primary">{profile.title}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Location</dt>
              <dd className="text-text-primary">{profile.location}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Skills parsed</dt>
              <dd className="text-text-primary">{profile.skills.length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-muted">Target cities</dt>
              <dd className="text-text-primary">Bangalore · Hyderabad</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <CardHeader title="AI provider" subtitle="Replaceable adapter layer" />
          <ul className="space-y-2 text-sm">
            {[
              ['Local / rules (default)', 'Active · free'],
              ['OpenAI', 'Not configured'],
              ['xAI / Grok', 'Not configured'],
              ['Gemini', 'Not configured'],
            ].map(([name, status]) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-xl border border-border-subtle px-3 py-2.5"
              >
                <span className="text-text-primary">{name}</span>
                <Badge tone={status.startsWith('Active') ? 'positive' : 'default'}>
                  {status}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-text-muted">
            Keys live in environment variables only — never hard-coded.
          </p>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <CardHeader
            title="Job data sources"
            subtitle="Modular adapters · public APIs preferred · no ToS-violating scrapers"
            action={
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={loading}
                className="rounded-xl border border-border-subtle px-3 py-1.5 text-xs text-text-secondary"
              >
                {loading ? 'Syncing…' : 'Sync now'}
              </button>
            }
          />
          <ul className="space-y-2 text-sm">
            {[
              {
                name: 'CareerOS seed catalog',
                status: 'Always on · offline demo inventory (BLR/HYD SE roles)',
                ok: true,
              },
              {
                name: 'Remotive public API',
                status: 'Free · no key · remote roles filtered by relevance',
                ok: true,
              },
              {
                name: 'Arbeitnow public API',
                status: 'Free · no key · dev proxy for CORS',
                ok: true,
              },
              {
                name: 'Adzuna India API',
                status: adzunaConfigured
                  ? 'Configured via VITE_ADZUNA_*'
                  : 'Optional — set VITE_ADZUNA_APP_ID / VITE_ADZUNA_APP_KEY',
                ok: adzunaConfigured,
              },
              {
                name: 'JSON import',
                status: 'Upload on Discover Jobs · user-provided feeds',
                ok: true,
              },
            ].map((row) => (
              <li
                key={row.name}
                className="flex flex-col gap-1 rounded-xl border border-border-subtle px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-text-primary">{row.name}</span>
                <Badge tone={row.ok ? 'positive' : 'warning'}>{row.status}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-text-muted">
            Inventory: {stats.total} jobs ({stats.bangalore} BLR · {stats.hyderabad} HYD ·{' '}
            {stats.remote} remote). See `.env.example` for optional keys.
          </p>
          {lastReport ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lastReport.sources.map((s) => (
                <Badge key={s.sourceId + s.sourceLabel} tone={s.ok ? 'positive' : 'warning'}>
                  {s.sourceLabel}: {s.ok ? `${s.fetched} fetched` : s.error?.slice(0, 48)}
                </Badge>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <CardHeader title="Appearance" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl border border-accent/30 bg-accent-dim px-4 py-2 text-sm text-accent-soft"
            >
              Dark (default)
            </button>
            <button
              type="button"
              disabled
              className="rounded-xl border border-border-subtle px-4 py-2 text-sm text-text-muted"
            >
              Light (later)
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
