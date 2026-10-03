export const RADAR_SOURCES = [
  { company: 'Octopus Energy Group', type: 'lever', board: 'octoenergy', priority: 1 },
  { company: 'PPRO', type: 'lever', board: 'ppro', priority: 1 },
  { company: 'Deliveroo', type: 'ashby', board: 'deliveroo', priority: 1 },
  { company: 'Volta', type: 'ashby', board: 'volta', priority: 1 },
  { company: 'Reactive Markets', type: 'ashby', board: 'reactivemarkets', priority: 2 },
  { company: 'Binance', type: 'lever', board: 'binance', priority: 1 },
  { company: 'Airwallex', type: 'ashby', board: 'airwallex', priority: 1 },
  { company: 'Sentient', type: 'ashby', board: 'sentient', priority: 2 },
  { company: 'Fi', type: 'lever', board: 'fi', priority: 2 }
];

export const TITLE_TERMS = [
  'strategic finance','finance strategy','finance & strategy','finance and strategy',
  'fp&a','financial planning','finance business partner','commercial finance',
  'corporate finance','corporate development','m&a','value creation',
  'portfolio finance','finance director','head of finance','finance manager',
  'finance transformation','strategy & operations','strategy and operations','transformation',
  'business finance','strategic planning','business planning','commercial strategy',
  'business strategy','chief financial officer','cfo','general manager','business unit',
  'pricing','revenue strategy','growth strategy','investment','capital allocation'
];

export const TARGET_MARKETS = [
  { geography: 'Hong Kong', currency: 'HKD', pattern: /hong kong|\bhk\b/i },
  { geography: 'UK', currency: 'GBP', pattern: /london|united kingdom|\buk\b|england|greater london/i },
  { geography: 'Mainland China', currency: 'CNY', pattern: /mainland china|china|shanghai|beijing|shenzhen|guangzhou|hangzhou|chengdu/i },
  { geography: 'Singapore', currency: 'SGD', pattern: /singapore|\bsg\b/i },
  { geography: 'Middle East', currency: 'AED', pattern: /dubai|abu dhabi|united arab emirates|\buae\b|riyadh|saudi|qatar|doha|middle east|mena/i }
];

export function classifyMarket(location = '') {
  return TARGET_MARKETS.find(m => m.pattern.test(location)) || null;
}

export function isRelevantJob(job) {
  const title = (job.title || '').toLowerCase();
  const location = job.location || '';
  const titleMatch = TITLE_TERMS.some(term => title.includes(term));
  return titleMatch && Boolean(classifyMarket(location));
}
