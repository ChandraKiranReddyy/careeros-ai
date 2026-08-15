/**
 * Default master resume — Fabrix / AI Ops & Agentic Ops as P1;
 * prior solutions / cloud / networking as P2.
 * Loaded when no user upload is stored (or after storage key bump).
 */
export const SAMPLE_RESUME_TEXT = `
Chandra Kiran Reddy
AI Ops & Agentic Ops Engineer
Bangalore, India
chandra.kiran@example.com | +91 98765 43210
LinkedIn: linkedin.com/in/chandrakiranreddy

PROFESSIONAL SUMMARY
AI Ops and Agentic Ops engineer at Fabrix, focused on multi-agent systems, LLM operations, observability for AI pipelines, and productionizing agent workflows for enterprise customers. Primary domain (P1): AI Ops, Agentic Ops, LLM platforms, RAG, evaluation, and agent orchestration. Secondary domain (P2): solutions engineering background in cloud, networking, pre-sales, and customer workshops across India (Bangalore / Hyderabad).

SKILLS
AI Ops, Agentic Ops, LLM Ops, Multi-Agent Systems, Agent Orchestration, RAG, Prompt Engineering, LangChain, LlamaIndex, Vector Databases, Model Evaluation, Observability, OpenTelemetry, Prometheus, Grafana, Python, FastAPI, REST APIs, Docker, Kubernetes, CI/CD, AWS, Azure, Terraform, Solution Architecture, Pre-Sales, Customer Workshops, POC, Demo, Networking, Linux

CERTIFICATIONS
AWS Certified Solutions Architect – Associate
CCNA

EXPERIENCE
AI Ops / Agentic Ops Engineer – Fabrix | Bangalore
2025 – Present
• Own AI Ops and Agentic Ops outcomes for Fabrix platform customers — agent reliability, runbooks, and production guardrails
• Design multi-agent workflows, tool-calling patterns, and RAG pipelines with evaluation hooks and observability
• Partner with product and GTM on POCs that demonstrate agentic automation for enterprise ops use cases
• Define SLOs, tracing, and incident playbooks for LLM and agent services (latency, cost, quality, safety)
• Translate customer ops requirements into agent architectures without inventing unsupported capabilities

Senior Solutions Engineer – Nimbus Edge Technologies | Bangalore
2021 – 2025
• (P2) Led pre-sales for cloud networking and platform deals across South India; technical discovery and demos
• Built AWS landing zones with Terraform and Kubernetes for enterprise POCs
• Ran RFP responses and customer workshops on hybrid connectivity, security, and cloud migration
• Bridged customer success and engineering for complex multi-account cloud designs

Solutions Engineer – Vertex Cloud Pvt Ltd | Hyderabad
2018 – 2021
• (P2) Solution architecture sessions for SaaS and telecom accounts
• Demo environments with AWS, Docker, and REST APIs; networking and cloud migration POCs
• Competitive battle cards and reference architectures for India pre-sales

Systems Engineer – CorePath Networks | Bangalore
2016 – 2018
• (P2) Data center networking projects; Python/Bash automation on Linux; firewall and load balancing support

EDUCATION
B.Tech Computer Science – Visvesvaraya Technological University | 2016

PROJECTS
Fabrix Agentic Ops Lab
Built reusable multi-agent demos with RAG, tool calling, and observability dashboards for customer workshops.

AI Ops Evaluation Harness
Automated quality/cost/latency checks for LLM and agent pipelines used in Fabrix POCs.

Hybrid Connectivity Lab (P2)
AWS + VPN demo environment with Terraform for prior solutions engineering workshops.

ACHIEVEMENTS
• At Fabrix, shortened agent POC cycle time with reusable Agentic Ops blueprints
• Improved production readiness of AI services via AI Ops SLOs and runbooks
• (P2) Prior solutions role: multi-crore technical pipeline contribution; 40% faster POC setup with Terraform modules
`.trim()

/** Explicit priority domains for matching and UI copy */
export const PROFILE_PRIORITIES = {
  p1: {
    label: 'P1 — Primary',
    company: 'Fabrix',
    domains: ['AI Ops', 'Agentic Ops', 'LLM Ops', 'Multi-Agent Systems', 'RAG'],
    targetRoles: [
      'AI Ops Engineer',
      'Agentic Ops Engineer',
      'LLM Ops Engineer',
      'AI Platform Engineer',
      'AI Solutions Engineer',
      'MLOps Engineer',
      'Agent Platform Engineer',
    ],
  },
  p2: {
    label: 'P2 — Secondary',
    domains: [
      'Solutions Engineering',
      'Pre-Sales',
      'Cloud',
      'Networking',
      'Solution Architecture',
    ],
    targetRoles: [
      'Solutions Engineer',
      'Senior Solutions Engineer',
      'Sales Engineer',
      'Solutions Architect',
      'Cloud Solutions Engineer',
    ],
  },
} as const
