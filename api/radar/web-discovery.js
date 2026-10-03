import { WEB_DISCOVERY_COMPANIES, WEB_DISCOVERY_MARKETS, WEB_DISCOVERY_TERMS } from '../../config/web-discovery.js';

function extractOutputText(data){
  if(data.output_text) return data.output_text;
  return (data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');
}
function parseJson(text=''){
  const cleaned=text.trim().replace(/^\`\`\`json\s*/i,'').replace(/\`\`\`$/,'').trim();
  const parsed=JSON.parse(cleaned);
  return Array.isArray(parsed)?parsed:(parsed.jobs||[]);
}
export async function discoverOfficialJobs({maxCompanies=100}={}){
  const key=process.env.OPENAI_API_KEY;
  if(!key) throw new Error('Missing OPENAI_API_KEY');
  const model=process.env.OPENAI_MODEL || 'gpt-5.6-luna';
  const companies=WEB_DISCOVERY_COMPANIES.slice(0,Math.max(1,Math.min(Number(maxCompanies)||100,WEB_DISCOVERY_COMPANIES.length)));
  const batchSize=10;
  const companyBatches=[];
  for(let i=0;i<companies.length;i+=batchSize) companyBatches.push(companies.slice(i,i+batchSize));
  const allJobs=[];
  for(const batch of companyBatches){
  const companyText=batch.map(x=>`${x.company}: ${x.domains.join(', ')}`).join('\n');
  const prompt=`Find currently open jobs ONLY on the official career domains listed below.

TARGET COMPANIES AND ALLOWED OFFICIAL DOMAINS:
${companyText}

TARGET LOCATIONS:
${WEB_DISCOVERY_MARKETS.join(', ')}

TARGET ROLE THEMES:
${WEB_DISCOVERY_TERMS.join(', ')}

Return at most 100 strong matches. Every result MUST be a currently open individual job posting, not a search page, company careers homepage, LinkedIn page, aggregator, cached page, or expired posting. The url MUST point to an allowed official company domain above. Only return roles whose job title matches the TARGET ROLE THEMES. Do not broaden to generic finance, accounting, analyst, business operations, GM-track, or MBA roles.

Return ONLY valid JSON with this shape:
{"jobs":[{"company":"","title":"","location":"","industry":"","url":"","jobDescription":""}]}
jobDescription should be a concise factual summary of the official posting sufficient for relevance screening. Do not invent missing facts.`;

  const r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
    body:JSON.stringify({model,tools:[{type:'web_search',search_context_size:'medium'}],input:prompt})
  });
  if(!r.ok) throw new Error(`Web discovery OpenAI error ${r.status}: ${(await r.text()).slice(0,300)}`);
  const data=await r.json();
  const jobs=parseJson(extractOutputText(data));
  const allowed=new Map(batch.map(x=>[x.company,x.domains]));
  const valid=jobs.filter(j=>{
    try{
      const host=new URL(j.url).hostname.toLowerCase();
      const domains=allowed.get(j.company)||[];
      return domains.some(d=>{const root=d.split('/')[0].toLowerCase();return host===root||host.endsWith('.'+root);});
    }catch{return false;}
  }).map(j=>({...j,source:'Official Web Discovery'}));
  allJobs.push(...valid);
  }
  const seen=new Set();
  return allJobs.filter(j=>{const k=j.url||`${j.company}|${j.title}|${j.location}`;if(seen.has(k))return false;seen.add(k);return true;});
}
