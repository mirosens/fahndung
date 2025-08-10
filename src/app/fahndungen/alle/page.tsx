"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { Loader2, Eye, Shield } from "lucide-react";

export default function AlleFahndungenPage() {
  const { isAuthenticated, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading) {
      if (!isAuthenticated) {
        // Speichere die gewünschte URL für Redirect nach Login
        sessionStorage.setItem("redirectAfterLogin", "/fahndungen");
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, initialized, router]);

  // Wenn nicht angemeldet, zeige Loading-Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Eye className="h-8 w-8 text-primary" />
              </div>
            </div>

            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Alle Fahndungen
            </h1>

            <p className="mb-6 text-muted-foreground">
              {!initialized || loading
                ? "Prüfe Authentifizierung..."
                : "Weiterleitung zur Anmeldung..."}
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Nur für autorisierte Benutzer</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wenn angemeldet, zeige Fahndungen-Übersicht
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Alle Fahndungen
          </h1>
          <p className="mt-2 text-muted-foreground">
            Übersicht aller aktiven Fahndungen
          </p>
        </div>

        {/* Fahndungen-Übersicht */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Platzhalter für Fahndungen */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Keine Fahndungen verfügbar
                </p>
                <p className="text-sm text-muted-foreground">
                  Erstellen Sie Ihre erste Fahndung
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Schnellaktionen */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Schnellaktionen
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/fahndungen/neu/enhanced")}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Shield className="h-4 w-4" />
              Neue Fahndung erstellen
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              <Eye className="h-4 w-4" />
              Dashboard anzeigen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
