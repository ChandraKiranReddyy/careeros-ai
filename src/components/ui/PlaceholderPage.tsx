import { PageHeader } from './PageHeader'
import { Card } from './Card'
import { Badge } from './Badge'
import { Construction } from 'lucide-react'

export function PlaceholderPage({
  title,
  description,
  phaseNote = 'Full functionality lands in a later phase. This shell is ready for real data.',
  children,
}: {
  title: string
  description: string
  phaseNote?: string
  children?: React.ReactNode
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      {children}
      <Card className="mt-6 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center">
        <div className="rounded-xl bg-accent-dim p-3 text-accent-soft">
          <Construction className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-text-primary">Phase 1 placeholder</p>
            <Badge tone="accent">Mock UI</Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary">{phaseNote}</p>
        </div>
      </Card>
    </div>
  )
}
