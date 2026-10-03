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
    risk: { type: 'string' },
    jobDescriptionZh: { type: 'string' }
  },
  required: ['track','fitScore','careerUpside','plExposure','maExposure','transformationExposure','leadershipExposure','optionalityScore','deadEndRisk','recommendation','whyFit','risk','jobDescriptionZh']
};

export async function scoreJob(job) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('Missing OPENAI_API_KEY');
  const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
  const prompt = `Evaluate this role for a finance-trained operator whose long-term paths are: (1) CFO / strategic finance leadership, (2) CEO / GM with direct P&L ownership, (3) PE Operating Partner / portfolio value creation.

Candidate baseline: Oxford MBA; prior FP&A Manager / team-lead level experience; enterprise planning, BI/data transformation, business reviews, supply-chain/operations finance, senior executive partnering and team leadership. She already has strong budgeting, forecasting, reporting and analytics experience.

Score TWO dimensions mentally before producing fitScore:
1) ATTAINABILITY NOW: seniority, required years, domain prerequisites, work-authorisation constraints explicitly stated in the JD, and whether the role is materially too junior or too senior.
2) STRATEGIC INCREMENT: how much NEW career capital it adds beyond her existing FP&A toolkit.

Prioritise direct P&L/commercial ownership, pricing/revenue/GTM decisions, capital allocation, M&A/corporate development, transformation/value creation, board/investor exposure, senior leadership access, people leadership and strong platform quality.

Calibration rules:
- A role can be easy to obtain but still score modestly if it mostly repeats budgeting/forecasting/reporting.
- Penalise Analyst/Associate or explicitly early-career roles unless the scope is unusually ownership-heavy; do not reward a 'Strategic Finance' title by itself.
- Penalise controllership, accounting, consolidation, tax, controls, finance-systems-only and reporting-heavy roles unless they clearly add a missing CFO-critical capability.
- Reward roles where finance influences revenue, pricing, GTM, market entry, product investment, resource allocation, deals or a business-unit P&L.
- Reward credible step-ups in scope (Senior Manager/Director/Head) only when requirements are realistically attainable; do not confuse prestige with fit.
- For CFO track, value breadth across commercial finance + capital allocation + M&A + controllership/treasury exposure.
- For CEO/GM track, require meaningful operating/commercial/P&L decision exposure.
- For Operating Partner track, require transformation, value creation, portfolio/deal exposure or repeatable operating improvement.
- careerUpside reflects what the role can unlock in 3-7 years; fitScore balances attainability and strategic increment.
- Recommendation: Apply = strong realistic target; Stretch = strategically attractive but has a meaningful entry gap; Skip = too junior, low-increment, wrong-function, or materially unrealistic.
- Do not invent salary, sponsorship, responsibilities or facts absent from the JD.

Write whyFit and risk in concise Simplified Chinese only.
Translate the full job description faithfully into natural Simplified Chinese and return it as jobDescriptionZh. Preserve headings, bullets, requirements, benefits, numbers, currencies, product names and proper nouns. Do not summarize or omit material information.

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
