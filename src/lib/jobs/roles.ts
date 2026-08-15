/**
 * Role vocabulary — P1 (AI Ops / Agentic Ops) first, then P2 (solutions / cloud).
 * Used for job-ingest relevance filters and match scoring.
 */

/** P1 — Fabrix domain: AI Ops & Agentic Ops */
export const ROLE_KEYWORDS_P1 = [
  'ai ops',
  'aiops',
  'agentic ops',
  'agenticops',
  'agent ops',
  'llm ops',
  'llmops',
  'mlops',
  'ml ops',
  'ai platform',
  'agent platform',
  'multi-agent',
  'multi agent',
  'agentic',
  'ai engineer',
  'ai solutions',
  'genai',
  'gen ai',
  'generative ai',
  'llm engineer',
  'rag engineer',
  'ai reliability',
  'ai sre',
  'platform engineer',
  'ai ops engineer',
  'agentic ops engineer',
  'ai consultant',
]

/** P2 — prior solutions / cloud / networking */
export const ROLE_KEYWORDS_P2 = [
  'solutions engineer',
  'solution engineer',
  'senior solutions engineer',
  'sales engineer',
  'pre-sales',
  'presales',
  'pre sales',
  'solutions architect',
  'solution architect',
  'technical solutions engineer',
  'customer solutions engineer',
  'network solutions engineer',
  'cloud solutions engineer',
  'ai solutions engineer',
  'technical consultant',
  'customer engineer',
  'systems engineer',
  'solutions consultant',
  'pre-sales engineer',
  'presales engineer',
]

export const ROLE_KEYWORDS = [...ROLE_KEYWORDS_P1, ...ROLE_KEYWORDS_P2]

export const SKILL_HINTS_P1 = [
  'ai ops',
  'aiops',
  'agentic',
  'agent',
  'llm',
  'rag',
  'langchain',
  'llamaindex',
  'vector',
  'prompt',
  'mlops',
  'observability',
  'opentelemetry',
  'langgraph',
  'openai',
  'anthropic',
  'multi-agent',
]

export const SKILL_HINTS_P2 = [
  'aws',
  'azure',
  'gcp',
  'kubernetes',
  'k8s',
  'terraform',
  'networking',
  'python',
  'pre-sales',
  'presales',
  'solution architecture',
  'docker',
  'vpn',
  'cloud',
  'saas',
  'api',
  'devops',
  'security',
]

export const SKILL_HINTS = [...SKILL_HINTS_P1, ...SKILL_HINTS_P2]

export function matchesRoleVocabulary(title: string, description = ''): boolean {
  const hay = `${title} ${description}`.toLowerCase()
  return ROLE_KEYWORDS.some((k) => hay.includes(k))
}

export function matchesP1Role(title: string, description = ''): boolean {
  const hay = `${title} ${description}`.toLowerCase()
  return ROLE_KEYWORDS_P1.some((k) => hay.includes(k))
}

/** Broader keep filter: role vocab OR (AI/cloud title + skill hints). */
export function isRelevantPosting(
  title: string,
  description = '',
  tags: string[] = [],
): boolean {
  if (matchesRoleVocabulary(title, description)) return true
  const hay = `${title} ${description} ${tags.join(' ')}`.toLowerCase()
  const titleHit =
    /\b(cloud|network|platform|infrastructure|devops|sre|security|saas|ai|ml|llm|agent|ops)\b/i.test(
      title,
    )
  const skillHit = SKILL_HINTS.some((s) => hay.includes(s))
  return titleHit && skillHit
}
