# Sri Ranga Charitable Trust — website

The public website and admin dashboard for **Sri Ranga Charitable Trust (SRC Trust)**,
a registered charitable trust in Manchaladore, Gubbi Taluk, Tumkur District, Karnataka.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and Supabase
(Postgres, Auth, Storage). Designed to be hosted on Vercel.

## Pages

| Page | URL |
|---|---|
| Home | `/` |
| About Us (includes Board of Trustees) | `/about-us/` |
| Our Causes | `/what-we-do/` |
| Gallery & Activities | `/gallery/` and `/gallery/<activity>/` |
| Get Involved (volunteer / partner / support form) | `/get-involved/` |
| Donate (UPI) | `/donate/` |
| Contact | `/contact/` |
| Privacy Policy (footer link) | `/privacy-policy/` |
| Admin dashboard | `/admin/` |

Old WordPress URLs are permanently redirected (see `next.config.ts`).

## Content sources

Organisational facts come from the registered **Trust Deed** (Document No.
GBB-4-00511-2025-26, registered 8 Dec 2025, Sub Registrar, Gubbi). The default
text lives in `lib/content/defaults.ts`, with PDF page references in the
comments, and is mirrored in `supabase/manual-setup/04_seed.sql`.

- Causes are shown as **"Planned focus"** until an admin marks them **Active**.
  The site never presents objectives as completed work.
- No tax-exemption (80G/12A) claims are made.
- Trustees are seeded **unpublished**. Publish each one from the admin dashboard
  once they agree to appear publicly.
- No stock photographs are used. Only real photos uploaded by admins appear.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values once Supabase exists
npm run dev                  # http://localhost:3000
```

Without Supabase credentials the public site still runs, using the built-in
deed content and empty states. The admin area and forms need Supabase.

| Command | Purpose |
|---|---|
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests (validation, spam protection, admin guard, enquiry action) |
| `npm run smoke` | Route/redirect/SEO/security-header checks against a running server (`BASE_URL=…`) |

## Structure

```
app/(public)/          public pages
app/admin/             login + protected dashboard (8 modules)
app/actions/enquiry.ts public form handler (validation, honeypot, rate limit)
components/            layout, brand, ui, public and admin components
lib/content/           default content from the Trust Deed
lib/data/public.ts     read-only public queries (graceful fallbacks)
lib/auth/              admin allowlist guard
lib/admin/             admin action wrapper, file clean-up, reordering
lib/client/upload.ts   in-browser resize + direct-to-Storage upload
supabase/manual-setup/ SQL + instructions (run manually)
docs/DEPLOYMENT.md     Vercel, domain migration and rollback
```

## Security

- Admin = signed in **and** listed in `admin_users`. This is enforced in the
  admin layout, in every server action, and by Row Level Security.
- Admin changes run as the signed-in user. The service-role key is used only
  to save validated public form submissions.
- Images upload straight to Supabase Storage through short-lived signed URLs.
  The server picks the file names, and only admins can write.
- Security headers (CSP, frame denial and others) are set in `next.config.ts`.
  Admin pages are `noindex`.

## Setup

1. Supabase: `supabase/manual-setup/README.md`
2. Vercel and domain: `docs/DEPLOYMENT.md`
