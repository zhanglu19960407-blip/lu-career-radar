import { cors, requireAccess, json } from './_utils.js';

const schema = {
  type: 'object', additionalProperties: false,
  properties: {
    track: { type: 'string', enum: ['CFO','CEO/GM','Operating Partner'] },
    fitScore: { type: 'integer', minimum: 0, maximum: 100 },
    careerUpside: { type: 'number', minimum: 1, maximum: 10 },
    plExposure: { type: 'integer', minimum: 1, maximum: 5 },
    maExposure: { type: 'integer', minimum: 1, maximum: 5 },
    transformationExposure: { type: 'integer', minimum: 1, maximum: 5 },
    leadershipExposure: { type: 'integer', minimum: 1, maximum: 5 },
    optionalityScore: { type: 'integer', minimum: 1, maximum: 10 },
    deadEndRisk: { type: 'integer', minimum: 1, maximum: 5 },
    recommendation: { type: 'string', enum: ['Apply','Stretch','Skip'] },
    whyFit: { type: 'string' },
    risk: { type: 'string' }
  },
  required: ['track','fitScore','careerUpside','plExposure','maExposure','transformationExposure','leadershipExposure','optionalityScore','deadEndRisk','recommendation','whyFit','risk']
};

export async function scoreJob(job) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('Missing OPENAI_API_KEY');
  const model = process.env.OPENAI_MODEL || 'gpt-6-astra';
  const prompt = `Evaluate this role for a finance-trained operator whose long-term paths are: (1) CFO / strategic finance leadership, (2) CEO / GM with direct P&L ownership, (3) PE Operating Partner / portfolio value creation.

Prioritise career optionality, direct P&L/commercial ownership, pricing/revenue decisions, capital allocation, M&A, transformation/value creation, senior leadership exposure and platform quality. Penalise reporting-heavy FP&A, consolidation, accounting-heavy roles, narrow forecasting roles, and roles that merely repeat existing FP&A skills.

Fit score should reflect both current attainability and strategic fit. Career upside should reflect what the role can unlock in 3-7 years. Do not invent salary or facts absent from the JD.

ROLE:
Company: ${job.company || ''}
Title: ${job.title || ''}
Location: ${job.city || ''}, ${job.country || ''}
Industry: ${job.industry || ''}
Job description:
${job.jobDescription || job.job_description || ''}`;

  const resp = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: [{ type: 'input_text', text: 'You are a precise career opportunity scoring engine. Return only the requested structured output.' }] },
        { role: 'user', content: [{ type: 'input_text', text: prompt }] }
      ],
      text: { format: { type: 'json_schema', name: 'career_job_score', strict: true, schema } }
    })
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(JSON.stringify(data));
  const out = data.output?.flatMap(x => x.content || []).find(x => x.type === 'output_text')?.text;
  if (!out) throw new Error('OpenAI response did not include structured output');
  return JSON.parse(out);
}

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (!requireAccess(req, res)) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  try { return json(res, 200, await scoreJob(req.body || {})); }
  catch (e) { return json(res, 500, { error: e.message }); }
}
