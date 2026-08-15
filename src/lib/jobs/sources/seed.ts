import type { Job, RawJobPosting } from '../../../types'
import { jobs as seedJobsLegacy } from '../../../data/mock'
import { normalizeRawJob } from '../normalize'

/** Expanded inventory — P1 AI Ops / Agentic Ops first, then P2 solutions. */
const EXTRA_RAW: RawJobPosting[] = [
  {
    externalId: 'seed-ai-1',
    title: 'AI Ops Engineer',
    company: 'Fabrix',
    locationRaw: 'Bangalore, Karnataka',
    description:
      'Own AI Ops for multi-agent and LLM services at Fabrix. SLOs, observability, incident runbooks, evaluation harnesses, and production guardrails for agentic workflows. Python, Kubernetes, RAG, OpenTelemetry.',
    salary: '₹32–48 LPA',
    postedAt: '2026-08-15',
    applyUrl: 'https://example.com/jobs/fabrix-aiops',
    workModeHint: 'hybrid',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['AI Ops', 'Agentic Ops', 'LLM Ops', 'Kubernetes', 'Python', 'Observability', 'RAG'],
  },
  {
    externalId: 'seed-ai-2',
    title: 'Agentic Ops Engineer',
    company: 'Fabrix',
    locationRaw: 'Bangalore / Hybrid',
    description:
      'Design and operate agentic systems: multi-agent orchestration, tool calling, RAG pipelines, cost/quality/latency controls. Partner with GTM on customer POCs for Agentic Ops.',
    salary: '₹30–45 LPA',
    postedAt: '2026-08-14',
    applyUrl: 'https://example.com/jobs/fabrix-agentic',
    workModeHint: 'hybrid',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['Agentic Ops', 'Multi-Agent Systems', 'RAG', 'LangChain', 'POC', 'Python'],
  },
  {
    externalId: 'seed-ai-3',
    title: 'LLM Ops / AI Platform Engineer',
    company: 'NovaMind AI',
    locationRaw: 'Hyderabad, Telangana',
    description:
      'LLM Ops platform engineer for enterprise GenAI. Model evaluation, vector databases, prompt pipelines, observability, and secure deployment on Kubernetes/AWS.',
    salary: '₹28–42 LPA',
    postedAt: '2026-08-14',
    applyUrl: 'https://example.com/jobs/novamind-llmops',
    workModeHint: 'hybrid',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['LLM Ops', 'Vector Databases', 'Kubernetes', 'AWS', 'Python', 'Model Evaluation'],
  },
  {
    externalId: 'seed-ai-4',
    title: 'AI Solutions Engineer – Agentic Platforms',
    company: 'Lumina ML',
    locationRaw: 'Bangalore',
    description:
      'Customer-facing AI Solutions Engineer for agentic automation. Demos, POCs, RAG architectures, and AI Ops readiness reviews. Pre-sales + technical workshops.',
    salary: '₹26–40 LPA',
    postedAt: '2026-08-13',
    applyUrl: 'https://example.com/jobs/lumina-aise',
    workModeHint: 'hybrid',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['AI Solutions Engineer', 'Agentic Ops', 'RAG', 'Pre-Sales', 'POC', 'Demo', 'Python'],
  },
  {
    externalId: 'seed-ai-5',
    title: 'MLOps / AI Ops Engineer',
    company: 'HelioStack',
    locationRaw: 'Hyderabad',
    description:
      'MLOps and AI Ops for production models and agents. CI/CD for models, monitoring, drift, cost controls, Terraform, Kubernetes.',
    salary: '₹24–36 LPA',
    postedAt: '2026-08-12',
    applyUrl: 'https://example.com/jobs/heliostack-mlops',
    workModeHint: 'onsite',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['MLOps', 'AI Ops', 'Kubernetes', 'Terraform', 'CI/CD', 'Python'],
  },
  {
    externalId: 'seed-ai-6',
    title: 'Senior AI Ops Engineer – Multi-Agent Systems',
    company: 'OrbitEdge',
    locationRaw: 'India Remote',
    description:
      'Remote senior AI Ops role: multi-agent reliability, OpenTelemetry tracing, evaluation harnesses, and customer enablement for agent platforms.',
    salary: '₹34–50 LPA',
    postedAt: '2026-08-11',
    applyUrl: 'https://example.com/jobs/orbitedge-aiops',
    workModeHint: 'remote',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['AI Ops', 'Multi-Agent Systems', 'OpenTelemetry', 'Observability', 'Python'],
  },
  {
    externalId: 'seed-9',
    title: 'Senior Sales Engineer',
    company: 'PacketForge',
    locationRaw: 'Bangalore, Karnataka',
    description:
      'Drive technical wins for SD-WAN and cloud networking. Pre-sales, RFP, and customer workshops across Karnataka.',
    salary: '₹25–35 LPA',
    postedAt: '2026-08-14',
    applyUrl: 'https://example.com/jobs/packetforge-se',
    workModeHint: 'hybrid',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['Pre-Sales', 'Networking', 'AWS', 'SD-WAN'],
  },
  {
    externalId: 'seed-10',
    title: 'Solutions Architect – Cloud',
    company: 'BluePeak Digital',
    locationRaw: 'Hyderabad, Telangana',
    description:
      'Lead solution architecture for Azure and AWS migrations. POCs, Terraform patterns, and executive briefings.',
    salary: '₹30–40 LPA',
    postedAt: '2026-08-13',
    applyUrl: 'https://example.com/jobs/bluepeak-sa',
    workModeHint: 'hybrid',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['Azure', 'AWS', 'Terraform', 'Solution Architecture'],
  },
  {
    externalId: 'seed-11',
    title: 'Technical Consultant – Networking',
    company: 'Saffron Telco',
    locationRaw: 'Bangalore / Hybrid',
    description:
      'Consult on data center networking, BGP, and firewall designs for enterprise telco accounts.',
    salary: '₹22–32 LPA',
    postedAt: '2026-08-12',
    applyUrl: 'https://example.com/jobs/saffron-tc',
    workModeHint: 'hybrid',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['Networking', 'BGP', 'Firewall', 'Technical Consulting'],
  },
  {
    externalId: 'seed-12',
    title: 'Cloud Solutions Engineer',
    company: 'HelioStack',
    locationRaw: 'Hyderabad',
    description:
      'Customer-facing cloud engineer for Kubernetes platforms. Demos, POCs, and onboarding automation.',
    salary: '₹24–33 LPA',
    postedAt: '2026-08-11',
    applyUrl: 'https://example.com/jobs/heliostack-cse',
    workModeHint: 'onsite',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['Kubernetes', 'AWS', 'Python', 'POC'],
  },
  {
    externalId: 'seed-13',
    title: 'Pre-Sales Engineer – SaaS',
    company: 'Northline Analytics',
    locationRaw: 'India Remote',
    description:
      'Remote pre-sales for India. Discovery calls, solution narratives, and RFP support for analytics SaaS.',
    salary: '₹18–28 LPA',
    postedAt: '2026-08-10',
    applyUrl: 'https://example.com/jobs/northline-pse',
    workModeHint: 'remote',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['Pre-Sales', 'SaaS', 'RFP', 'Demo'],
  },
  {
    externalId: 'seed-14',
    title: 'Customer Solutions Engineer',
    company: 'OrbitEdge',
    locationRaw: 'Bengaluru',
    description:
      'Post-sale solutions engineer bridging implementation and account teams. REST APIs, AWS, customer workshops.',
    salary: '₹20–30 LPA',
    postedAt: '2026-08-09',
    applyUrl: 'https://example.com/jobs/orbitedge-cse',
    workModeHint: 'hybrid',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['REST APIs', 'AWS', 'Customer Workshops'],
  },
  {
    externalId: 'seed-15',
    title: 'Senior Solutions Engineer – Security',
    company: 'CipherGate',
    locationRaw: 'Hyderabad / Secunderabad',
    description:
      'Security-focused solutions engineer. Zero trust narratives, IAM, and hybrid connectivity demos.',
    salary: '₹28–38 LPA',
    postedAt: '2026-08-08',
    applyUrl: 'https://example.com/jobs/ciphergate-sse',
    workModeHint: 'hybrid',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['Security', 'IAM', 'Networking', 'Pre-Sales'],
  },
  {
    externalId: 'seed-16',
    title: 'AI Solutions Engineer',
    company: 'Lumina ML',
    locationRaw: 'Bangalore',
    description:
      'Help enterprises adopt AI copilots. Solution architecture, Python prototypes, and executive demos.',
    salary: '₹32–48 LPA',
    postedAt: '2026-08-07',
    applyUrl: 'https://example.com/jobs/lumina-aise',
    workModeHint: 'hybrid',
    sourceId: 'seed',
    sourceLabel: 'CareerOS seed catalog',
    tags: ['Python', 'Solution Architecture', 'AWS', 'Demo'],
  },
]

function legacyToRaw(j: (typeof seedJobsLegacy)[number]): RawJobPosting {
  return {
    externalId: j.id,
    title: j.title,
    company: j.company,
    locationRaw: j.location,
    description: `${j.summary}\n\nMust have: ${j.mustHave.join(', ')}.\nNice to have: ${j.niceToHave.join(', ')}.`,
    salary: j.salary,
    postedAt: j.postedAt,
    applyUrl: j.applyUrl.startsWith('http') ? j.applyUrl : `https://example.com/jobs/${j.id}`,
    workModeHint: j.workMode,
    sourceId: 'seed',
    sourceLabel: j.source.includes('seed') ? 'CareerOS seed catalog' : `${j.source} (seed)`,
    tags: [...j.mustHave, ...j.niceToHave],
  }
}

export async function fetchSeedJobs(): Promise<{ raw: RawJobPosting[]; jobs: Job[] }> {
  const now = new Date().toISOString()
  const raw = [...seedJobsLegacy.map(legacyToRaw), ...EXTRA_RAW]
  const jobs = raw.map((r) => {
    const n = normalizeRawJob(r, now)
    // Preserve curated scores from legacy seed when available
    const legacy = seedJobsLegacy.find((x) => x.id === r.externalId)
    if (legacy) {
      return {
        ...n,
        matchScore: legacy.matchScore,
        matchScoreKind: 'seed' as const,
        matchedSkills: legacy.matchedSkills,
        missingSkills: legacy.missingSkills,
        mustHave: legacy.mustHave,
        niceToHave: legacy.niceToHave,
        city: legacy.city,
        workMode: legacy.workMode,
      }
    }
    return { ...n, matchScoreKind: 'seed' as const, matchScore: n.matchScore || 70 }
  })
  return { raw, jobs }
}
