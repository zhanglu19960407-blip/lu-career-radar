create extension if not exists pgcrypto;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  company text not null,
  title text not null,
  city text,
  country text,
  geography text,
  currency text not null default 'GBP',
  track text check (track in ('CFO','CEO/GM','Operating Partner')),
  fit_score integer default 0 check (fit_score between 0 and 100),
  career_upside numeric(4,1) default 0,
  pl_exposure integer default 0,
  ma_exposure integer default 0,
  transformation_exposure integer default 0,
  leadership_exposure integer default 0,
  optionality_score integer default 0,
  dead_end_risk integer default 0,
  salary_min numeric default 0,
  salary_max numeric default 0,
  bonus_pct numeric default 0,
  industry text,
  why_fit text,
  risk text,
  recommendation text check (recommendation in ('Apply','Stretch','Skip') or recommendation is null),
  status text not null default 'Inbox',
  url text,
  source text,
  job_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jobs_track_idx on public.jobs(track);
create index if not exists jobs_city_idx on public.jobs(city);
create index if not exists jobs_fit_idx on public.jobs(fit_score desc);
create index if not exists jobs_created_idx on public.jobs(created_at desc);

alter table public.jobs enable row level security;
revoke all on table public.jobs from anon, authenticated;
