#!/bin/bash

echo "🔄 Aktualisiere Vercel-Umgebungsvariable..."

# Entferne die alte Variable
echo "🗑️ Entferne NEXT_PUBLIC_PROTOTYPE_MODE..."
npx vercel env rm NEXT_PUBLIC_PROTOTYPE_MODE production <<< "y"

# Füge die neue Variable hinzu
echo "✅ Setze NEXT_PUBLIC_PROTOTYPE_MODE auf false..."
npx vercel env add NEXT_PUBLIC_PROTOTYPE_MODE production <<< "false"

echo "🚀 Deploye zu Vercel..."
npx vercel --prod

echo "✅ Fertig! Prototyp-Modus ist jetzt deaktiviert."
