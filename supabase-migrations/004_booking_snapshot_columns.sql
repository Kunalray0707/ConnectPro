-- ============================================
-- ConnectPro Stage 3 — Booking snapshot columns
-- Adds backup snapshot fields for UI/reporting
-- ============================================

begin;

do $$
begin
  -- Backup snapshot: client & professional display names
  -- (prevents losing names if profiles/user display changes later)
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bookings'
      and column_name = 'client_name'
  ) then
    alter table public.bookings add column client_name text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bookings'
      and column_name = 'professional_name'
  ) then
    alter table public.bookings add column professional_name text;
  end if;

end $$;

commit;

