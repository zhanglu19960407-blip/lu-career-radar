import { cors, requireAccess, json, supabaseFetch, clientToDb, dbToClient } from '../_utils.js';
import { scoreJob } from '../score-job.js';
import { RADAR_SOURCES, isRelevantJob } from '../../config/radar-sources.js';

async function fetchLever(source) {
  const r = await fetch(`https://api.lever.co/v0/postings/${source.board}?mode=json`);
  if (!r.ok) throw new Error(`Lever ${source.board}: ${r.status}`);
  const rows = await r.json();
  return rows.map(x => ({
    company: source.company, title: x.text,
    location: x.categories?.location || '',
    city: /london/i.test(x.categories?.location || '') ? 'London' : '',
    country: 'United Kingdom', geography: 'UK', currency: 'GBP',
    industry: '', url: x.hostedUrl || x.applyUrl || '',
    source: `Lever:${source.board}`,
    jobDescription: [x.descriptionPlain, ...(x.lists || []).map(v => `${v.text}: ${v.content}`)].filter(Boolean).join('\n\n')
  }));
}

async function fetchAshby(source) {
  const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${source.board}?includeCompensation=true`);
  if (!r.ok) throw new Error(`Ashby ${source.board}: ${r.status}`);
  const data = await r.json();
  return (data.jobs || []).map(x => ({
    company: source.company, title: x.title,
    location: x.location || '',
    city: /london/i.test(x.location || '') ? 'London' : '',
    country: 'United Kingdom', geography: 'UK', currency: 'GBP',
    industry: '', url: x.jobUrl || x.applyUrl || '',
    source: `Ashby:${source.board}`,
    jobDescription: x.descriptionPlain || x.description || ''
  }));
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAccess(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const maxScore = Math.min(Math.max(Number(req.body?.maxScore || 5), 1), 10);
    const discovered = [];
    const sourceErrors = [];
    for (const source of RADAR_SOURCES) {
      try {
        const jobs = source.type === 'lever' ? await fetchLever(source) : await fetchAshby(source);
        discovered.push(...jobs.filter(isRelevantJob));
      } catch (e) { sourceErrors.push({ source: source.company, error: e.message }); }
    }

    const existing = await supabaseFetch('jobs?select=url,fingerprint&limit=5000');
    const urls = new Set(existing.map(x => x.url).filter(Boolean));
    const fresh = discovered.filter(x => !x.url || !urls.has(x.url));
    const saved = [];
    const errors = [];

    for (const job of fresh.slice(0, maxScore)) {
      try {
        const scored = job.jobDescription ? await scoreJob(job) : {};
        const db = clientToDb({ ...job, ...scored });
        const rows = await supabaseFetch('jobs?on_conflict=fingerprint', {
          method: 'POST', prefer: 'resolution=merge-duplicates,return=representation',
          body: JSON.stringify(db)
        });
        if (rows?.[0]) saved.push(dbToClient(rows[0]));
      } catch (e) { errors.push({ company: job.company, title: job.title, error: e.message }); }
    }

    return json(res, 200, {
      ok: true, sources: RADAR_SOURCES.length, discovered: discovered.length,
      newCandidates: fresh.length, scoredAndSaved: saved.length,
      jobs: saved, sourceErrors, errors
    });
  } catch (e) {
    console.error('Career Radar run failure', e);
    return json(res, 500, { error: e.message });
  }
}
