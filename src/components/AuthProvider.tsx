"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "~/hooks/useAuth";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";

interface AuthContextType {
  session: any;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { session, loading, error, initialized } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🔥 VERBESSERTE AUTOMATISCHE SESSION-VERWALTUNG
  useEffect(() => {
    if (!initialized) return;

    const supabase = getBrowserClient();

    // 🔥 KÜRZERE REFRESH-INTERVALLE FÜR BESSERE STABILITÄT
    // Token-Refresh Timer (alle 15 Minuten statt 30)
    const refreshInterval = setInterval(
      async () => {
        try {
          console.log("🔄 Automatischer Token-Refresh...");
          const { data, error: refreshError } =
            await supabase.auth.refreshSession();

          if (refreshError) {
            console.error("❌ Token-Refresh fehlgeschlagen:", refreshError);
            // Bei Refresh-Fehlern versuche Session-Reset
            if (
              refreshError.message.includes("Invalid Refresh Token") ||
              refreshError.message.includes("JWT expired")
            ) {
              console.log("🔄 Versuche Session-Reset nach Refresh-Fehler...");
              await supabase.auth.signOut();
            }
          } else if (data.session) {
            console.log("✅ Token erfolgreich erneuert");
          }
        } catch (err) {
          console.error("❌ Token-Refresh Exception:", err);
        }
      },
      15 * 60 * 1000,
    ); // 15 Minuten

    // 🔥 HÄUFIGERE SESSION-VALIDIERUNG
    // Session-Validierung Timer (alle 2 Minuten statt 5)
    const validationInterval = setInterval(
      async () => {
        try {
          const {
            data: { session: currentSession },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.log(
              "⚠️ Session-Validierung fehlgeschlagen:",
              error.message,
            );
            // Bei Validierungsfehlern versuche Session-Reset
            if (
              error.message.includes("Invalid Refresh Token") ||
              error.message.includes("JWT expired")
            ) {
              console.log(
                "🔄 Versuche Session-Reset nach Validierungsfehler...",
              );
              await supabase.auth.signOut();
            }
          } else if (!currentSession && session) {
            console.log("⚠️ Session verloren - versuche Wiederherstellung...");
            // Versuche Session-Wiederherstellung
            try {
              const { data: refreshData, error: refreshError } =
                await supabase.auth.refreshSession();
              if (refreshError || !refreshData.session) {
                console.log(
                  "❌ Session-Wiederherstellung fehlgeschlagen - bereinige...",
                );
                await supabase.auth.signOut();
              }
            } catch (refreshErr) {
              console.log(
                "❌ Session-Wiederherstellung Exception - bereinige...",
              );
              await supabase.auth.signOut();
            }
          } else if (currentSession) {
            // Prüfe Token-Ablauf
            const now = Math.floor(Date.now() / 1000);
            const expiresAt = currentSession.expires_at;

            if (expiresAt && now >= expiresAt) {
              console.log("❌ Session abgelaufen - bereinige...");
              await supabase.auth.signOut();
            } else if (expiresAt && expiresAt - now < 300) {
              // Weniger als 5 Minuten
              console.log(
                "⚠️ Session läuft bald ab - führe vorzeitigen Refresh durch...",
              );
              try {
                const { data: refreshData, error: refreshError } =
                  await supabase.auth.refreshSession();
                if (refreshError || !refreshData.session) {
                  console.log(
                    "❌ Vorzeitiger Refresh fehlgeschlagen - bereinige...",
                  );
                  await supabase.auth.signOut();
                }
              } catch (refreshErr) {
                console.log("❌ Vorzeitiger Refresh Exception - bereinige...");
                await supabase.auth.signOut();
              }
            }
          }
        } catch (err) {
          console.error("❌ Session-Validierung fehlgeschlagen:", err);
        }
      },
      2 * 60 * 1000,
    ); // 2 Minuten

    // 🔥 SESSION-WIEDERHERSTELLUNG BEIM SEITENRELOAD
    const handleBeforeUnload = () => {
      // Speichere Session-Status vor dem Reload
      if (session) {
        localStorage.setItem("fahndung-session-active", "true");
        localStorage.setItem(
          "fahndung-session-timestamp",
          Date.now().toString(),
        );
      }
    };

    const handleLoad = () => {
      // Prüfe ob Session vor Reload aktiv war
      const wasActive = localStorage.getItem("fahndung-session-active");
      const timestamp = localStorage.getItem("fahndung-session-timestamp");

      if (wasActive === "true" && timestamp) {
        const timeDiff = Date.now() - parseInt(timestamp);
        // Wenn weniger als 5 Minuten vergangen sind, versuche Session-Wiederherstellung
        if (timeDiff < 5 * 60 * 1000) {
          console.log("🔄 Versuche Session-Wiederherstellung nach Reload...");
          supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
              console.warn(
                "⚠️ Session-Wiederherstellung nach Reload fehlgeschlagen:",
                error.message,
              );
            } else if (data.session) {
              console.log(
                "✅ Session nach Reload erfolgreich wiederhergestellt",
              );
            }
          });
        }
      }

      // Cleanup
      localStorage.removeItem("fahndung-session-active");
      localStorage.removeItem("fahndung-session-timestamp");
    };

    // Event Listener für Reload-Handling
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("load", handleLoad);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      clearInterval(validationInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("load", handleLoad);
    };
  }, [session, initialized]);

  // 🔥 PERSISTENTE SESSION-WIEDERHERSTELLUNG
  useEffect(() => {
    const supabase = getBrowserClient();

    // Auth State Change Listener für robuste Session-Verwaltung
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth State Change:", event, session?.user?.email);

      switch (event) {
        case "SIGNED_IN":
          console.log("✅ Benutzer angemeldet:", session?.user?.email);
          // Speichere Session-Status für Reload-Wiederherstellung
          localStorage.setItem("fahndung-session-active", "true");
          localStorage.setItem(
            "fahndung-session-timestamp",
            Date.now().toString(),
          );
          break;
        case "SIGNED_OUT":
          console.log("🚪 Benutzer abgemeldet");
          // Cleanup Session-Status
          localStorage.removeItem("fahndung-session-active");
          localStorage.removeItem("fahndung-session-timestamp");
          break;
        case "TOKEN_REFRESHED":
          console.log("🔄 Token erneuert");
          // Aktualisiere Session-Status
          localStorage.setItem("fahndung-session-active", "true");
          localStorage.setItem(
            "fahndung-session-timestamp",
            Date.now().toString(),
          );
          break;
        case "USER_UPDATED":
          console.log("👤 Benutzer aktualisiert");
          break;
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Manueller Session-Refresh
  const refreshSession = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("❌ Manueller Session-Refresh fehlgeschlagen:", error);
        // Bei Refresh-Fehlern versuche Session-Reset
        if (
          error.message.includes("Invalid Refresh Token") ||
          error.message.includes("JWT expired")
        ) {
          console.log(
            "🔄 Versuche Session-Reset nach manuellem Refresh-Fehler...",
          );
          await supabase.auth.signOut();
        }
      } else if (data.session) {
        console.log("✅ Manueller Session-Refresh erfolgreich");
        // Aktualisiere Session-Status
        localStorage.setItem("fahndung-session-active", "true");
        localStorage.setItem(
          "fahndung-session-timestamp",
          Date.now().toString(),
        );
      }
    } catch (err) {
      console.error("❌ Session-Refresh Exception:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const value: AuthContextType = {
    session,
    loading,
    error,
    initialized,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
