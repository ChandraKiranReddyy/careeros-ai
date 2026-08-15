import type {
  ActivityItem,
  AppStage,
  CandidateProfile,
  MarketSkill,
  WorkMode,
} from '../types'

/** Seed pipeline rows — normalized by ApplicationContext */
export interface SeedApplication {
  id: string
  jobId: string
  stage: AppStage
  company: string
  title: string
  updatedAt: string
  notes?: string
}

/** Legacy curated seed rows — normalized by job ingestion layer. */
export interface SeedJobRow {
  id: string
  title: string
  company: string
  location: string
  city: 'Bangalore' | 'Hyderabad' | 'India Remote'
  workMode: WorkMode
  salary?: string
  postedAt: string
  source: string
  applyUrl: string
  matchScore: number
  summary: string
  mustHave: string[]
  niceToHave: string[]
  matchedSkills: string[]
  missingSkills: string[]
}

export const candidate: CandidateProfile = {
  name: 'Chandra Kiran Reddy',
  title: 'AI Ops & Agentic Ops Engineer',
  location: 'Bangalore, India',
  yearsExperience: 8,
  summary:
    'P1: AI Ops & Agentic Ops at Fabrix (multi-agent systems, LLM ops, RAG, observability). P2: solutions engineering, cloud, networking, pre-sales.',
  skills: [
    'AI Ops',
    'Agentic Ops',
    'LLM Ops',
    'Multi-Agent Systems',
    'RAG',
    'LangChain',
    'Observability',
    'Python',
    'Kubernetes',
    'AWS',
    'Docker',
    'Solution Architecture',
    'Pre-Sales',
    'REST APIs',
    'Terraform',
    'Networking',
  ],
  certifications: ['AWS Solutions Architect – Associate', 'CCNA'],
  targetRoles: [
    'AI Ops Engineer',
    'Agentic Ops Engineer',
    'LLM Ops Engineer',
    'AI Platform Engineer',
    'AI Solutions Engineer',
    'Solutions Engineer',
    'Senior Solutions Engineer',
  ],
}

export const jobs: SeedJobRow[] = [
  {
    id: 'j1',
    title: 'Senior Solutions Engineer',
    company: 'Nimbus Cloud',
    location: 'Bangalore, Karnataka',
    city: 'Bangalore',
    workMode: 'hybrid',
    salary: '₹28–38 LPA',
    postedAt: '2026-08-14',
    source: 'Company careers',
    applyUrl: '#',
    matchScore: 94,
    summary:
      'Own technical discovery and demos for mid-market cloud networking deals in South India.',
    mustHave: ['AWS', 'Pre-Sales', 'Networking', 'Customer workshops'],
    niceToHave: ['Kubernetes', 'Terraform', 'CCNA'],
    matchedSkills: ['AWS', 'Pre-Sales', 'Networking', 'Kubernetes', 'Terraform'],
    missingSkills: ['Salesforce CPQ'],
  },
  {
    id: 'j2',
    title: 'Solutions Architect',
    company: 'Aether Systems',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    workMode: 'hybrid',
    salary: '₹32–42 LPA',
    postedAt: '2026-08-13',
    source: 'Public ATS',
    applyUrl: '#',
    matchScore: 91,
    summary:
      'Design multi-cloud architectures and lead proof-of-concepts with enterprise accounts.',
    mustHave: ['Solution Architecture', 'AWS', 'Azure', 'Python'],
    niceToHave: ['Kubernetes', 'Terraform'],
    matchedSkills: ['Solution Architecture', 'AWS', 'Azure', 'Python', 'Terraform'],
    missingSkills: ['TOGAF'],
  },
  {
    id: 'j3',
    title: 'Sales Engineer – Cloud',
    company: 'Vertex Networks',
    location: 'Bangalore, Karnataka',
    city: 'Bangalore',
    workMode: 'onsite',
    salary: '₹24–34 LPA',
    postedAt: '2026-08-12',
    source: 'Job board feed',
    applyUrl: '#',
    matchScore: 88,
    summary:
      'Partner with account executives on RFP responses and live product demos.',
    mustHave: ['Pre-Sales', 'AWS', 'Networking'],
    niceToHave: ['Azure', 'REST APIs'],
    matchedSkills: ['Pre-Sales', 'AWS', 'Networking', 'Azure', 'REST APIs'],
    missingSkills: ['HubSpot'],
  },
  {
    id: 'j4',
    title: 'Technical Solutions Engineer',
    company: 'Orbit Labs',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    workMode: 'remote',
    salary: '₹22–30 LPA',
    postedAt: '2026-08-11',
    source: 'Company careers',
    applyUrl: '#',
    matchScore: 86,
    summary:
      'Support India-remote enterprise customers with integration design and onboarding.',
    mustHave: ['REST APIs', 'Python', 'Customer Workshops'],
    niceToHave: ['Kubernetes', 'AWS'],
    matchedSkills: ['REST APIs', 'Python', 'Customer Workshops', 'AWS'],
    missingSkills: ['GraphQL'],
  },
  {
    id: 'j5',
    title: 'Cloud Solutions Engineer',
    company: 'Pinnacle Infra',
    location: 'Bangalore, Karnataka',
    city: 'Bangalore',
    workMode: 'hybrid',
    salary: '₹26–36 LPA',
    postedAt: '2026-08-10',
    source: 'Public ATS',
    applyUrl: '#',
    matchScore: 83,
    summary:
      'Deliver infrastructure automation demos and customer success playbooks for cloud migrations.',
    mustHave: ['AWS', 'Terraform', 'Kubernetes'],
    niceToHave: ['Azure', 'Python'],
    matchedSkills: ['AWS', 'Terraform', 'Kubernetes', 'Azure', 'Python'],
    missingSkills: ['Ansible'],
  },
  {
    id: 'j6',
    title: 'Pre-Sales Engineer',
    company: 'Lumen Grid',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    workMode: 'hybrid',
    salary: '₹20–28 LPA',
    postedAt: '2026-08-09',
    source: 'Job board feed',
    applyUrl: '#',
    matchScore: 79,
    summary:
      'Run technical qualification calls and build solution narratives for networking deals.',
    mustHave: ['Pre-Sales', 'Networking', 'Customer Workshops'],
    niceToHave: ['CCNA', 'AWS'],
    matchedSkills: ['Pre-Sales', 'Networking', 'Customer Workshops', 'AWS', 'CCNA'],
    missingSkills: ['SD-WAN product cert'],
  },
  {
    id: 'j7',
    title: 'AI Solutions Engineer',
    company: 'NovaMind AI',
    location: 'India Remote',
    city: 'India Remote',
    workMode: 'remote',
    salary: '₹30–45 LPA',
    postedAt: '2026-08-08',
    source: 'Company careers',
    applyUrl: '#',
    matchScore: 88,
    summary:
      'Help customers adopt agentic copilots and LLM platforms; AI Ops readiness, RAG demos, and solutions workshops.',
    mustHave: ['Python', 'RAG', 'Agentic Ops', 'Customer Workshops'],
    niceToHave: ['AWS', 'LangChain', 'Solution Architecture'],
    matchedSkills: ['Python', 'RAG', 'Agentic Ops', 'AWS', 'LangChain'],
    missingSkills: ['LLM fine-tuning'],
  },
  {
    id: 'j8',
    title: 'Network Solutions Engineer',
    company: 'CorePath Telecom',
    location: 'Bangalore, Karnataka',
    city: 'Bangalore',
    workMode: 'onsite',
    salary: '₹18–26 LPA',
    postedAt: '2026-08-07',
    source: 'Public ATS',
    applyUrl: '#',
    matchScore: 68,
    summary:
      'Design campus and data-center network solutions for large Indian enterprises.',
    mustHave: ['Networking', 'CCNA'],
    niceToHave: ['AWS', 'Python'],
    matchedSkills: ['Networking', 'CCNA', 'AWS'],
    missingSkills: ['BGP deep expertise', 'Cisco ACI'],
  },
]

export const applications: SeedApplication[] = [
  {
    id: 'a1',
    jobId: 'seed-ai-1',
    stage: 'interview',
    company: 'Fabrix',
    title: 'AI Ops Engineer',
    updatedAt: '2026-08-15',
    notes: 'P1 role — panel on agent reliability & observability',
  },
  {
    id: 'a2',
    jobId: 'seed-ai-2',
    stage: 'applied',
    company: 'Fabrix',
    title: 'Agentic Ops Engineer',
    updatedAt: '2026-08-14',
  },
  {
    id: 'a3',
    jobId: 'seed-ai-3',
    stage: 'screening',
    company: 'NovaMind AI',
    title: 'LLM Ops / AI Platform Engineer',
    updatedAt: '2026-08-14',
  },
  {
    id: 'a4',
    jobId: 'seed-ai-4',
    stage: 'interested',
    company: 'Lumina ML',
    title: 'AI Solutions Engineer – Agentic Platforms',
    updatedAt: '2026-08-13',
  },
  {
    id: 'a5',
    jobId: 'j7',
    stage: 'new',
    company: 'NovaMind AI',
    title: 'AI Solutions Engineer',
    updatedAt: '2026-08-12',
  },
  {
    id: 'a6',
    jobId: 'j1',
    stage: 'interested',
    company: 'Nimbus Cloud',
    title: 'Senior Solutions Engineer',
    updatedAt: '2026-08-11',
    notes: 'P2 backup — solutions / cloud networking',
  },
]

export const activity: ActivityItem[] = [
  {
    id: 'act1',
    text: 'New strong match: Senior Solutions Engineer at Nimbus Cloud (94%)',
    time: '2h ago',
    tone: 'positive',
  },
  {
    id: 'act2',
    text: 'Interview confirmed with Nimbus Cloud — Thu 3:00 PM IST',
    time: '5h ago',
    tone: 'accent',
  },
  {
    id: 'act3',
    text: 'Application submitted to Aether Systems',
    time: '1d ago',
    tone: 'default',
  },
  {
    id: 'act4',
    text: '12 new Bangalore roles ingested from public ATS feeds',
    time: '1d ago',
    tone: 'default',
  },
  {
    id: 'act5',
    text: 'Skill gap flagged: Salesforce CPQ for 3 top matches',
    time: '2d ago',
    tone: 'warning',
  },
  {
    id: 'act6',
    text: 'Offer received from Orbit Labs',
    time: '3d ago',
    tone: 'positive',
  },
]

export const marketSkills: MarketSkill[] = [
  { skill: 'AWS', demand: 92 },
  { skill: 'Kubernetes', demand: 78 },
  { skill: 'Terraform', demand: 74 },
  { skill: 'Pre-Sales', demand: 71 },
  { skill: 'Python', demand: 68 },
  { skill: 'Networking', demand: 65 },
  { skill: 'Azure', demand: 61 },
  { skill: 'Solution Architecture', demand: 58 },
]

export const cityDistribution = [
  { city: 'Bangalore', jobs: 48, fill: '#5b8cff' },
  { city: 'Hyderabad', jobs: 31, fill: '#3ddc97' },
  { city: 'India Remote', jobs: 12, fill: '#8aafff' },
]

export const weeklyDiscoveries = [
  { day: 'Mon', count: 14 },
  { day: 'Tue', count: 19 },
  { day: 'Wed', count: 11 },
  { day: 'Thu', count: 22 },
  { day: 'Fri', count: 17 },
  { day: 'Sat', count: 8 },
  { day: 'Sun', count: 6 },
]

export const insights = [
  {
    title: 'P1: Fabrix AI Ops / Agentic Ops',
    body: 'Lead with multi-agent reliability, RAG, LLM Ops, and observability stories from Fabrix. These should rank highest.',
  },
  {
    title: 'P1 roles to target',
    body: 'AI Ops Engineer, Agentic Ops Engineer, LLM Ops, AI Platform, AI Solutions Engineer — Bangalore & Hyderabad hybrid/remote.',
  },
  {
    title: 'P2 still valuable',
    body: 'Solutions engineering, cloud, networking, and pre-sales remain secondary strengths for hybrid AI + customer-facing roles.',
  },
]

export const dashboardStats = {
  jobsDiscovered: 91,
  newToday: 7,
  strongMatches: 18,
  applications: applications.length,
  interviews: applications.filter((a) => a.stage === 'interview').length,
  offers: applications.filter((a) => a.stage === 'offer').length,
}

export const companies = [
  { name: 'Nimbus Cloud', openRoles: 3, city: 'Bangalore', hiring: 'Active' },
  { name: 'Aether Systems', openRoles: 2, city: 'Hyderabad', hiring: 'Active' },
  { name: 'Vertex Networks', openRoles: 4, city: 'Bangalore', hiring: 'Active' },
  { name: 'Orbit Labs', openRoles: 1, city: 'Hyderabad', hiring: 'Offer stage' },
  { name: 'Pinnacle Infra', openRoles: 2, city: 'Bangalore', hiring: 'Watching' },
  { name: 'NovaMind AI', openRoles: 2, city: 'India Remote', hiring: 'Active' },
]
