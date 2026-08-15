import type { TailoredResume } from '../../types'
import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import {
  downloadText,
  openPrintableHtml,
  tailoredToHtml,
} from '../../lib/resume/tailor'
import { Download, Printer, FileText } from 'lucide-react'
import { cn } from '../../lib/cn'

function AtsCompare({ t }: { t: TailoredResume }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-border-subtle bg-surface-1/50 p-3">
        <p className="text-[11px] uppercase tracking-wider text-text-muted">Before (master)</p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-text-secondary">
          {t.atsBefore.score}%
        </p>
        <p className="mt-1 text-[11px] text-text-muted">
          {t.atsBefore.found.length}/{t.atsBefore.totalChecked} keywords
        </p>
      </div>
      <div className="rounded-xl border border-accent/20 bg-accent-dim/40 p-3">
        <p className="text-[11px] uppercase tracking-wider text-text-muted">After (tailored)</p>
        <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-positive">
          {t.atsAfter.score}%
        </p>
        <p className="mt-1 text-[11px] text-text-muted">
          {t.atsAfter.found.length}/{t.atsAfter.totalChecked} keywords ·{' '}
          <span className={t.atsDelta >= 0 ? 'text-positive' : 'text-warning'}>
            {t.atsDelta >= 0 ? '+' : ''}
            {t.atsDelta} pts
          </span>
        </p>
      </div>
    </div>
  )
}

export function TailoredResumeView({
  tailored,
  onClose,
}: {
  tailored: TailoredResume
  onClose?: () => void
}) {
  const c = tailored.content
  const slug = `${tailored.company}-${tailored.jobTitle}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 48)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {tailored.label}
          </h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Created {new Date(tailored.createdAt).toLocaleString()} · master{' '}
            {tailored.masterVersionId.slice(0, 10)}…
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              downloadText(
                `careeros-${slug}.txt`,
                tailored.plainText,
              )
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-xs text-text-secondary hover:text-text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            TXT
          </button>
          <button
            type="button"
            onClick={() =>
              downloadText(
                `careeros-${slug}.html`,
                tailoredToHtml(tailored),
                'text/html',
              )
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-1 px-3 text-xs text-text-secondary hover:text-text-primary"
          >
            <FileText className="h-3.5 w-3.5" />
            HTML
          </button>
          <button
            type="button"
            onClick={() => {
              const ok = openPrintableHtml(tailoredToHtml(tailored))
              if (!ok) {
                downloadText(`careeros-${slug}.html`, tailoredToHtml(tailored), 'text/html')
              }
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-xs font-medium text-void"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / PDF
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center rounded-xl border border-border-subtle px-3 text-xs text-text-muted"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      <Card className="p-5">
        <CardHeader
          title="ATS keyword coverage"
          subtitle="Before/after vs this job — estimate only"
        />
        <AtsCompare t={tailored} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tailored.atsAfter.found.slice(0, 10).map((k) => (
            <Badge key={k} tone="positive">
              {k}
            </Badge>
          ))}
          {tailored.atsAfter.missing.slice(0, 6).map((k) => (
            <Badge key={k} tone="warning">
              missing: {k}
            </Badge>
          ))}
        </div>
      </Card>

      {c.skillGaps.length ? (
        <Card className="p-5">
          <CardHeader
            title="Skill gaps (not invented)"
            subtitle="JD requirements unsupported by master resume"
          />
          <div className="flex flex-wrap gap-1.5">
            {c.skillGaps.map((g) => (
              <Badge key={g} tone="warning">
                {g}
              </Badge>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="p-5">
        <CardHeader title="Tailored preview" />
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-display text-base font-semibold">{c.name}</p>
            <p className="text-text-secondary">{c.title}</p>
            <p className="text-xs text-text-muted">{c.contactLine}</p>
          </div>
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wider text-text-muted">Summary</p>
            <p className="leading-relaxed text-text-secondary">{c.summary}</p>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-wider text-text-muted">
              Skills (JD-ordered)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {c.skills.map((s) => (
                <Badge
                  key={s}
                  tone={
                    c.emphasizedKeywords.some((k) => k.toLowerCase() === s.toLowerCase())
                      ? 'positive'
                      : 'default'
                  }
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-wider text-text-muted">
              Experience (relevance-ranked)
            </p>
            <ul className="space-y-4">
              {c.experience.map((exp) => (
                <li key={`${exp.company}-${exp.title}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-text-primary">
                      {exp.title} — {exp.company}
                    </p>
                    <Badge tone="accent">rel {exp.relevance}</Badge>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {exp.bullets.map((b) => (
                      <li
                        key={b}
                        className="text-xs leading-relaxed text-text-secondary before:mr-2 before:content-['•']"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-text-muted">
          Generation notes
        </p>
        <ul className="space-y-1">
          {c.notes.map((n) => (
            <li key={n} className="text-xs text-text-muted">
              · {n}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4">
        <CardHeader title="Plain text (export source)" />
        <pre
          className={cn(
            'scroll-thin max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-surface-1 p-3 text-xs text-text-secondary',
          )}
        >
          {tailored.plainText}
        </pre>
      </Card>
    </div>
  )
}
