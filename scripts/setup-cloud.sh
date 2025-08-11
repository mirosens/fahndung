#!/bin/bash

echo "🚀 Automatische Cloud-Migration gestartet..."

# 1. GitHub Repository Setup
echo "📦 GitHub Repository Setup..."
echo "Bitte erstelle manuell eine README.md im Repository:"
echo "https://github.com/mirosens/fahndung"
echo ""

# 2. Supabase Database Migration
echo "🗄️ Supabase Database Migration..."
echo "Führe setup-database.sql in Supabase aus:"
echo "https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/sql"
echo ""

# 3. Test Cloud Connection
echo "🔍 Teste Cloud-Verbindung..."
echo "Starte Entwicklungsserver..."

# 4. Start Development Server
echo "🌐 Starte Server auf Port 3001..."
pnpm dev
