const CURRENCIES = ['GBP','EUR','USD','CNY','HKD','AED','SAR','CHF','SGD'];
const CITY_DEFAULTS = {
  London:{country:'United Kingdom',currency:'GBP',taxKey:'England'}, Oxford:{country:'United Kingdom',currency:'GBP',taxKey:'England'}, Cambridge:{country:'United Kingdom',currency:'GBP',taxKey:'England'},
  Paris:{country:'France',currency:'EUR',taxKey:'France'}, Amsterdam:{country:'Netherlands',currency:'EUR',taxKey:'Netherlands'}, Zurich:{country:'Switzerland',currency:'CHF',taxKey:'Switzerland'}, Munich:{country:'Germany',currency:'EUR',taxKey:'Germany'},
  'New York':{country:'United States',currency:'USD',taxKey:'New York'}, Boston:{country:'United States',currency:'USD',taxKey:'Massachusetts'}, 'San Francisco':{country:'United States',currency:'USD',taxKey:'California'}, Seattle:{country:'United States',currency:'USD',taxKey:'Washington'},
  Shanghai:{country:'China',currency:'CNY',taxKey:'China'}, Beijing:{country:'China',currency:'CNY',taxKey:'China'}, Shenzhen:{country:'China',currency:'CNY',taxKey:'China'}, 'Hong Kong':{country:'Hong Kong',currency:'HKD',taxKey:'Hong Kong'},
  Dubai:{country:'United Arab Emirates',currency:'AED',taxKey:'UAE'}, 'Abu Dhabi':{country:'United Arab Emirates',currency:'AED',taxKey:'UAE'}, Riyadh:{country:'Saudi Arabia',currency:'SAR',taxKey:'Saudi Arabia'}, Singapore:{country:'Singapore',currency:'SGD',taxKey:'Singapore'}
};
const DEFAULT_SETTINGS = {
  fx:{GBP:9.70,EUR:8.32,USD:7.12,CNY:1,HKD:0.915,AED:1.94,SAR:1.90,CHF:8.95,SGD:5.55},
  effectiveTax:{France:0.36,Netherlands:0.35,Switzerland:0.24,Germany:0.39,'New York':0.34,Massachusetts:0.30,California:0.36,Washington:0.27,China:0.25,'Hong Kong':0.15,UAE:0,'Saudi Arabia':0,Singapore:0.18,Other:0.30}
};
const defaultJobs = [
  {id:1,company:'Xero',title:'Senior Strategic Finance Manager',city:'London',country:'United Kingdom',geography:'United Kingdom',currency:'GBP',track:'CFO',fitScore:93,careerUpside:9.5,plExposure:5,maExposure:2,deadEndRisk:1,salaryMin:105000,salaryMax:135000,bonusPct:15,whyFit:'Market-level P&L, GTM finance, profitability, resource allocation and direct commercial decision support.',risk:'May expect longer tenure in strategic finance.',industry:'Technology',status:'Shortlist',url:'#'},
  {id:2,company:'PwC Strategy&',title:'Value Creation Manager',city:'London',country:'United Kingdom',geography:'United Kingdom',currency:'GBP',track:'Operating Partner',fitScore:84,careerUpside:10,plExposure:4,maExposure:4,deadEndRisk:1,salaryMin:90000,salaryMax:120000,bonusPct:15,whyFit:'Builds pre/post-deal value creation, pricing, growth and transformation experience across portfolio businesses.',risk:'More consulting-oriented and may require case interview readiness.',industry:'Consulting / PE',status:'Shortlist',url:'#'},
  {id:3,company:'PE-backed Infrastructure',title:'Strategic Finance Manager',city:'London',country:'United Kingdom',geography:'United Kingdom',currency:'GBP',track:'Operating Partner',fitScore:91,careerUpside:9,plExposure:4,maExposure:3,deadEndRisk:1,salaryMin:90000,salaryMax:120000,bonusPct:20,whyFit:'Excellent bridge from FP&A into sponsor-backed strategic finance and eventual PE-backed CFO roles.',risk:'Platform quality depends heavily on sponsor, CFO and portfolio company stage.',industry:'Energy Infrastructure',status:'Researching',url:'#'},
  {id:4,company:'Amazon',title:'Finance Manager, EU DSP Finance',city:'London',country:'United Kingdom',geography:'United Kingdom',currency:'GBP',track:'CEO/GM',fitScore:92,careerUpside:9,plExposure:5,maExposure:1,deadEndRisk:1,salaryMin:95000,salaryMax:125000,bonusPct:15,whyFit:'Strong operating finance role with product, logistics and business leadership exposure.',risk:'High pace; title progression can be competitive.',industry:'Technology / Logistics',status:'Applied',url:'#'},
  {id:5,company:'Bupa',title:'Corporate Development Manager',city:'London',country:'United Kingdom',geography:'United Kingdom',currency:'GBP',track:'CFO',fitScore:79,careerUpside:9,plExposure:3,maExposure:5,deadEndRisk:1,salaryMin:90000,salaryMax:115000,bonusPct:15,whyFit:'Adds M&A, valuation, due diligence and board exposure — the main gap in the current profile.',risk:'Transaction experience may be the main entry barrier.',industry:'Healthcare',status:'Researching',url:'#'},
  {id:6,company:'Danaher',title:'Senior Finance Business Partner',city:'Amsterdam',country:'Netherlands',geography:'Europe',currency:'EUR',track:'CFO',fitScore:87,careerUpside:8.5,plExposure:4,maExposure:2,deadEndRisk:2,salaryMin:105000,salaryMax:135000,bonusPct:15,whyFit:'Business-facing finance with strong operating system and leadership development potential.',risk:'Role scope must be checked carefully to avoid becoming reporting-heavy.',industry:'Industrial / Life Sciences',status:'Inbox',url:'#'},
  {id:7,company:'Portfolio Company',title:'Director, Value Creation',city:'New York',country:'United States',geography:'United States',currency:'USD',track:'Operating Partner',fitScore:75,careerUpside:10,plExposure:5,maExposure:4,deadEndRisk:1,salaryMin:190000,salaryMax:250000,bonusPct:30,whyFit:'Direct portfolio value creation with multiple P&Ls and transformation mandates.',risk:'Likely stretch on US work authorization and level.',industry:'Private Equity',status:'Inbox',url:'#'},
  {id:8,company:'ByteDance',title:'Commercial Strategy & Finance Manager',city:'Shanghai',country:'China',geography:'Greater China',currency:'CNY',track:'CEO/GM',fitScore:90,careerUpside:9,plExposure:5,maExposure:2,deadEndRisk:1,salaryMin:700000,salaryMax:1100000,bonusPct:20,whyFit:'Combines finance, business strategy, growth and fast-moving operating decisions.',risk:'Role intensity and management style need to fit personal preferences.',industry:'Technology',status:'Inbox',url:'#'},
  {id:9,company:'Regional Consumer Group',title:'Finance Director, Business Unit',city:'Dubai',country:'United Arab Emirates',geography:'Middle East',currency:'AED',track:'CFO',fitScore:88,careerUpside:9,plExposure:5,maExposure:3,deadEndRisk:1,salaryMin:480000,salaryMax:660000,bonusPct:20,whyFit:'Full business-unit finance ownership and a credible route to GM or regional CFO.',risk:'May require broader controllership and treasury exposure.',industry:'Consumer',status:'Inbox',url:'#'},
  {id:10,company:'Global Industrial',title:'Group FP&A Manager',city:'London',country:'United Kingdom',geography:'United Kingdom',currency:'GBP',track:'CFO',fitScore:95,careerUpside:5,plExposure:2,maExposure:1,deadEndRisk:5,salaryMin:95000,salaryMax:110000,bonusPct:12,whyFit:'Easy fit based on experience, but adds limited new ownership.',risk:'High dead-end risk: could reinforce pure FP&A identity.',industry:'Industrial',status:'Inbox',url:'#'}
];

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let jobs=JSON.parse(localStorage.getItem('careerRadarJobsV3')||'null')||defaultJobs;
let settings=JSON.parse(localStorage.getItem('careerRadarSettings')||'null')||structuredClone(DEFAULT_SETTINGS);
let accessToken=localStorage.getItem('careerRadarAccessToken')||'';
let cloudConnected=false;
function save(){localStorage.setItem('careerRadarJobsV3',JSON.stringify(jobs));}
function saveSettings(){localStorage.setItem('careerRadarSettings',JSON.stringify(settings));}
async function apiFetch(path, options={}){
  const headers={'content-type':'application/json',...(options.headers||{})};
  if(accessToken) headers['x-career-radar-token']=accessToken;
  const res=await fetch(path,{...options,headers});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error||`Request failed (${res.status})`);
  return data;
}
async function loadCloudJobs(){
  try{
    const data=await apiFetch('/api/jobs');
    if(Array.isArray(data.jobs)){jobs=data.jobs.map(normalizeJob);save();cloudConnected=true;render();}
    updateConnectionStatus('Connected to cloud database.');
  }catch(e){cloudConnected=false;updateConnectionStatus(`Local fallback mode: ${e.message}`);}
}
async function upsertCloudJob(job){
  if(!cloudConnected && !accessToken) return job;
  const data=await apiFetch('/api/jobs',{method:'POST',body:JSON.stringify(job)});
  return normalizeJob(data.job);
}
function updateConnectionStatus(msg){const el=document.querySelector('#connectionStatus');if(el)el.textContent=msg;}

function salaryMid(j){return ((Number(j.salaryMin)||0)+(Number(j.salaryMax)||0))/2}
function totalCashMid(j){return salaryMid(j)*(1+(Number(j.bonusPct)||0)/100)}
function money(n,c='GBP'){try{return new Intl.NumberFormat('en-GB',{style:'currency',currency:c,maximumFractionDigits:0}).format(n||0)}catch{return `${c} ${Math.round(n||0).toLocaleString()}`}}
function rmb(n){return `¥${Math.round(n||0).toLocaleString('zh-CN')}`}
function recommendation(j){if(j.deadEndRisk>=4)return['Skip','rec-skip'];if(j.fitScore>=85&&j.careerUpside>=8)return['Apply','rec-apply'];return['Stretch','rec-stretch']}

function ukEnglandNet(gross){
  gross=Math.max(0,Number(gross)||0);
  let allowance=12570;
  if(gross>100000) allowance=Math.max(0,12570-(gross-100000)/2);
  const taxable=Math.max(0,gross-allowance);
  let incomeTax=0;
  const basic=Math.min(taxable,37700); incomeTax+=basic*.20;
  const higher=Math.min(Math.max(taxable-37700,0),125140-37700); incomeTax+=higher*.40;
  const additional=Math.max(taxable-125140,0); incomeTax+=additional*.45;
  const niBand=Math.max(0,Math.min(gross,50270)-12570);
  const niHigh=Math.max(0,gross-50270);
  const ni=niBand*.08+niHigh*.02;
  return {net:Math.max(0,gross-incomeTax-ni),tax:incomeTax+ni,label:'UK 2026/27 formula'};
}
function taxKeyFor(j){return CITY_DEFAULTS[j.city]?.taxKey || (j.country==='United Kingdom'?'England':j.country)||'Other'}
function netLocal(gross,j){
  const key=taxKeyFor(j);
  if(key==='England'&&j.currency==='GBP') return ukEnglandNet(gross);
  const rate=settings.effectiveTax[key] ?? settings.effectiveTax.Other ?? .30;
  return {net:gross*(1-rate),tax:gross*rate,label:`${key} ${(rate*100).toFixed(0)}% effective`};
