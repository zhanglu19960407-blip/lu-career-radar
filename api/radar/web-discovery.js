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
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

export async function discoverOfficialJobs({maxCompanies=150,onBatch=null,onCompanyStart=null,rotation=0,batchOnly=null,companyOnly=null}={}){
  const key=process.env.OPENAI_API_KEY;
  if(!key) throw new Error('Missing OPENAI_API_KEY');
  const model=process.env.OPENAI_MODEL || 'gpt-5.6-luna';
  const limit=Math.max(1,Math.min(Number(maxCompanies)||150,WEB_DISCOVERY_COMPANIES.length));
  const t1=WEB_DISCOVERY_COMPANIES.filter(x=>x.tier===1);
  const t2=WEB_DISCOVERY_COMPANIES.filter(x=>x.tier===2);
  const t3=WEB_DISCOVERY_COMPANIES.filter(x=>x.tier===3);
  const t4=WEB_DISCOVERY_COMPANIES.filter(x=>x.tier===4);
  const rotate=(arr,count,offset)=>Array.from({length:Math.min(count,arr.length)},(_,i)=>arr[(i+offset)%arr.length]);
  // Every run: all Tier-1 + 20 rotating Tier-2 + 10 rotating Tier-3 + 5 rotating Tier-4.
  // rotation changes by UTC day unless explicitly supplied.
  const r=Number.isFinite(Number(rotation))&&Number(rotation)!==0?Number(rotation):Math.floor(Date.now()/86400000);
  const selected=[...t1,...rotate(t2,20,r*20),...rotate(t3,10,r*10),...rotate(t4,5,r*5)];
  const companies=companyOnly ? WEB_DISCOVERY_COMPANIES.filter(x=>x.company===companyOnly) : selected.slice(0,limit);
  if(companyOnly && !companies.length) throw new Error(`Unknown company: ${companyOnly}`);
  const batchSize=10;
  const companyBatches=[];
  for(let i=0;i<companies.length;i+=batchSize) companyBatches.push(companies.slice(i,i+batchSize));
  const allJobs=[];
  const batchErrors=[];
  const batchIndexes=batchOnly===null ? companyBatches.map((_,i)=>i) : [Math.max(0,Math.min(Number(batchOnly)||0,companyBatches.length-1))];
  for(const batchIndex of batchIndexes){
  const batch=companyBatches[batchIndex];
  if(onCompanyStart) await Promise.all(batch.map(company=>onCompanyStart(company)));
  const companyText=batch.map(x=>`${x.company}: ${x.domains.join(', ')}`).join('\n');
  const prompt=`Find currently open jobs ONLY on the official career domains listed below.

TARGET COMPANIES AND ALLOWED OFFICIAL DOMAINS:
${companyText}

TARGET LOCATIONS:
${WEB_DISCOVERY_MARKETS.join(', ')}

TARGET ROLE THEMES:
${WEB_DISCOVERY_TERMS.join(', ')}

DISCOVERY EXPANSION:
Also use public-web discovery patterns similar to the user's job search intent: Senior Finance Manager, Finance Manager, Finance Business Partner, Financial Planning & Analysis Manager / FP&A Manager, MBA Summer Intern, MBA Intern, MBA Internship, and MBA Summer Associate. On-site and hybrid roles are both acceptable. This is discovery only: never return LinkedIn URLs or job aggregators; verify each result against the employer's official career/ATS domain above.

Return at most 100 strong matches. Every result MUST be a currently open individual job posting, not a search page, company careers homepage, LinkedIn page, aggregator, cached page, or expired posting. The url MUST point to an allowed official company domain above. Only return roles whose job title matches the TARGET ROLE THEMES. Do not broaden to generic finance, accounting, analyst, business operations, or GM-track roles. MBA roles are allowed only when the title explicitly indicates MBA internship/program intent.

Return ONLY valid JSON with this shape:
{"jobs":[{"company":"","title":"","location":"","industry":"","url":"","jobDescription":""}]}
jobDescription should be a concise factual summary of the official posting sufficient for relevance screening. Do not invent missing facts.`;

  let data=null;
  let lastError=null;
  for(let attempt=0;attempt<4;attempt++){
    if(attempt>0) await sleep(6000*Math.pow(2,attempt-1));
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
      body:JSON.stringify({model,tools:[{type:'web_search',search_context_size:'low'}],input:prompt})
    });
    if(r.ok){ data=await r.json(); break; }
    const detail=(await r.text()).slice(0,300);
    lastError=new Error(`Web discovery OpenAI error ${r.status}: ${detail}`);
    if(r.status!==429 && r.status<500) break;
  }
  if(!data){
    batchErrors.push({batch:batchIndex+1,companies:batch.map(x=>x.company),error:lastError?.message||'Unknown batch error'});
    continue;
  }
  let jobs=[];
  try{ jobs=parseJson(extractOutputText(data)); }
  catch(e){ batchErrors.push({batch:batchIndex+1,companies:batch.map(x=>x.company),error:`Parse error: ${e.message}`}); continue; }
  const allowed=new Map(batch.map(x=>[x.company,x.domains]));
  const valid=jobs.filter(j=>{
    try{
      const host=new URL(j.url).hostname.toLowerCase();
      const domains=allowed.get(j.company)||[];
      return domains.some(d=>{const root=d.split('/')[0].toLowerCase();return host===root||host.endsWith('.'+root);});
    }catch{return false;}
  }).map(j=>({...j,source:'Official Web Discovery'}));
  allJobs.push(...valid);
  if(onBatch) await onBatch({batch:batchIndex+1,totalBatches:companyBatches.length,companies:batch,jobs:valid});
  if(batchOnly===null && batchIndex<companyBatches.length-1) await sleep(6500);
  }
  const seen=new Set();
  const jobs=allJobs.filter(j=>{const k=j.url||`${j.company}|${j.title}|${j.location}`;if(seen.has(k))return false;seen.add(k);return true;});
  jobs.batchErrors=batchErrors;
  return jobs;
}
