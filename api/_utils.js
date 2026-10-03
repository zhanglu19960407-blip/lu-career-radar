export function json(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

export function cors(req, res) {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', 'x-career-radar-token, content-type');
  res.setHeader('access-control-allow-methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  return false;
}

export function requireAccess(req, res) {
  const expected = process.env.CAREER_RADAR_ACCESS_TOKEN;
  if (!expected) return true;
  const actual = String(req.headers['x-career-radar-token'] || '');
  if (actual !== expected) {
    json(res, 401, { error: 'Unauthorized' });
    return false;
  }
  return true;
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase credentials. Expected SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY.'
    );
  }
  return { url: url.replace(/\/$/, ''), key };
}

function supabaseHeaders(prefer) {
  const { key } = supabaseConfig();
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    'content-type': 'application/json',
    ...(prefer ? { prefer } : {})
  };
}

export async function supabaseFetch(path, options = {}) {
  const { url } = supabaseConfig();
  let resp;
  try {
    resp = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers: { ...supabaseHeaders(options.prefer), ...(options.headers || {}) }
    });
  } catch (e) {
    let hostname = 'invalid-url';
    try { hostname = new URL(url).hostname; } catch {}
    console.error('Supabase fetch transport failure', {
      hostname,
      error: e?.message || String(e),
      causeCode: e?.cause?.code || null,
      causeMessage: e?.cause?.message || null
    });
    throw e;
  }
  const text = await resp.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = text; } }
  if (!resp.ok) throw new Error(typeof data === 'string' ? data : JSON.stringify(data));
  return data;
}

export function fingerprint(job) {
  const raw = [job.company, job.title, job.city, job.url].map(v => String(v || '').trim().toLowerCase()).join('|');
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) { h ^= raw.charCodeAt(i); h = Math.imul(h, 16777619); }
  return `j_${(h >>> 0).toString(16)}`;
}

export function dbToClient(j) {
  return {
    id: j.id,
    company: j.company,
    title: j.title,
    city: j.city || '',
    country: j.country || '',
    geography: j.geography || '',
    currency: j.currency || 'GBP',
    track: j.track || 'CFO',
    fitScore: Number(j.fit_score ?? 0),
    careerUpside: Number(j.career_upside ?? 0),
    plExposure: Number(j.pl_exposure ?? 0),
    maExposure: Number(j.ma_exposure ?? 0),
    deadEndRisk: Number(j.dead_end_risk ?? 0),
    transformationExposure: Number(j.transformation_exposure ?? 0),
    leadershipExposure: Number(j.leadership_exposure ?? 0),
    optionalityScore: Number(j.optionality_score ?? 0),
    salaryMin: Number(j.salary_min ?? 0),
    salaryMax: Number(j.salary_max ?? 0),
    bonusPct: Number(j.bonus_pct ?? 0),
    industry: j.industry || '',
    whyFit: j.why_fit || '',
    risk: j.risk || '',
    recommendation: j.recommendation || '',
    status: j.status || 'Inbox',
    url: j.url || '',
    source: j.source || '',
    jobDescription: j.job_description || '',
    jobDescriptionZh: j.job_description_zh || '',
    createdAt: j.created_at
  };
}

export function clientPatchToDb(j) {
  const map = {
    city:'city', country:'country', geography:'geography', currency:'currency', track:'track',
    fitScore:'fit_score', careerUpside:'career_upside', plExposure:'pl_exposure', maExposure:'ma_exposure',
    deadEndRisk:'dead_end_risk', transformationExposure:'transformation_exposure', leadershipExposure:'leadership_exposure',
    optionalityScore:'optionality_score', salaryMin:'salary_min', salaryMax:'salary_max', bonusPct:'bonus_pct',
    industry:'industry', whyFit:'why_fit', risk:'risk', recommendation:'recommendation', status:'status', url:'url',
    source:'source', jobDescription:'job_description', jobDescriptionZh:'job_description_zh'
  };
  const out = { updated_at: new Date().toISOString() };
  for (const [client, db] of Object.entries(map)) if (Object.prototype.hasOwnProperty.call(j, client)) out[db] = j[client];
  return out;
}

export function clientToDb(j) {
  return {
    fingerprint: j.fingerprint || fingerprint(j),
    company: j.company,
    title: j.title,
    city: j.city || null,
    country: j.country || null,
    geography: j.geography || null,
    currency: j.currency || 'GBP',
    track: j.track || null,
    fit_score: Number(j.fitScore ?? j.fit_score ?? 0),
    career_upside: Number(j.careerUpside ?? j.career_upside ?? 0),
    pl_exposure: Number(j.plExposure ?? j.pl_exposure ?? 0),
    ma_exposure: Number(j.maExposure ?? j.ma_exposure ?? 0),
    dead_end_risk: Number(j.deadEndRisk ?? j.dead_end_risk ?? 0),
    transformation_exposure: Number(j.transformationExposure ?? j.transformation_exposure ?? 0),
    leadership_exposure: Number(j.leadershipExposure ?? j.leadership_exposure ?? 0),
    optionality_score: Number(j.optionalityScore ?? j.optionality_score ?? 0),
    salary_min: Number(j.salaryMin ?? j.salary_min ?? 0),
    salary_max: Number(j.salaryMax ?? j.salary_max ?? 0),
    bonus_pct: Number(j.bonusPct ?? j.bonus_pct ?? 0),
    industry: j.industry || null,
    why_fit: j.whyFit ?? j.why_fit ?? null,
    risk: j.risk || null,
    recommendation: j.recommendation || null,
    status: j.status || 'Inbox',
    url: j.url || null,
    source: j.source || null,
    job_description: j.jobDescription ?? j.job_description ?? null,
    job_description_zh: j.jobDescriptionZh ?? j.job_description_zh ?? null,
    updated_at: new Date().toISOString()
  };
}
