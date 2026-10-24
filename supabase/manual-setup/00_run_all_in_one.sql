-- =============================================================
-- Sri Ranga Charitable Trust — COMPLETE SETUP (01 + 02 + 03 + 04 in one)
-- Paste into Supabase SQL Editor and click Run once.
-- Then run 05_add_admin.sql with your email.
-- Safe to re-run.
-- =============================================================


-- =============================================================
-- Sri Ranga Charitable Trust — 01 Schema
-- Run manually in the Supabase SQL Editor, in order (01 → 05).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.
-- =============================================================

-- ---------------------------------------------------------------
-- Helper: keep updated_at current
-- ---------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------
-- 1. admin_users — explicit allowlist of dashboard administrators
-- ---------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  email      text        not null,
  created_at timestamptz not null default now()
);

-- is_admin(): true when the current session user is on the allowlist.
-- SECURITY DEFINER so RLS policies can call it without exposing admin_users.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------
-- 2. site_settings — single row of global + donation settings
-- ---------------------------------------------------------------
create table if not exists public.site_settings (
  id                    smallint    primary key default 1 check (id = 1),
  trust_name            text        not null default 'Sri Ranga Charitable Trust',
  short_name            text        not null default 'SRC Trust',
  tagline               text        not null default 'Grow Together',
  phone                 text,
  address               text,
  map_url               text,
  founded_on            date,
  registration_no       text,
  registration_date     date,
  registrar             text,
  footer_note           text,
  seo_description       text,
  donation_message      text,
  donation_instructions text,
  upi_id                text,
  upi_payee_name        text,
  upi_qr_path           text,
  bank_details          text,
  updated_at            timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- 3. content_blocks — editable text blocks (fixed set of keys)
-- ---------------------------------------------------------------
create table if not exists public.content_blocks (
  key        text        primary key
                         check (key in (
                           'home.hero', 'home.intro',
                           'about.story', 'about.mission', 'about.vision',
                           'involved.intro'
                         )),
  title      text,
  body       text,
  updated_at timestamptz not null default now()
);

drop trigger if exists content_blocks_updated_at on public.content_blocks;
create trigger content_blocks_updated_at
  before update on public.content_blocks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- 4. trustees
-- ---------------------------------------------------------------
create table if not exists public.trustees (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null check (char_length(name) between 2 and 120),
  designation  text        not null check (char_length(designation) between 2 and 80),
  bio          text        check (bio is null or char_length(bio) <= 1200),
  photo_path   text,
  photo_alt    text,
  sort_order   integer     not null default 0,
  is_published boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists trustees_published_order_idx
  on public.trustees (is_published, sort_order);

drop trigger if exists trustees_updated_at on public.trustees;
create trigger trustees_updated_at
  before update on public.trustees
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- 5. causes
-- ---------------------------------------------------------------
create table if not exists public.causes (
  id           uuid        primary key default gen_random_uuid(),
  slug         text        not null unique
                           check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title        text        not null check (char_length(title) between 2 and 120),
  summary      text        not null check (char_length(summary) between 10 and 400),
  description  text        check (description is null or char_length(description) <= 4000),
  icon         text        not null
                           check (icon in ('education', 'healthcare', 'women-children',
                                           'food', 'seniors', 'community', 'housing')),
  image_path   text,
  image_alt    text,
  status       text        not null default 'planned'
                           check (status in ('planned', 'active')),
  sort_order   integer     not null default 0,
  is_published boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists causes_published_order_idx
  on public.causes (is_published, sort_order);

drop trigger if exists causes_updated_at on public.causes;
create trigger causes_updated_at
  before update on public.causes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- 6. activities — events, updates and photo albums in one place
-- ---------------------------------------------------------------
create table if not exists public.activities (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        not null unique
                            check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title         text        not null check (char_length(title) between 2 and 160),
  activity_date date        not null,
  location      text        check (location is null or char_length(location) <= 160),
  summary       text        not null check (char_length(summary) between 10 and 400),
  description   text        check (description is null or char_length(description) <= 8000),
  is_published  boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists activities_published_date_idx
  on public.activities (is_published, activity_date desc);

drop trigger if exists activities_updated_at on public.activities;
create trigger activities_updated_at
  before update on public.activities
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- 7. activity_photos — the first photo (lowest sort_order) is the cover
-- ---------------------------------------------------------------
create table if not exists public.activity_photos (
  id           uuid        primary key default gen_random_uuid(),
  activity_id  uuid        not null references public.activities (id) on delete cascade,
  storage_path text        not null unique,
  alt_text     text        not null check (char_length(alt_text) between 2 and 300),
  caption      text        check (caption is null or char_length(caption) <= 300),
  width        integer,
  height       integer,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists activity_photos_activity_order_idx
  on public.activity_photos (activity_id, sort_order);

-- ---------------------------------------------------------------
-- 8. enquiries — Get Involved (volunteer) and Contact form submissions
-- ---------------------------------------------------------------
create table if not exists public.enquiries (
  id         uuid        primary key default gen_random_uuid(),
  kind       text        not null check (kind in ('volunteer', 'contact')),
  name       text        not null check (char_length(name) between 2 and 100),
  email      text        not null
                         check (char_length(email) <= 254
                                and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone      text        check (phone is null or char_length(phone) between 7 and 20),
  interest   text        check (interest is null
                                or interest in ('volunteer', 'donate', 'partner', 'general')),
  subject    text        check (subject is null or char_length(subject) between 2 and 150),
  message    text        not null check (char_length(message) between 10 and 5000),
  status     text        not null default 'new'
                         check (status in ('new', 'contacted', 'closed')),
  ip_hash    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Volunteer form requires phone + interest; contact form requires a subject.
  constraint enquiries_volunteer_fields
    check (kind <> 'volunteer' or (phone is not null and interest is not null)),
  constraint enquiries_contact_fields
    check (kind <> 'contact' or subject is not null)
);

create index if not exists enquiries_kind_status_created_idx
  on public.enquiries (kind, status, created_at desc);
create index if not exists enquiries_ip_created_idx
  on public.enquiries (ip_hash, created_at);

drop trigger if exists enquiries_updated_at on public.enquiries;
create trigger enquiries_updated_at
  before update on public.enquiries
  for each row execute function public.set_updated_at();


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


-- =============================================================
-- Sri Ranga Charitable Trust — 04 Seed content (verified)
-- Run after 03_storage.sql. Content is written from the registered
-- Trust Deed (Document No. GBB-4-00511-2025-26).
-- Re-running will NOT overwrite edits made in the admin dashboard.
-- =============================================================

insert into public.site_settings (id, trust_name, short_name, tagline, phone, address, founded_on, registration_no, registration_date, registrar, footer_note, seo_description, donation_message, donation_instructions, upi_id, map_url)
values (1,
  'Sri Ranga Charitable Trust',
  'SRC Trust',
  'Grow Together',
  '8095032044',
  'Sri Maradiranganatha Nilaya, Manchaladore, Gubbi Taluk, Tumkur District, Karnataka – 572117',
  '2025-12-04',
  'GBB-4-00511-2025-26',
  '2025-12-08',
  'Sub Registrar, Gubbi',
  'A registered charitable trust working for education, healthcare and the welfare of people in need.',
  'Sri Ranga Charitable Trust (SRC Trust) is a registered charitable trust in Manchaladore, Gubbi Taluk, Tumkur District, working for education, healthcare, women and children, senior citizens and community welfare.',
  'Your contribution — in money or in kind — helps the Trust begin and sustain its work for people in need.',
  'If you would like your contribution acknowledged, please call us or share your details through the Get Involved form.',
  '8095032044@ybl',
  'https://www.google.com/maps/search/?api=1&query=Manchaladore%2C%20Gubbi%20Taluk%2C%20Tumakuru%20District%2C%20Karnataka%20572117'
)
on conflict (id) do nothing;

insert into public.content_blocks (key, title, body) values
  ('home.hero', 'Grow Together.', 'A registered charitable trust from Gubbi, Tumkur, working to bring education, healthcare and dignity within reach of those who need it most.'),
  ('home.intro', 'Founded on a simple promise: no one left behind.', 'Sri Ranga Charitable Trust was founded in December 2025 by Sri M. K. Marudaiah, a social worker from Manchaladore, to uplift people who are poor and in need.

We are at the very beginning of our journey — and we will share every step of it openly.'),
  ('about.story', 'Our story', 'Sri Ranga Charitable Trust — SRC Trust — was founded on 4 December 2025 by Sri M. K. Marudaiah, a social worker from Manchaladore in Gubbi Taluk, Tumkur District. Its trust deed was registered with the Sub Registrar, Gubbi, on 8 December 2025.

The Trust was created for the benefit of the public, with one purpose at its heart: to uplift people who are poor and in need. Its founding deed commits it to work in education, healthcare, the welfare of women and children, food and basic needs, the welfare of senior citizens, and the wider community.

We are at the beginning of this journey. As our work begins, every activity will be shared openly on this website.'),
  ('about.mission', 'Our mission', 'To uplift the poor and the vulnerable by supporting education, healthcare, livelihoods and basic needs — with no motive of profit.'),
  ('about.vision', 'Our vision', 'A community where access to education, healthcare and dignity is a right, not a privilege.'),
  ('involved.intro', 'Stand with us', 'Sri Ranga Charitable Trust is just beginning its work, and every helping hand matters. Whether you can offer time, skills, resources or partnership, we would be glad to hear from you.')
on conflict (key) do nothing;

-- Causes: published, all marked 'planned' until work actually begins.
insert into public.causes (slug, title, summary, description, icon, status, sort_order, is_published) values
  ('education', 'Education & Scholarships', 'Helping children and young people learn — from primary school through higher, technical and medical education.', 'The Trust aims to promote primary, secondary and higher education, including technical and medical education and physical training. It may help establish and run schools, colleges and other institutions of learning, and award scholarships, stipends, prizes and financial assistance so that deserving students can continue their studies — in schools, colleges, technical institutions or art schools, in India or abroad.', 'education', 'planned', 10, true),
  ('healthcare', 'Healthcare & Medical Relief', 'Bringing medical care, medicine and relief within reach of people who cannot afford it.', 'The Trust aims to help set up and support hospitals, charitable dispensaries, maternity homes, child welfare centres, convalescent homes and similar institutions that bring medical relief to those who are suffering. It also seeks to provide medicine to people in need and to encourage research and education in medical science.', 'healthcare', 'planned', 20, true),
  ('women-and-children', 'Women & Children', 'Livelihood, skills and welfare support for women, and care for the wellbeing of children.', 'The Trust aims to support schemes that provide livelihood and upliftment for poor women and promote the welfare of children. It seeks to encourage education and training for women in handicrafts and fine arts, and to establish or support centres and institutions that carry out social welfare work for women and children.', 'women-children', 'planned', 30, true),
  ('food-and-basic-needs', 'Food & Basic Needs', 'Food, medicine and essential support for poor and deserving families.', 'The Trust aims to provide food, medicine and other help — in whatever form is most needed — to poor and deserving people, and to support those in need with financial, educational and food assistance.', 'food', 'planned', 40, true),
  ('senior-citizens', 'Senior Citizens'' Welfare', 'Care, shelter and dignity for elderly, infirm and destitute people.', 'The Trust aims to work for the welfare of senior citizens, including building old age homes, and to support institutions — such as care homes and orphanages — that bring relief to the poor, the old, the infirm and the destitute.', 'seniors', 'planned', 50, true),
  ('community-welfare', 'Community Welfare', 'Shared spaces and programmes that strengthen community life.', 'The Trust aims to support playgrounds, parks and facilities for sports and games, along with community centres and meeting spaces for socially useful activities. More broadly, it seeks to promote activities anywhere in India that serve the general welfare of the public, without any motive of profit.', 'community', 'planned', 60, true),
  ('housing-and-community-buildings', 'Housing & Community Buildings', 'Affordable housing sites for people in essential need, and buildings that serve the community.', 'The Trust''s deed allows it to develop land, form housing sites and construct buildings to be offered at a lower price to people in essential need. It also provides for building hostels, a school, a convention hall and temples for the community.', 'housing', 'planned', 70, true)
on conflict (slug) do nothing;

-- Trustees: from the Trust Deed (clause 4, PDF p.7–8; clause 23, PDF p.18).
-- Seeded UNPUBLISHED. Publish each one from the admin dashboard after the
-- trustees confirm they are happy to appear on the public website.
insert into public.trustees (name, designation, sort_order, is_published)
select v.name, v.designation, v.sort_order, false
from (values
  ('Sri M. K. Marudaiah',     'Founder & Managing Trustee', 10),
  ('Sri M. S. Praveen Kumar', 'Secretary',                  20),
  ('Smt. Boramma M. R.',      'Trustee',                    30),
  ('Smt. Dhanushree C. V.',   'Trustee',                    40),
  ('Sri Nagendra H. N.',      'Trustee',                    50),
  ('Smt. R. Veena',           'Trustee',                    60)
) as v(name, designation, sort_order)
where not exists (select 1 from public.trustees);
