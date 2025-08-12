import { createClient } from "@supabase/supabase-js";

// Erweitere das Window-Interface um die globale Supabase-Client-Eigenschaft
declare global {
  interface Window {
    __globalSupabaseClient?: ReturnType<typeof createClient>;
  }
}

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

// Globaler Supabase-Client - wird nur einmal erstellt
let globalSupabaseClient: ReturnType<typeof createClient> | null = null;

export function getGlobalSupabaseClient() {
  if (globalSupabaseClient) {
    return globalSupabaseClient;
  }

  // 🔥 VERBESSERTE SESSION-KONFIGURATION FÜR ROBUSTE PERSISTIERUNG
  globalSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "fahndung-auth-session", // Eindeutiger Key für bessere Persistierung
      debug: process.env.NODE_ENV === "development",
      // 🔥 ZUSÄTZLICHE KONFIGURATION FÜR BESSERE SESSION-STABILITÄT
      storageOptions: {
        // Verhindere Session-Verlust bei Browser-Updates
        secure: true,
        sameSite: "lax",
      },
    },
    global: {
      headers: {
        "X-Client-Info": "fahndung-global",
      },
    },
    // 🔥 VERBESSERTE NETZWERK-KONFIGURATION
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  // 🔥 SESSION-WIEDERHERSTELLUNG BEIM START
  if (typeof window !== "undefined") {
    // Versuche Session beim Start wiederherzustellen
    globalSupabaseClient.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.warn(
          "⚠️ Session-Wiederherstellung fehlgeschlagen:",
          error.message,
        );
      } else if (data.session) {
        console.log(
          "✅ Session erfolgreich wiederhergestellt:",
          data.session.user.email,
        );
      }
    });

    // Auth State Change Listener für robuste Session-Verwaltung
    globalSupabaseClient.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Auth State Change:", event, session?.user?.email);

      // Automatische Session-Validierung bei Auth-Events
      if (event === "SIGNED_IN" && session) {
        // Prüfe Token-Ablauf und führe Refresh durch wenn nötig
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at;

        if (expiresAt && expiresAt - now < 300) {
          // Weniger als 5 Minuten
          console.log("🔄 Token läuft bald ab - führe Refresh durch...");
          globalSupabaseClient?.auth
            .refreshSession()
            .then(({ data, error }) => {
              if (error) {
                console.error(
                  "❌ Token-Refresh fehlgeschlagen:",
                  error.message,
                );
              } else {
                console.log("✅ Token erfolgreich erneuert");
              }
            });
        }
      }
    });

    window.__globalSupabaseClient = globalSupabaseClient;
  }

  return globalSupabaseClient;
}

// Cleanup-Funktion für Tests
export function resetGlobalSupabaseClient() {
  globalSupabaseClient = null;
  if (typeof window !== "undefined") {
    delete window.__globalSupabaseClient;
  }
}
