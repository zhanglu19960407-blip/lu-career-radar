import { cors, requireAccess, json, supabaseFetch, clientToDb, dbToClient } from './_utils.js';
import { scoreJob } from './score-job.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAccess(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try {
    const job = req.body || {};
    if (!job.company || !job.title) return json(res, 400, { error: 'company and title are required' });
    let scored = {};
    if (job.jobDescription || job.job_description) scored = await scoreJob(job);
    const merged = { ...job, ...scored };
    const db = clientToDb(merged);
    const rows = await supabaseFetch('jobs?on_conflict=fingerprint', {
      method: 'POST', prefer: 'resolution=merge-duplicates,return=representation', body: JSON.stringify(db)
    });
    return json(res, 200, { job: dbToClient(rows[0]), scored: Boolean(job.jobDescription || job.job_description) });
  } catch (e) { return json(res, 500, { error: e.message }); }
}
