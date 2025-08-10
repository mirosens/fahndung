# 🚀 Port-Konfiguration - Fahndung App

## Übersicht

Die Fahndung App unterstützt jetzt **alle Ports** und ist **Vercel-Deployment-ready**! 🎉

## 🎯 Verfügbare Start-Befehle

### Standard-Entwicklung

```bash
pnpm dev          # Startet auf Standard-Port (3000)
```

### Spezifische Ports

```bash
pnpm dev:3000     # Startet auf Port 3000
pnpm dev:3010     # Startet auf Port 3010
pnpm dev:4000     # Startet auf Port 4000
```

### Dynamischer Port

```bash
pnpm dev:port     # Startet mit Skript (siehe unten)
./scripts/start-dev.sh 8080  # Startet auf Port 8080
```

## 🔧 Umgebungsvariablen

### Lokale Entwicklung

```bash
# .env.local
PORT=3000                    # Optional - wird automatisch erkannt
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel-Produktion

```bash
# Automatisch gesetzt von Vercel
VERCEL_URL=https://your-app.vercel.app
VERCEL_ENV=production
```

## 🌐 Verfügbare URLs

### Lokale Entwicklung

- **Port 3000**: http://localhost:3000
- **Port 3010**: http://localhost:3010
- **Port 4000**: http://localhost:4000
- **Beliebiger Port**: http://localhost:[PORT]

### Vercel-Produktion

- **Live-URL**: https://your-app.vercel.app

## 🚀 Hauptseiten (alle Ports)

### 🏠 Startseiten

- **Homepage**: `/` (Startseite)
- **Dashboard**: `/dashboard` (nur für angemeldete Benutzer)
- **Login**: `/login`
- **Register**: `/register`

### 🔍 Fahndungen

- **Alle Fahndungen**: `/fahndungen` (Hauptseite)
- **Fahndungen Übersicht**: `/fahndungen/alle`
- **Neue Fahndung (Wizard)**: `/fahndungen/neu`
- **Enhanced Wizard**: `/fahndungen/neu/enhanced`

### ⚙️ Admin & Service

- **Admin-Bereich**: `/admin`
- **Test-Auth**: `/test-auth` (nur Development)

## 🔄 Automatische Port-Erkennung

Die App erkennt automatisch:

1. **Client-seitig**: Aktuelle URL im Browser
2. **Vercel**: `VERCEL_URL` Environment-Variable
3. **Lokale Entwicklung**: `PORT` Environment-Variable oder Standard 3000

## 🛠️ Technische Details

### Base-URL-Funktion

```typescript
function getBaseUrl() {
  // 1. Client-seitig: Aktuelle URL
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // 2. Vercel-Produktion: VERCEL_URL
  if (process.env["VERCEL_URL"]) {
    return `https://${process.env["VERCEL_URL"]}`;
  }

  // 3. Lokale Entwicklung: PORT oder 3000
  const port = process.env["PORT"] || "3000";
  return `http://localhost:${port}`;
}
```

### CORS-Konfiguration

Die Middleware unterstützt automatisch alle Origins und Ports.

## 🚀 Deployment

### Vercel

```bash
# Automatisches Deployment
git push origin main
```

### Lokale Produktion

```bash
pnpm build
pnpm start
```

## ✅ Testen

### Port 3000

```bash
pnpm dev:3000
# Öffne: http://localhost:3000
```

### Port 3010

```bash
pnpm dev:3010
# Öffne: http://localhost:3010
```

### Beliebiger Port

```bash
PORT=8080 pnpm dev
# Öffne: http://localhost:8080
```

## 🎉 Fazit

Die App funktioniert jetzt mit **allen Ports** und ist **produktionsreif** für Vercel! 🚀
