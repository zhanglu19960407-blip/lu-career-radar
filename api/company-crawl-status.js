import { cors, requireAccess, json, supabaseFetch } from './_utils.js';
import { WEB_DISCOVERY_COMPANIES } from '../config/web-discovery.js';
const INDUSTRY_GROUPS=[
  ['科技与数字平台',/Amazon|Microsoft|Google|Meta|Apple|TikTok|Adobe|Oracle|SAP|Netflix|Cloudflare|Datadog|Atlassian|Workday|Intuit/i],
  ['金融科技与支付',/Stripe|Revolut|Wise|Checkout|Airwallex|Adyen|Visa|Mastercard|American Express|PayPal|Worldpay|Klarna|Ant Group|Bloomberg/i],
  ['银行与资产管理',/JPMorgan|Goldman|Morgan Stanley|Citi|HSBC|Barclays|Standard Chartered$|UBS|Bank of America|BlackRock|DBS/i],
  ['PE、投资与主权基金',/Blackstone|KKR|Apollo Global|Carlyle|Brookfield|EQT|CVC|Permira|Advent|Bain Capital|Mubadala|Temasek|Standard Chartered Ventures|GIC|Khazanah|ADQ|Public Investment Fund|Qatar Investment|Investcorp|Warburg|General Atlantic|TPG|Partners Group|Ardian|Cinven|Bridgepoint/i],
  ['咨询与专业服务',/McKinsey|BCG|Bain & Company|Deloitte|PwC|EY|KPMG|Accenture|Alvarez|Kearney/i],
  ['消费品、奢侈品与零售',/Reckitt|Mondelez|Danone|Unilever|Procter|Nestlé|PepsiCo|Coca-Cola|Diageo|L'Oréal|LVMH|Richemont|Kering|Nike|Adidas|Inditex|Tesco|Mars|Kraft Heinz|Heineken|BAT|JDE Peet|Colgate|Kimberly-Clark/i],
  ['医疗与医药',/AstraZeneca|GSK|Novartis|Roche|Sanofi|Johnson & Johnson|Merck|Pfizer/i],
  ['工业、制造与汽车',/Rolls-Royce|Schneider|Siemens|GE Aerospace|Honeywell|ABB|Midea|Haier|CATL|BYD/i],
  ['能源、资源与大宗商品',/Saudi Aramco|Shell|^BP$|ADNOC|Uniper|Rio Tinto|Glencore|BHP|Trafigura/i],
  ['物流、航空与出行',/Uber|Booking|Maersk|DP World|Emirates|Etihad|Trip.com|Grab|Didi|Gojek/i],
  ['中国与亚洲互联网科技',/Alibaba|Tencent|JD.com|Meituan|PDD|Xiaomi|Lenovo|Huawei|SHEIN|Sea Group|Shopee|Baidu|NetEase/i]
];
function industryFor(name){return INDUSTRY_GROUPS.find(([,re])=>re.test(name))?.[0]||'其他';}

export default async function handler(req,res){
  if(cors(req,res)) return; if(!requireAccess(req,res)) return;
  if(req.method!=='GET') return json(res,405,{error:'Method not allowed'});
  try{
    const rows=await supabaseFetch('company_crawl_status?select=*&order=company.asc');
    const byCompany=new Map(rows.map(x=>[x.company,x]));
    const companies=WEB_DISCOVERY_COMPANIES.map((x,index)=>{const s=byCompany.get(x.company)||{};return {index:index+1,company:x.company,industry:industryFor(x.company),tier:x.tier,domains:x.domains,lastCrawledAt:s.last_crawled_at||null,lastFoundCount:Number(s.last_found_count||0),lastStatus:s.last_status||'never',lastError:s.last_error||null};});
    return json(res,200,{companies,total:companies.length,crawled:companies.filter(x=>x.lastCrawledAt).length});
  }catch(e){return json(res,500,{error:e.message});}
}