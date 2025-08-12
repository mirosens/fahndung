# Supabase Cloud Migration - Schritt für Schritt

## 🗄️ **Schritt 1: Supabase SQL Editor öffnen**

1. **Gehe zu**: [https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/sql](https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/sql)
2. **Klicke auf "New Query"**

## 📝 **Schritt 2: Datenbank-Schema ausführen**

Kopiere den gesamten Inhalt von `setup-database.sql` und füge ihn in den SQL Editor ein.

**Wichtige Tabellen die erstellt werden:**

- `user_profiles` - Benutzerprofile
- `investigations` - Fahndungen
- `investigation_images` - Bilder für Fahndungen

## 🔐 **Schritt 3: Test-Benutzer erstellen**

Führe dieses SQL aus, um einen Test-Benutzer zu erstellen:

```sql
-- Erstelle einen Test-Benutzer
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('test123456', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Erstelle ein Test-Profil
INSERT INTO public.user_profiles (
  id,
  name,
  email,
  role
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  'Test User',
  'test@example.com',
  'admin'
);
```

## 📊 **Schritt 4: Test-Fahndungen erstellen**

Führe dieses SQL aus, um Test-Fahndungen zu erstellen:

```sql
-- Erstelle Test-Fahndungen
INSERT INTO public.investigations (
  title,
  case_number,
  description,
  short_description,
  status,
  priority,
  category,
  location,
  station,
  features,
  date,
  created_by,
  tags
) VALUES
(
  'Vermisste Person: Max Mustermann',
  'F-2025-001',
  'Max Mustermann wurde am 15. Januar 2025 zuletzt in der Innenstadt gesehen. Er trägt eine blaue Jacke und eine rote Mütze.',
  'Vermisste Person in der Innenstadt',
  'published',
  'urgent',
  'MISSING_PERSON',
  'Innenstadt, Berlin',
  'Polizei Berlin',
  'Blaue Jacke, rote Mütze, 1.80m groß',
  '2025-01-15',
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  ARRAY['vermisst', 'innenstadt', 'berlin']
),
(
  'Gesuchte Person: Anna Schmidt',
  'F-2025-002',
  'Anna Schmidt wird wegen Betrugs gesucht. Sie soll mehrere Menschen um Geld betrogen haben.',
  'Gesuchte Person wegen Betrugs',
  'published',
  'normal',
  'WANTED_PERSON',
  'Hamburg',
  'Polizei Hamburg',
  'Braune Haare, grüne Augen, 1.65m',
  '2025-01-10',
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  ARRAY['betrug', 'hamburg', 'gesucht']
),
(
  'Gestohlene Fahrzeuge',
  'F-2025-003',
  'Mehrere Fahrzeuge wurden in der Nacht gestohlen. Es handelt sich um weiße Lieferwagen.',
  'Gestohlene weiße Lieferwagen',
  'published',
  'new',
  'STOLEN_GOODS',
  'München',
  'Polizei München',
  'Weiße Lieferwagen, Kennzeichen unbekannt',
  '2025-01-20',
  (SELECT id FROM auth.users WHERE email = 'test@example.com'),
  ARRAY['fahrzeuge', 'gestohlen', 'münchen']
);
```

## ✅ **Schritt 5: Überprüfung**

Nach der Migration sollten Sie:

1. **In der Anwendung anmelden können** mit:
   - Email: `test@example.com`
   - Passwort: `test123456`

2. **Fahndungen sehen können** unter:
   - https://fahndung.vercel.app/fahndungen

3. **Neue Fahndungen erstellen können** unter:
   - https://fahndung.vercel.app/fahndungen/neu

## 🔗 **Nützliche Links**

- **Supabase Dashboard**: [https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa](https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa)
- **SQL Editor**: [https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/sql](https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/sql)
- **Table Editor**: [https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/editor](https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/editor)

## 🚀 **Nach der Migration**

1. **Teste die Anwendung**: https://fahndung.vercel.app
2. **Melde dich an**: test@example.com / test123456
3. **Erstelle neue Fahndungen**
4. **Teste Cloudinary-Upload**

**Die Migration ist abgeschlossen, wenn alle Schritte ausgeführt wurden!** 🎉
