"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRoles?: ("user" | "admin" | "editor" | "super_admin")[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  fallback,
  requiredRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { session, loading, initialized, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log("🔐 ProtectedRoute: Prüfe Authentifizierung...", {
      loading,
      initialized,
      isAuthenticated,
      hasSession: !!session,
      requiredRoles,
      userRole: session?.profile?.role,
      currentPath: window.location.pathname,
    });

    if (initialized && !loading) {
      if (!isAuthenticated) {
        console.log(
          "❌ ProtectedRoute: Nicht authentifiziert - Weiterleitung zu Login",
        );

        // Speichere aktuelle URL für Redirect nach Login
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== "/login" && currentPath !== "/register") {
          sessionStorage.setItem("redirectAfterLogin", currentPath);
        }

        router.push(redirectTo);
        return;
      }

      // Rollenprüfung nur wenn Session vorhanden und Rollen erforderlich
      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = session?.profile?.role as string;
        const hasRequiredRole = requiredRoles.includes(
          userRole as "user" | "admin" | "editor" | "super_admin",
        );

        console.log("🔐 ProtectedRoute: Rollenprüfung", {
          userRole,
          requiredRoles,
          hasRequiredRole,
        });

        if (!hasRequiredRole) {
          console.log(
            "❌ ProtectedRoute: Unzureichende Berechtigung - Weiterleitung zu Dashboard",
          );
          router.push("/dashboard");
          return;
        }
      }

      console.log("✅ ProtectedRoute: Authentifizierung erfolgreich");
    }
  }, [
    session,
    loading,
    initialized,
    router,
    requiredRoles,
    redirectTo,
    isAuthenticated,
  ]);

  // Loading state für Hydration
  if (!initialized || loading) {
    return (
      fallback ?? (
        <div className="min-h-screen bg-background">
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
              <div className="text-xl font-semibold text-foreground">
                Lade...
              </div>
              <div className="mt-2 text-muted-foreground">
                {!initialized
                  ? "Initialisiere..."
                  : "Prüfe Authentifizierung..."}
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  // Wenn nicht authentifiziert, zeige nichts (Weiterleitung läuft)
  if (!isAuthenticated) {
    return null;
  }

  // Rollenprüfung
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = session?.profile?.role as string;
    const hasRequiredRole = requiredRoles.includes(
      userRole as "user" | "admin" | "editor" | "super_admin",
    );

    if (!hasRequiredRole) {
      return null; // Weiterleitung läuft
    }
  }

  // Alles OK - zeige geschützten Inhalt
  return <>{children}</>;
}
