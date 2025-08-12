# Vercel Umgebungsvariablen Setup

## 🔧 **Vercel Projekt konfigurieren**

### **Schritt 1: Vercel Dashboard**
1. Gehe zu: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Klicke "New Project"
3. Importiere: `mirosens/fahndung`

### **Schritt 2: Umgebungsvariablen setzen**

Gehe zu: **Settings → Environment Variables**

#### **Supabase Cloud-Konfiguration:**
```
NEXT_PUBLIC_SUPABASE_URL=https://rhuhrqlucgfiqwjtqsoa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWhycWx1Y2dmaXF3anRxc29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzkzMDMsImV4cCI6MjA3MDUxNTMwM30.G1-qrryrxhna6RO9TfEWSY2ddK2kQrm1rd9Bprp1rD4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWhycWx1Y2dmaXF3anRxc29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzOTMwMywiZXhwIjoyMDcwNTE1MzAzfQ.pDe_8QW8O0VHRIYy1fZyJreLhfKH86cISZ7A70_OCzw
```

#### **Cloudinary-Konfiguration:**
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dpfpr3yxc
NEXT_PUBLIC_CLOUDINARY_API_KEY=163413616558123
CLOUDINARY_API_SECRET=3owG6BleMFr6LOG2gxW5JyU6l9U
```

#### **App-Konfiguration:**
```
NEXT_PUBLIC_APP_URL=https://fahndung.vercel.app
NODE_ENV=production
NEXTAUTH_SECRET=your-production-secret-key-here
NEXTAUTH_URL=https://fahndung.vercel.app
```

#### **Admin-Konfiguration:**
```
ADMIN_EMAIL=ptlsweb@gmail.com
```

### **Schritt 3: Build-Einstellungen**

**Build Command:** `pnpm build`
**Output Directory:** `.next`
**Install Command:** `pnpm install`

### **Schritt 4: Deploy**

Klicke "Deploy" und warte auf den Build-Prozess.

## 🔗 **Nützliche Links**

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa
- **GitHub Repository**: https://github.com/mirosens/fahndung

## ✅ **Nach dem Deploy**

1. **Teste die Anwendung**: https://fahndung.vercel.app
2. **Teste Cloudinary**: https://fahndung.vercel.app/test-cloudinary
3. **Teste Authentifizierung**: https://fahndung.vercel.app/login
