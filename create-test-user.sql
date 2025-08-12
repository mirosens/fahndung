-- Einfacher Test-Benutzer für Fahndungssystem
-- Führe dieses Script im Supabase SQL Editor aus

-- 1. Erstelle einen einfachen Test-Benutzer
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'test@test.com',
  crypt('test123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Erstelle Benutzerprofil
INSERT INTO public.user_profiles (
  id,
  name,
  email,
  role
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@test.com'),
  'Test User',
  'test@test.com',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- 3. Prüfe ob Benutzer erstellt wurde
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.name,
  p.role
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE u.email = 'test@test.com';
