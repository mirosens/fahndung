"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { Loader2, Shield, Plus } from "lucide-react";

export default function NeueFahndungPage() {
  const { isAuthenticated, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading) {
      if (!isAuthenticated) {
        // Speichere die gewünschte URL für Redirect nach Login
        sessionStorage.setItem(
          "redirectAfterLogin",
          "/fahndungen/neu/enhanced",
        );
        router.push("/login");
      } else {
        // Wenn angemeldet, direkt zum Wizard weiterleiten
        router.push("/fahndungen/neu/enhanced");
      }
    }
  }, [isAuthenticated, loading, initialized, router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>

          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Neue Fahndung erstellen
          </h1>

          <p className="mb-6 text-muted-foreground">
            {!initialized || loading
              ? "Prüfe Authentifizierung..."
              : !isAuthenticated
                ? "Weiterleitung zur Anmeldung..."
                : "Weiterleitung zum Wizard..."}
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Plus className="h-4 w-4" />
            <span>Fahndung Wizard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
