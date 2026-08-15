import { useMemo } from 'react'
import { Building2 } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useJobs } from '../context/JobContext'

export function Companies() {
  const { jobs } = useJobs()

  const companies = useMemo(() => {
    const map = new Map<
      string,
      { name: string; openRoles: number; cities: Set<string>; sources: Set<string> }
    >()
    for (const j of jobs.filter((x) => !x.stale)) {
      const key = j.company.toLowerCase()
      const cur = map.get(key) ?? {
        name: j.company,
        openRoles: 0,
        cities: new Set<string>(),
        sources: new Set<string>(),
      }
      cur.openRoles++
      cur.cities.add(j.city)
      cur.sources.add(j.sourceId)
      map.set(key, cur)
    }
    return [...map.values()].sort((a, b) => b.openRoles - a.openRoles)
  }, [jobs])

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Derived from ingested job inventory. Prefer original company apply URLs when present."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => (
          <Card key={c.name} hover className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-surface-2 p-2.5 text-text-secondary">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary">{c.name}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {[...c.cities].join(' · ')}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="accent">
                    {c.openRoles} open role{c.openRoles === 1 ? '' : 's'}
                  </Badge>
                  {[...c.sources].map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!companies.length ? (
        <Card className="mt-4 p-8 text-center text-sm text-text-muted">
          No companies yet — run Refresh feeds on Discover Jobs.
        </Card>
      ) : null}
    </div>
  )
}
