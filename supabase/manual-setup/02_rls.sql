-- =============================================================
-- Sri Ranga Charitable Trust — 02 Row Level Security
-- Run after 01_schema.sql.
--
-- Model:
--   • Public (anon) can read only published / public content.
--   • Admins (rows in admin_users, checked by is_admin()) can manage content.
--   • Nobody can read enquiries through the API except admins.
--   • Enquiries are inserted only by the website server (service role, which
--     bypasses RLS) after validation, honeypot and rate-limit checks.
-- =============================================================

alter table public.admin_users     enable row level security;
alter table public.site_settings   enable row level security;
alter table public.content_blocks  enable row level security;
alter table public.trustees        enable row level security;
alter table public.causes          enable row level security;
alter table public.activities      enable row level security;
alter table public.activity_photos enable row level security;
alter table public.enquiries       enable row level security;

-- ---------------------------------------------------------------
-- Table privileges. Granted explicitly so this works when the project
-- was created with "Automatically expose new tables" turned OFF
-- (recommended). RLS policies below then decide which ROWS each role
-- can actually see or change.
-- ---------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;

-- Public visitors: read-only access to website content.
grant select on public.site_settings, public.content_blocks, public.trustees,
                public.causes, public.activities, public.activity_photos
  to anon, authenticated;

-- Signed-in users: write access, limited to admins by the RLS policies.
grant update                 on public.site_settings   to authenticated;
grant insert, update         on public.content_blocks  to authenticated;
grant insert, update, delete on public.trustees, public.causes,
                                public.activities, public.activity_photos
  to authenticated;
grant select, update, delete on public.enquiries       to authenticated;

-- Server-side form handler (service role, bypasses RLS).
grant all on all tables in schema public to service_role;

-- anon gets nothing on enquiries; nobody but SQL-editor users can touch
-- admin_users (is_admin() reads it as SECURITY DEFINER).

-- ---------------------------------------------------------------
-- admin_users: no policies → not reachable through the API at all.
-- Managed only from the SQL editor (see 05_add_admin.sql).
-- ---------------------------------------------------------------

-- ---------------------------------------------------------------
-- site_settings (single row)
-- ---------------------------------------------------------------
drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins update site settings" on public.site_settings;
create policy "Admins update site settings"
  on public.site_settings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------
-- content_blocks
-- ---------------------------------------------------------------
drop policy if exists "Public read content blocks" on public.content_blocks;
create policy "Public read content blocks"
  on public.content_blocks for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins insert content blocks" on public.content_blocks;
create policy "Admins insert content blocks"
  on public.content_blocks for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins update content blocks" on public.content_blocks;
create policy "Admins update content blocks"
  on public.content_blocks for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------
-- trustees, causes, activities — published rows are public
-- ---------------------------------------------------------------
drop policy if exists "Read published trustees" on public.trustees;
create policy "Read published trustees"
  on public.trustees for select
  to anon, authenticated
  using (is_published or (select public.is_admin()));

drop policy if exists "Admins manage trustees" on public.trustees;
create policy "Admins manage trustees"
  on public.trustees for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Read published causes" on public.causes;
create policy "Read published causes"
  on public.causes for select
  to anon, authenticated
  using (is_published or (select public.is_admin()));

drop policy if exists "Admins manage causes" on public.causes;
create policy "Admins manage causes"
  on public.causes for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Read published activities" on public.activities;
create policy "Read published activities"
  on public.activities for select
  to anon, authenticated
  using (is_published or (select public.is_admin()));

drop policy if exists "Admins manage activities" on public.activities;
create policy "Admins manage activities"
  on public.activities for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------
-- activity_photos — public only when the parent activity is published
-- ---------------------------------------------------------------
drop policy if exists "Read photos of published activities" on public.activity_photos;
create policy "Read photos of published activities"
  on public.activity_photos for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id and a.is_published
    )
    or (select public.is_admin())
  );

drop policy if exists "Admins manage activity photos" on public.activity_photos;
create policy "Admins manage activity photos"
  on public.activity_photos for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------
-- enquiries — admins only. No INSERT policy on purpose.
-- ---------------------------------------------------------------
drop policy if exists "Admins read enquiries" on public.enquiries;
create policy "Admins read enquiries"
  on public.enquiries for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins update enquiries" on public.enquiries;
create policy "Admins update enquiries"
  on public.enquiries for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins delete enquiries" on public.enquiries;
create policy "Admins delete enquiries"
  on public.enquiries for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------
-- Verification (run after applying)
-- ---------------------------------------------------------------
-- select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- select tablename, policyname, cmd, roles from pg_policies where schemaname = 'public' order by 1, 2;
