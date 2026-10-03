# Lu Career Radar 3.0 — 15-minute connection checklist

The code is fully wired. You only need to create the external accounts/projects and paste their credentials.

## 1) Supabase
1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. Open **Settings → API Keys**.
4. Copy:
   - Project URL → `SUPABASE_URL`
   - Secret key (`sb_secret_...`) → `SUPABASE_SECRET_KEY`
5. Do **not** put the secret key in browser code. This project only uses it in Vercel API routes.

## 2) OpenAI API
1. Create an API key in your OpenAI API project.
2. Save it as `OPENAI_API_KEY` in Vercel.
3. `OPENAI_MODEL` is configurable. The included default is `gpt-6-astra`; change this environment variable without changing code if you want another Structured-Outputs-capable model.

## 3) Vercel
1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Add the five environment variables from `.env.example`:
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `CAREER_RADAR_ACCESS_TOKEN`
4. Deploy.
5. Open `https://YOUR-DOMAIN/api/health` with an `X-Career-Radar-Token: ...` header to verify, or use the site's **Tax & FX Settings → Cloud connection → Test connection** control.
6. In the site, paste the same `CAREER_RADAR_ACCESS_TOKEN` once. It is saved only in that browser's localStorage.

## 4) Seed existing sample jobs (optional)
Open the dashboard and use **Import jobs** with `sample-jobs.json`, or add new jobs manually. For AI scoring, paste the JD and choose **AI score + save**.

## 5) n8n
1. Import `n8n/lu-career-radar-workflow.json`.
2. Configure these n8n environment variables (or replace the expressions with fixed values/credentials in the nodes):
   - `CAREER_RADAR_BASE_URL=https://YOUR-DOMAIN.vercel.app`
   - `CAREER_RADAR_ACCESS_TOKEN=the same long random token`
   - `JOB_FEED_URL=https://...` (optional feed that returns a JSON array or `{jobs:[...]}`)
3. The workflow has two entrances:
   - **Daily 07:00** → fetch a JSON job feed → normalize → `/api/ingest`
   - **Clay Webhook** → receive rows from Clay → normalize → `/api/ingest`
4. Activate only after the test run succeeds.

## 6) Clay
Use a Clay table with at least these columns:
- `company`
- `title`
- `city`
- `country`
- `currency`
- `salary_min`
- `salary_max`
- `bonus_pct`
- `industry`
- `job_url`
- `job_description`

Send new/updated rows to the n8n **Clay Webhook** production URL. n8n then calls Career Radar `/api/ingest`, which:
1. scores the JD with OpenAI Structured Outputs,
2. creates a deterministic fingerprint,
3. upserts into Supabase,
4. makes the role appear in the dashboard.

## 7) What is deliberately not automated
- Applying to a job
- Sending networking messages
- Inventing missing salaries
- Tax calculations through an LLM

The system automates discovery, normalization, deduplication, scoring and storage. Human approval remains before any application/outreach action.
