-- =============================================================
-- Sri Ranga Charitable Trust — 03 Storage (bucket + policies)
-- Run after 02_rls.sql. Alternatively create the bucket in the
-- dashboard (Storage → New bucket) with the same settings and run
-- only the policy statements below.
--
-- Bucket: site-media (public read)
--   • 5 MB per file
--   • JPEG, PNG, WebP only (SVG excluded: it can carry scripts)
--   • Only admins may upload, replace or delete
-- Folders used by the app:
--   site/  content/  trustees/  causes/  activities/{activity_id}/
-- =============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Files in a public bucket are served by their public URL WITHOUT any
-- policy. We deliberately do NOT grant public SELECT: that would let anyone
-- list every file (including photos of unpublished activities).
-- Admins need SELECT for listing/removing files.
drop policy if exists "Public read site-media" on storage.objects;
drop policy if exists "Admins read site-media" on storage.objects;
create policy "Admins read site-media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()));

drop policy if exists "Admins upload site-media" on storage.objects;
create policy "Admins upload site-media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-media' and (select public.is_admin()));

drop policy if exists "Admins update site-media" on storage.objects;
create policy "Admins update site-media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()))
  with check (bucket_id = 'site-media' and (select public.is_admin()));

drop policy if exists "Admins delete site-media" on storage.objects;
create policy "Admins delete site-media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()));
