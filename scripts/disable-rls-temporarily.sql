-- Temporär RLS deaktivieren für user_profiles
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Deaktiviere RLS für user_profiles temporär
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Bestätigung
SELECT 'RLS für user_profiles temporär deaktiviert!' as status;
SELECT 'Die Anwendung sollte jetzt funktionieren.' as info;
