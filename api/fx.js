import { cors, requireAccess, json } from './_utils.js';

export default async function handler(req,res){
  if(cors(req,res)) return;
  if(!requireAccess(req,res)) return;
  if(req.method!=='GET') return json(res,405,{error:'Method not allowed'});
  try{
    const r=await fetch('https://api.frankfurter.app/latest?from=CNY',{headers:{accept:'application/json'}});
    if(!r.ok) throw new Error(`FX provider returned ${r.status}`);
    const data=await r.json();
    return json(res,200,{base:'CNY',date:data.date,rates:data.rates,provider:'Frankfurter / ECB reference rates'});
  }catch(e){
    console.error('FX refresh failure',e);
    return json(res,502,{error:'实时汇率服务暂时不可用'});
  }
}
