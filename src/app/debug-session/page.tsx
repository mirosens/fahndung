"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  ArrowLeft,
} from "lucide-react";

export default function DebugSessionPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getBrowserClient();

      // Prüfe Session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        setError(`Session-Fehler: ${sessionError.message}`);
        setSessionInfo(null);
        return;
      }

      if (!sessionData.session) {
        setSessionInfo({ status: "Keine Session", valid: false });
        return;
      }

      // Prüfe Token-Ablauf
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = sessionData.session.expires_at;
      const isExpired = expiresAt && now >= expiresAt;
      const expiresIn = expiresAt ? expiresAt - now : null;

      // Prüfe Benutzer
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      setSessionInfo({
        status: isExpired ? "Abgelaufen" : "Aktiv",
        valid: !isExpired && !userError && userData.user,
        user: userData.user,
        session: sessionData.session,
        expiresAt: expiresAt
          ? new Date(expiresAt * 1000).toLocaleString()
          : "Unbekannt",
        expiresIn: expiresIn
          ? `${Math.floor(expiresIn / 60)} Minuten`
          : "Unbekannt",
        isExpired,
        userError: userError?.message,
      });
    } catch (err) {
      setError(
        `Unerwarteter Fehler: ${err instanceof Error ? err.message : "Unbekannt"}`,
      );
      setSessionInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    try {
      const supabase = getBrowserClient();
      await supabase.auth.signOut();
      setSessionInfo({ status: "Session bereinigt", valid: false });
      setError(null);
    } catch (err) {
      setError(
        `Fehler beim Bereinigen: ${err instanceof Error ? err.message : "Unbekannt"}`,
      );
    }
  };

  useEffect(() => {
    void checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-muted dark:bg-muted dark:hover:bg-muted/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Anmeldung
          </button>
          <h1 className="text-2xl font-bold">Session-Debug</h1>
        </div>

        {/* Session-Info */}
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm dark:border-border dark:bg-muted">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Session-Status</h2>
            <button
              onClick={checkSession}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Aktualisieren
            </button>
          </div>

          {loading && (
            <div className="py-8 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-2 text-muted-foreground">Prüfe Session...</p>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/20 p-3">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {sessionInfo && !loading && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-3">
                {sessionInfo.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">
                    Status: {sessionInfo.status}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {sessionInfo.valid
                      ? "Session ist gültig"
                      : "Session ist ungültig"}
                  </div>
                </div>
              </div>

              {/* Benutzer-Info */}
              {sessionInfo.user && (
                <div className="rounded-lg border border-border p-4">
                  <h3 className="mb-2 font-medium">Benutzer-Informationen</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>E-Mail:</strong> {sessionInfo.user.email}
                    </div>
                    <div>
                      <strong>ID:</strong> {sessionInfo.user.id}
                    </div>
                    <div>
                      <strong>Erstellt:</strong>{" "}
                      {new Date(sessionInfo.user.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Session-Info */}
              {sessionInfo.session && (
                <div className="rounded-lg border border-border p-4">
                  <h3 className="mb-2 font-medium">Session-Informationen</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Läuft ab:</strong> {sessionInfo.expiresAt}
                    </div>
                    <div>
                      <strong>Verbleibende Zeit:</strong>{" "}
                      {sessionInfo.expiresIn}
                    </div>
                    <div>
                      <strong>Token-Typ:</strong>{" "}
                      {sessionInfo.session.token_type}
                    </div>
                  </div>
                </div>
              )}

              {/* Fehler */}
              {sessionInfo.userError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/20 p-4">
                  <h3 className="mb-2 font-medium text-red-600">
                    Benutzer-Fehler
                  </h3>
                  <div className="text-sm text-red-600">
                    {sessionInfo.userError}
                  </div>
                </div>
              )}

              {/* Aktionen */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={clearSession}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Session bereinigen
                </button>

                <button
                  onClick={() => router.push("/login?logout=true")}
                  className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-muted dark:bg-muted dark:hover:bg-muted/80"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Zur Login-Seite mit Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
