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
