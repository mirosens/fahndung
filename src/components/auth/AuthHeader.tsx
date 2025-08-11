"use client";

import React, { useState } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { LogIn, UserPlus, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import { navigationData, type NavItem } from "@/constants/navigationData";

interface AuthHeaderProps {
  isAuthenticated: boolean;
  userEmail?: string;
  userRole?: string;
}

export default function AuthHeader({
  isAuthenticated,
  userEmail,
  userRole,
}: AuthHeaderProps) {
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const { logout } = useAuth();
  // const _router = useRouter();

  const handleLogout = async () => {
    await logout();
    setShowAuthDropdown(false);
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "editor":
        return "Redakteur";
      case "super_admin":
        return "Super Administrator";
      default:
        return "Benutzer";
    }
  };

  // Filtere Navigation-Items basierend auf Authentifizierung
  const getAuthItems = () => {
    if (isAuthenticated) {
      // Zeige nur Items für angemeldete Benutzer
      return navigationData.POLIZEI.filter(
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (item) => item.requiresAuth || !item.authOnly,
      );
    } else {
      // Zeige nur öffentliche Items
      return navigationData.POLIZEI.filter((item) => !item.requiresAuth);
    }
  };

  const authItems = getAuthItems();

  return (
    <div className="relative">
      {isAuthenticated ? (
        // Angemeldeter Benutzer
        <div className="flex items-center gap-3">
          {/* Benutzer-Info */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden text-sm md:block">
              <div className="font-medium text-foreground">
                {userEmail?.split("@")[0] ?? "Benutzer"}
              </div>
              <div className="text-xs text-muted-foreground">
                {getRoleDisplayName(userRole)}
              </div>
            </div>
          </div>

          {/* Dropdown für angemeldete Benutzer */}
          <div className="relative">
            <button
              onClick={() => setShowAuthDropdown(!showAuthDropdown)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/90 transition-all duration-200 hover:bg-accent/50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${showAuthDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showAuthDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border/50 bg-popover/95 shadow-xl backdrop-blur-2xl duration-200 dark:bg-popover/90">
                <div className="p-2">
                  {/* Benutzer-Info */}
                  <div className="mb-2 rounded-lg bg-accent/50 px-3 py-2">
                    <div className="text-sm font-medium text-foreground">
                      {userEmail}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getRoleDisplayName(userRole)}
                    </div>
                  </div>

                  {/* Navigation-Items für angemeldete Benutzer */}
                  {authItems.map((item: NavItem) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-accent focus:bg-accent focus:outline-none"
                        onClick={() => setShowAuthDropdown(false)}
                      >
                        <IconComponent className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
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

                  {/* Trennlinie */}
                  <div className="my-2 border-t border-border/50" />

                  {/* Abmelden */}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-200 hover:bg-accent focus:bg-accent focus:outline-none"
                  >
                    <LogOut className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Abmelden</div>
                      <div className="text-xs text-muted-foreground">
                        Aus dem System abmelden
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Nicht angemeldeter Benutzer
        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/90 transition-all duration-200 hover:bg-accent/50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Anmelden</span>
          </a>
          <a
            href="/register"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Registrieren</span>
          </a>
        </div>
      )}

      {/* Click-Outside Handler */}
      {showAuthDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowAuthDropdown(false)}
        />
      )}
    </div>
  );
}
