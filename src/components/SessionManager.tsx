"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "~/hooks/useAuth";
import { clearAuthSession } from "~/lib/auth";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";

export function SessionManager() {
  const { session, error, initialized } = useAuth();
  const hasHandledError = useRef(false);
  const lastError = useRef<string | null>(null);
  const errorCount = useRef(0);
  const maxErrorCount = 5; // Erhöht auf 5 Fehler bevor abgemeldet wird
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // 🔥 ROBUSTE SESSION-WIEDERHERSTELLUNG
  useEffect(() => {
    if (!initialized) return;

    const supabase = getBrowserClient();

    // Regelmäßige Session-Validierung (alle 2 Minuten)
    sessionCheckInterval.current = setInterval(
      () => {
        void (async () => {
          try {
            const {
              data: { session: currentSession },
              error: sessionError,
            } = await supabase.auth.getSession();

            if (sessionError) {
              console.log(
                "⚠️ Session-Validierung fehlgeschlagen:",
                sessionError.message,
              );
              errorCount.current++;
            } else if (!currentSession && session) {
              console.log("⚠️ Session verloren, versuche Wiederherstellung...");
              errorCount.current++;
            } else if (currentSession) {
              // Session ist gültig, reset error count
              errorCount.current = 0;
              hasHandledError.current = false;
            }
          } catch (err) {
            console.error("❌ Session-Validierung Exception:", err);
            errorCount.current++;
          }
        })();
      },
      2 * 60 * 1000,
    ); // 2 Minuten

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [initialized, session]);

  // 🔥 VERBESSERTE FEHLERBEHANDLUNG
  useEffect(() => {
    if (error && !hasHandledError.current && error !== lastError.current) {
      errorCount.current++;
      console.log(
        `🔐 SessionManager: Auth-Fehler erkannt (${errorCount.current}/${maxErrorCount}):`,
        error,
      );

      lastError.current = error;

      // Nur bei mehreren aufeinanderfolgenden Fehlern abmelden
      if (errorCount.current >= maxErrorCount) {
        console.log(
          "🔐 SessionManager: Zu viele Auth-Fehler, bereinige Session...",
        );
        hasHandledError.current = true;

        // Session bereinigen
        void clearAuthSession(getBrowserClient());

        // Zur Login-Seite weiterleiten
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
      }
    }
  }, [error]);

  // Reset error handler wenn Session wiederhergestellt wird
  useEffect(() => {
    if (session && hasHandledError.current) {
      console.log(
        "🔐 SessionManager: Session wiederhergestellt, reset error handler",
      );
      hasHandledError.current = false;
      lastError.current = null;
      errorCount.current = 0; // Reset error count
    }
  }, [session]);

  // 🔥 AUTOMATISCHE SESSION-WIEDERHERSTELLUNG BEI SEITENRELOAD
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Speichere Session-Status vor dem Reload
      if (session) {
        sessionStorage.setItem("sessionActive", "true");
        sessionStorage.setItem("sessionTimestamp", Date.now().toString());
      }
    };

    const handleLoad = () => {
      // Prüfe ob Session vor Reload aktiv war
      const wasActive = sessionStorage.getItem("sessionActive");
      const timestamp = sessionStorage.getItem("sessionTimestamp");

      if (wasActive === "true" && timestamp) {
        const timeDiff = Date.now() - parseInt(timestamp);
        // Nur wenn weniger als 5 Minuten vergangen sind
        if (timeDiff < 5 * 60 * 1000) {
          console.log("🔄 Session-Wiederherstellung nach Reload...");
          // Session wird automatisch durch Supabase wiederhergestellt
        }
      }

      // Cleanup
      sessionStorage.removeItem("sessionActive");
      sessionStorage.removeItem("sessionTimestamp");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("load", handleLoad);
    };
  }, [session]);

  // 🔥 VISIBILITY CHANGE HANDLER FÜR TAB-WECHSEL
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        // Tab wurde wieder aktiv, prüfe Session
        console.log("🔄 Tab aktiviert, prüfe Session...");
        const supabase = getBrowserClient();

        void (async () => {
          try {
            const {
              data: { session: currentSession },
              error,
            } = await supabase.auth.getSession();

            if (error || !currentSession) {
              console.log("⚠️ Session nach Tab-Wechsel ungültig");
              errorCount.current++;
            } else {
              console.log("✅ Session nach Tab-Wechsel gültig");
              errorCount.current = 0;
            }
          } catch (err) {
            console.error(
              "❌ Session-Check nach Tab-Wechsel fehlgeschlagen:",
              err,
            );
          }
        })();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session]);

  return null; // SessionManager rendert nichts
}
