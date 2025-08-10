"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { useSupabaseAuthActions } from "~/hooks/useSupabaseAuthActions";
import {
  Loader2,
  LayoutDashboard,
  Shield,
  User,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";

export default function DashboardPage() {
  const { isAuthenticated, loading, initialized, session } = useAuth();
  const { checkAuthStatus, debugInfo } = useSupabaseAuthActions();
  const router = useRouter();
  const [authDebug, setAuthDebug] = useState("");
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  // Erweiterte Authentifizierungsprüfung
  useEffect(() => {
    const performAuthCheck = async () => {
      if (initialized && !loading) {
        setAuthDebug("🔍 Prüfe Authentifizierungsstatus...");

        try {
          // Prüfe Supabase Session direkt
          const supabase = getBrowserClient();
          const {
            data: { session: supabaseSession },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            setAuthDebug(`❌ Supabase Session-Fehler: ${error.message}`);
            return;
          }

          if (supabaseSession) {
            setSessionInfo({
              userId: supabaseSession.user.id,
              email: supabaseSession.user.email,
              tokenLength: supabaseSession.access_token?.length ?? 0,
              expiresAt: supabaseSession.expires_at
                ? new Date(supabaseSession.expires_at * 1000).toISOString()
                : "N/A",
            });
            setAuthDebug("✅ Supabase Session gefunden");
          } else {
            setAuthDebug("⚠️ Keine Supabase Session gefunden");
          }

          // Prüfe Auth Hook Status
          const authStatus = await checkAuthStatus();
          if (authStatus.isAuthenticated) {
            setAuthDebug("✅ Auth Hook bestätigt Authentifizierung");
          } else {
            setAuthDebug("❌ Auth Hook: Nicht authentifiziert");
          }
        } catch (err) {
          setAuthDebug(
            `❌ Auth-Check Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
          );
        }
      }
    };

    performAuthCheck();
  }, [initialized, loading, checkAuthStatus]);

  // Weiterleitung zur Login-Seite wenn nicht authentifiziert
  useEffect(() => {
    if (initialized && !loading && !isAuthenticated) {
      setAuthDebug("🔄 Weiterleitung zur Login-Seite...");
      // Speichere die gewünschte URL für Redirect nach Login
      sessionStorage.setItem("redirectAfterLogin", "/dashboard");
      router.push("/login");
    }
  }, [isAuthenticated, loading, initialized, router]);

  // Wenn nicht angemeldet, zeige Loading-Screen mit Debug-Informationen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
            </div>

            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Fahndungs-Dashboard
            </h1>

            <p className="mb-6 text-muted-foreground">
              {!initialized || loading
                ? "Prüfe Authentifizierung..."
                : "Weiterleitung zur Anmeldung..."}
            </p>

            {/* Debug-Informationen */}
            {authDebug && (
              <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/20 p-3">
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-blue-400">{authDebug}</div>
                </div>
              </div>
            )}

            {debugInfo && (
              <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/20 p-3">
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-green-400">{debugInfo}</div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Nur für autorisierte Benutzer</span>
            </div>

            {/* Debug-Button für Development */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 rounded bg-gray-600 px-3 py-2 text-xs text-white hover:bg-gray-700"
                >
                  <RefreshCw className="h-3 w-3" />
                  Seite neu laden
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Wenn angemeldet, zeige Dashboard-Inhalt
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header mit Benutzer-Informationen */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Fahndungs-Dashboard
              </h1>
              <p className="mt-2 text-muted-foreground">
                Übersicht über alle Fahndungen und Statistiken
              </p>
            </div>

            {/* Benutzer-Info */}
            {session && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {session.user.email}
                  </p>
                  <p className="text-muted-foreground">
                    {session.profile?.role || "Benutzer"}
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>

          {/* Debug-Informationen für Development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 space-y-2">
              {authDebug && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/20 p-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-blue-400">{authDebug}</div>
                  </div>
                </div>
              )}

              {sessionInfo && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/20 p-3">
                  <div className="text-sm text-green-400">
                    <p>
                      <strong>Session Info:</strong>
                    </p>
                    <p>User ID: {sessionInfo.userId}</p>
                    <p>Email: {sessionInfo.email}</p>
                    <p>Token Length: {sessionInfo.tokenLength}</p>
                    <p>Expires: {sessionInfo.expiresAt}</p>
                  </div>
                </div>
              )}

              {debugInfo && (
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/20 p-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-purple-400">{debugInfo}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dashboard-Inhalt */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Statistik-Karten */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aktive Fahndungen
                </p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <LayoutDashboard className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Erfolgreich gelöst
                </p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                <Shield className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Bearbeitung
                </p>
                <p className="text-2xl font-bold text-foreground">0</p>
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
              onClick={() => router.push("/fahndungen")}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              <LayoutDashboard className="h-4 w-4" />
              Alle Fahndungen anzeigen
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              <User className="h-4 w-4" />
              Admin-Bereich
            </button>
          </div>
        </div>

        {/* Status-Informationen */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            System-Status
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-foreground">Authentifizierung</p>
                <p className="text-sm text-muted-foreground">
                  Erfolgreich angemeldet
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-foreground">Session</p>
                <p className="text-sm text-muted-foreground">
                  Aktiv und gültig
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-foreground">Datenbank</p>
                <p className="text-sm text-muted-foreground">
                  Verbindung verfügbar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-foreground">tRPC</p>
                <p className="text-sm text-muted-foreground">
                  API-Verbindung aktiv
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
