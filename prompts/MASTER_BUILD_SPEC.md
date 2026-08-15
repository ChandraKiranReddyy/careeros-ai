# CareerOS AI — Master Build Specification

Premium AI-powered job search and career management platform.

## Primary market

- India
- Bangalore / Bengaluru
- Hyderabad / Secunderabad
- Optional India-remote jobs

## Core product

1. Upload and parse a master resume
2. Create a structured candidate profile
3. Discover relevant jobs via legitimate public APIs / ATS feeds / public career pages (where permitted)
4. Prioritize Bangalore and Hyderabad
5. Normalize locations and dedupe postings
6. Match jobs against candidate profile
7. Explainable 0–100 match score (AI estimate)
8. Skill matches, gaps, experience/role/location/ATS keyword coverage
9. Job-specific tailored resume from master (no fabrication)
10. Application Kanban pipeline
11. Interview prep from JD + resume
12. Skill-gap and market intelligence
13. AI Copilot for natural-language commands

## Free-first

- No paid AI required for basic app
- Replaceable AI provider adapters
- No ToS-violating scraping
- API keys in env only

## Initial role vocabulary

Solutions Engineer, Senior Solutions Engineer, Sales Engineer, Pre-Sales Engineer, Solutions Architect, Technical Solutions Engineer, Customer Solutions Engineer, Network Solutions Engineer, Cloud Solutions Engineer, AI Solutions Engineer, Technical Consultant

## UI

Premium SaaS (Linear + Notion + fintech analytics). Dark default, light mode, desktop-first, polished empty/loading/error states.

## Navigation

Dashboard · Discover Jobs · My Matches · Resume Center · Applications · Interview Prep · Skill Gaps · Companies · Market Intelligence · AI Copilot · Settings

## Build strategy

1. Architecture + premium UI shell + mock data (Phase 1)
2. Resume intelligence
3. Job ingestion
4. Matching
5. Resume tailoring
6. Application tracking
7. Interview + market analytics

Never invent credentials, candidate experience, or unsupported claims.
