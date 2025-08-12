"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { Loader2, Shield, Plus } from "lucide-react";

export default function NeueFahndungPage() {
  const { isAuthenticated, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 🔥 PROTOYP-MODUS: Erlaube direkten Zugriff auf Wizard
    if (
      process.env.NODE_ENV === "development" ||
      process.env["NEXT_PUBLIC_PROTOTYPE_MODE"] === "true"
    ) {
      console.log("🚀 Prototyp-Modus: Direkter Zugriff auf Wizard erlaubt");
      router.push("/fahndungen/neu/enhanced");
      return;
    }

    if (initialized && !loading) {
      if (!isAuthenticated) {
        // Speichere die gewünschte URL für Redirect nach Login
        sessionStorage.setItem(
          "redirectAfterLogin",
          "/fahndungen/neu/enhanced",
        );
        // SOFORTIGE Weiterleitung zur Login-Seite
        router.push("/login");
      } else {
        // 🔥 SOFORTIGE Weiterleitung zum Wizard
        console.log("🚀 SOFORTIGE Weiterleitung zum Wizard...");
        router.push("/fahndungen/neu/enhanced");
      }
    }
  }, [isAuthenticated, loading, initialized, router]);

  // 🔥 PROTOYP-MODUS: Zeige Loading-Screen für direkten Zugriff
  if (
    process.env.NODE_ENV === "development" ||
    process.env["NEXT_PUBLIC_PROTOTYPE_MODE"] === "true"
  ) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-8 w-8 text-primary" />
              </div>
            </div>

            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Neue Fahndung erstellen
            </h1>

            <p className="mb-6 text-muted-foreground">
              Leite zum Wizard weiter...
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Prototyp-Modus aktiv</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wenn nicht angemeldet, zeige Loading-Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-8 w-8 text-primary" />
              </div>
            </div>

            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Neue Fahndung erstellen
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

  // Wenn angemeldet, zeige Loading-Screen für Weiterleitung
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-8 w-8 text-primary" />
            </div>
          </div>

          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Neue Fahndung erstellen
          </h1>

          <p className="mb-6 text-muted-foreground">
            Leite zum Wizard weiter...
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Authentifiziert</span>
          </div>
        </div>
      </div>
    </div>
  );
}
