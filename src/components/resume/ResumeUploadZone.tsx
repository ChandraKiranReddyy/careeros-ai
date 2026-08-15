import { useCallback, useRef, useState } from 'react'
import { Upload, FileUp, Loader2 } from 'lucide-react'
import { useResume } from '../../context/ResumeContext'
import { cn } from '../../lib/cn'

type Props = {
  /** Compact toolbar style vs large drop zone */
  variant?: 'hero' | 'compact' | 'inline'
  onUploaded?: () => void
  className?: string
}

/**
 * Primary resume upload control. Accepts PDF, DOCX, TXT.
 * On success, ResumeContext becomes the active master — matching, gaps,
 * tailoring, interview prep, and copilot all re-read from it.
 */
export function ResumeUploadZone({ variant = 'hero', onUploaded, className }: Props) {
  const { uploadFile, loading, error, clearError } = useResume()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [localMsg, setLocalMsg] = useState<string | null>(null)

  const handle = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0]
      if (!file) return
      setLocalMsg(null)
      clearError()
      try {
        const v = await uploadFile(file)
        setLocalMsg(
          `Master resume set: ${v.profile.name} · ${v.profile.skills.length} skills · matches & gaps updated.`,
        )
        onUploaded?.()
      } catch {
        /* error on context */
      }
    },
    [uploadFile, clearError, onUploaded],
  )

  if (variant === 'compact' || variant === 'inline') {
    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-opacity',
            variant === 'compact'
              ? 'bg-accent text-void hover:opacity-90 disabled:opacity-60'
              : 'border border-border-subtle bg-surface-1 text-text-secondary hover:text-text-primary disabled:opacity-60',
          )}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {loading ? 'Parsing…' : 'Upload resume'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            void handle(e.target.files)
            e.target.value = ''
          }}
        />
        {error ? <p className="text-[11px] text-warning">{error}</p> : null}
        {localMsg ? <p className="text-[11px] text-positive">{localMsg}</p> : null}
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          void handle(e.dataTransfer.files)
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors',
          dragOver
            ? 'border-accent/50 bg-accent-dim'
            : 'border-border-soft bg-surface-0/50 hover:border-accent/30',
        )}
      >
        <div className="rounded-2xl bg-accent-dim p-4 text-accent-soft">
          {loading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <FileUp className="h-7 w-7" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">
            {loading ? 'Extracting & parsing your resume…' : 'Upload your master resume'}
          </p>
          <p className="mt-1 max-w-md text-xs text-text-muted">
            PDF, DOCX, or TXT. Everything recalculates from your file: match scores, skill gaps,
            tailoring, interview prep, and Copilot. Parsing stays on your device — no paid API.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-void disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {loading ? 'Working…' : 'Choose file'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            void handle(e.target.files)
            e.target.value = ''
          }}
        />
        {error ? (
          <p className="max-w-md text-xs text-warning">{error}</p>
        ) : null}
        {localMsg ? (
          <p className="max-w-md text-xs text-positive">{localMsg}</p>
        ) : null}
      </div>
    </div>
  )
}
