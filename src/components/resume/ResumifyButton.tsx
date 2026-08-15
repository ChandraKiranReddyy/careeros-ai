import { Link } from 'react-router-dom'
import { Wand2, Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { Job } from '../../types'
import { useTailor } from '../../context/TailorContext'
import { useResume } from '../../context/ResumeContext'

type Props = {
  job: Job
  /** primary = filled accent, ghost = outline, text = link-style */
  variant?: 'primary' | 'ghost' | 'text'
  size?: 'sm' | 'md'
  className?: string
  /**
   * If true, generate immediately then open tailor page with result already stored.
   * Default: navigate with ?auto=1 so TailorJob runs Resumify on load.
   */
  generateFirst?: boolean
  stopPropagation?: boolean
}

/**
 * Resumify — rewrite/reorder master resume for this role + job description.
 * Only facts from the master resume; unsupported JD items become skill gaps.
 */
export function ResumifyButton({
  job,
  variant = 'primary',
  size = 'sm',
  className,
  generateFirst = false,
  stopPropagation = true,
}: Props) {
  const { tailorForJob, getForJob, tailoring } = useTailor()
  const { active } = useResume()
  const existing = getForJob(job.id)
  const href = `/resume/tailor/${job.id}?auto=1`

  const base =
    size === 'md'
      ? 'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium'
      : 'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium'

  const styles = {
    primary: 'bg-accent text-void hover:opacity-90 disabled:opacity-50',
    ghost:
      'border border-accent/35 bg-accent-dim text-accent-soft hover:border-accent/50 disabled:opacity-50',
    text: 'text-accent-soft hover:underline disabled:opacity-50',
  }[variant]

  if (generateFirst) {
    return (
      <button
        type="button"
        disabled={tailoring || !active}
        title={
          !active
            ? 'Upload a master resume first'
            : `Resumify for ${job.title} — adapts resume to this role & description`
        }
        className={cn(base, styles, className)}
        onClick={(e) => {
          if (stopPropagation) {
            e.preventDefault()
            e.stopPropagation()
          }
          tailorForJob(job)
          window.location.assign(`/resume/tailor/${job.id}`)
        }}
      >
        {tailoring ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Wand2 className="h-3.5 w-3.5" />
        )}
        {existing ? 'Resumify again' : 'Resumify'}
      </button>
    )
  }

  return (
    <Link
      to={href}
      title={`Resumify: update resume for ${job.title} using this job description`}
      className={cn(base, styles, className)}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation()
      }}
    >
      <Wand2 className="h-3.5 w-3.5" />
      {existing ? 'Resumify again' : 'Resumify'}
    </Link>
  )
}
