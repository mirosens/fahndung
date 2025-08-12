#!/bin/bash

echo "🚀 Automatisches Vercel Deployment Setup..."

# Vercel Umgebungsvariablen automatisch setzen
echo "📝 Setze Umgebungsvariablen..."

# Supabase Configuration
npx vercel env add NEXT_PUBLIC_SUPABASE_URL <<< "https://rhuhrqlucgfiqwjtqsoa.supabase.co"
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWhycWx1Y2dmaXF3anRxc29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzkzMDMsImV4cCI6MjA3MDUxNTMwM30.G1-qrryrxhna6RO9TfEWSY2ddK2kQrm1rd9Bprp1rD4"
npx vercel env add SUPABASE_SERVICE_ROLE_KEY <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWhycWx1Y2dmaXF3anRxc29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzOTMwMywiZXhwIjoyMDcwNTE1MzAzfQ.pDe_8QW8O0VHRIYy1fZyJreLhfKH86cISZ7A70_OCzw"

# Cloudinary Configuration
npx vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME <<< "dpfpr3yxc"
npx vercel env add NEXT_PUBLIC_CLOUDINARY_API_KEY <<< "163413616558123"
npx vercel env add CLOUDINARY_API_SECRET <<< "3owG6BleMFr6LOG2gxW5JyU6l9U"

# App Configuration
npx vercel env add NODE_ENV <<< "production"
npx vercel env add NEXTAUTH_SECRET <<< "fahndung-production-secret-key-2025"
npx vercel env add ADMIN_EMAIL <<< "ptlsweb@gmail.com"

echo "✅ Umgebungsvariablen gesetzt!"

# Deploy to Vercel
echo "🚀 Deploye zu Vercel..."
npx vercel --prod

echo "🎉 Deployment abgeschlossen!"
echo "🌐 Ihre Anwendung ist verfügbar unter: https://fahndung.vercel.app"
