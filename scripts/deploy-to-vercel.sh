#!/usr/bin/env bash
# Vercel Deployment Script für Fahndung-Anwendung
# Dieses Script bereitet das Projekt für das Deployment vor

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

# Prüfe Voraussetzungen
check_prerequisites() {
    print_info "Prüfe Voraussetzungen..."
    
    # Prüfe Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js ist nicht installiert"
        exit 1
    fi
    
    # Prüfe pnpm
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm ist nicht installiert"
        exit 1
    fi
    
    # Prüfe .env.local
    if [ ! -f ".env.local" ]; then
        print_error ".env.local nicht gefunden"
        print_info "Führen Sie zuerst das Remote-Supabase-Setup aus:"
        print_info "bash scripts/setup-remote-supabase.sh setup"
        exit 1
    fi
    
    print_success "Alle Voraussetzungen erfüllt"
}

# Setup Remote-Supabase
setup_remote_supabase() {
    print_info "Setup Remote-Supabase..."
    
    # Führe das Remote-Supabase-Setup aus
    bash scripts/setup-remote-supabase.sh setup
    
    if [ $? -eq 0 ]; then
        print_success "Remote-Supabase Setup abgeschlossen"
    else
        print_error "Fehler beim Remote-Supabase Setup"
        exit 1
    fi
}

# Installiere Dependencies
install_dependencies() {
    print_info "Installiere Dependencies..."
    
    pnpm install
    
    if [ $? -eq 0 ]; then
        print_success "Dependencies installiert"
    else
        print_error "Fehler beim Installieren der Dependencies"
        exit 1
    fi
}

# Führe Tests aus
run_tests() {
    print_info "Führe Tests aus..."
    
    # TypeScript-Prüfung
    pnpm typecheck
    
    if [ $? -eq 0 ]; then
        print_success "TypeScript-Prüfung bestanden"
    else
        print_warning "TypeScript-Fehler gefunden - fahre trotzdem fort"
    fi
    
    # Linting
    pnpm lint
    
    if [ $? -eq 0 ]; then
        print_success "Linting bestanden"
    else
        print_warning "Linting-Fehler gefunden - fahre trotzdem fort"
    fi
}

# Build-Projekt
build_project() {
    print_info "Baue Projekt..."
    
    pnpm build
    
    if [ $? -eq 0 ]; then
        print_success "Build erfolgreich"
    else
        print_error "Build fehlgeschlagen"
        exit 1
    fi
}

# Setup Vercel Environment-Variablen
setup_vercel_env() {
    print_info "Setup Vercel Environment-Variablen..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI nicht installiert"
        print_info "Installieren Sie es mit: npm i -g vercel"
        print_info "Oder setzen Sie die Environment-Variablen manuell im Vercel Dashboard"
        return
    fi
    
    # Lade .env.local
    source .env.local
    
    # Setze Vercel Environment-Variablen
    vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$NEXT_PUBLIC_SUPABASE_URL"
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
    vercel env add DATABASE_URL production <<< "$DATABASE_URL"
    vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY"
    vercel env add SUPABASE_JWT_SECRET production <<< "$SUPABASE_JWT_SECRET"
    
    print_success "Vercel Environment-Variablen gesetzt"
}

# Deploy zu Vercel
deploy_to_vercel() {
    print_info "Deploy zu Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI nicht installiert"
        print_info "Installieren Sie es mit: npm i -g vercel"
        print_info "Oder deployen Sie manuell über das Vercel Dashboard"
        exit 1
    fi
    
    # Deploy
    vercel --prod
    
    if [ $? -eq 0 ]; then
        print_success "Deployment erfolgreich"
    else
        print_error "Deployment fehlgeschlagen"
        exit 1
    fi
}

# Teste Deployment
test_deployment() {
    print_info "Teste Deployment..."
    
    # Hole die Vercel URL
    VERCEL_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "")
    
    if [ -n "$VERCEL_URL" ]; then
        print_success "Deployment URL: https://$VERCEL_URL"
        print_info "Testen Sie die Anwendung unter: https://$VERCEL_URL"
    else
        print_warning "Konnte Deployment URL nicht ermitteln"
        print_info "Prüfen Sie das Vercel Dashboard für die URL"
    fi
}

# Hauptfunktion
main() {
    print_info "🚀 Vercel Deployment für Fahndung-Anwendung"
    print_info "============================================="
    
    case "${1:-full}" in
        "full")
            check_prerequisites
            setup_remote_supabase
            install_dependencies
            run_tests
            build_project
            setup_vercel_env
            deploy_to_vercel
            test_deployment
            ;;
        "setup")
            check_prerequisites
            setup_remote_supabase
            ;;
        "build")
            install_dependencies
            run_tests
            build_project
            ;;
        "deploy")
            setup_vercel_env
            deploy_to_vercel
            test_deployment
            ;;
        "test")
            run_tests
            ;;
        *)
            print_error "Unbekannter Befehl: $1"
            print_info "Verfügbare Befehle: full, setup, build, deploy, test"
            exit 1
            ;;
    esac
    
    print_success "Deployment-Prozess abgeschlossen!"
    print_info "Nächste Schritte:"
    print_info "1. Testen Sie die Anwendung auf Vercel"
    print_info "2. Prüfen Sie die Logs im Vercel Dashboard"
    print_info "3. Konfigurieren Sie Custom Domain falls gewünscht"
}

# Script ausführen
main "$@"
