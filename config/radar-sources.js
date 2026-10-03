export const RADAR_SOURCES = [
  { company: 'Octopus Energy Group', type: 'lever', board: 'octoenergy', priority: 1 },
  { company: 'PPRO', type: 'lever', board: 'ppro', priority: 1 },
  { company: 'Deliveroo', type: 'ashby', board: 'deliveroo', priority: 1 },
  { company: 'Volta', type: 'ashby', board: 'volta', priority: 1 },
  { company: 'Reactive Markets', type: 'ashby', board: 'reactivemarkets', priority: 2 },
  { company: 'Binance', type: 'lever', board: 'binance', priority: 1 },
  { company: 'Airwallex', type: 'ashby', board: 'airwallex', priority: 1 },
  { company: 'Sentient', type: 'ashby', board: 'sentient', priority: 2 },
  { company: 'Fi', type: 'lever', board: 'fi', priority: 2 },
  { company: 'Apollo Research', type: 'lever', board: 'apolloresearch', priority: 1 },
  { company: 'Moneybox', type: 'lever', board: 'moneyboxapp', priority: 1 },
  { company: 'Legend', type: 'lever', board: 'Legend', priority: 1 },
  { company: 'CFGI', type: 'lever', board: 'cfgi', priority: 1 },
  { company: 'Moonpig', type: 'lever', board: 'moonpig', priority: 2 },
  { company: 'Mulberry', type: 'lever', board: 'mulberry', priority: 2 },
  { company: 'Thought Machine', type: 'ashby', board: 'thought-machine', priority: 1 },
  { company: 'Flagright', type: 'ashby', board: 'flagright.com', priority: 2 },
  { company: 'Patch', type: 'ashby', board: 'patch.io', priority: 2 },
  { company: 'Pave Bank', type: 'ashby', board: 'pavebank', priority: 2 },
  { company: 'Aptura', type: 'ashby', board: 'aptura', priority: 2 },
  { company: 'MOO', type: 'lever', board: 'moo', priority: 1 },
  { company: 'Zopa', type: 'lever', board: 'zopa', priority: 1 },
  { company: 'Zeller', type: 'lever', board: 'Zeller', priority: 2 },
  { company: 'Nium', type: 'lever', board: 'nium', priority: 1 },
  { company: 'Sitetracker', type: 'lever', board: 'sitetracker', priority: 2 },
  { company: '01Health', type: 'lever', board: '32Co', priority: 2 },
  { company: 'Farfetch', type: 'lever', board: 'farfetch', priority: 1 },
  { company: 'Xero', type: 'ashby', board: 'xero', priority: 1 },
  { company: 'Checkout.com', type: 'ashby', board: 'checkout.com', priority: 1 },
  { company: 'Capsa AI', type: 'ashby', board: 'capsa', priority: 1 }
];

export const CFO_TITLE_TERMS = [
  'finance','fp&a','financial planning','business partner','commercial finance',
  'strategic finance','corporate finance','corporate development','m&a',
  'treasury','capital allocation','investment','pricing','revenue','business finance',
  'financial strategy','strategic planning','business planning'
];

export const PE_TITLE_TERMS = [
  'value creation','portfolio operations','portfolio finance','portfolio performance',
  'private equity','operating team','performance improvement','transformation',
  'corporate development','m&a','deal','transaction','commercial due diligence',
  'strategy & operations','strategy and operations'
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
  const description = (job.jobDescription || '').toLowerCase();
  const location = job.location || '';
  if (!classifyMarket(location)) return false;
  const terms = [...CFO_TITLE_TERMS, ...PE_TITLE_TERMS];
  return terms.some(term => title.includes(term)) || terms.some(term => description.includes(term));
}
