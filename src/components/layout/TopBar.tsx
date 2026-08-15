import { Link } from 'react-router-dom'
import { Bell, Search, Command } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { useResume } from '../../context/ResumeContext'
import { ResumeUploadZone } from '../resume/ResumeUploadZone'

export function TopBar({ title }: { title?: string }) {
  const { profile, isUserResume, active } = useResume()
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || 'CO'

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-border-subtle bg-void/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="min-w-0">
        {title ? (
          <p className="truncate text-sm font-medium text-text-secondary">{title}</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">Bangalore · Hyderabad</Badge>
            {isUserResume ? (
              <Badge tone="positive">Your resume</Badge>
            ) : (
              <Badge tone="warning">Demo profile</Badge>
            )}
            <span className="hidden max-w-[200px] truncate text-xs text-text-muted lg:inline">
              {active?.label ?? profile.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search roles, companies…"
            className="h-9 w-52 rounded-xl border border-border-subtle bg-surface-1 py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent/40 focus:outline-none xl:w-64"
          />
        </label>

        <div className="hidden sm:block">
          <ResumeUploadZone variant="compact" />
        </div>
        <Link
          to="/resume"
          className="hidden h-9 items-center rounded-xl border border-border-subtle bg-surface-1 px-2.5 text-xs text-text-muted hover:text-text-primary lg:inline-flex"
        >
          Resume
        </Link>

        <button
          type="button"
          className="hidden h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-2.5 text-xs text-text-muted xl:inline-flex"
          title="Command palette (coming soon)"
        >
          <Command className="h-3.5 w-3.5" />
          <span>K</span>
        </button>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface-1 text-text-secondary transition-colors hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent/80 to-positive/60 text-xs font-semibold text-void"
          title={profile.name}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
