#!/bin/bash

echo "🚀 Deploye zu Vercel mit Prototyp-Modus..."

# Setze Umgebungsvariablen für Vercel
echo "📝 Setze Umgebungsvariablen..."

# Prototyp-Modus aktivieren
npx vercel env add NEXT_PUBLIC_PROTOTYPE_MODE production <<< "true"

# Supabase Configuration
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://rhuhrqlucgfiqwjtqsoa.supabase.co"
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWhycWx1Y2dmaXF3anRxc29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzkzMDMsImV4cCI6MjA3MDUxNTMwM30.G1-qrryrxhna6RO9TfEWSY2ddK2kQrm1rd9Bprp1rD4"
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWhycWx1Y2dmaXF3anRxc29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzOTMwMywiZXhwIjoyMDcwNTE1MzAzfQ.pDe_8QW8O0VHRIYy1fZyJreLhfKH86cISZ7A70_OCzw"

# Cloudinary Configuration
npx vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production <<< "dpfpr3yxc"
npx vercel env add CLOUDINARY_API_KEY production <<< "163413616558123"
npx vercel env add CLOUDINARY_API_SECRET production <<< "3owG6BleMFr6LOG2gxW5JyU6l9U"

# App Configuration
npx vercel env add NODE_ENV production <<< "production"
npx vercel env add NEXTAUTH_SECRET production <<< "fahndung-production-secret-key-2025"
npx vercel env add NEXTAUTH_URL production <<< "https://fahndung-ptls.vercel.app"
npx vercel env add ADMIN_EMAIL production <<< "ptlsweb@gmail.com"

echo "✅ Umgebungsvariablen gesetzt!"

# Deploy zu Vercel
echo "🚀 Deploye zu Vercel..."
npx vercel --prod

echo "🎉 Deployment abgeschlossen!"
echo "🌐 Ihre Anwendung ist verfügbar unter: https://fahndung-ptls.vercel.app"
echo "🔍 Wizard ist jetzt verfügbar unter: https://fahndung-ptls.vercel.app/fahndungen/neu"
