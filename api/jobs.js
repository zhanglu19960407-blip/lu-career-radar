import { cors, requireAccess, json, supabaseFetch, dbToClient, clientToDb, clientPatchToDb } from './_utils.js';

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAccess(req, res)) return;
  try {
    if (req.method === 'GET') {
      const rows = await supabaseFetch('jobs?select=*&order=created_at.desc&limit=1000');
      return json(res, 200, { jobs: rows.map(dbToClient) });
    }
    if (req.method === 'POST') {
      const db = clientToDb(req.body || {});
      const rows = await supabaseFetch('jobs?on_conflict=fingerprint', {
        method: 'POST', prefer: 'resolution=merge-duplicates,return=representation', body: JSON.stringify(db)
      });
      return json(res, 200, { job: dbToClient(rows[0]) });
    }
    if (req.method === 'PATCH') {
      const id = req.query.id || req.body?.id;
      if (!id) return json(res, 400, { error: 'Missing id' });
      const patch = clientPatchToDb(req.body || {});
      const rows = await supabaseFetch(`jobs?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH', prefer: 'return=representation', body: JSON.stringify(patch)
      });
      return json(res, 200, { job: dbToClient(rows[0]) });
    }
    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) return json(res, 400, { error: 'Missing id' });
      await supabaseFetch(`jobs?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: 'return=minimal' });
      return json(res, 200, { ok: true });
    }
    return json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    console.error('Career Radar /api/jobs failure', {
      method: req.method,
      message: e?.message || String(e),
      supabaseUrlConfigured: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseSecretConfigured: Boolean(process.env.SUPABASE_SECRET_KEY),
      serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      anonConfigured: Boolean(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    });
    return json(res, 500, { error: e?.message || 'Cloud database request failed' });
  }
}
