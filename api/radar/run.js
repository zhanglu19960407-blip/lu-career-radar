import { cors, requireAccess, json, supabaseFetch, clientToDb, dbToClient } from '../_utils.js';
import { RADAR_SOURCES, isRelevantJob, classifyMarket } from '../../config/radar-sources.js';
import { discoverOfficialJobs } from './web-discovery.js';

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
      url:x.hostedUrl||x.applyUrl||'',source:`Lever:${source.board}`,postedAt:x.createdAt?new Date(x.createdAt).toISOString():null,
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
      url:x.jobUrl||x.applyUrl||'',source:`Ashby:${source.board}`,postedAt:x.publishedAt||x.createdAt||null,jobDescription:x.descriptionPlain||x.description||'' };
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
        const relevantJobs = jobs.filter(x=>isRelevantJob(x) && /^https?:\/\//i.test(x.url||''));
        discovered.push(...relevantJobs);
        sourceStats.push({source:source.company,raw:jobs.length,market:marketJobs.length,relevant:relevantJobs.length});
      } catch (e) { sourceErrors.push({ source: source.company, error: e.message }); }
    }

    let webDiscovery = { raw: 0, relevant: 0, error: null };
    try {
      const existingBeforeWeb = await supabaseFetch('jobs?select=url&limit=5000');
      const knownWebUrls = new Set(existingBeforeWeb.map(x=>x.url).filter(Boolean));
      let batchSaved = 0;
      const webJobs = await discoverOfficialJobs({
        maxCompanies: Number(req.body?.maxWebCompanies || 100),
        onBatch: async ({batch,totalBatches,jobs}) => {
          const normalized = jobs.map(x=>({ ...x, ...locationMeta(x.location||''), source:x.source||'Official Web Discovery' }))
            .filter(x=>isRelevantJob(x) && /^https?:\/\//i.test(x.url||''));
          for(const job of normalized){
            if(knownWebUrls.has(job.url)) continue;
            try{
              const db=clientToDb({...job,recommendation:'Stretch',whyFit:null,risk:null});
              await supabaseFetch('jobs?on_conflict=fingerprint',{method:'POST',prefer:'resolution=merge-duplicates,return=minimal',body:JSON.stringify(db)});
              knownWebUrls.add(job.url); batchSaved++;
            }catch(e){ console.warn('Web batch save failed',batch,job.company,job.title,e.message); }
          }
          console.log('Career Radar web batch',JSON.stringify({batch,totalBatches,found:jobs.length,saved:batchSaved}));
        }
      });
      webDiscovery.raw = webJobs.length;
      webDiscovery.batchErrors = webJobs.batchErrors || [];
      webDiscovery.batchSaved = batchSaved;
      const normalizedWebJobs = webJobs.map(x => ({ ...x, ...locationMeta(x.location||''), source: x.source || 'Official Web Discovery' }));
      const relevantWebJobs = normalizedWebJobs.filter(x => isRelevantJob(x) && /^https?:\/\//i.test(x.url||''));
      webDiscovery.relevant = relevantWebJobs.length;
      rawJobs.push(...normalizedWebJobs);
      discovered.push(...relevantWebJobs);
    } catch (e) {
      webDiscovery.error = e.message;
      console.warn('Official web discovery failed', e);
    }

    const existing = await supabaseFetch('jobs?select=url,fingerprint&limit=5000');
    const urls = new Set(existing.map(x => x.url).filter(Boolean));
    const fresh = discovered.filter(x => /^https?:\/\//i.test(x.url||'') && !urls.has(x.url));
    const priorityTitle = /senior finance manager|finance manager|finance business partner|strategic finance|commercial finance|fp&a|financial planning|finance director|head of finance|corporate development|m&a|value creation|portfolio operations|portfolio finance|portfolio performance|private equity|transformation|performance improvement/i;
    const majorCompany = /amazon|aws|microsoft|google|tiktok|bytedance|unilever|procter|diageo|l'oréal|blackstone|kkr|apollo|mckinsey|bcg|bain/i;
    fresh.sort((a,b) => {
      const rank = j => (j.source === 'Official Web Discovery' ? 100 : 0)
        + (majorCompany.test(j.company||'') ? 50 : 0)
        + (priorityTitle.test(j.title||'') ? 25 : 0);
      return rank(b) - rank(a);
    });
    const saved = [];
    const errors = [];

    // Discovery-first mode: persist every fresh relevant job immediately.
    // AI scoring is intentionally disabled so it never limits visibility.
    for (const job of fresh) {
      try {
        const db = clientToDb({
          ...job,
          recommendation: 'Stretch',
          whyFit: null,
          risk: null
        });
        const rows = await supabaseFetch('jobs?on_conflict=fingerprint', {
          method: 'POST', prefer: 'resolution=merge-duplicates,return=representation',
          body: JSON.stringify(db)
        });
        if (rows?.[0]) saved.push(dbToClient(rows[0]));
      } catch (e) {
        errors.push({ company: job.company, title: job.title, error: e.message });
      }
    }

    const diagnostics={sources:RADAR_SOURCES.length,webDiscovery,rawDiscovered:rawJobs.length,sourceStats,discovered:discovered.length,newCandidates:fresh.length,scoredAndSaved:saved.length,sourceErrors,errors};
    console.log('Career Radar diagnostics', JSON.stringify(diagnostics));
    return json(res, 200, {
      ok: true, ...diagnostics,
      newCandidates: fresh.length, scoredAndSaved: saved.length,
      jobs: saved, sourceErrors, errors
    });
  } catch (e) {
    console.error('Career Radar run failure', e);
    return json(res, 500, { error: e.message });
  }
}
