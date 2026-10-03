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
  if(!res.ok) throw new Error(data.error||`请求失败（${res.status}）`);
  return data;
}
async function loadCloudJobs(){
  try{
    const data=await apiFetch('/api/jobs');
    if(Array.isArray(data.jobs)){jobs=data.jobs.map(normalizeJob);save();cloudConnected=true;render();}
    updateConnectionStatus('已连接云端数据库。');
  }catch(e){cloudConnected=false;updateConnectionStatus(`本地备用模式：${e.message}`);}
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
function statusZh(s){return ({Inbox:'待处理',Researching:'研究中',Shortlist:'候选名单',Applied:'已申请'})[s]||s}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function recommendation(j){if(j.deadEndRisk>=4)return['跳过','rec-skip'];if(j.fitScore>=85&&j.careerUpside>=8)return['申请','rec-apply'];return['挑战','rec-stretch']}

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
  return {net:Math.max(0,gross-incomeTax-ni),tax:incomeTax+ni,label:'英国 2026/27 税务公式'};
}
function taxKeyFor(j){return CITY_DEFAULTS[j.city]?.taxKey || (j.country==='United Kingdom'?'England':j.country)||'Other'}
function netLocal(gross,j){
  const key=taxKeyFor(j);
  if(key==='England'&&j.currency==='GBP') return ukEnglandNet(gross);
  const rate=settings.effectiveTax[key] ?? settings.effectiveTax.Other ?? .30;
  return {net:gross*(1-rate),tax:gross*rate,label:`${key} 有效税率 ${(rate*100).toFixed(0)}%`};
}
function netRmbForJob(j){const gross=totalCashMid(j);const n=netLocal(gross,j);return n.net*(settings.fx[j.currency]||1)}
function inferEmploymentType(j){
  if(j.employmentType) return j.employmentType;
  const t=((j.title||'')+' '+(j.jobDescription||'')).toLowerCase();
  const mba=/\bmba\b/.test(t), intern=/intern|internship/.test(t), program=/program|programme|rotation|rotational|leadership development/.test(t);
  if(mba&&intern) return 'MBA Internship';
  if(mba&&program) return 'MBA Program';
  if(intern) return 'Internship';
  return 'Full-time';
}
function postedAgo(value){
  if(!value)return '发布时间未知';
  const ms=Date.now()-new Date(value).getTime();
  if(!Number.isFinite(ms)||ms<0)return '刚刚发布';
  const hours=Math.floor(ms/3600000);
  if(hours<1)return '1小时内发布';
  if(hours<24)return hours+'小时前发布';
  const days=Math.floor(hours/24);
  if(days<30)return days+'天前发布';
  const months=Math.floor(days/30);
  return months+'个月前发布';
}
function employmentTypeZh(t){return ({'Full-time':'全职','Internship':'实习','MBA Program':'MBA 项目','MBA Internship':'MBA 实习'})[t]||t||'全职'}
function normalizeJob(j){const d=CITY_DEFAULTS[j.city]||{};return {...j,country:j.country||d.country||'',currency:j.currency||d.currency||'GBP',bonusPct:Number(j.bonusPct||0),employmentType:inferEmploymentType(j)}}
jobs=jobs.map(normalizeJob);

function refreshLocationOptions(){
  const cities=[...new Set([...Object.keys(CITY_DEFAULTS),...jobs.map(j=>j.city).filter(Boolean)])].sort();
  const cur=$('#locationSelect')?.value||'All';
  if($('#locationSelect')) $('#locationSelect').innerHTML='<option value="All">全部地点</option>'+cities.map(c=>`<option>${c}</option>`).join('');
  if($('#locationSelect') && (cities.includes(cur)||cur==='All')) $('#locationSelect').value=cur;
  const opts=cities.map(c=>`<option>${c}</option>`).join('');
  if($('#calcCity')) $('#calcCity').innerHTML=opts;
  const currOpts=CURRENCIES.map(c=>`<option>${c}</option>`).join('');
  if($('#calcCurrency')) $('#calcCurrency').innerHTML=currOpts;
  if($('#jobCurrency')) $('#jobCurrency').innerHTML=currOpts;
}
function refreshDynamicFilters(){
  const make=(id,cls,values)=>{
    const box=$(id); if(!box)return;
    const previous=new Set($$('.'+cls+':checked').map(x=>x.value));
    const first=!box.children.length;
    box.innerHTML=values.map(v=>`<label><input type="checkbox" class="${cls}" value="${escapeHtml(v)}" ${first||previous.has(v)?'checked':''}> ${escapeHtml(v)}</label>`).join('');
    $$('.'+cls).forEach(el=>el.addEventListener('change',render));
  };
  make('#industryFilters','industry-filter',[...new Set(jobs.map(j=>j.industry||'其他'))].sort((a,b)=>a.localeCompare(b,'zh-CN')));
}
function ruleTrack(j){
  if(j.track==='CFO'||j.track==='Operating Partner') return j.track;
  const text=((j.title||'')+' '+(j.jobDescription||'')).toLowerCase();
  const pe=['value creation','portfolio operations','portfolio finance','portfolio performance','private equity','operating team','performance improvement','transformation','corporate development','m&a','transaction','commercial due diligence','strategy & operations','strategy and operations'];
  return pe.some(term=>text.includes(term)) ? 'Operating Partner' : 'CFO';
}
function filteredJobs(){
  const tracks=new Set($$('.track-filter:checked').map(x=>x.value));
  const geos=new Set($$('.geo-filter:checked').map(x=>x.value));
  const q=$('#searchInput')?.value?.toLowerCase().trim()||'', loc=$('#locationSelect')?.value||'All', employment=$('#employmentTypeSelect')?.value||'All';
  let list=jobs;
  // diagnostic mode: no search filtering
  // diagnostic mode: no location filtering
  // diagnostic mode: no employment filtering
  const sort=$('#sortSelect')?.value||'fit';
  const trackOrder={'CFO':0,'Operating Partner':1};
  list.sort((a,b)=>(trackOrder[ruleTrack(a)]??9)-(trackOrder[ruleTrack(b)]??9)||(sort==='career'?b.careerUpside-a.careerUpside:sort==='pl'?b.plExposure-a.plExposure:sort==='gross'?totalCashMid(b)*(settings.fx[b.currency]||1)-totalCashMid(a)*(settings.fx[a.currency]||1):sort==='netRmb'?netRmbForJob(b)-netRmbForJob(a):b.fitScore-a.fitScore));
  return list;
}
function render(){
  refreshLocationOptions();
  const list=[...jobs];
  if($('#jobCount')) $('#jobCount').textContent=list.length;
  const trackLabels={'CFO':'CFO 导向','Operating Partner':'PE 价值创造导向'};
  const trackOrder=['CFO','Operating Partner'];
  const cardHtml=j=>{const [rec,cls]=recommendation(j), gross=totalCashMid(j), n=netLocal(gross,j), nr=n.net*(settings.fx[j.currency]||1);return `<article class="job-card">
    <div class="job-top"><div><div class="job-company">${j.company}</div><div class="job-title">${j.title}</div><div class="job-meta">${j.city} · ${j.country||j.geography} · ${postedAgo(j.postedAt)}</div></div></div>
    <div class="tag-row"><span class="tag">${employmentTypeZh(inferEmploymentType(j))}</span><span class="tag">${ruleTrack(j)}</span><span class="tag">${money(j.salaryMin,j.currency)}–${money(j.salaryMax,j.currency)}</span><span class="tag">奖金 ${j.bonusPct||0}%</span><span class="tag">${statusZh(j.status||'Inbox')}</span></div>
    <div class="money-strip"><div><span>市场薪酬参考</span><b>${(j.salaryMin||j.salaryMax) ? money(j.salaryMin,j.currency)+'–'+money(j.salaryMax,j.currency)+' / 年' : '待估算'}</b></div><div><span>预计税后人民币</span><b>${(j.salaryMin||j.salaryMax) ? rmb(nr)+' / 年' : '待估算'}</b></div></div>
    ${(j.jobDescriptionZh||j.jobDescription) ? `<details class="job-description"><summary>查看职位描述</summary><div class="job-copy" style="white-space:pre-wrap;margin-top:10px">${escapeHtml(j.jobDescriptionZh||j.jobDescription)}</div></details>` : ''}
    <div class="job-footer"><div class="recommendation ${cls}">${rec}</div><div class="job-actions"><button class="mini-btn" onclick='moveStatus(${JSON.stringify(String(j.id))})'>推进阶段</button>${j.url&&j.url!=='#'?`<a class="mini-btn" href="${j.url}" target="_blank" rel="noopener">申请职位</a>`:''}</div></div>
  </article>`};
  const grouped=trackOrder.map(track=>{
    const trackJobs=list.filter(j=>ruleTrack(j)===track); if(!trackJobs.length)return '';
    return `<section class="track-section"><h2 class="track-heading">${trackLabels[track]} <span>${trackJobs.length}</span></h2><div class="job-grid">${trackJobs.map(cardHtml).join('')}</div></section>`;
  }).join('');
  $('#jobGrid').innerHTML=grouped||'<div class="job-card">没有符合当前筛选条件的职位。</div>';
  renderPipeline();renderCompTable();renderCalc();
}
function renderPipeline(){const stages=['Inbox','Researching','Shortlist','Applied'];$('#pipelineBoard').innerHTML=stages.map(stage=>`<div class="pipeline-col"><h3>${statusZh(stage)}</h3>${jobs.filter(j=>(j.status||'Inbox')===stage).map(j=>`<div class="pipeline-card"><b>${j.title}</b><small>${j.company} · ${j.city}</small><small>${rmb(netRmbForJob(j))} 预计税后 / 年</small></div>`).join('')}</div>`).join('')}
function renderCompTable(){const body=$('#compTable tbody');if(!body)return;body.innerHTML=[...jobs].sort((a,b)=>netRmbForJob(b)-netRmbForJob(a)).map(j=>{const gross=totalCashMid(j),n=netLocal(gross,j),nr=n.net*(settings.fx[j.currency]||1);return `<tr><td><b>${j.title}</b><br><small>${j.company}</small></td><td>${j.city}</td><td>${money(gross,j.currency)}</td><td>${money(n.net,j.currency)}</td><td><b>${rmb(nr)}</b></td><td>${rmb(nr/12)}</td><td>${n.label}</td></tr>`}).join('')}
function renderCalc(){if(!$('#calcCity'))return;const city=$('#calcCity').value||'London',d=CITY_DEFAULTS[city]||{},currency=$('#calcCurrency').value||d.currency||'GBP',base=Number($('#calcSalary').value||0),bonus=Number($('#calcBonus').value||0),gross=base+bonus,j={city,country:d.country||'',currency},n=netLocal(gross,j),nr=n.net*(settings.fx[currency]||1);$('#calcResult').innerHTML=`<div><span>当地税前收入</span><b>${money(gross,currency)}</b></div><div><span>预计当地税后收入</span><b>${money(n.net,currency)}</b></div><div><span>预计税后人民币 / 年</span><b>${rmb(nr)}</b></div><div><span>预计税后人民币 / 月</span><b>${rmb(nr/12)}</b></div>`}
window.moveStatus=async id=>{const order=['Inbox','Researching','Shortlist','Applied'];const j=jobs.find(x=>String(x.id)===String(id));if(!j)return;j.status=order[(order.indexOf(j.status||'Inbox')+1)%order.length];save();render();if(cloudConnected){try{await apiFetch(`/api/jobs?id=${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(j)});}catch(e){updateConnectionStatus(`阶段已保存到本地；云端更新失败：${e.message}`)}}};

function renderSettings(){
  $('#fxSettings').innerHTML=CURRENCIES.map(c=>`<div class="settings-row"><span>1 ${c} =</span><input class="fx-input" data-currency="${c}" type="number" step="0.0001" value="${settings.fx[c]??''}"><small>人民币</small></div>`).join('');
  $('#taxSettings').innerHTML=Object.entries(settings.effectiveTax).map(([k,v])=>`<div class="settings-row"><span>${k}</span><input class="tax-input" data-taxkey="${k}" type="number" step="0.1" min="0" max="70" value="${(v*100).toFixed(1)}"><small>%</small></div>`).join('');
}
function wireNav(){ $$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{$$('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$$('.view').forEach(x=>x.classList.remove('active-view'));$('#'+btn.dataset.view+'View').classList.add('active-view');if(btn.dataset.view==='settings')renderSettings();if(btn.dataset.view==='compensation'){renderCompTable();renderCalc()}})) }
wireNav();
['change','input'].forEach(evt=>document.querySelectorAll('.track-filter,.geo-filter,#locationSelect,#employmentTypeSelect,#sortSelect,#searchInput').forEach(el=>el.addEventListener(evt,render)));
['change','input'].forEach(evt=>['#calcCity','#calcCurrency','#calcSalary','#calcBonus'].forEach(sel=>$(sel)?.addEventListener(evt,()=>{if(sel==='#calcCity'){const d=CITY_DEFAULTS[$('#calcCity').value];if(d)$('#calcCurrency').value=d.currency}renderCalc()})));

$('#runRadarBtn')?.addEventListener('click',async e=>{
  const btn=e.currentTarget;
  const original=btn.textContent;
  btn.disabled=true; btn.textContent='正在抓取职位…';
  try{
    let discoveredTotal=0, newTotal=0;
    // Run each official-web batch as an independent request so no single Vercel
    // function has to scan the whole company universe within its time limit.
    for(let webBatch=0;webBatch<7;webBatch++){
      btn.textContent=`正在抓取职位… ${webBatch+1}/7`;
      const data=await apiFetch('/api/radar/run',{method:'POST',body:JSON.stringify({maxWebCompanies:150,webBatch})});
      discoveredTotal+=Number(data.discovered||0);
      newTotal+=Number(data.newCandidates||0);
    }
    const data={discovered:discoveredTotal,newCandidates:newTotal};
    const cloud=await apiFetch('/api/jobs');
    jobs=Array.isArray(cloud.jobs)?cloud.jobs.map(normalizeJob):jobs;
    save(); render();
    updateConnectionStatus(`抓取完成：本次发现 ${data.discovered||0} 个相关职位，新增 ${data.newCandidates||0} 个；当前共 ${jobs.length} 个职位。`);
    if(data.errors?.length||data.sourceErrors?.length){
      console.warn('Radar partial errors',data.errors,data.sourceErrors);
    }
  }catch(err){
    updateConnectionStatus(`职位抓取失败：${err.message}`);
    alert(`职位抓取失败：${err.message}`);
  }finally{btn.disabled=false;btn.textContent=original;}
});

const dialog=$('#jobDialog');$('#addJobBtn')?.addEventListener('click',()=>dialog?.showModal());
function formToJob(){const fd=new FormData($('#jobForm')),obj=Object.fromEntries(fd.entries());['fitScore','careerUpside','plExposure','maExposure','deadEndRisk','salaryMin','salaryMax','bonusPct'].forEach(k=>obj[k]=Number(obj[k]));const d=CITY_DEFAULTS[obj.city]||{};obj.id=obj.id||Date.now();obj.status='Inbox';obj.industry=obj.industry||'';obj.country=obj.country||d.country||'';obj.currency=obj.currency||d.currency||'GBP';return obj;}
$('#saveJobBtn')?.addEventListener('click',async e=>{e.preventDefault();let obj=formToJob();try{obj=await upsertCloudJob(obj);}catch(err){updateConnectionStatus(`已保存到本地；云端保存失败：${err.message}`)}jobs.unshift(obj);jobs=[...new Map(jobs.map(x=>[String(x.id),x])).values()];save();dialog.close();$('#jobForm').reset();render()});
$('#scoreAndSaveBtn')?.addEventListener('click',async e=>{e.preventDefault();const btn=e.currentTarget;btn.disabled=true;btn.textContent='AI 评分中…';try{let obj=formToJob();if(!obj.jobDescription?.trim())throw new Error('请先粘贴职位描述。');const scored=await apiFetch('/api/score-job',{method:'POST',body:JSON.stringify(obj)});obj={...obj,...scored};obj=await upsertCloudJob(obj);jobs.unshift(obj);jobs=[...new Map(jobs.map(x=>[String(x.id),x])).values()];save();dialog.close();$('#jobForm').reset();render();updateConnectionStatus('AI 评分后的职位已保存到云端。');}catch(err){alert(err.message);}finally{btn.disabled=false;btn.textContent='AI 评分并保存';}});
$('#importBtn')?.addEventListener('click',()=>$('#fileInput')?.click());
$('#fileInput')?.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);jobs=(Array.isArray(data)?data:data.jobs).map(normalizeJob);save();render()}catch{alert('JSON 文件无效。')}};r.readAsText(f)});
$('#exportBtn')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),jobs,settings},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='lu-career-radar-data.json';a.click();URL.revokeObjectURL(a.href)});
$('#saveSettingsBtn')?.addEventListener('click',()=>{$$('.fx-input').forEach(i=>settings.fx[i.dataset.currency]=Number(i.value));$$('.tax-input').forEach(i=>settings.effectiveTax[i.dataset.taxkey]=Number(i.value)/100);saveSettings();render();$('#fxStatus').textContent='设置已保存到当前浏览器。'});
$('#resetSettingsBtn')?.addEventListener('click',()=>{settings=structuredClone(DEFAULT_SETTINGS);saveSettings();renderSettings();render()});
$('#refreshFxBtn')?.addEventListener('click',async()=>{const btn=$('#refreshFxBtn'),status=$('#fxStatus');btn.disabled=true;status.textContent='正在刷新实时汇率…';try{const data=await apiFetch('/api/fx');for(const c of CURRENCIES){if(c==='CNY'){settings.fx.CNY=1;continue}const cnyPerUnit=data.rates[c]?1/data.rates[c]:null;if(cnyPerUnit)settings.fx[c]=Number(cnyPerUnit.toFixed(4))}saveSettings();renderSettings();render();status.textContent=`实时汇率已刷新（汇率日期：${data.date||'最新'}）。`}catch(err){status.textContent='实时汇率暂时无法刷新，已保留现有备用汇率。'}finally{btn.disabled=false}});

if($('#accessTokenInput')) $('#accessTokenInput').value=accessToken;
$('#saveTokenBtn')?.addEventListener('click',()=>{accessToken=$('#accessTokenInput').value.trim();localStorage.setItem('careerRadarAccessToken',accessToken);updateConnectionStatus('访问令牌已保存到当前浏览器。');loadCloudJobs();});
$('#testConnectionBtn')?.addEventListener('click',async()=>{try{const d=await apiFetch('/api/health');cloudConnected=true;updateConnectionStatus(`连接成功。Supabase：${d.supabaseConfigured?'就绪':'缺失'} · OpenAI：${d.openaiConfigured?'就绪':'缺失'} · 模型：${d.model}`);}catch(e){cloudConnected=false;updateConnectionStatus(`连接失败：${e.message}`);}});

$$('.filter-toggle').forEach(btn=>btn.addEventListener('click',()=>{
  const checked=btn.dataset.check==='true';
  $$('.'+btn.dataset.target).forEach(el=>el.checked=checked);
  render();
}));
refreshLocationOptions();
if($('#calcCity')) $('#calcCity').value='London'; if($('#calcCurrency')) $('#calcCurrency').value='GBP'; renderSettings(); refreshDynamicFilters();
render();
loadCloudJobs();

// binding-fix-20261003-0431
