-- ============================================
-- Professional Reviews (production upgrade)
-- Adds `public.professional_reviews` table and aggregates
-- ============================================

begin;

-- ------------------------------
-- Ensure aggregate columns exist on professionals table
-- Frontend currently reads `public.profiles` as professionals row.
-- ------------------------------
alter table public.profiles
  add column if not exists average_rating numeric(4,2) not null default 0,
  add column if not exists total_reviews integer not null default 0;

-- ------------------------------
-- Create reviews table
-- Requirements:
--  - professional_id, user_id
--  - rating 1–5
--  - comment
--  - timestamps
-- ------------------------------
create table if not exists public.professional_reviews (
  id uuid primary key default gen_random_uuid(),

  professional_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Each user can add a new review; no uniqueness constraint on (professional_id, user_id).
  -- Add an index for fast lookups.
  constraint professional_reviews_comment_min_len check (char_length(trim(comment)) >= 1)
);

create index if not exists idx_professional_reviews_professional on public.professional_reviews(professional_id);
create index if not exists idx_professional_reviews_user on public.professional_reviews(user_id);
create index if not exists idx_professional_reviews_created_at on public.professional_reviews(created_at desc);

-- ------------------------------
-- RLS
-- ------------------------------
alter table public.professional_reviews enable row level security;

-- Public can view reviews for a professional (profile page)
create policy if not exists "professional_reviews: select public" 
on public.professional_reviews for select
using (true);

-- Only the review owner can insert their review
create policy if not exists "professional_reviews: insert own" 
on public.professional_reviews for insert
with check (auth.uid() = user_id);

-- Only the review owner can update
create policy if not exists "professional_reviews: update own" 
on public.professional_reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Only the review owner can delete
create policy if not exists "professional_reviews: delete own" 
on public.professional_reviews for delete
using (auth.uid() = user_id);

-- ------------------------------
-- Trigger: keep aggregate stats in `public.profiles`
-- ------------------------------
create or replace function public.refresh_professional_review_aggregates(p_professional_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Update totals and average_rating from the reviews table.
  update public.profiles
  set
    total_reviews = (
      select count(*)::int
      from public.professional_reviews pr
      where pr.professional_id = p_professional_id
    ),
    average_rating = (
      select coalesce(avg(pr.rating)::numeric(4,2), 0)
      from public.professional_reviews pr
      where pr.professional_id = p_professional_id
    )
  where public.profiles.id = p_professional_id;
end;
$$;

-- Ensure updated_at is maintained
create trigger if not exists trg_professional_reviews_updated_at
before update on public.professional_reviews
for each row execute function public.set_updated_at();

-- After insert/update/delete, recompute aggregates
create or replace function public.trg_professional_reviews_aggregates()
returns trigger
language plpgsql
security definer
as $$
begin
  perform public.refresh_professional_review_aggregates(
    coalesce(new.professional_id, old.professional_id)
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_professional_reviews_aggregates_ins on public.professional_reviews;
create trigger trg_professional_reviews_aggregates_ins
after insert on public.professional_reviews
for each row execute function public.trg_professional_reviews_aggregates();

drop trigger if exists trg_professional_reviews_aggregates_upd on public.professional_reviews;
create trigger trg_professional_reviews_aggregates_upd
after update on public.professional_reviews
for each row execute function public.trg_professional_reviews_aggregates();

drop trigger if exists trg_professional_reviews_aggregates_del on public.professional_reviews;
create trigger trg_professional_reviews_aggregates_del
after delete on public.professional_reviews
for each row execute function public.trg_professional_reviews_aggregates();

-- ------------------------------
-- Realtime
-- (Front-end realtime subscriptions depend on replica identity + publication)
-- replica identity full helps deliver updated rows reliably.
-- ------------------------------
alter table public.professional_reviews replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    execute 'alter publication supabase_realtime add table public.professional_reviews';
  end if;
exception when others then null;
end $$;

commit;

