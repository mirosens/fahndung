# Supabase Cloud Migration - Manuelle Anleitung

## 🗄️ Datenbank-Schema migrieren

### Schritt 1: Gehe zu Supabase SQL Editor

**URL**: https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/sql

### Schritt 2: Kopiere das SQL-Script

Kopiere den gesamten Inhalt von `setup-database.sql` und füge ihn in den SQL Editor ein.

### Schritt 3: Führe das Script aus

Klicke auf "Run" um das Datenbank-Schema zu erstellen.

## 📊 Test-Daten erstellen (Optional)

Nach der Migration kannst du Test-Daten erstellen:

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

## ✅ Nach der Migration

1. **Teste die Anwendung**: http://localhost:3001
2. **Melde dich an** mit: test@example.com / test123456
3. **Teste Cloudinary**: http://localhost:3001/test-cloudinary

## 🔗 Nützliche Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa
- **SQL Editor**: https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/sql
- **API Keys**: https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/settings/api
