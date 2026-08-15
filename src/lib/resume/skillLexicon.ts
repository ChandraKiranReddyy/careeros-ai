import type { SkillCategory } from '../../types'

/** Canonical skill tokens for extraction + ATS. Only match what's in the text. */
export const SKILL_LEXICON: Array<{
  name: string
  category: SkillCategory
  patterns: RegExp[]
}> = [
  // Cloud
  { name: 'AWS', category: 'cloud', patterns: [/\baws\b/i, /amazon web services/i] },
  { name: 'Azure', category: 'cloud', patterns: [/\bazure\b/i, /microsoft azure/i] },
  { name: 'GCP', category: 'cloud', patterns: [/\bgcp\b/i, /google cloud/i] },
  { name: 'Kubernetes', category: 'cloud', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { name: 'Docker', category: 'cloud', patterns: [/\bdocker\b/i] },
  { name: 'Terraform', category: 'cloud', patterns: [/\bterraform\b/i] },
  { name: 'CloudFormation', category: 'cloud', patterns: [/cloudformation/i] },
  { name: 'Ansible', category: 'cloud', patterns: [/\bansible\b/i] },
  { name: 'OpenStack', category: 'cloud', patterns: [/openstack/i] },

  // Networking
  { name: 'Networking', category: 'networking', patterns: [/\bnetworking\b/i, /\bnetwork engineer/i] },
  { name: 'TCP/IP', category: 'networking', patterns: [/\btcp\/?ip\b/i] },
  { name: 'BGP', category: 'networking', patterns: [/\bbgp\b/i] },
  { name: 'OSPF', category: 'networking', patterns: [/\bospf\b/i] },
  { name: 'VPN', category: 'networking', patterns: [/\bvpn\b/i] },
  { name: 'SD-WAN', category: 'networking', patterns: [/\bsd-?wan\b/i] },
  { name: 'Firewall', category: 'networking', patterns: [/\bfirewall/i, /\bpalo alto\b/i, /\bfortinet\b/i] },
  { name: 'Load Balancing', category: 'networking', patterns: [/load balanc/i, /\bf5\b/i] },
  { name: 'DNS', category: 'networking', patterns: [/\bdns\b/i] },
  { name: 'Cisco ACI', category: 'networking', patterns: [/cisco aci/i, /\baci\b/i] },

  // Programming / automation
  { name: 'Python', category: 'programming', patterns: [/\bpython\b/i] },
  { name: 'JavaScript', category: 'programming', patterns: [/\bjavascript\b/i, /\bnode\.?js\b/i] },
  { name: 'Go', category: 'programming', patterns: [/\bgolang\b/i, /\bgo lang\b/i] },
  { name: 'Bash', category: 'programming', patterns: [/\bbash\b/i, /\bshell script/i] },
  { name: 'REST APIs', category: 'programming', patterns: [/\brest\b/i, /\brestful\b/i, /\bapis?\b/i] },
  { name: 'GraphQL', category: 'programming', patterns: [/\bgraphql\b/i] },
  { name: 'SQL', category: 'programming', patterns: [/\bsql\b/i, /\bpostgres/i, /\bmysql\b/i] },
  { name: 'CI/CD', category: 'programming', patterns: [/\bci\/?cd\b/i, /jenkins/i, /github actions/i] },
  { name: 'Linux', category: 'programming', patterns: [/\blinux\b/i] },

  // Pre-sales / solutions
  { name: 'Pre-Sales', category: 'presales', patterns: [/\bpre-?sales\b/i, /\bpresales\b/i] },
  {
    name: 'Solution Architecture',
    category: 'presales',
    patterns: [/solution architecture/i, /solutions architect/i],
  },
  { name: 'Customer Workshops', category: 'presales', patterns: [/workshop/i, /customer enablement/i] },
  { name: 'RFP', category: 'presales', patterns: [/\brfp\b/i, /\brfi\b/i, /\brfq\b/i] },
  { name: 'POC', category: 'presales', patterns: [/\bpoc\b/i, /proof of concept/i] },
  { name: 'Demo', category: 'presales', patterns: [/\bdemo(s|nstrat)/i, /product demo/i] },
  { name: 'Technical Consulting', category: 'presales', patterns: [/technical consult/i] },
  { name: 'Salesforce CPQ', category: 'presales', patterns: [/salesforce cpq/i, /\bcpq\b/i] },

  // Technical general
  { name: 'Microservices', category: 'technical', patterns: [/microservices?/i] },
  { name: 'Observability', category: 'technical', patterns: [/observability/i, /\bprometheus\b/i, /\bgrafana\b/i, /opentelemetry/i, /\botel\b/i] },
  { name: 'Security', category: 'technical', patterns: [/\bsecurity\b/i, /\biam\b/i, /zero trust/i] },
  { name: 'Data Center', category: 'technical', patterns: [/data ?centre/i, /data ?center/i] },

  // P1 — AI Ops / Agentic Ops (Fabrix domain)
  { name: 'AI Ops', category: 'technical', patterns: [/\bai\s*ops\b/i, /\baiops\b/i] },
  { name: 'Agentic Ops', category: 'technical', patterns: [/agentic\s*ops/i, /\bagenticops\b/i, /agent\s*ops/i] },
  { name: 'LLM Ops', category: 'technical', patterns: [/\bllm\s*ops\b/i, /\bllmops\b/i] },
  { name: 'MLOps', category: 'technical', patterns: [/\bmlops\b/i, /\bml\s*ops\b/i] },
  { name: 'Multi-Agent Systems', category: 'technical', patterns: [/multi-?\s*agent/i, /agentic\s+workflow/i] },
  { name: 'Agent Orchestration', category: 'technical', patterns: [/agent\s+orchestr/i, /tool[- ]calling/i, /langgraph/i] },
  { name: 'RAG', category: 'technical', patterns: [/\brag\b/i, /retrieval[- ]augmented/i] },
  { name: 'Prompt Engineering', category: 'technical', patterns: [/prompt\s+engineering/i, /prompt\s+design/i] },
  { name: 'LangChain', category: 'programming', patterns: [/langchain/i] },
  { name: 'LlamaIndex', category: 'programming', patterns: [/llamaindex/i, /llama\s*index/i] },
  { name: 'Vector Databases', category: 'technical', patterns: [/vector\s*(db|database|store)/i, /\bpinecone\b/i, /\bweaviate\b/i, /\bchroma\b/i, /\bqdrant\b/i] },
  { name: 'Model Evaluation', category: 'technical', patterns: [/model\s+eval/i, /llm\s+eval/i, /eval\s+harness/i] },
  { name: 'FastAPI', category: 'programming', patterns: [/\bfastapi\b/i] },
  { name: 'OpenTelemetry', category: 'technical', patterns: [/opentelemetry/i, /\botel\b/i] },
]

export const CERT_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'AWS Solutions Architect – Associate', pattern: /aws\s*(certified\s*)?solutions?\s*architect\s*(associate|saa)?/i },
  { name: 'AWS Solutions Architect – Professional', pattern: /aws\s*(certified\s*)?solutions?\s*architect\s*professional/i },
  { name: 'AWS Developer Associate', pattern: /aws\s*(certified\s*)?developer/i },
  { name: 'Azure Administrator', pattern: /azure\s*(administrator|admin)/i },
  { name: 'Azure Solutions Architect', pattern: /azure\s*solutions?\s*architect/i },
  { name: 'CCNA', pattern: /\bccna\b/i },
  { name: 'CCNP', pattern: /\bccnp\b/i },
  { name: 'CCIE', pattern: /\bccie\b/i },
  { name: 'CKA', pattern: /\bcka\b/i, },
  { name: 'CKAD', pattern: /\bckad\b/i },
  { name: 'PMP', pattern: /\bpmp\b/i },
  { name: 'TOGAF', pattern: /\btogaf\b/i },
]

export const ROLE_PATTERNS = [
  // P1
  'AI Ops Engineer',
  'Agentic Ops Engineer',
  'LLM Ops Engineer',
  'AI Platform Engineer',
  'MLOps Engineer',
  'Agent Platform Engineer',
  'AI Solutions Engineer',
  // P2
  'Senior Solutions Engineer',
  'Solutions Engineer',
  'Sales Engineer',
  'Pre-Sales Engineer',
  'Solutions Architect',
  'Technical Solutions Engineer',
  'Customer Solutions Engineer',
  'Network Solutions Engineer',
  'Cloud Solutions Engineer',
  'Technical Consultant',
  'Solution Architect',
  'Systems Engineer',
  'Customer Engineer',
]

export const SENIORITY_PATTERNS = [
  { label: 'Principal', re: /\bprincipal\b/i },
  { label: 'Staff', re: /\bstaff\b/i },
  { label: 'Senior', re: /\bsenior\b|\bsr\.?\b/i },
  { label: 'Lead', re: /\blead\b/i },
  { label: 'Mid', re: /\bmid[- ]level\b/i },
  { label: 'Junior', re: /\bjunior\b|\bjr\.?\b/i },
]

export const INDUSTRY_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: 'AI / Agentic platforms', re: /\bai\b|agentic|llm|genai|generative ai/i },
  { name: 'Enterprise SaaS', re: /\bsaas\b|enterprise software/i },
  { name: 'Cloud infrastructure', re: /cloud (infra|infrastructure|platform)/i },
  { name: 'Telecommunications', re: /telecom|telco/i },
  { name: 'Networking', re: /network(ing)? (vendor|equipment)/i },
  { name: 'FinTech', re: /\bfintech\b|financial services/i },
  { name: 'Data center', re: /data ?cent(er|re)/i },
]

/** ATS checklist — P1 AI Ops + P2 solutions (illustrative). */
export const ATS_KEYWORDS = [
  'AI Ops',
  'Agentic Ops',
  'LLM Ops',
  'RAG',
  'Multi-Agent Systems',
  'LangChain',
  'Vector Databases',
  'Observability',
  'Python',
  'Kubernetes',
  'AWS',
  'Azure',
  'Terraform',
  'Networking',
  'Pre-Sales',
  'Solution Architecture',
  'Customer Workshops',
  'REST APIs',
  'POC',
  'Docker',
  'Linux',
  'CI/CD',
]
