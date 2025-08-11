import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Menu, X, User, LogOut } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Logo } from "../ui/Logo";
import { ModernMobileMenu } from "./MobileMenu";
import { useScrollDetection } from "~/hooks/useScrollDetection";
import { useAuth } from "~/hooks/useAuth";
import {
  navigationData,
  type NavItem,
  type NavSection,
} from "@/constants/navigationData";

// 🚀 CODE SPLITTING OPTIMIERUNGEN
// Lazy Loading für schwere Komponenten reduziert das initiale JavaScript Bundle

// Lazy Loading für schwere Komponenten
const A11navEnhanced = dynamic(() => import("./A11navEnhanced"), {
  loading: () => <div className="h-8 w-8 animate-pulse rounded bg-muted" />,
  ssr: false,
});

/**
 * ModernHeader Component
 * Glassmorphismus-Design mit komplettem A11y-Dropdown
 * CSS-only Scroll-Animationen für optimale Performance
 */
export default function ModernHeader() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { session, isAuthenticated, logout } = useAuth();

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // CSS-only Scroll-Detection ohne Re-Renders
  const { headerRef, spacerRef, searchRef } = useScrollDetection();

  // Navigation Sections
  const navSections: NavSection[] = ["SICHERHEIT", "SERVICE", "POLIZEI"];

  // Dropdown Handlers mit Hover + Click
  const handleMouseEnter = (section: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(section);
  };

  const handleMouseLeave = (section: string) => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown((current) => (current === section ? null : current));
    }, 200);
  };

  const handleDropdownClick = (section: string) => {
    setActiveDropdown(activeDropdown === section ? null : section);
  };

  // Filtere Navigation-Items basierend auf Authentifizierung
  const getFilteredNavigationItems = (section: NavSection) => {
    const items = navigationData[section];

    if (section === "POLIZEI") {
      // Für POLIZEI-Sektion: Zeige nur öffentliche Items wenn nicht angemeldet
      if (!isAuthenticated) {
        return items.filter(
          (item) => !item.requiresAuth && !item.isAuthSection,
        );
      }
      // Wenn angemeldet: Zeige alle Items außer Anmelden/Registrieren
      return items.filter((item) => !item.authOnly && !item.isAuthSection);
    }

    return items;
  };

  // Separat: Authentifizierungs-Items für POLIZEI
  const getAuthItems = () => {
    return navigationData.POLIZEI.filter((item) => item.isAuthSection);
  };

  return (
    <>
      {/* Font-Loading Optimierung */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @font-face {
            font-display: swap; /* Kritisch! */
            size-adjust: 105%; /* Verhindert Layout Shift */
          }
        `,
        }}
      />

      {/* Skip Link für Screenreader */}
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:ring-4 focus:ring-primary/30"
      >
        Zum Hauptinhalt springen
      </a>

      <header
        ref={headerRef}
        className="
          fixed left-0 right-0 top-0 z-50 
          h-20 transition-all duration-300 ease-out
          [&.scrolled]:h-16
        "
        role="banner"
        aria-label="Hauptnavigation"
      >
        {/* Glassmorphismus Container - freistehende Form */}
        <div
          className="
          mx-auto mt-4 h-full max-w-[1273px]
          rounded-[10px] border border-white/50
          bg-white/40 shadow-lg backdrop-blur-[50px] 
          transition-all duration-300 hover:shadow-xl
          dark:border-white/20 dark:bg-black/40
          [.scrolled_&]:mt-0
        "
        >
          <div className="h-full px-4 sm:px-6 lg:px-8">
            <div className="flex h-full items-center justify-between">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Logo />
              </div>

              {/* Desktop Navigation */}
              <nav className="ml-8 hidden items-center space-x-1 lg:flex">
                {navSections.map((section) => {
                  const filteredItems = getFilteredNavigationItems(section);

                  // Überspringe POLIZEI-Sektion wenn keine Items verfügbar (außer Auth-Items)
                  if (
                    section === "POLIZEI" &&
                    filteredItems.length === 0 &&
                    getAuthItems().length === 0
                  ) {
                    return null;
                  }

                  return (
                    <div
                      key={section}
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(section)}
                      onMouseLeave={() => handleMouseLeave(section)}
                    >
                      <button
                        onClick={() => handleDropdownClick(section)}
                        className={`
                          flex items-center gap-1.5 rounded-lg px-4 
                          py-2 text-sm font-medium
                          text-foreground/90 transition-colors
                          duration-200 hover:bg-accent/50 hover:text-primary
                          focus:outline-none focus:ring-2 focus:ring-primary/50
                          ${activeDropdown === section ? "bg-accent/50 text-primary" : ""}
                        `}
                        aria-expanded={activeDropdown === section}
                        aria-haspopup="true"
                      >
                        {section}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            activeDropdown === section ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === section && (
                        <div
                          className={`
                          absolute left-0 top-full mt-2 w-80
                          rounded-xl border border-border/50
                          bg-popover/95 shadow-xl backdrop-blur-2xl 
                          dark:bg-popover/90
                        `}
                          onMouseEnter={() => handleMouseEnter(section)}
                          onMouseLeave={() => handleMouseLeave(section)}
                        >
                          <div className="p-2">
                            {/* Hauptnavigation */}
                            {filteredItems.map((item: NavItem) => {
                              const IconComponent = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={`
                                    group flex items-start gap-3 rounded-lg px-3 py-2.5
                                    transition-colors duration-200
                                    hover:bg-accent focus:bg-accent focus:outline-none
                                    ${item.urgent ? "border border-destructive/20" : ""}
                                  `}
                                >
                                  <IconComponent
                                    className={`mt-0.5 h-5 w-5 flex-shrink-0 transition-all duration-200
                                      ${
                                        item.urgent
                                          ? "text-destructive group-hover:fill-destructive"
                                          : "text-muted-foreground group-hover:fill-primary group-hover:text-primary"
                                      }`}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {item.label}
                                      </span>
                                      {item.badge && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    {item.description && (
                                      <div className="text-xs text-muted-foreground">
                                        {item.description}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}

                            {/* Authentifizierungs-Bereich - nur für POLIZEI */}
                            {section === "POLIZEI" && (
                              <>
                                {/* Trennlinie */}
                                <div className="my-2 border-t border-border/50" />

                                {/* Auth-Header */}
                                <div className="mb-2 px-3 py-1">
                                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {isAuthenticated ? "Benutzer" : "Anmeldung"}
                                  </div>
                                </div>

                                {/* Auth-Items */}
                                {isAuthenticated ? (
                                  // Angemeldeter Benutzer - zeige Benutzer-Info und Logout
                                  <div className="space-y-2">
                                    <div className="rounded-lg bg-accent/50 px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-foreground">
                                            {session?.user?.email?.split(
                                              "@",
                                            )[0] ?? "Benutzer"}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            Angemeldet
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Logout Button */}
                                    <button
                                      onClick={logout}
                                      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:outline-none dark:hover:bg-red-950/50"
                                      title="Abmelden"
                                    >
                                      <LogOut className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-all duration-200 group-hover:text-red-600" />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">
                                            Abmelden
                                          </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Aus dem System abmelden
                                        </div>
                                      </div>
                                    </button>
                                  </div>
                                ) : (
                                  // Nicht angemeldet - zeige Anmelden/Registrieren
                                  getAuthItems().map((item: NavItem) => {
                                    const IconComponent = item.icon;
                                    return (
                                      <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-accent focus:bg-accent focus:outline-none"
                                      >
                                        <IconComponent className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground transition-all duration-200 group-hover:fill-primary group-hover:text-primary" />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                              {item.label}
                                            </span>
                                          </div>
                                          {item.description && (
                                            <div className="text-xs text-muted-foreground">
                                              {item.description}
                                            </div>
                                          )}
                                        </div>
                                      </Link>
                                    );
                                  })
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="hidden items-center md:flex">
                  <div
                    ref={searchRef}
                    className="relative flex w-64 items-center rounded-lg border border-input bg-card px-3 py-2 transition-colors duration-200 focus-within:bg-accent hover:bg-accent [.scrolled_&]:w-48"
                  >
                    <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Suche..."
                      className="w-full bg-transparent pl-10 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      aria-label="Suche im Fahndungsportal"
                    />
                  </div>
                </div>

                {/* Enhanced A11y Dropdown - ALLE Meta-Nav Features */}
                <A11navEnhanced />

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="rounded-lg p-2 text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 lg:hidden"
                  aria-label="Mobilmenü öffnen"
                  aria-expanded={isMobileMenuOpen}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <ModernMobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </header>

      {/* Spacer für fixed Header */}
      <div
        ref={spacerRef}
        className="h-20 transition-all duration-300 [.scrolled_&]:h-16"
      />
    </>
  );
}
