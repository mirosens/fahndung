#!/usr/bin/env bash
# Remote Supabase Setup Script für Vercel Deployment
# Dieses Script richtet das Projekt für Remote-Supabase ein

set -e

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Prüfe Environment-Variablen
check_env() {
    # Lade .env.local
    if [ -f ".env.local" ]; then
        export $(grep -v '^#' .env.local | xargs)
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        print_error "Supabase Environment-Variablen fehlen!"
        print_info "Bitte stellen Sie sicher, dass .env.local die folgenden Variablen enthält:"
        print_info "NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co"
        print_info "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here"
        exit 1
    fi
    
    print_success "Supabase Environment-Variablen gefunden"
    print_info "URL: $NEXT_PUBLIC_SUPABASE_URL"
    print_info "Anon Key: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
}

# Erstelle .env.local für Remote-Supabase
create_remote_env() {
    print_info "Erstelle .env.local für Remote-Supabase..."
    
    if [ -f ".env.local" ]; then
        cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
        print_success "Backup von .env.local erstellt"
    fi
    
    cat > .env.local << 'EOF'
# Remote Supabase Konfiguration für Vercel
# Bitte ersetzen Sie die folgenden Werte mit Ihren echten Supabase-Credentials

# Supabase URLs (Remote)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here

# Datenbank URL (Remote)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase Service Role Key (Remote)
SUPABASE_SERVICE_ROLE_KEY=your-remote-service-role-key-here

# JWT Secret (Remote)
SUPABASE_JWT_SECRET=your-remote-jwt-secret-here

# E-Mail Konfiguration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com

# Admin E-Mail für Benachrichtigungen
ADMIN_EMAIL=ptlsweb@gmail.com

# App URLs
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Upload-Konfiguration
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Sicherheit
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app

# Produktion
NODE_ENV=production
EOF

    print_success ".env.local für Remote-Supabase erstellt"
    print_warning "Bitte konfigurieren Sie Ihre echten Supabase-Credentials in .env.local"
}

# Setup Storage Buckets
setup_storage() {
    print_info "Setup Storage Buckets..."
    
    # Führe das Storage-Setup aus
    node scripts/check-buckets.cjs
    
    if [ $? -eq 0 ]; then
        print_success "Storage Buckets erfolgreich eingerichtet"
    else
        print_error "Fehler beim Setup der Storage Buckets"
        exit 1
    fi
}

# Teste Remote-Verbindung
test_remote_connection() {
    print_info "Teste Remote-Supabase-Verbindung..."
    
    # Führe einen einfachen Test aus
    node -e "
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });
    
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    supabase.from('investigations').select('count').limit(1)
        .then(result => {
            if (result.error) {
                console.error('❌ Verbindungsfehler:', result.error.message);
                process.exit(1);
            } else {
                console.log('✅ Remote-Verbindung erfolgreich');
            }
        })
        .catch(error => {
            console.error('❌ Verbindungsfehler:', error.message);
            process.exit(1);
        });
    "
    
    if [ $? -eq 0 ]; then
        print_success "Remote-Verbindung erfolgreich getestet"
    else
        print_error "Fehler bei der Remote-Verbindung"
        exit 1
    fi
}

# Vercel Environment-Variablen Setup
setup_vercel_env() {
    print_info "Setup Vercel Environment-Variablen..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI nicht installiert. Installieren Sie es mit: npm i -g vercel"
        print_info "Sie können die Environment-Variablen auch manuell im Vercel Dashboard setzen:"
        print_info "1. Gehen Sie zu Ihrem Vercel Projekt"
        print_info "2. Settings > Environment Variables"
        print_info "3. Fügen Sie die folgenden Variablen hinzu:"
        echo ""
        echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co"
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key-here"
        echo "DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
        echo "SUPABASE_SERVICE_ROLE_KEY=your-remote-service-role-key-here"
        echo "SUPABASE_JWT_SECRET=your-remote-jwt-secret-here"
        echo ""
        return
    fi
    
    # Lade .env.local
    if [ -f ".env.local" ]; then
        export $(grep -v '^#' .env.local | xargs)
    fi
    
    # Setze Vercel Environment-Variablen
    vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$NEXT_PUBLIC_SUPABASE_URL"
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
    vercel env add DATABASE_URL production <<< "$DATABASE_URL"
    vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY"
    vercel env add SUPABASE_JWT_SECRET production <<< "$SUPABASE_JWT_SECRET"
    
    print_success "Vercel Environment-Variablen gesetzt"
}

# Hauptfunktion
main() {
    print_info "🚀 Remote Supabase Setup für Vercel"
    print_info "===================================="
    
    case "${1:-setup}" in
        "setup")
            create_remote_env
            check_env
            setup_storage
            test_remote_connection
            setup_vercel_env
            ;;
        "test")
            check_env
            test_remote_connection
            ;;
        "storage")
            setup_storage
            ;;
        "vercel")
            setup_vercel_env
            ;;
        *)
            print_error "Unbekannter Befehl: $1"
            print_info "Verfügbare Befehle: setup, test, storage, vercel"
            exit 1
            ;;
    esac
    
    print_success "Remote Supabase Setup abgeschlossen!"
    print_info "Nächste Schritte:"
    print_info "1. Konfigurieren Sie Ihre echten Supabase-Credentials in .env.local"
    print_info "2. Führen Sie 'vercel --prod' aus, um zu deployen"
    print_info "3. Testen Sie die Anwendung auf Vercel"
}

# Script ausführen
main "$@" 