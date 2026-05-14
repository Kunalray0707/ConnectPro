-- ============================================
-- ConnectPro Stage 2 — RLS compatibility helpers
-- Ensures existing frontend behavior continues.
-- ============================================

begin;

-- ------------------------------
-- Ensure `profiles` has row-level security enabled.
-- Frontend uses `profiles` as the professionals table.
-- ------------------------------
alter table public.profiles enable row level security;

-- ------------------------------
-- Baseline policies for profiles (professionals)
-- ------------------------------
-- Public read
create policy if not exists "profiles: public select" on public.profiles
for select using (public = true);

-- Professionals can insert/update their own professional profile rows
-- (compatibility: assumes `user_id` exists in profiles)
create policy if not exists "profiles: insert own" on public.profiles
for insert with check (auth.uid() = user_id);

create policy if not exists "profiles: update own" on public.profiles
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------
-- Ratings/reviews link to profiles
-- allow public select for aggregated review display
-- ------------------------------
alter table public.ratings enable row level security;
alter table public.reviews enable row level security;

commit;

