import { useMemo, useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useResume } from '../context/ResumeContext'
import { useJobs } from '../context/JobContext'
import { useApplications } from '../context/ApplicationContext'
import { routeCopilot } from '../lib/copilot/router'

const suggestions = [
  'Find the best jobs for me today.',
  'Show Bangalore jobs above 90% match.',
  'Show Hyderabad jobs requiring AWS.',
  'Which jobs should I apply to first?',
  'Why am I a weak match for top roles?',
  'What skills should I learn to qualify for more jobs?',
  'Prepare me for interviews in my pipeline.',
  'How do I tailor my resume?',
]

export function AICopilot() {
  const { profile } = useResume()
  const { rankedJobs } = useJobs()
  const { applications } = useApplications()

  const skillGaps = useMemo(() => {
    const skillSet = new Set(profile.skills.map((s) => s.toLowerCase()))
    const map = new Map<string, number>()
    for (const job of rankedJobs.filter((j) => !j.stale)) {
      for (const req of [...job.mustHave, ...job.missingSkills]) {
        if (!skillSet.has(req.toLowerCase())) {
          map.set(req, (map.get(req) ?? 0) + 1)
        }
      }
    }
    return [...map.entries()]
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
  }, [profile.skills, rankedJobs])

  const deps = useMemo(
    () => ({ profile, rankedJobs, applications, skillGaps }),
    [profile, rankedJobs, applications, skillGaps],
  )

  const welcome = routeCopilot('help', deps)
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string }>
  >([{ role: 'assistant', text: welcome }])
  const [input, setInput] = useState('')

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const reply = routeCopilot(trimmed, deps)
    setMessages((m) => [
      ...m,
      { role: 'user', text: trimmed },
      { role: 'assistant', text: reply },
    ])
    setInput('')
  }

  return (
    <div>
      <PageHeader
        title="AI Copilot"
        description="Natural-language commands over your live resume, job inventory, and applications. Free local router — optional LLM providers can plug in later."
        actions={<Badge tone="positive">Local · free</Badge>}
      />
      <Card className="flex h-[min(640px,70vh)] flex-col overflow-hidden">
        <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.map((m, i) => (
            <div
              key={`${i}-${m.role}`}
              className={
                m.role === 'user' ? 'flex justify-end' : 'flex justify-start gap-3'
              }
            >
              {m.role === 'assistant' ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-dim text-accent-soft">
                  <Bot className="h-4 w-4" />
                </div>
              ) : null}
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-sm text-void'
                    : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-border-subtle bg-surface-1 px-3.5 py-2.5 text-sm text-text-secondary'
                }
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border-subtle p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-border-subtle px-3 py-1 text-[11px] text-text-secondary transition-colors hover:border-accent/30 hover:text-accent-soft"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about matches, cities, skills, pipeline…"
              className="h-11 min-w-0 flex-1 rounded-xl border border-border-subtle bg-surface-1 px-3 text-sm focus:border-accent/40 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-void"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}
