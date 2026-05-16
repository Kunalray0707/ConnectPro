-- ============================================
-- ConnectPro Stage 7 — DB-backed Professional Verification Badges
-- Implements:
-- 1) professional_verification table (public badge source of truth)
-- 2) verification_requests table (queue/state)
-- 3) email/phone/admin/document breakdown for UI
--
-- Strategy:
-- - Email verified = auth.users.email_confirmed_at IS NOT NULL
-- - Phone verified = auth.users.phone is present AND auth.users.phone_confirmed_at IS NOT NULL
--   (If phone confirmation columns differ in your auth setup, adjust.)
-- - Admin verification documents = verification_documents.status = approved
-- - Professional badge level is computed from flags and stored in professional_verifications.badge_level
--
-- This migration is additive; it does not replace existing tables.
-- ============================================

begin;

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists citext;

-- ------------------------------
-- Request queue (submitted by professional/candidate)
-- ------------------------------
create table if not exists public.professional_verification_requests (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.profiles(id) on delete cascade,
  requester_user_id uuid not null references auth.users(id) on delete cascade,

  status text not null default 'draft'
    check (status in ('draft','pending','approved','rejected','partial')),

  admin_note text,

  submitted_at timestamptz,
  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (professional_profile_id, requester_user_id)
);

-- ------------------------------
-- Badge state per professional
-- ------------------------------
create table if not exists public.professional_verifications (
  professional_profile_id uuid primary key references public.profiles(id) on delete cascade,

  -- breakdown
  email_verified boolean not null default false,
  email_verified_at timestamptz,

  phone_verified boolean not null default false,
  phone_verified_at timestamptz,

  documents_verified boolean not null default false,
  documents_verified_at timestamptz,

  admin_verified boolean not null default false,
  admin_verified_at timestamptz,

  -- computed badge
  badge_level text not null default 'none'
    check (badge_level in ('none','basic','pro','elite')),

  -- metadata
  admin_last_reviewed_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

-- ------------------------------
-- verification_documents alignment
-- Existing table public.verification_documents uses (user_id, doc_type).
-- We enhance it to allow mapping to a professional profile.
-- ------------------------------
alter table public.verification_documents
  add column if not exists professional_profile_id uuid;

-- Add index
create index if not exists idx_verif_docs_prof on public.verification_documents(professional_profile_id);
create index if not exists idx_verif_docs_user_doc on public.verification_documents(user_id, doc_type);

-- ------------------------------
-- RLS
-- ------------------------------
alter table public.professional_verification_requests enable row level security;
alter table public.professional_verifications enable row level security;
alter table public.verification_documents enable row level security;

-- Requests: professional can insert/update their own
create policy if not exists "pvr_requests: select self" on public.professional_verification_requests
for select
using (auth.uid() = requester_user_id);

create policy if not exists "pvr_requests: insert self" on public.professional_verification_requests
for insert
with check (auth.uid() = requester_user_id);

create policy if not exists "pvr_requests: update self" on public.professional_verification_requests
for update
using (auth.uid() = requester_user_id)
with check (auth.uid() = requester_user_id);

-- Badges: anyone can read (public)
create policy if not exists "pvr_badges: public select" on public.professional_verifications
for select
using (true);

-- Admin can update badges
-- (In your app, admin auth is stored in app_metadata.role.
-- Supabase doesn't expose it directly to SQL, so you may need to adjust predicate.)
-- For now, restrict updates to users who have app_metadata.role='admin'
create policy if not exists "pvr_badges: admin update" on public.professional_verifications
for update
using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' )
with check ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );

-- verification_documents: keep existing policies, but also allow updates for own user.
-- We rely on existing policies from 002_realtime_schema.sql.
-- If your existing policies are too strict, adjust later.

-- ------------------------------
-- Triggers to keep updated_at
-- ------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger if not exists trg_professional_verification_requests_updated_at
before update on public.professional_verification_requests
for each row execute function public.set_updated_at();

create trigger if not exists trg_professional_verifications_updated_at
before update on public.professional_verifications
for each row execute function public.set_updated_at();

-- ------------------------------
-- Badge computation helper
-- ------------------------------
create or replace function public.compute_badge_level(
  p_email_verified boolean,
  p_phone_verified boolean,
  p_admin_verified boolean,
  p_documents_verified boolean
)
returns text language plpgsql as $$
declare
  score int := 0;
begin
  if p_email_verified then score := score + 1; end if;
  if p_phone_verified then score := score + 1; end if;
  if p_documents_verified then score := score + 1; end if;
  if p_admin_verified then score := score + 1; end if;

  if score >= 4 then return 'elite'; end if;
  if score >= 3 then return 'pro'; end if;
  if score >= 2 then return 'basic'; end if;
  return 'none';
end;
$$;

-- ------------------------------
-- When a document is approved/rejected, update badge for that professional
-- We compute breakdown from auth.users + approved documents.
-- ------------------------------
create or replace function public.refresh_professional_badge(p_professional_id uuid)
returns void language plpgsql security definer as $$
declare
  v_user_id uuid;
  v_email_confirmed timestamptz;
  v_phone text;
  v_phone_confirmed timestamptz;
  v_documents_approved boolean;
  v_admin_verified boolean;
  v_badge text;
begin
  -- profiles row is keyed; map to user id
  select id into v_user_id from public.profiles where id = p_professional_id;
  -- The frontend uses public.profiles as professional row; it may store user_id separately.
  -- In your current schema, public.profiles includes user_id column.
  -- We'll attempt to read it.
  select up.user_id, u.email_confirmed_at, up.phone, u.phone_confirmed_at
  into v_user_id, v_email_confirmed, v_phone, v_phone_confirmed
  from public.profiles up
  join auth.users u on u.id = up.user_id
  where up.id = p_professional_id;

  v_documents_approved := exists (
    select 1 from public.verification_documents vd
    where vd.professional_profile_id = p_professional_id
      and vd.status = 'approved'
  );

  -- admin_verified mirrors whether any approved document exists.
  -- You can refine: require specific doc types.
  v_admin_verified := v_documents_approved;

  v_badge := public.compute_badge_level(
    (v_email_confirmed is not null),
    (v_phone_confirmed is not null),
    v_admin_verified,
    v_documents_approved
  );

  insert into public.professional_verifications(
    professional_profile_id,
    email_verified,
    email_verified_at,
    phone_verified,
    phone_verified_at,
    documents_verified,
    documents_verified_at,
    admin_verified,
    admin_verified_at,
    badge_level,
    updated_at
  ) values (
    p_professional_id,
    (v_email_confirmed is not null),
    v_email_confirmed,
    (v_phone_confirmed is not null),
    v_phone_confirmed,
    v_documents_approved,
    case when v_documents_approved then now() else null end,
    v_admin_verified,
    case when v_admin_verified then now() else null end,
    v_badge,
    now()
  )
  on conflict (professional_profile_id) do update set
    email_verified = excluded.email_verified,
    email_verified_at = excluded.email_verified_at,
    phone_verified = excluded.phone_verified,
    phone_verified_at = excluded.phone_verified_at,
    documents_verified = excluded.documents_verified,
    documents_verified_at = excluded.documents_verified_at,
    admin_verified = excluded.admin_verified,
    admin_verified_at = excluded.admin_verified_at,
    badge_level = excluded.badge_level,
    admin_last_reviewed_by = auth.uid(),
    updated_at = now();

end;
$$;

-- Fire badge refresh when a document changes.
create trigger if not exists trg_refresh_badge_on_doc_update
after insert or update on public.verification_documents
for each row
when (new.professional_profile_id is not null)
execute function public.refresh_professional_badge(new.professional_profile_id);

commit;

