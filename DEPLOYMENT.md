# 🚀 Fahndung-Anwendung Deployment & Problemlösung

## **Übersicht der Probleme und Lösungen**

### **Problem 1: Lokale vs. Remote Supabase**

**Symptom:** Anwendung funktioniert lokal, aber nicht auf Vercel
**Ursache:** Lokale Supabase-URLs werden in Vercel verwendet
**Lösung:** Remote-Supabase-Setup

### **Problem 2: Bilder werden nicht angezeigt**

**Symptom:** Fahndungen ohne Bilder in Vercel
**Ursache:** Storage Bucket nicht konfiguriert oder falsche URLs
**Lösung:** Storage Bucket Setup und verbesserte Bildkomponente

### **Problem 3: Wizard nicht erreichbar**

**Symptom:** Navigation zum Wizard funktioniert nicht
**Ursache:** Routing-Probleme oder Authentifizierung
**Lösung:** Verbesserte Navigation und Routing

## **🔧 Schritt-für-Schritt Lösung**

### **Schritt 1: Remote Supabase Setup**

```bash
# Führe das Remote-Supabase-Setup aus
bash scripts/setup-remote-supabase.sh setup
```

**Was passiert:**

- Erstellt `.env.local` für Remote-Supabase
- Konfiguriert Storage Buckets
- Testet Remote-Verbindung
- Setzt Vercel Environment-Variablen

### **Schritt 2: Konfiguriere Supabase Credentials**

Bearbeite `.env.local` und ersetze die Platzhalter:

```env
# Supabase URLs (Remote)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here

# Datenbank URL (Remote)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase Service Role Key (Remote)
SUPABASE_SERVICE_ROLE_KEY=your-remote-service-role-key-here
```

### **Schritt 3: Storage Bucket Setup**

```bash
# Prüfe und erstelle Storage Buckets
node scripts/check-buckets.cjs
```

**Erwartete Ausgabe:**

```
✅ media-gallery Bucket erfolgreich erstellt
✅ Bucket erfolgreich erstellt und verfügbar
```

### **Schritt 4: Deployment zu Vercel**

```bash
# Vollständiges Deployment
bash scripts/deploy-to-vercel.sh full

# Oder Schritt für Schritt:
bash scripts/deploy-to-vercel.sh setup    # Nur Setup
bash scripts/deploy-to-vercel.sh build    # Nur Build
bash scripts/deploy-to-vercel.sh deploy   # Nur Deploy
```

## **🔍 Troubleshooting**

### **Bilder werden nicht angezeigt**

1. **Prüfe Storage Bucket:**

   ```bash
   node scripts/check-buckets.cjs
   ```

2. **Prüfe Browser-Konsole:**
   - Öffne Developer Tools (F12)
   - Schaue nach Bildfehlern in der Konsole
   - Prüfe Network-Tab für fehlgeschlagene Bild-Requests

3. **Prüfe Supabase Storage:**
   - Gehe zu Supabase Dashboard
   - Storage > Buckets
   - Prüfe ob `media-gallery` Bucket existiert
   - Prüfe RLS Policies

### **Wizard nicht erreichbar**

1. **Direkte URL testen:**

   ```
   https://your-app.vercel.app/fahndungen/neu/enhanced
   ```

2. **Prüfe Authentifizierung:**
   - Melde dich an
   - Prüfe Browser-Konsole für Auth-Fehler

3. **Prüfe Routing:**
   ```bash
   # Teste lokale Navigation
   pnpm dev
   # Gehe zu http://localhost:3000/fahndungen/neu/enhanced
   ```

### **Vercel Deployment-Fehler**

1. **Prüfe Build-Logs:**

   ```bash
   pnpm build
   ```

2. **Prüfe Environment-Variablen:**
   - Vercel Dashboard > Settings > Environment Variables
   - Stelle sicher, dass alle Supabase-Variablen gesetzt sind

3. **Prüfe Vercel Logs:**
   - Vercel Dashboard > Deployments > Latest
   - Schaue nach Fehlern in den Logs

## **📋 Checkliste für erfolgreiches Deployment**

- [ ] Remote Supabase Setup ausgeführt
- [ ] Supabase Credentials in `.env.local` konfiguriert
- [ ] Storage Buckets erstellt und getestet
- [ ] Build erfolgreich (`pnpm build`)
- [ ] Vercel Environment-Variablen gesetzt
- [ ] Deployment zu Vercel erfolgreich
- [ ] Anwendung auf Vercel getestet
- [ ] Bilder werden korrekt angezeigt
- [ ] Wizard ist erreichbar
- [ ] Navigation funktioniert

## **🚀 Schnellstart für neue Deployments**

```bash
# 1. Repository klonen
git clone <your-repo>
cd fahndung

# 2. Dependencies installieren
pnpm install

# 3. Remote-Supabase Setup
bash scripts/setup-remote-supabase.sh setup

# 4. Supabase Credentials konfigurieren
# Bearbeite .env.local mit deinen echten Credentials

# 5. Storage Buckets erstellen
node scripts/check-buckets.cjs

# 6. Deploy zu Vercel
bash scripts/deploy-to-vercel.sh full
```

## **🔧 Manuelle Schritte (falls Scripts nicht funktionieren)**

### **Storage Bucket manuell erstellen:**

1. Gehe zu Supabase Dashboard
2. Storage > Create Bucket
3. Name: `media-gallery`
4. Public: ✅
5. File Size Limit: 50MB
6. Allowed MIME Types: `image/*`

### **RLS Policies manuell setzen:**

```sql
-- Öffentlichen Zugriff erlauben
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media-gallery');

-- Authentifizierte Benutzer können hochladen
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media-gallery'
  AND auth.role() = 'authenticated'
);
```

### **Vercel Environment-Variablen manuell setzen:**

1. Vercel Dashboard > Settings > Environment Variables
2. Füge hinzu:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`

## **📞 Support**

Bei Problemen:

1. **Prüfe die Logs:**
   - Browser-Konsole (F12)
   - Vercel Deployment-Logs
   - Supabase Logs

2. **Debug-Informationen sammeln:**

   ```bash
   # System-Info
   node --version
   pnpm --version

   # Build-Info
   pnpm build

   # Storage-Info
   node scripts/check-buckets.cjs
   ```

3. **Häufige Fehler:**
   - **"Bucket not found"**: Storage Bucket nicht erstellt
   - **"Forbidden"**: RLS Policies falsch konfiguriert
   - **"Invalid URL"**: Supabase URL falsch
   - **"Authentication failed"**: Anon Key falsch

## **🎯 Erfolgsindikatoren**

Nach erfolgreichem Setup sollten Sie sehen:

✅ **Lokal:** `http://localhost:3000` funktioniert mit Bildern
✅ **Vercel:** `https://your-app.vercel.app` funktioniert mit Bildern
✅ **Wizard:** `/fahndungen/neu/enhanced` ist erreichbar
✅ **Navigation:** Alle Buttons führen zu korrekten Seiten
✅ **Bilder:** Fahndungen zeigen Bilder oder Platzhalter
✅ **Upload:** Neue Fahndungen können mit Bildern erstellt werden
