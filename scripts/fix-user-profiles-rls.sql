-- Fix RLS Policies für user_profiles Tabelle
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Aktiviere RLS für user_profiles (falls nicht aktiviert)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Lösche existierende Policies (falls vorhanden)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Public can view approved profiles" ON public.user_profiles;

-- 3. Erstelle neue Policies

-- Benutzer können ihr eigenes Profil sehen
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

-- Benutzer können ihr eigenes Profil aktualisieren
CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Admins können alle Profile sehen
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Öffentlicher Zugriff auf genehmigte Profile (für Anzeige)
CREATE POLICY "Public can view approved profiles" ON public.user_profiles
FOR SELECT USING (status = 'approved');

-- 4. Erlaube INSERT für neue Benutzer
CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Teste die Policies
SELECT 'RLS Policies für user_profiles erfolgreich erstellt!' as status;
