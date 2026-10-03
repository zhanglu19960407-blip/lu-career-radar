# Lu Career Radar 3.0

A deployable career-intelligence system for three long-term tracks:

1. CFO / Strategic Finance
2. CEO / GM / direct P&L ownership
3. PE Operating Partner / Portfolio Value Creation

## Architecture

`Job sources / Clay → n8n → /api/ingest → OpenAI Structured Outputs → Supabase → Lu Career Radar`

The browser never receives your OpenAI key or Supabase secret key. Vercel serverless API routes own all privileged operations.

## Included

- Multi-region / city job dashboard
- CFO / CEO-GM / Operating Partner classification
- P&L, M&A, transformation, leadership, optionality and dead-end scoring
- Local salary + bonus
- Estimated local take-home + annual/monthly RMB
- UK 2026/27 England income tax + employee NI model
- Editable effective-tax assumptions for other markets
- Compensation Lab
- Application pipeline
- AI score + save from a pasted JD
- Supabase schema
- Vercel API routes
- OpenAI Structured Outputs scoring endpoint
- Job ingest/upsert endpoint with deterministic deduplication
- n8n importable workflow template
- Clay webhook path
- Vercel deployment config

## Files

- `index.html`, `styles.css`, `app.js` — dashboard
- `api/jobs.js` — list/upsert/update/delete jobs
- `api/score-job.js` — OpenAI career scoring
- `api/ingest.js` — score + dedupe + Supabase upsert in one call
- `api/health.js` — deployment health check
- `supabase/schema.sql` — database schema
- `n8n/lu-career-radar-workflow.json` — scheduled feed + Clay webhook workflow
- `.env.example` — required environment variables
- `SETUP.md` — exact connection steps

## Security model

- `SUPABASE_SECRET_KEY` is server-only.
- `OPENAI_API_KEY` is server-only.
- `CAREER_RADAR_ACCESS_TOKEN` protects the API for this single-user deployment.
- Supabase RLS is enabled and direct anon/authenticated access is revoked; the browser talks to your own serverless API.
- For a future multi-user version, replace the single access token with Supabase Auth / SSO.

## Deploy

See `SETUP.md`.

## Compensation model

The dashboard stores salary in local currency and calculates take-home separately. UK/England uses a deterministic 2026/27 formula. Other markets use visible, editable effective tax assumptions. This is for cross-market career comparison, not tax filing.
