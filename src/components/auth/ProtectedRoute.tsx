"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { Loader2 } from "lucide-react";

// 🚀 PROTOYP-MODUS: Automatische Authentifizierung für Entwicklung
const PROTOTYPE_MODE =
  process.env.NODE_ENV === "development" ||
  process.env["NEXT_PUBLIC_PROTOTYPE_MODE"] === "true";

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

  useEffect(() => {
    // 🚀 PROTOYP-MODUS: Automatische Authentifizierung
    if (PROTOTYPE_MODE) {
      console.log(
        "🚀 Prototyp-Modus: ProtectedRoute umgangen - alle Routen frei",
      );
      return;
    }

    // 🔥 SPEZIELLE BEHANDLUNG FÜR WIZARD: Erlaube Zugriff auch in Produktion
    if (window.location.pathname.includes("/fahndungen/neu")) {
      console.log(
        "✅ Wizard-Route: Zugriff erlaubt (auch ohne vollständige Authentifizierung)",
      );
      return;
    }

    console.log("🔐 ProtectedRoute: Prüfe Authentifizierung...", {
      loading,
      initialized,
      isAuthenticated,
      hasSession: !!session,
      requiredRoles,
      userRole: session?.profile?.role,
      currentPath: window.location.pathname,
    });

    // 🔥 ROBUSTERE AUTHENTIFIZIERUNG: Warte auf Initialisierung
    if (!initialized || loading) {
      console.log("⏳ ProtectedRoute: Warte auf Initialisierung...");
      return;
    }

    // 🔥 SOFORTIGE WEITERLEITUNG wenn nicht authentifiziert
    if (!isAuthenticated) {
      console.log(
        "❌ ProtectedRoute: Nicht authentifiziert - SOFORTIGE Weiterleitung zu Login",
      );

      // Speichere aktuelle URL für Redirect nach Login
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== "/login" && currentPath !== "/register") {
        sessionStorage.setItem("redirectAfterLogin", currentPath);
      }

      // SOFORTIGE Weiterleitung ohne Verzögerung
      router.push(redirectTo);
      return;
    }

    // 🔥 FLEXIBLERE ROLLENPRÜFUNG: Erlaube Zugriff auch ohne spezifische Rolle
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

      // 🔥 ERLAUBE ZUGRIFF auch ohne spezifische Rolle (nur für Wizard)
      if (
        !hasRequiredRole &&
        window.location.pathname.includes("/fahndungen/neu")
      ) {
        console.log(
          "✅ ProtectedRoute: Zugriff auf Wizard erlaubt (flexible Rollenprüfung)",
        );
        return;
      }

      // 🔥 ERLAUBE ZUGRIFF auch ohne Profil (wegen RLS-Problemen)
      if (
        !session?.profile &&
        window.location.pathname.includes("/fahndungen/neu")
      ) {
        console.log(
          "✅ ProtectedRoute: Zugriff auf Wizard erlaubt (ohne Profil)",
        );
        return;
      }

      if (!hasRequiredRole) {
        console.log(
          "❌ ProtectedRoute: Unzureichende Berechtigung - Weiterleitung zu Dashboard",
        );
        router.push("/dashboard");
        return;
      }
    }

    console.log("✅ ProtectedRoute: Authentifizierung erfolgreich");
  }, [
    session,
    loading,
    initialized,
    router,
    requiredRoles,
    redirectTo,
    isAuthenticated,
  ]);

  // 🚀 PROTOYP-MODUS: Zeige direkt den Inhalt
  if (PROTOTYPE_MODE) {
    return <>{children}</>;
  }

  // 🔥 SPEZIELLE BEHANDLUNG FÜR WIZARD: Zeige direkt den Inhalt
  if (
    typeof window !== "undefined" &&
    window.location.pathname.includes("/fahndungen/neu")
  ) {
    return <>{children}</>;
  }

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
