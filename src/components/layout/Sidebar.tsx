import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  FileText,
  Kanban,
  Mic2,
  CircleDashed,
  Building2,
  TrendingUp,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useResume } from '../../context/ResumeContext'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/discover', label: 'Discover Jobs', icon: Compass },
  { to: '/matches', label: 'My Matches', icon: Sparkles },
  { to: '/resume', label: 'Resume Center', icon: FileText },
  { to: '/applications', label: 'Applications', icon: Kanban },
  { to: '/interview', label: 'Interview Prep', icon: Mic2 },
  { to: '/skill-gaps', label: 'Skill Gaps', icon: CircleDashed },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/market', label: 'Market Intelligence', icon: TrendingUp },
  { to: '/copilot', label: 'AI Copilot', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const { profile } = useResume()

  return (
    <aside
      className={cn(
        'relative flex h-full shrink-0 flex-col border-r border-border-subtle bg-surface-0/80 backdrop-blur-xl transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-[260px]',
      )}
    >
      <div className={cn('flex items-center gap-3 px-4 py-5', collapsed && 'justify-center px-2')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-positive/80 font-display text-sm font-bold text-void shadow-lg shadow-accent/20">
          C
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold tracking-tight">CareerOS</p>
            <p className="truncate text-[11px] text-text-muted">AI · India jobs</p>
          </div>
        ) : null}
      </div>

      <nav className="scroll-thin flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-accent-dim text-accent-soft'
                  : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0 opacity-90" strokeWidth={1.75} />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className={cn('border-t border-border-subtle p-3', collapsed && 'px-2')}>
        {!collapsed ? (
          <div className="mb-3 rounded-xl bg-surface-1 px-3 py-2.5">
            <p className="truncate text-xs font-medium text-text-primary">{profile.name}</p>
            <p className="truncate text-[11px] text-text-muted">{profile.title}</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-1 px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
