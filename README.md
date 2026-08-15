# CareerOS AI

Premium AI-powered job search and career platform for **India** (Bangalore · Hyderabad).

**All planned phases (1–7) are complete.** Free-first: no paid APIs required for core flows.

## Stack

React 19 · TypeScript · Vite · Tailwind 4 · React Router · Recharts · Lucide · pdfjs-dist · mammoth

## Run

```bash
cd CareerOS-AI
npm install
npm run dev
```

```bash
npm run build && npm run preview
```

### Optional Adzuna

Copy `.env.example` → `.env.local`:

```
VITE_ADZUNA_APP_ID=
VITE_ADZUNA_APP_KEY=
```

## Phases

| # | Feature | Status |
|---|---------|--------|
| 1 | Premium UI shell + mock dashboard | Done |
| 2 | Resume intelligence (PDF/DOCX/TXT parse) | Done |
| 3 | Job ingestion (seed, Remotive, Arbeitnow, Adzuna, JSON) | Done |
| 4 | Explainable matching engine (7 dimensions) | Done |
| 5 | Resume tailoring + ATS before/after + export | Done |
| 6 | Application Kanban (DnD, notes, history) | Done |
| 7 | Interview prep, market lift estimates, live Copilot | Done |

## App map

| Route | Purpose |
|-------|---------|
| `/` | Dashboard |
| `/discover` | Job inventory + filters + refresh |
| `/matches` | Ranked matches + breakdown |
| `/jobs/:id` | Job detail + track / tailor / prep |
| `/resume` | Master resume + tailored versions |
| `/resume/tailor/:jobId` | Tailor for a job |
| `/applications` | Kanban pipeline |
| `/interview` | Interview packs + mock mode |
| `/skill-gaps` | Gaps + opportunity lift |
| `/companies` | Hiring companies from inventory |
| `/market` | Market intelligence |
| `/copilot` | Local NL commands |
| `/settings` | Profile + sources |

## Layout

```
src/
  context/     Resume, Job, Tailor, Application
  lib/resume/  parse, extract, tailor
  lib/jobs/    ingest, sources, normalize, dedupe
  lib/matching engine
  lib/interview/
  lib/market/
  lib/copilot/
  pages/
```

## Principles

- Free-first; keys only in env when used
- No ToS-violating scrapers
- Scores labeled as **estimates**
- Never invent skills, employers, or experience
- Prefer original apply URLs when available
