-- Run this AFTER creating the user in Supabase Auth dashboard
-- Replace the UUID with the actual user ID from Authentication → Users

INSERT INTO public.users (id, email, role)
VALUES (
  'PASTE-YOUR-AUTH-USER-UUID-HERE',
  'admin@mndasox.com',
  'admin'
)
ON CONFLICT (id) DO NOTHING;