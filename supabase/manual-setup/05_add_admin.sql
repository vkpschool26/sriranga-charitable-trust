-- =============================================================
-- Sri Ranga Charitable Trust — 05 Add an administrator
--
-- 1. Supabase Dashboard → Authentication → Users → "Add user"
--    → enter the email + a strong password → tick "Auto Confirm User".
-- 2. Replace the email below and run this script.
-- Repeat for each administrator. Only users listed in admin_users can
-- use the admin dashboard — being signed in is not enough.
-- =============================================================

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'admin@example.com'   -- ← change this
on conflict (user_id) do nothing;

-- Check:
-- select * from public.admin_users;

-- To remove an administrator:
-- delete from public.admin_users where email = 'admin@example.com';
