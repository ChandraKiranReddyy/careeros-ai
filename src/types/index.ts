export type WorkMode = 'onsite' | 'hybrid' | 'remote'
export type AppStage =
  | 'new'
  | 'interested'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export type SkillCategory =
  | 'technical'
  | 'cloud'
  | 'networking'
  | 'programming'
  | 'presales'
  | 'other'

export type ResumeSource = 'seed' | 'upload' | 'paste'

export type JobCity = 'Bangalore' | 'Hyderabad' | 'India Remote' | 'Other India'

export type JobSourceId =
  | 'seed'
  | 'remotive'
  | 'arbeitnow'
  | 'adzuna'
  | 'import'
  | 'manual'

export interface CandidateProfile {
  name: string
  title: string
  location: string
  yearsExperience: number
  summary: string
  skills: string[]
  certifications: string[]
  targetRoles: string[]
}

export interface WorkExperience {
  title: string
  company: string
  location?: string
  startDate?: string
  endDate?: string
  current?: boolean
  bullets: string[]
}

export interface EducationItem {
  degree: string
  school: string
  year?: string
}

export interface ProjectItem {
  name: string
  description: string
  technologies: string[]
}

export interface AchievementItem {
  text: string
}

export interface SkillBucket {
  category: SkillCategory
  label: string
  skills: string[]
}

/** Structured profile extracted only from resume text — never invented. */
export interface StructuredResumeProfile {
  name: string
  title: string
  email?: string
  phone?: string
  location: string
  yearsExperience: number
  summary: string
  targetRoles: string[]
  seniorityHints: string[]
  skills: string[]
  skillBuckets: SkillBucket[]
  certifications: string[]
  education: EducationItem[]
  experience: WorkExperience[]
  projects: ProjectItem[]
  achievements: AchievementItem[]
  industries: string[]
  rawSectionHits: string[]
  parseNotes: string[]
}

export interface ResumeVersion {
  id: string
  label: string
  source: ResumeSource
  fileName?: string
  mimeType?: string
  createdAt: string
  rawText: string
  profile: StructuredResumeProfile
  ats: AtsAnalysis
}

export interface AtsAnalysis {
  score: number
  found: string[]
  missing: string[]
  totalChecked: number
  label: string
}

export interface TailoredExperience {
  title: string
  company: string
  location?: string
  startDate?: string
  endDate?: string
  current?: boolean
  bullets: string[]
  relevance: number
}

export interface TailoredResumeContent {
  name: string
  title: string
  contactLine: string
  summary: string
  skills: string[]
  certifications: string[]
  experience: TailoredExperience[]
  education: EducationItem[]
  projects: ProjectItem[]
  achievements: string[]
  /** JD requirements not supported by master resume — never invented into content */
  skillGaps: string[]
  /** Supported JD terms emphasized from master facts only */
  emphasizedKeywords: string[]
  notes: string[]
}

export interface TailoredResume {
  id: string
  masterVersionId: string
  jobId: string
  jobTitle: string
  company: string
  createdAt: string
  label: string
  content: TailoredResumeContent
  plainText: string
  atsBefore: AtsAnalysis
  atsAfter: AtsAnalysis
  atsDelta: number
}

/** Intermediate record from a job source before normalization. */
export interface RawJobPosting {
  externalId: string
  title: string
  company: string
  locationRaw: string
  description?: string
  salary?: string
  postedAt?: string
  applyUrl: string
  workModeHint?: WorkMode | string
  sourceId: JobSourceId
  sourceLabel: string
  tags?: string[]
}

export type MatchDimensionId =
  | 'experience'
  | 'skills'
  | 'role'
  | 'industry'
  | 'location'
  | 'certs'
  | 'ats'

export interface MatchDimension {
  id: MatchDimensionId
  label: string
  weight: number
  /** 0–100 contribution quality for this dimension */
  score: number
  /** weight * score / 100 — points toward overall */
  weighted: number
  summary: string
  details: string[]
}

export interface JobMatchResult {
  jobId: string
  /** Overall 0–100 AI estimate — not scientifically exact */
  score: number
  label: 'strong' | 'good' | 'fair' | 'weak'
  disclaimer: string
  dimensions: MatchDimension[]
  strengths: string[]
  gaps: string[]
  matchedSkills: string[]
  missingSkills: string[]
  keywordCoverage: {
    found: string[]
    missing: string[]
    percent: number
  }
  computedAt: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  city: JobCity
  workMode: WorkMode
  salary?: string
  postedAt: string
  /** Human-readable source provenance */
  source: string
  sourceId: JobSourceId
  externalId: string
  applyUrl: string
  /** Fingerprint used for deduplication */
  fingerprint: string
  firstSeen: string
  lastSeen: string
  stale: boolean
  description?: string
  /** Explainable match engine score (estimate) */
  matchScore: number
  matchScoreKind: 'engine' | 'seed' | 'provisional' | 'none'
  summary: string
  mustHave: string[]
  niceToHave: string[]
  matchedSkills: string[]
  missingSkills: string[]
  tags: string[]
  /** Full breakdown when scored by Phase 4 engine */
  match?: JobMatchResult
}

export interface SourceRunResult {
  sourceId: JobSourceId
  sourceLabel: string
  ok: boolean
  fetched: number
  kept: number
  error?: string
  durationMs: number
}

export interface IngestReport {
  at: string
  sources: SourceRunResult[]
  totalRaw: number
  afterDedupe: number
  newJobs: number
  updatedJobs: number
  staleMarked: number
}

export interface ApplicationNote {
  id: string
  text: string
  createdAt: string
}

export interface ApplicationHistoryEntry {
  at: string
  from?: AppStage
  to: AppStage
  note?: string
}

export interface Application {
  id: string
  jobId: string
  stage: AppStage
  company: string
  title: string
  city?: string
  createdAt: string
  updatedAt: string
  notes?: string
  noteLog: ApplicationNote[]
  history: ApplicationHistoryEntry[]
  tailoredResumeId?: string
  applyUrl?: string
}

export type InterviewQuestionType =
  | 'company'
  | 'technical'
  | 'behavioral'
  | 'resume'
  | 'job'

export interface InterviewQuestion {
  id: string
  type: InterviewQuestionType
  question: string
  framework: string
  basedOn: string
}

export interface InterviewPack {
  jobId: string
  jobTitle: string
  company: string
  generatedAt: string
  questions: InterviewQuestion[]
  tips: string[]
  disclaimer: string
}

export interface SkillLiftEstimate {
  skill: string
  jobsNeeding: number
  estimatedExtraMatches: number
  estimatedLiftPts: number
  label: string
}

export interface ActivityItem {
  id: string
  text: string
  time: string
  tone?: 'default' | 'positive' | 'warning' | 'accent'
}

export interface MarketSkill {
  skill: string
  demand: number
}
