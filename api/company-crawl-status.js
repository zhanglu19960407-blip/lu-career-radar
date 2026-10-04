import { cors, requireAccess, json, supabaseFetch } from './_utils.js';
import { WEB_DISCOVERY_COMPANIES } from '../config/web-discovery.js';
export default async function handler(req,res){
  if(cors(req,res)) return; if(!requireAccess(req,res)) return;
  if(req.method!=='GET') return json(res,405,{error:'Method not allowed'});
  try{
    const rows=await supabaseFetch('company_crawl_status?select=*&order=company.asc');
    const byCompany=new Map(rows.map(x=>[x.company,x]));
    const companies=WEB_DISCOVERY_COMPANIES.map((x,index)=>{const s=byCompany.get(x.company)||{};return {index:index+1,company:x.company,tier:x.tier,domains:x.domains,lastCrawledAt:s.last_crawled_at||null,lastFoundCount:Number(s.last_found_count||0),lastStatus:s.last_status||'never',lastError:s.last_error||null};});
    return json(res,200,{companies,total:companies.length,crawled:companies.filter(x=>x.lastCrawledAt).length});
  }catch(e){return json(res,500,{error:e.message});}
}