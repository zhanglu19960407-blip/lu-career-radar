export const RADAR_SOURCES = [
  { company: 'Octopus Energy Group', type: 'lever', board: 'octoenergy', priority: 1 },
  { company: 'PPRO', type: 'lever', board: 'ppro', priority: 1 },
  { company: 'Deliveroo', type: 'ashby', board: 'deliveroo', priority: 1 },
  { company: 'Volta', type: 'ashby', board: 'volta', priority: 1 },
  { company: 'Reactive Markets', type: 'ashby', board: 'reactivemarkets', priority: 2 }
];

export const TITLE_TERMS = [
  'strategic finance','finance strategy','finance & strategy','finance and strategy',
  'fp&a','financial planning','finance business partner','commercial finance',
  'corporate finance','corporate development','m&a','value creation',
  'portfolio finance','finance director','head of finance','finance manager',
  'strategy & operations','strategy and operations','transformation'
];

export function isRelevantJob(job) {
  const title = (job.title || '').toLowerCase();
  const location = (job.location || '').toLowerCase();
  const titleMatch = TITLE_TERMS.some(term => title.includes(term));
  const ukMatch = /london|united kingdom|\buk\b|england|remote.*uk/.test(location);
  return titleMatch && ukMatch;
}
