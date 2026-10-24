# Supabase manual setup

These steps are done **by hand** in the Supabase dashboard. Nothing in this
repository runs them automatically.

Use a **new, separate Supabase project** for the Trust. Do not reuse the VK
Public School project.

## 1. Create the project

1. <https://supabase.com/dashboard> → **New project**.
2. Name: `sriranga-charitable-trust`. Region: **Mumbai (ap-south-1)**.
3. Save the database password somewhere safe.

## 2. Run the SQL (SQL Editor → New query)

Run each file in order. Read each one before you run it.

| File | What it does |
|---|---|
| `01_schema.sql` | Creates the 8 tables, the `is_admin()` function and the `updated_at` triggers |
| `02_rls.sql` | Turns on Row Level Security and adds the access policies |
| `03_storage.sql` | Creates the public `site-media` bucket (5 MB, JPG/PNG/WebP) and its admin-only write policies |
| `04_seed.sql` | Adds the verified content from the Trust Deed: settings, page text, 7 causes, and the 6 trustees (**unpublished**) |
| `05_add_admin.sql` | Template for adding an administrator (see step 4) |

To check the result, run the verification queries at the bottom of `02_rls.sql`.

## 3. Authentication settings

**Authentication → Sign In / Providers**

- Email provider: **enabled**.
- **Allow new users to sign up: OFF.** This matters. Admins are created only by you.
- Confirm email: can stay on. You'll auto-confirm admins when you create them.

**Authentication → URL Configuration**

- Site URL: `https://srirangacharitabletrust.org`. Use the `*.vercel.app` address until the domain moves.

## 4. Create an administrator

1. **Authentication → Users → Add user → Create new user**. Enter the email and a
   strong password, and tick **Auto Confirm User**.
2. Open `05_add_admin.sql`, replace `admin@example.com` with that email, and run it.

Only users in `admin_users` can use `/admin`. A signed-in account that isn't on
the list is signed out straight away.

**Forgotten password:** there's no self-service reset page. In **Authentication → Users**,
delete the user, create them again with a new password, and re-run `05_add_admin.sql`.

## 5. Copy the keys into the app

**Project Settings → API**

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` / secret key. **Server only.** Never share it or put it in client code. |

The service-role key is used for one thing only: saving public form
submissions after they've passed validation, spam checks and rate limiting.
All admin changes run as the signed-in admin and are checked by RLS.

## Security model (summary)

- Visitors can only **read** published content. They can never read enquiries.
- Admin access needs **both** a valid login **and** a row in `admin_users`.
  This is checked in the admin layout, in every server action, and again by RLS.
- Storage: anyone can view an image by its URL. Only admins can upload,
  replace, delete or list files, so unpublished photos can't be discovered by listing.
- Form submissions store a salted hash of the visitor's IP (for rate limiting), never the raw IP.

## Free-plan notes

- Supabase pauses free projects after about a week with no activity. The daily
  Vercel cron (`/api/cron/keep-alive`) does a small read to prevent this.
- Free-plan database and storage limits are generous for this site. Check the
  current limits on Supabase's pricing page.
