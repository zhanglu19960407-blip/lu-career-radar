import { cors, requireAccess, json, supabaseFetch, clientToDb, dbToClient } from '../_utils.js';
import { scoreJob } from '../score-job.js';
import { RADAR_SOURCES, isRelevantJob, classifyMarket } from '../../config/radar-sources.js';

function locationMeta(location='') {
  const market = classifyMarket(location);
  const cityPatterns = [
    ['London',/london/i],['Shanghai',/shanghai/i],['Beijing',/beijing/i],['Shenzhen',/shenzhen/i],
    ['Guangzhou',/guangzhou/i],['Hangzhou',/hangzhou/i],['Chengdu',/chengdu/i],['Hong Kong',/hong kong|\bhk\b/i],
    ['Singapore',/singapore/i],['Dubai',/dubai/i],['Abu Dhabi',/abu dhabi/i],['Riyadh',/riyadh/i],['Doha',/doha/i]
  ];
  const city = cityPatterns.find(([,p])=>p.test(location))?.[0] || location.split(/[\/,]/)[0].trim();
  const country = market?.geography === 'UK' ? 'United Kingdom'
    : market?.geography === 'Mainland China' ? 'China'
    : market?.geography === 'Hong Kong' ? 'Hong Kong'
    : market?.geography === 'Singapore' ? 'Singapore'
    : /riyadh|saudi/i.test(location) ? 'Saudi Arabia'
    : /doha|qatar/i.test(location) ? 'Qatar'
    : market?.geography === 'Middle East' ? 'United Arab Emirates' : '';
  return { city, country, geography: market?.geography || '', currency: market?.currency || 'USD' };
}

async function fetchLever(source) {
  const r = await fetch(`https://api.lever.co/v0/postings/${source.board}?mode=json`);
  if (!r.ok) throw new Error(`Lever ${source.board}: ${r.status}`);
  const rows = await r.json();
  return rows.map(x => {
    const location=x.categories?.location || '';
    return { company:source.company,title:x.text,location,...locationMeta(location),industry:'',
      url:x.hostedUrl||x.applyUrl||'',source:`Lever:${source.board}`,
      jobDescription:[x.descriptionPlain,...(x.lists||[]).map(v=>`${v.text}: ${v.content}`)].filter(Boolean).join('\n\n') };
  });
}

async function fetchAshby(source) {
  const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${source.board}?includeCompensation=true`);
  if (!r.ok) throw new Error(`Ashby ${source.board}: ${r.status}`);
  const data=await r.json();
  return (data.jobs||[]).map(x => {
    const location=x.location||'';
    return { company:source.company,title:x.title,location,...locationMeta(location),industry:'',
      url:x.jobUrl||x.applyUrl||'',source:`Ashby:${source.board}`,jobDescription:x.descriptionPlain||x.description||'' };
  });
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAccess(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const maxScore = Math.min(Math.max(Number(req.body?.maxScore || 5), 1), 10);
    const discovered = [];
    const rawJobs = [];
    const sourceStats = [];
    const sourceErrors = [];
    for (const source of RADAR_SOURCES) {
      try {
        const jobs = source.type === 'lever' ? await fetchLever(source) : await fetchAshby(source);
        rawJobs.push(...jobs);
        const marketJobs = jobs.filter(x=>Boolean(classifyMarket(x.location||'')));
        const relevantJobs = jobs.filter(isRelevantJob);
        discovered.push(...relevantJobs);
        sourceStats.push({source:source.company,raw:jobs.length,market:marketJobs.length,relevant:relevantJobs.length});
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
      ok: true, sources: RADAR_SOURCES.length, rawDiscovered: rawJobs.length, sourceStats, discovered: discovered.length,
      newCandidates: fresh.length, scoredAndSaved: saved.length,
      jobs: saved, sourceErrors, errors
    });
  } catch (e) {
    console.error('Career Radar run failure', e);
    return json(res, 500, { error: e.message });
  }
}
