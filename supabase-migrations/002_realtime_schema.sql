-- ============================================
-- ConnectPro Stage 2 — Realtime-ready schema
-- Creates tables for notifications, messages, bookings, ratings/reviews,
-- verification documents, payments, resume data, teams, and company verification.
-- Uses COMPATIBILITY MODE: keeps `public.profiles` as the PROFESSIONALS table
-- because the frontend currently reads/writes it.
-- ============================================

begin;

-- ------------------------------
-- Extensions
-- ------------------------------
create extension if not exists pgcrypto;

-- ------------------------------
-- Users (app-level metadata)
-- We intentionally do NOT repurpose `profiles`.
-- `profiles` remains PROFESSIONALS.
-- ------------------------------
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,

  display_name text,
  role text not null default 'client',
  location text,

  bio text,
  avatar text,

  skills text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------
-- Professionals availability
-- ------------------------------
create table if not exists public.professional_availability (
  id uuid primary key default gen_random_uuid(),
  professional_user_id uuid references auth.users(id) on delete cascade,
  professional_profile_id uuid references public.profiles(id) on delete cascade,

  timezone text not null default 'Asia/Kolkata',
  is_available boolean not null default true,
  last_status_at timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_professional_availability_prof_profile on public.professional_availability(professional_profile_id);
create index if not exists idx_professional_availability_available on public.professional_availability(is_available);

-- ------------------------------
-- Ratings & Reviews
-- ------------------------------
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  stars int not null check (stars >= 1 and stars <= 5),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (professional_profile_id, user_id)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  title text,
  body text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (professional_profile_id, user_id)
);

create index if not exists idx_reviews_prof on public.reviews(professional_profile_id);
create index if not exists idx_reviews_user on public.reviews(user_id);

-- ------------------------------
-- Resume data (builder)
-- ------------------------------
create table if not exists public.resume_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  profile_name text,
  desired_role text,
  experience text,
  education text,
  skills text[] not null default '{}',

  resume_text text,
  generated_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id)
);

-- ------------------------------
-- Teams / members
-- ------------------------------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),

  unique (team_id, user_id)
);

create index if not exists idx_team_members_team on public.team_members(team_id);

-- ------------------------------
-- Company verification
-- ------------------------------
create table if not exists public.company_verification (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  company_domain text,

  requester_user_id uuid not null references auth.users(id) on delete cascade,

  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (company_domain)
);

-- ------------------------------
-- Verification documents
-- ------------------------------
create table if not exists public.verification_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  doc_type text not null, -- e.g. aadhaar, passport, degree
  storage_path text not null,
  mime_type text,

  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewer_user_id uuid references auth.users(id),
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, doc_type)
);

create index if not exists idx_verification_documents_user on public.verification_documents(user_id);

-- ------------------------------
-- Messages
-- We use the existing `public.messages` contract from RLS migration.
-- If it doesn't exist, create it.
-- ------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,

  content text not null,
  read boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);
create index if not exists idx_messages_created_at on public.messages(created_at);

-- ------------------------------
-- Notifications
-- ------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  type text not null,
  title text,
  body text,
  data jsonb not null default '{}'::jsonb,

  read boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_user_read on public.notifications(user_id, read);

-- ------------------------------
-- Appointments / bookings
-- We keep `public.bookings` contract from RLS migration.
-- ------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,

  start_time timestamptz not null,
  end_time timestamptz not null,

  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),

  price_amount numeric(12,2),
  currency text not null default 'INR',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookings_user on public.bookings(user_id);
create index if not exists idx_bookings_professional on public.bookings(professional_id);
create index if not exists idx_bookings_status on public.bookings(status);

-- ------------------------------
-- Payments
-- ------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,

  provider text,
  provider_payment_id text,

  amount numeric(12,2),
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending','succeeded','failed','refunded')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(provider, provider_payment_id)
);

create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_booking on public.payments(booking_id);

-- ------------------------------
-- Activity dashboard events (for realtime)
-- ------------------------------
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  event_type text not null,
  entity_type text,
  entity_id uuid,

  meta jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists idx_activity_events_user on public.activity_events(user_id);

-- ------------------------------
-- Enable RLS
-- ------------------------------
alter table public.user_profiles enable row level security;
alter table public.professional_availability enable row level security;
alter table public.ratings enable row level security;
alter table public.reviews enable row level security;
alter table public.resume_data enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.company_verification enable row level security;
alter table public.verification_documents enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.activity_events enable row level security;

-- ------------------------------
-- Policies (minimal, production-ready baseline)
-- ------------------------------
-- user_profiles
create policy "user_profiles: select own" on public.user_profiles for select
using (auth.uid() = user_id);

create policy "user_profiles: insert own" on public.user_profiles for insert
with check (auth.uid() = user_id);

create policy "user_profiles: update own" on public.user_profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- professional_availability
create policy "availability: select" on public.professional_availability for select
using (true);

create policy "availability: insert own" on public.professional_availability for insert
with check (auth.uid() = professional_user_id);

create policy "availability: update own" on public.professional_availability for update
using (auth.uid() = professional_user_id)
with check (auth.uid() = professional_user_id);

-- ratings/reviews
create policy "ratings: select public for professionals" on public.ratings for select
using (true);

create policy "ratings: insert own" on public.ratings for insert
with check (auth.uid() = user_id);

create policy "ratings: update own" on public.ratings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "reviews: select public for professionals" on public.reviews for select
using (true);

create policy "reviews: insert own" on public.reviews for insert
with check (auth.uid() = user_id);

create policy "reviews: update own" on public.reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- resume_data
create policy "resume_data: select own" on public.resume_data for select
using (auth.uid() = user_id);

create policy "resume_data: insert own" on public.resume_data for insert
with check (auth.uid() = user_id);

create policy "resume_data: update own" on public.resume_data for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- teams
create policy "teams: select member" on public.teams for select
using (exists (select 1 from public.team_members tm where tm.team_id = teams.id and tm.user_id = auth.uid()));

create policy "teams: insert owner" on public.teams for insert
with check (auth.uid() = owner_id);

create policy "team_members: select member" on public.team_members for select
using (exists (select 1 from public.team_members tm2 where tm2.team_id = team_members.team_id and tm2.user_id = auth.uid()));

create policy "team_members: insert" on public.team_members for insert
with check (exists (select 1 from public.teams t where t.id = team_members.team_id and t.owner_id = auth.uid()));

create policy "team_members: update" on public.team_members for update
using (exists (select 1 from public.teams t where t.id = team_members.team_id and t.owner_id = auth.uid()));

-- company_verification
create policy "company_verification: select" on public.company_verification for select
using (true);

create policy "company_verification: insert own" on public.company_verification for insert
with check (auth.uid() = requester_user_id);

create policy "company_verification: update own" on public.company_verification for update
using (auth.uid() = requester_user_id)
with check (auth.uid() = requester_user_id);

-- verification_documents
create policy "verification_documents: select own or public" on public.verification_documents for select
using (auth.uid() = user_id);

create policy "verification_documents: insert own" on public.verification_documents for insert
with check (auth.uid() = user_id);

create policy "verification_documents: update own" on public.verification_documents for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- notifications (own user only)
create policy "notifications: select own" on public.notifications for select
using (auth.uid() = user_id);

create policy "notifications: insert own" on public.notifications for insert
with check (auth.uid() = user_id);

create policy "notifications: update own" on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- messages (these policies already exist in 001_security_setup.sql for sender_id; but
-- they might not cover receiver updates. We add baseline receiver select if needed.)
-- NOTE: do not drop existing policies.
create policy if not exists "messages: select sent or received" on public.messages for select
using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- bookings (baseline)
create policy "bookings: select own" on public.bookings for select
using (auth.uid() = user_id);

create policy "bookings: insert own" on public.bookings for insert
with check (auth.uid() = user_id);

create policy "bookings: update own" on public.bookings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- payments (baseline)
create policy "payments: select own" on public.payments for select
using (auth.uid() = user_id);

create policy "payments: insert own" on public.payments for insert
with check (auth.uid() = user_id);

-- activity_events
create policy "activity_events: select own" on public.activity_events for select
using (auth.uid() = user_id);

create policy "activity_events: insert own" on public.activity_events for insert
with check (auth.uid() = user_id);

-- ------------------------------
-- Realtime enablement
-- Supabase enables realtime by setting table replica identity.
-- Also mark replica identity to full so updates are propagated.
-- ------------------------------
-- messages
alter table public.messages replica identity full;
alter table public.bookings replica identity full;
alter table public.payments replica identity full;
alter table public.notifications replica identity full;
alter table public.activity_events replica identity full;
alter table public.reviews replica identity full;
alter table public.ratings replica identity full;
alter table public.professional_availability replica identity full;

-- Supabase Realtime uses "realtime" publication; ensure tables are part of it.
-- This is done in the Supabase UI typically; however we add ALTER PUBLICATION statements.
-- (If your project uses the default publication, these statements are harmless.)

-- Create or alter publication if present.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    execute 'alter publication supabase_realtime add table public.messages';
    execute 'alter publication supabase_realtime add table public.notifications';
    execute 'alter publication supabase_realtime add table public.bookings';
    execute 'alter publication supabase_realtime add table public.payments';
    execute 'alter publication supabase_realtime add table public.activity_events';
    execute 'alter publication supabase_realtime add table public.reviews';
    execute 'alter publication supabase_realtime add table public.ratings';
    execute 'alter publication supabase_realtime add table public.professional_availability';
  end if;
exception
  when others then null;
end $$;

-- ------------------------------
-- Triggers for updated_at
-- ------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- attach to tables
create trigger if not exists trg_user_profiles_updated_at
before update on public.user_profiles for each row execute function public.set_updated_at();
create trigger if not exists trg_professional_availability_updated_at
before update on public.professional_availability for each row execute function public.set_updated_at();
create trigger if not exists trg_ratings_updated_at
before update on public.ratings for each row execute function public.set_updated_at();
create trigger if not exists trg_reviews_updated_at
before update on public.reviews for each row execute function public.set_updated_at();
create trigger if not exists trg_resume_data_updated_at
before update on public.resume_data for each row execute function public.set_updated_at();
create trigger if not exists trg_teams_updated_at
before update on public.teams for each row execute function public.set_updated_at();
create trigger if not exists trg_company_verification_updated_at
before update on public.company_verification for each row execute function public.set_updated_at();
create trigger if not exists trg_verification_documents_updated_at
before update on public.verification_documents for each row execute function public.set_updated_at();
create trigger if not exists trg_messages_updated_at
before update on public.messages for each row execute function public.set_updated_at();
create trigger if not exists trg_bookings_updated_at
before update on public.bookings for each row execute function public.set_updated_at();
create trigger if not exists trg_payments_updated_at
before update on public.payments for each row execute function public.set_updated_at();
create trigger if not exists trg_activity_events_updated_at
before update on public.activity_events for each row execute function public.set_updated_at();

commit;

