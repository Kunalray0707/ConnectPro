-- ============================================
-- ConnectPro Stage 9 — Admin & SmartHire ATS Schema
-- Creates tables for reports, smarthire jobs/candidates, integrations config,
-- user requests, and verification requests.
-- ============================================

begin;

-- ------------------------------
-- Reports Management
-- ------------------------------
create table if not exists public.admin_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reported_user_id uuid not null references auth.users(id) on delete cascade,
  reporter_name text,
  reported_user_name text,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_reports_status on public.admin_reports(status);

-- ------------------------------
-- SmartHire Jobs
-- ------------------------------
create table if not exists public.smarthire_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  location text not null,
  job_type text not null default 'Full-time',
  required_skills text[] not null default '{}',
  min_experience int not null default 0,
  description text not null,
  status text not null default 'open' check (status in ('open', 'closed', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------
-- SmartHire Candidates & ATS
-- ------------------------------
create table if not exists public.smarthire_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  job_id uuid references public.smarthire_jobs(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null,
  desired_role text not null,
  experience_years int not null default 0,
  experience_summary text,
  education text,
  skills text[] not null default '{}',
  resume_url text,
  resume_text text,
  ats_score int not null default 0 check (ats_score >= 0 and ats_score <= 100),
  fit_score int not null default 0 check (fit_score >= 0 and fit_score <= 100),
  status text not null default 'pending' check (status in ('pending', 'shortlisted', 'interviewing', 'offered', 'rejected', 'hired')),
  external_source text not null default 'direct' check (external_source in ('direct', 'linkedin', 'naukri', 'indeed')),
  applied_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_smarthire_candidates_status on public.smarthire_candidates(status);

-- ------------------------------
-- Integrations Config
-- ------------------------------
create table if not exists public.integrations_config (
  id text primary key, -- e.g. 'stripe', 'sendgrid', 'github', 'linkedin', 'openai'
  name text not null,
  status text not null default 'disabled' check (status in ('active', 'disabled')),
  api_key text,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ------------------------------
-- User Requests Management
-- ------------------------------
create table if not exists public.user_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text,
  request_type text not null, -- e.g. 'service_approval', 'role_change', 'support'
  details jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------
-- Verification Requests
-- ------------------------------
create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  professional_id text not null,
  company_name text,
  experience_years int,
  experience_summary text,
  documents jsonb not null default '[]'::jsonb, -- array of VerificationDoc
  status text not null default 'pending' check (status in ('draft', 'pending', 'approved', 'rejected', 'partial')),
  admin_note text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------
-- Enable RLS & Policies
-- ------------------------------
alter table public.admin_reports enable row level security;
alter table public.smarthire_jobs enable row level security;
alter table public.smarthire_candidates enable row level security;
alter table public.integrations_config enable row level security;
alter table public.user_requests enable row level security;
alter table public.verification_requests enable row level security;

-- Admin policies (using a simple check or public access for MVP demo purposes while keeping RLS active)
create policy "admin_reports: select all" on public.admin_reports for select using (true);
create policy "admin_reports: insert" on public.admin_reports for insert with check (auth.uid() = reporter_id);
create policy "admin_reports: update" on public.admin_reports for update using (true);

create policy "smarthire_jobs: select all" on public.smarthire_jobs for select using (true);
create policy "smarthire_jobs: all access" on public.smarthire_jobs for all using (true);

create policy "smarthire_candidates: select all" on public.smarthire_candidates for select using (true);
create policy "smarthire_candidates: all access" on public.smarthire_candidates for all using (true);

create policy "integrations_config: select all" on public.integrations_config for select using (true);
create policy "integrations_config: all access" on public.integrations_config for all using (true);

create policy "user_requests: select all" on public.user_requests for select using (true);
create policy "user_requests: all access" on public.user_requests for all using (true);

create policy "verification_requests: select all" on public.verification_requests for select using (true);
create policy "verification_requests: all access" on public.verification_requests for all using (true);

-- Enable realtime
alter table public.admin_reports replica identity full;
alter table public.smarthire_jobs replica identity full;
alter table public.smarthire_candidates replica identity full;
alter table public.user_requests replica identity full;
alter table public.verification_requests replica identity full;

-- Insert initial dummy jobs & integrations if empty
insert into public.integrations_config (id, name, status, settings) values
('github', 'GitHub OAuth & Sync', 'active', '{"linked_users": 682}'),
('linkedin', 'LinkedIn Job Board Sync', 'active', '{"linked_users": 419, "auto_sync": true}'),
('openai', 'OpenAI GPT-3.5 ATS Engine', 'active', '{"model": "gpt-3.5-turbo", "scoring_enabled": true}'),
('stripe', 'Stripe Payment Gateway', 'active', '{"mode": "test"}'),
('sendgrid', 'SendGrid Email Automation', 'active', '{"automated_emails": true}')
on conflict (id) do nothing;

insert into public.smarthire_jobs (title, department, location, job_type, required_skills, min_experience, description, status) values
('Senior Full-Stack Engineer', 'Engineering', 'Remote (India)', 'Full-time', '{"React", "Node.js", "TypeScript", "Supabase"}', 4, 'Looking for an experienced engineer to build scalable web applications.', 'open'),
('AI/ML Research Scientist', 'AI Lab', 'Bangalore, India', 'Full-time', '{"Python", "PyTorch", "NLP", "OpenAI"}', 3, 'Lead the development of our automated ATS resume scoring algorithms.', 'open'),
('Product Designer (UI/UX)', 'Design', 'Mumbai, India', 'Full-time', '{"Figma", "Design Systems", "User Research"}', 2, 'Craft beautiful and premium dark-mode web interfaces for professional networking.', 'open')
on conflict do nothing;

commit;
