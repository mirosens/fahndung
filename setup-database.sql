-- Setup Script für Fahndungssystem Datenbank
-- Führen Sie dieses Script im Supabase SQL Editor aus

-- 1. Erstelle user_profiles Tabelle
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Erstelle investigations Tabelle (Haupttabelle für Fahndungen)
CREATE TABLE IF NOT EXISTS public.investigations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  case_number TEXT UNIQUE,
  description TEXT,
  short_description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'published', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'new')),
  category TEXT DEFAULT 'MISSING_PERSON' CHECK (category IN ('WANTED_PERSON', 'MISSING_PERSON', 'UNKNOWN_DEAD', 'STOLEN_GOODS')),
  location TEXT,
  station TEXT,
  contact_info JSONB DEFAULT '{}',
  features TEXT,
  date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Erstelle investigation_images Tabelle
CREATE TABLE IF NOT EXISTS public.investigation_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
  file_name VARCHAR(500) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INTEGER,
  height INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Erstelle Indexe für bessere Performance
CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_category ON investigations(category);
CREATE INDEX IF NOT EXISTS idx_investigations_priority ON investigations(priority);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON investigations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_created_by ON investigations(created_by);
CREATE INDEX IF NOT EXISTS idx_investigations_case_number ON investigations(case_number);

CREATE INDEX IF NOT EXISTS idx_investigation_images_investigation_id ON investigation_images(investigation_id);
CREATE INDEX IF NOT EXISTS idx_investigation_images_uploaded_at ON investigation_images(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_investigation_images_is_primary ON investigation_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_investigation_images_is_public ON investigation_images(is_public);

-- 5. Aktiviere Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_images ENABLE ROW LEVEL SECURITY;

-- 6. Erstelle RLS Policies
-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Investigations Policies
DROP POLICY IF EXISTS "Public can view published investigations" ON public.investigations;
DROP POLICY IF EXISTS "Authenticated users can view all investigations" ON public.investigations;
DROP POLICY IF EXISTS "Authenticated users can insert investigations" ON public.investigations;
DROP POLICY IF EXISTS "Users can update their own investigations" ON public.investigations;
DROP POLICY IF EXISTS "Users can delete their own investigations" ON public.investigations;

CREATE POLICY "Public can view published investigations" ON public.investigations
FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can view all investigations" ON public.investigations
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert investigations" ON public.investigations
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Users can update their own investigations" ON public.investigations
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own investigations" ON public.investigations
FOR DELETE USING (auth.uid() = created_by);

-- Investigation Images Policies
DROP POLICY IF EXISTS "Public can view public investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Authenticated users can view all investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Authenticated users can insert investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Users can update their own investigation images" ON public.investigation_images;
DROP POLICY IF EXISTS "Users can delete their own investigation images" ON public.investigation_images;

CREATE POLICY "Public can view public investigation images" ON public.investigation_images
FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can view all investigation images" ON public.investigation_images
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert investigation images" ON public.investigation_images
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND uploaded_by = auth.uid());

CREATE POLICY "Users can update their own investigation images" ON public.investigation_images
FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own investigation images" ON public.investigation_images
FOR DELETE USING (auth.uid() = uploaded_by);

-- 7. Erstelle Funktionen für automatische Aktualisierung
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Erstelle Trigger für automatische updated_at Aktualisierung
DROP TRIGGER IF EXISTS update_investigations_updated_at ON public.investigations;
DROP TRIGGER IF EXISTS update_investigation_images_updated_at ON public.investigation_images;

CREATE TRIGGER update_investigations_updated_at
    BEFORE UPDATE ON public.investigations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investigation_images_updated_at
    BEFORE UPDATE ON public.investigation_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Erstelle Funktion für automatische case_number Generierung
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    case_number TEXT;
    sequence_num INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Finde die nächste Sequenznummer für dieses Jahr
    SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.investigations
    WHERE case_number LIKE year_part || '-%';
    
    sequence_part := LPAD(sequence_num::TEXT, 4, '0');
    case_number := year_part || '-' || sequence_part;
    
    RETURN case_number;
END;
$$ LANGUAGE plpgsql;

-- 10. Erstelle Trigger für automatische case_number Generierung
DROP TRIGGER IF EXISTS auto_generate_case_number ON public.investigations;

CREATE TRIGGER auto_generate_case_number
    BEFORE INSERT ON public.investigations
    FOR EACH ROW
    WHEN (NEW.case_number IS NULL OR NEW.case_number = '')
    EXECUTE FUNCTION generate_case_number();

-- 11. Erstelle Beispieldaten für Tests
INSERT INTO public.investigations (
  title,
  description,
  short_description,
  status,
  priority,
  category,
  location,
  station,
  date,
  tags
) VALUES 
(
  'Vermisste Person: Max Mustermann',
  'Max Mustermann wurde zuletzt am 15. Januar 2025 in Stuttgart gesehen. Er trägt eine blaue Jacke und eine rote Mütze.',
  'Vermisste Person in Stuttgart',
  'published',
  'urgent',
  'MISSING_PERSON',
  'Stuttgart, Baden-Württemberg',
  'Polizeipräsidium Stuttgart',
  '2025-01-15',
  ARRAY['vermisst', 'stuttgart', 'dringend']
),
(
  'Gesuchter Täter: Einbruch in Wohnung',
  'Am 10. Januar 2025 wurde in eine Wohnung in Karlsruhe eingebrochen. Der Täter wurde von einer Überwachungskamera erfasst.',
  'Einbruch in Karlsruhe',
  'published',
  'normal',
  'WANTED_PERSON',
  'Karlsruhe, Baden-Württemberg',
  'Polizeipräsidium Karlsruhe',
  '2025-01-10',
  ARRAY['einbruch', 'karlsruhe', 'überwachungskamera']
),
(
  'Gestohlene Fahrzeuge: BMW X5',
  'Ein BMW X5 wurde am 12. Januar 2025 in Mannheim gestohlen. Kennzeichen: M-AB 1234',
  'Gestohlener BMW X5',
  'published',
  'normal',
  'STOLEN_GOODS',
  'Mannheim, Baden-Württemberg',
  'Polizeipräsidium Mannheim',
  '2025-01-12',
  ARRAY['fahrzeugdiebstahl', 'mannheim', 'bmw']
)
ON CONFLICT (case_number) DO NOTHING;

-- 12. Erstelle Storage Bucket für Bilder
INSERT INTO storage.buckets (id, name, public) 
VALUES ('investigation-images', 'investigation-images', true)
ON CONFLICT (id) DO NOTHING;

-- 13. Erstelle Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload investigation images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view investigation images" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'investigation-images');

CREATE POLICY "Authenticated users can upload investigation images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'investigation-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public can view investigation images" ON storage.objects
FOR SELECT USING (bucket_id = 'investigation-images');

-- 14. Aktiviere Real-time für investigations Tabelle
ALTER PUBLICATION supabase_realtime ADD TABLE public.investigations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.investigation_images;

-- Erfolgsmeldung
SELECT 'Datenbank-Setup erfolgreich abgeschlossen!' as status;
