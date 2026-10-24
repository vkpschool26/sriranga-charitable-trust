# Deployment and domain migration

Every step here is done **manually**. The live WordPress site keeps running
until you switch DNS in step C4. Every step can be reversed (see **Rollback**).

## A. Before you start

1. Complete `supabase/manual-setup/README.md`.
2. **Back up WordPress.** In Hostinger hPanel:
   - **Websites → Backups**: download a full backup (files and database).
   - Optionally, in WordPress go to **Tools → Export → All content** and download the XML.
   - Download `wp-content/uploads/2026/05/QRCode.png` and any other original media you want to keep.
3. In Hostinger **DNS / Nameservers**, take a screenshot of **every** current DNS
   record. On 24 Oct 2026 the domain used Hostinger nameservers
   (`aster/helios.dns-parking.com`) with A `@` → `91.108.107.2` and
   **no MX records** (no email on this domain). Keep every TXT record you find.
4. Lower the TTL of the `@` and `www` records to 300 seconds, a day before the switch.

## B. Deploy to a temporary Vercel URL

1. <https://vercel.com/new> → import the GitHub repo `sriranga-charitable-trust`.
   Vercel detects Next.js automatically. Keep the default build settings.
2. Environment variables (Production **and** Preview):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase (secret) |
   | `NEXT_PUBLIC_SITE_URL` | `https://srirangacharitabletrust.org` |
   | `ENQUIRY_IP_SALT` | a random string, e.g. the output of `openssl rand -hex 32` |
   | `CRON_SECRET` | another random string |

3. Deploy. The daily keep-alive cron is configured in `vercel.json`.
4. **Plan:** Vercel's Hobby plan is for non-commercial, personal use. A
   registered trust's website is an organisation's website, so check Vercel's
   current terms. The Pro plan may be required. Also check Hobby's
   image-optimisation and function limits; this site's usage is small.

## C. Test on the `*.vercel.app` URL, then switch

1. **Public pages.** Run `BASE_URL=https://<project>.vercel.app npm run smoke`.
   It checks every page, the old WordPress URLs, the 404 page, `robots.txt`,
   the sitemap and the security headers.
   Then check by hand on a phone: the menu, every page, and the Donate page.
2. **Admin.**
   - Sign in at `/admin/` and confirm a non-admin account is refused.
   - Edit a text block and check it on the site.
   - Add a trustee photo.
   - Create a test activity, upload 2–3 photos, reorder them, publish it, view it, then delete it.
   - Upload the UPI QR code in **Donation Settings** and check the Donate page.
3. **Forms.** Send **one** Get Involved and **one** Contact enquiry marked as a test.
   Check they appear under **Enquiries**, then delete them. Don't send test
   messages to Trust members without telling them first.
4. **Publish the trustees** you have permission to show (**Admin → Trustees → Publish**).
5. **Add the domain.** Vercel → Project → **Settings → Domains** → add
   `srirangacharitabletrust.org` and `www.srirangacharitabletrust.org`.
   Set one as primary; Vercel redirects the other to it.
6. **Update DNS** in Hostinger (**Domains → DNS / Nameservers → Manage DNS records**).
   Use the **exact records Vercel shows you**. Usually:
   - `A` record `@` → the IP Vercel shows (typically `76.76.21.21`). Delete the old `A @ → 91.108.107.2`.
   - `CNAME` record `www` → the target Vercel shows (e.g. `cname.vercel-dns.com`).
   - **Don't touch** TXT records or any MX records. None exist today. Add MX
     records later only if you set up email on the domain.
7. Wait for DNS to update (minutes to a few hours). Vercel issues the SSL certificate automatically.

## D. After the switch

- `https://srirangacharitabletrust.org` and `https://www.…` both load over HTTPS, and one redirects to the other.
- Run `BASE_URL=https://srirangacharitabletrust.org npm run smoke`.
- Old links redirect: `/join-sriranga-charitable-trust/`, `/donate-2/`, `/hello-world/` and others (see `next.config.ts`).
- Google Search Console: add the property and submit `https://srirangacharitabletrust.org/sitemap.xml`.
- Change Supabase **Site URL** to the real domain.
- Keep Hostinger hosting and the WordPress backup for at least 30 days before deciding anything about the old hosting.

## Rollback

If something goes wrong after the DNS change:

1. In Hostinger DNS, set `A @` back to `91.108.107.2` and restore the original
   `www` record from your screenshot.
2. WordPress is still on Hostinger, unchanged, so it comes back as soon as DNS updates.
3. Fix the problem on the Vercel URL, then try the switch again.
