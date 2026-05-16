-- ============================================
-- ConnectPro Stage 4 — Professional location for Near Me map
-- Adds location + coordinates to public.profiles
-- ============================================

begin;

-- Coordinates (for distance sorting & map markers)
alter table public.profiles
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists country text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- Optional: PostGIS geography point for efficient distance queries
-- Only added if PostGIS exists; otherwise distance queries can be done in frontend.
create extension if not exists postgis;

alter table public.profiles
  add column if not exists location_geog geography(Point, 4326);

-- Keep geography column in sync when lat/lng exist.
-- We use a trigger to populate location_geog.
create or replace function public.sync_location_geog()
returns trigger as $$
begin
  if (new.latitude is not null and new.longitude is not null) then
    new.location_geog := ST_SetSRID(ST_MakePoint(new.longitude, new.latitude), 4326)::geography;
  else
    new.location_geog := null;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_sync_location_geog on public.profiles;
create trigger trg_sync_location_geog
before insert or update of latitude, longitude
on public.profiles
for each row execute function public.sync_location_geog();

-- Backfill geography for existing rows
update public.profiles
set location_geog = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
where latitude is not null and longitude is not null;

-- Indexes
create index if not exists idx_profiles_lat_lng on public.profiles (latitude, longitude);
create index if not exists idx_profiles_city_state on public.profiles (city, state);

-- GIST index for geography
create index if not exists idx_profiles_location_geog on public.profiles using gist (location_geog);

-- RLS: allow public read (already exists in 003_update_rls_compat_views.sql,
-- but ensure policy applies to all columns automatically).
-- No extra policies needed for added columns.

commit;

